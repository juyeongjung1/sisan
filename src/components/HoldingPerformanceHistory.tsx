'use client';

import React, { useState, useMemo } from 'react';
import { AssetHolding, HoldingHistoryPoint, TimeframeOption } from '@/types';
import { filterHistoryByTimeframe } from '@/lib/historyGenerator';
import { formatCurrencyJpy, formatPercent } from '@/lib/calculations';
import { Language, DICTIONARY, translateHoldingName, translateNotes } from '@/lib/i18n';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Percent,
  X,
  Maximize2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';

interface HoldingPerformanceHistoryProps {
  holdings: AssetHolding[];
  historyPoints: HoldingHistoryPoint[];
  isModal?: boolean;
  onCloseModal?: () => void;
  lang?: Language;
  isMasked?: boolean;
}

export interface EnrichedHistoryRow extends HoldingHistoryPoint {
  dailyDiffVal: number;      // 前日比・前期比（円）
  dailyDiffPercent: number;  // 前日比・前期比（%）
  totalGainVal: number;      // トータル損益（円）
  totalGainPercent: number;  // トータル損益率（%）
}

export const HoldingPerformanceHistory: React.FC<HoldingPerformanceHistoryProps> = ({
  holdings,
  historyPoints,
  isModal = false,
  onCloseModal,
  lang = 'ja',
  isMasked = false,
}) => {
  const t = DICTIONARY[lang];
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('day');
  const [showFxRateLine, setShowFxRateLine] = useState<boolean>(true);
  const [isDynamicScale, setIsDynamicScale] = useState<boolean>(true); // 変化を激しく・ダイナミックに見せるオートズーム

  const formatVal = (val: number, showSign: boolean = false) => {
    if (isMasked) {
      if (showSign && val > 0) return '+¥***,***';
      if (showSign && val < 0) return '-¥***,***';
      return '¥***,***';
    }
    return formatCurrencyJpy(val, showSign);
  };

  // フィルタリングされたデータ
  const rawChartData = filterHistoryByTimeframe(historyPoints, selectedHoldingId, timeframe);

  // 前日比・日次変動率を各行に計算
  const enrichedChartData: EnrichedHistoryRow[] = useMemo(() => {
    return rawChartData.map((row, idx) => {
      const prev = idx > 0 ? rawChartData[idx - 1] : null;
      const dailyDiffVal = prev ? row.currentValJpy - prev.currentValJpy : 0;
      const dailyDiffPercent =
        prev && prev.currentValJpy > 0 ? (dailyDiffVal / prev.currentValJpy) * 100 : 0;

      const totalGainVal = row.currentValJpy - row.purchaseAmountJpy;
      const totalGainPercent =
        row.purchaseAmountJpy > 0 ? (totalGainVal / row.purchaseAmountJpy) * 100 : 0;

      return {
        ...row,
        dailyDiffVal,
        dailyDiffPercent,
        totalGainVal,
        totalGainPercent,
      };
    });
  }, [rawChartData]);

  const selectedHolding = holdings.find((h) => h.id === selectedHoldingId);
  const title = selectedHolding ? translateHoldingName(selectedHolding.name, lang) : t.allAssets;

  // 期間内の開始値と最新値
  const startPoint = enrichedChartData[0];
  const endPoint = enrichedChartData[enrichedChartData.length - 1];

  const periodDiffVal =
    endPoint && startPoint ? endPoint.currentValJpy - startPoint.currentValJpy : 0;
  const periodDiffPercent =
    startPoint && startPoint.currentValJpy > 0
      ? (periodDiffVal / startPoint.currentValJpy) * 100
      : 0;

  // 最新日の前日比
  const latestDailyDiffVal = endPoint?.dailyDiffVal || 0;
  const latestDailyDiffPercent = endPoint?.dailyDiffPercent || 0;

  // 期間ラベルの取得
  const timeframeLabels: { key: TimeframeOption; label: string; periodText: string; desc: string }[] = [
    { key: 'day', label: t.timeframeDay, periodText: lang === 'ko' ? '최근 7일 통산' : '直近7日間の通算', desc: lang === 'ko' ? '최근 7일 일별 추이' : '直近7日間の日次推移' },
    { key: 'week', label: t.timeframeWeek, periodText: lang === 'ko' ? '최근 4주 통산' : '直近4週間の通算', desc: lang === 'ko' ? '최근 1개월 주별 추이' : '直近1ヶ月の週次推移' },
    { key: 'month', label: t.timeframeMonth, periodText: lang === 'ko' ? '최근 1년 통산' : '直近1年間の通算', desc: lang === 'ko' ? '최근 12개월 월별 추이' : '直近12ヶ月の月次推移' },
    { key: 'year', label: t.timeframeYear, periodText: lang === 'ko' ? '최근 3년 통산' : '直近3年間の通算', desc: lang === 'ko' ? '최근 3년 연간 추이' : '直近3年間の推移' },
    { key: 'all', label: t.timeframeAll, periodText: lang === 'ko' ? '전체 운용 기간 통산' : '全運用期間の通算', desc: lang === 'ko' ? '투자 시작 이후 전체 추이' : '投資開始からの全推移' },
  ];

  const currentTfConfig = timeframeLabels.find((tf) => tf.key === timeframe) || timeframeLabels[0];

  // ダイナミックY軸オートズームの計算
  const currentVals = enrichedChartData.map((d) => d.currentValJpy).filter((v) => v > 0);
  const purchaseVals = enrichedChartData.map((d) => d.purchaseAmountJpy).filter((v) => v > 0);
  const allVals = [...currentVals, ...purchaseVals];

  const minVal = allVals.length > 0 ? Math.min(...allVals) : 0;
  const maxVal = allVals.length > 0 ? Math.max(...allVals) : 100000;
  const valRange = maxVal - minVal;

  const dynamicYDomain = isDynamicScale
    ? [
        Math.max(0, Math.floor((minVal - Math.max(valRange * 0.15, 10000)) / 10000) * 10000),
        Math.ceil((maxVal + Math.max(valRange * 0.15, 10000)) / 10000) * 10000,
      ]
    : [0, Math.ceil((maxVal * 1.1) / 10000) * 10000];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as EnrichedHistoryRow;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md text-white min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-bold text-slate-200">{label}</span>
            {data.notes && (
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.2 rounded border border-indigo-500/30">
                {translateNotes(data.notes, lang)}
              </span>
            )}
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">{t.currentVal}:</span>
            <span className="font-bold text-white">{formatVal(data.currentValJpy)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">{t.dailyDiff}:</span>
            <span
              className={`font-bold ${
                data.dailyDiffVal >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatVal(data.dailyDiffVal, true)} ({formatPercent(data.dailyDiffPercent, true)})
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">{t.colPrincipal}:</span>
            <span className="font-semibold text-slate-300">{formatVal(data.purchaseAmountJpy)}</span>
          </div>

          <div className="flex justify-between pt-1 border-t border-slate-800">
            <span className="text-slate-400">{t.totalGain}:</span>
            <span
              className={`font-bold ${
                data.totalGainVal >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatVal(data.totalGainVal, true)} ({formatPercent(data.totalGainPercent, true)})
            </span>
          </div>

          {data.fxRateUsd && (
            <div className="flex justify-between text-[11px] text-amber-300 pt-0.5">
              <span>{t.fxRateTrend}:</span>
              <span>¥{data.fxRateUsd.toFixed(2)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6 ${isModal ? 'max-w-5xl w-full' : ''}`}>
      {/* Header with Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.historyTitle}
                </h2>
                {isModal && (
                  <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-bold">
                    {lang === 'ko' ? '상세 모달' : '詳細モーダル'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.historySubtitle}
              </p>
            </div>
          </div>

          {isModal && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters & Timeframe Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dynamic Scaling Toggle */}
          <button
            onClick={() => setIsDynamicScale(!isDynamicScale)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              isDynamicScale
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title="グラフの変化を強調して波形をわかりやすく拡大表示"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isDynamicScale ? t.zoomScaleOn : t.zoomScaleOff}</span>
          </button>

          {/* Product Select Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedHoldingId}
              onChange={(e) => setSelectedHoldingId(e.target.value)}
              className="bg-transparent border-none text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">{t.allAssets}</option>
              {holdings.map((h) => (
                <option key={h.id} value={h.id}>
                  {translateHoldingName(h.name, lang)}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-0.5">
            {timeframeLabels.map((tf) => (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  timeframe === tf.key
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {isModal && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-2"
              title="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Target Asset Detail Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Target Name & Category */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">
            {lang === 'ko' ? '분석 대상 상품' : '分析対象の商品'}
          </span>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate block mt-0.5">
            {title}
          </span>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block mt-1">
            {currentTfConfig.desc}
          </span>
        </div>

        {/* 2. Current Value */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">
            {t.currentVal}
          </span>
          <span className="font-extrabold text-lg text-slate-900 dark:text-white block mt-0.5">
            {formatVal(endPoint?.currentValJpy || 0)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            {t.colPrincipal}: {formatVal(endPoint?.purchaseAmountJpy || 0)}
          </span>
        </div>

        {/* 3. Daily / Latest Change */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">
            {t.dailyDiff}
          </span>
          <div
            className={`font-extrabold text-lg flex items-center gap-1 mt-0.5 ${
              latestDailyDiffVal >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {latestDailyDiffVal >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{formatVal(latestDailyDiffVal, true)}</span>
          </div>
          <span
            className={`text-[11px] font-bold block mt-1 ${
              latestDailyDiffVal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatPercent(latestDailyDiffPercent, true)}
          </span>
        </div>

        {/* 4. Cumulative Period Change */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">
            {currentTfConfig.periodText}
          </span>
          <div
            className={`font-extrabold text-lg flex items-center gap-1 mt-0.5 ${
              periodDiffVal >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {periodDiffVal >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{formatVal(periodDiffVal, true)}</span>
          </div>
          <span
            className={`text-[11px] font-bold block mt-1 ${
              periodDiffVal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatPercent(periodDiffPercent, true)}
          </span>
        </div>
      </div>

      {/* Main Interactive Recharts Chart Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t.currentVal}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-slate-400 border-b border-dashed border-slate-400" />
              <span>{t.colPrincipal}</span>
            </span>
            {showFxRateLine && (
              <span className="flex items-center gap-1 text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{t.fxRateTrend}</span>
              </span>
            )}
          </div>

          <button
            onClick={() => setShowFxRateLine(!showFxRateLine)}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
          >
            {showFxRateLine ? (lang === 'ko' ? '환율선 숨김' : '為替線を非表示') : (lang === 'ko' ? '환율선 표시' : '為替線を表示')}
          </button>
        </div>

        <div className="h-64 sm:h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={enrichedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="chartValGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#94A3B8"
                fontSize={10}
                tickFormatter={(val) => {
                  const parts = val.split('-');
                  return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
                }}
              />
              <YAxis
                yAxisId="left"
                stroke="#94A3B8"
                fontSize={10}
                domain={dynamicYDomain}
                tickFormatter={(v) => isMasked ? '***' : `${(v / 10000).toFixed(0)}万`}
              />
              {showFxRateLine && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#F59E0B"
                  fontSize={10}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tickFormatter={(v) => `¥${v}`}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="currentValJpy"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartValGradient)"
                name="currentVal"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="purchaseAmountJpy"
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fill="none"
                name="purchaseVal"
              />
              {showFxRateLine && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="fxRateUsd"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  dot={false}
                  name="fxRate"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Data Table / Timeline list */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {lang === 'ko' ? '일별·기간별 변동 이력 데이터' : '日別・期間別 変動履歴データ'}
          </h3>
          <span className="text-[11px] text-slate-400">
            {enrichedChartData.length} {lang === 'ko' ? '개 데이터 포인트' : 'データポイント'}
          </span>
        </div>

        <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 sticky top-0 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-700 font-semibold">
                <th className="py-2 px-3">{lang === 'ko' ? '날짜' : '日付'}</th>
                <th className="py-2 px-3 text-right">{t.currentVal}</th>
                <th className="py-2 px-3 text-right">{t.dailyDiff}</th>
                <th className="py-2 px-3 text-right">{t.colPrincipal}</th>
                <th className="py-2 px-3 text-right">{t.totalGain}</th>
                <th className="py-2 px-3 text-right">{t.fxRateTrend}</th>
                <th className="py-2 px-3">{lang === 'ko' ? '이벤트 / 비고' : 'イベント / 備考'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {enrichedChartData
                .slice()
                .reverse()
                .map((row, i) => {
                  const isDailyPositive = row.dailyDiffVal >= 0;
                  const isTotalPositive = row.totalGainVal >= 0;
                  return (
                    <tr
                      key={row.id || i}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition font-mono"
                    >
                      <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-semibold">
                        {row.date}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatVal(row.currentValJpy)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold">
                        <span
                          className={
                            isDailyPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {formatVal(row.dailyDiffVal, true)} (
                          {formatPercent(row.dailyDiffPercent, true)})
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400">
                        {formatVal(row.purchaseAmountJpy)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold">
                        <span
                          className={
                            isTotalPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {formatVal(row.totalGainVal, true)} (
                          {formatPercent(row.totalGainPercent, true)})
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400 font-medium">
                        {row.fxRateUsd ? `¥${row.fxRateUsd.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-500 dark:text-slate-400 text-[11px] font-sans">
                        {row.notes ? translateNotes(row.notes, lang) : '-'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
