'use client';

import React, { useState, useMemo } from 'react';
import { AssetHolding, HoldingHistoryPoint, TimeframeOption } from '@/types';
import { filterHistoryByTimeframe } from '@/lib/historyGenerator';
import { formatCurrencyJpy, formatPercent } from '@/lib/calculations';
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
}) => {
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('day');
  const [showFxRateLine, setShowFxRateLine] = useState<boolean>(true);

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
  const title = selectedHolding ? selectedHolding.name : '保有資産全体 (トータルポートフォリオ)';

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
    { key: 'day', label: '日 (7日)', periodText: '直近7日間の通算', desc: '直近7日間の日次推移' },
    { key: 'week', label: '週 (4週)', periodText: '直近4週間の通算', desc: '直近1ヶ月の週次推移' },
    { key: 'month', label: '月 (1年)', periodText: '直近1年間の通算', desc: '直近12ヶ月の月次推移' },
    { key: 'year', label: '年 (3年)', periodText: '直近3年間の通算', desc: '直近3年間の推移' },
    { key: 'all', label: '全期間', periodText: '全運用期間の通算', desc: '投資開始からの全推移' },
  ];

  const currentTfConfig = timeframeLabels.find((t) => t.key === timeframe) || timeframeLabels[0];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: EnrichedHistoryRow = payload[0].payload;

      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs space-y-1.5 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
            <span className="font-bold text-slate-200">{data.date}</span>
            {data.fxRateUsd && (
              <span className="text-amber-400 font-semibold text-[11px]">
                $1 = ¥{data.fxRateUsd.toFixed(1)}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">評価額:</span>
            <span className="font-bold text-blue-400 text-sm">
              {formatCurrencyJpy(data.currentValJpy)}
            </span>
          </div>

          {/* 前日比・日次変動率 */}
          <div className="flex justify-between items-center bg-slate-800/80 px-2 py-1 rounded-lg">
            <span className="text-slate-300 font-medium">前日比 (1日変動):</span>
            <span
              className={`font-bold ${
                data.dailyDiffVal >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrencyJpy(data.dailyDiffVal, true)} ({formatPercent(data.dailyDiffPercent, true)})
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">投資元本:</span>
            <span className="font-medium text-slate-300">
              {formatCurrencyJpy(data.purchaseAmountJpy)}
            </span>
          </div>

          <div className="flex justify-between pt-1 border-t border-slate-800">
            <span className="text-slate-400">トータル損益:</span>
            <span
              className={`font-bold ${
                data.totalGainVal >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrencyJpy(data.totalGainVal, true)} ({formatPercent(data.totalGainPercent, true)})
            </span>
          </div>

          {data.notes && (
            <div className="text-[10px] text-amber-300 bg-amber-950/40 p-1 rounded border border-amber-800/40 mt-1">
              📌 {data.notes}
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
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                商品別・期間別（日/週/月/年）資産推移分析
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                実際の運用期間（レバナス5年・FANG+/Zテック2年等）に連動した推移トラッカー
              </p>
            </div>
          </div>

          {isModal && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Holding Selector Dropdown & Timeframe Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs w-full sm:w-auto">
            <Layers className="w-4 h-4 text-blue-500 shrink-0" />
            <select
              value={selectedHoldingId}
              onChange={(e) => setSelectedHoldingId(e.target.value)}
              className="bg-transparent border-none text-slate-800 dark:text-slate-200 font-bold focus:outline-none w-full sm:w-64 truncate cursor-pointer"
            >
              <option value="all">📊 全資産の合計推移</option>
              {holdings.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Buttons (Day / Week / Month / Year / All) */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-0.5">
            {timeframeLabels.map((t) => (
              <button
                key={t.key}
                onClick={() => setTimeframe(t.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  timeframe === t.key
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={t.desc}
              >
                {t.label.split(' ')[0]}
              </button>
            ))}
          </div>

          {isModal && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="hidden lg:flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              <X className="w-4 h-4" />
              <span>閉じる</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Performance Metric Cards with Clear Meaning */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Card 1: Current Val */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            現在評価額
          </span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatCurrencyJpy(endPoint?.currentValJpy || 0)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            元本: {formatCurrencyJpy(endPoint?.purchaseAmountJpy || 0)}
          </span>
        </div>

        {/* Card 2: Latest 1-Day Change (前日比: 昨日との差) */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            前日比（昨日からの1日変動）
          </span>
          <div
            className={`text-xl font-extrabold mt-0.5 flex items-center gap-1 ${
              latestDailyDiffVal >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {latestDailyDiffVal >= 0 ? (
              <ArrowUpRight className="w-5 h-5" />
            ) : (
              <ArrowDownRight className="w-5 h-5" />
            )}
            <span>{formatCurrencyJpy(latestDailyDiffVal, true)}</span>
          </div>
          <span
            className={`text-[10px] font-bold block mt-0.5 ${
              latestDailyDiffVal >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {formatPercent(latestDailyDiffPercent, true)} (1日比)
          </span>
        </div>

        {/* Card 3: Selected Period Cumulative Change (選択期間の通算増減) */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            {currentTfConfig.periodText}の増減
          </span>
          <div
            className={`text-xl font-extrabold mt-0.5 flex items-center gap-1 ${
              periodDiffVal >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {periodDiffVal >= 0 ? (
              <ArrowUpRight className="w-5 h-5" />
            ) : (
              <ArrowDownRight className="w-5 h-5" />
            )}
            <span>{formatCurrencyJpy(periodDiffVal, true)}</span>
          </div>
          <span
            className={`text-[10px] font-bold block mt-0.5 ${
              periodDiffVal >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {formatPercent(periodDiffPercent, true)} ({startPoint?.date.slice(5)} ➔ {endPoint?.date.slice(5)})
          </span>
        </div>

        {/* Card 4: FX Rate in Period */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              為替レート (USD/JPY)
            </span>
            <label className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={showFxRateLine}
                onChange={(e) => setShowFxRateLine(e.target.checked)}
                className="w-3 h-3 rounded text-amber-500"
              />
              為替線
            </label>
          </div>
          <div className="text-base font-bold text-amber-500 dark:text-amber-400 mt-1">
            ¥{startPoint?.fxRateUsd?.toFixed(1) || '110.0'} ➔ ¥
            {endPoint?.fxRateUsd?.toFixed(1) || '153.5'}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            円安進行による恩恵を可視化
          </span>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={enrichedChartData}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748B" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#64748B" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#94A3B8"
              fontSize={11}
              tickFormatter={(v) => {
                const parts = v.split('-');
                return timeframe === 'day'
                  ? `${parts[1]}/${parts[2]}`
                  : `${parts[0].slice(2)}/${parts[1]}`;
              }}
            />
            <YAxis
              yAxisId="val"
              stroke="#94A3B8"
              fontSize={11}
              tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
            />
            {showFxRateLine && (
              <YAxis
                yAxisId="fx"
                orientation="right"
                domain={['auto', 'auto']}
                stroke="#F59E0B"
                fontSize={10}
                tickFormatter={(v) => `¥${v}`}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => {
                if (value === 'currentValJpy') return '評価額 (円)';
                if (value === 'purchaseAmountJpy') return '投資元本 (円)';
                if (value === 'fxRateUsd') return '為替レート (USD/JPY)';
                return value;
              }}
            />
            <Area
              yAxisId="val"
              type="monotone"
              dataKey="currentValJpy"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorVal)"
              name="currentValJpy"
            />
            <Area
              yAxisId="val"
              type="monotone"
              dataKey="purchaseAmountJpy"
              stroke="#64748B"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorPrincipal)"
              name="purchaseAmountJpy"
            />
            {showFxRateLine && (
              <Line
                yAxisId="fx"
                type="monotone"
                dataKey="fxRateUsd"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={false}
                name="fxRateUsd"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown Table with Daily Changes */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <span>{title} の時系列推移ログ</span>
            <span className="text-[10px] font-normal text-slate-400">
              ({enrichedChartData.length} 件のデータ)
            </span>
          </span>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold lowercase">
            ※ 前日比（1日変動率）とトータル損益を両方確認できます
          </span>
        </h3>

        <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-3">日付</th>
                <th className="py-2.5 px-3 text-right">評価額 (円)</th>
                <th className="py-2.5 px-3 text-right bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold">
                  前日比 (1日の変動)
                </th>
                <th className="py-2.5 px-3 text-right">投資元本 (円)</th>
                <th className="py-2.5 px-3 text-right">トータル損益 (全体率 %)</th>
                <th className="py-2.5 px-3 text-right">為替 (USD/JPY)</th>
                <th className="py-2.5 px-3">備考・イベント</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
              {enrichedChartData
                .slice()
                .reverse()
                .map((row) => {
                  const isDailyPositive = row.dailyDiffVal >= 0;
                  const isTotalPositive = row.totalGainVal >= 0;

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {row.date}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrencyJpy(row.currentValJpy)}
                      </td>
                      {/* 前日比・日次変動率 */}
                      <td className="py-2 px-3 text-right bg-blue-50/20 dark:bg-blue-950/10 font-bold">
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] ${
                            isDailyPositive
                              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60'
                              : 'text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/60'
                          }`}
                        >
                          {isDailyPositive ? '+' : ''}
                          {formatCurrencyJpy(row.dailyDiffVal)} (
                          {formatPercent(row.dailyDiffPercent, true)})
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400">
                        {formatCurrencyJpy(row.purchaseAmountJpy)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold">
                        <span
                          className={
                            isTotalPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {formatCurrencyJpy(row.totalGainVal, true)} (
                          {formatPercent(row.totalGainPercent, true)})
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400 font-medium">
                        {row.fxRateUsd ? `¥${row.fxRateUsd.toFixed(1)}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        {row.notes || '-'}
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
