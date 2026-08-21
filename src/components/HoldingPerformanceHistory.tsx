'use client';

import React, { useState } from 'react';
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
}

export const HoldingPerformanceHistory: React.FC<HoldingPerformanceHistoryProps> = ({
  holdings,
  historyPoints,
}) => {
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('month');
  const [showFxRateLine, setShowFxRateLine] = useState<boolean>(true);

  // フィルタリングされたデータ
  const chartData = filterHistoryByTimeframe(historyPoints, selectedHoldingId, timeframe);

  const selectedHolding = holdings.find((h) => h.id === selectedHoldingId);
  const title = selectedHolding ? selectedHolding.name : '保有資産全体 (トータルポートフォリオ)';

  // 期間内の開始値と最新値
  const startPoint = chartData[0];
  const endPoint = chartData[chartData.length - 1];

  const diffVal = endPoint && startPoint ? endPoint.currentValJpy - startPoint.currentValJpy : 0;
  const diffPercent =
    startPoint && startPoint.currentValJpy > 0 ? (diffVal / startPoint.currentValJpy) * 100 : 0;

  // 期間中の最高値・最安値
  const maxVal = chartData.length > 0 ? Math.max(...chartData.map((d) => d.currentValJpy)) : 0;
  const minVal = chartData.length > 0 ? Math.min(...chartData.map((d) => d.currentValJpy)) : 0;

  const timeframeLabels: { key: TimeframeOption; label: string; desc: string }[] = [
    { key: 'day', label: '日 (7日)', desc: '直近1週間の日次推移' },
    { key: 'week', label: '週 (4週)', desc: '直近1ヶ月の週次推移' },
    { key: 'month', label: '月 (1年)', desc: '直近12ヶ月の月次推移' },
    { key: 'year', label: '年 (3年)', desc: '直近3年間の推移' },
    { key: 'all', label: '全期間', desc: '投資開始からの全推移' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const gain = data.currentValJpy - data.purchaseAmountJpy;
      const gainPercent =
        data.purchaseAmountJpy > 0 ? (gain / data.purchaseAmountJpy) * 100 : 0;

      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1">
            <span className="font-bold text-slate-200">{data.date}</span>
            {data.fxRateUsd && (
              <span className="text-amber-400 font-semibold">
                $1 = ¥{data.fxRateUsd.toFixed(1)}
              </span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">評価額:</span>
            <span className="font-bold text-blue-400">
              {formatCurrencyJpy(data.currentValJpy)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">投資元本:</span>
            <span className="font-medium text-slate-300">
              {formatCurrencyJpy(data.purchaseAmountJpy)}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800">
            <span className="text-slate-400">含み損益:</span>
            <span
              className={`font-bold ${gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {formatCurrencyJpy(gain, true)} ({formatPercent(gainPercent, true)})
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
      {/* Header with Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              商品別・期間別（日/週/月/年）資産推移分析
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              各投資信託・資産ごとの過去の値動きと積立による成長履歴
            </p>
          </div>
        </div>

        {/* Holding Selector Dropdown */}
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
        </div>
      </div>

      {/* Selected Target Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Current Val in Period */}
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

        {/* Period Change */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            期間中の評価額増減
          </span>
          <div
            className={`text-xl font-extrabold mt-0.5 flex items-center gap-1 ${
              diffVal >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {diffVal >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            <span>{formatCurrencyJpy(diffVal, true)}</span>
          </div>
          <span
            className={`text-[10px] font-bold block mt-0.5 ${
              diffVal >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {formatPercent(diffPercent, true)} (期間比)
          </span>
        </div>

        {/* Max & Min in Period */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            期間内の最高 / 最低評価額
          </span>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
            高値: <span className="text-emerald-600 dark:text-emerald-400">{formatCurrencyJpy(maxVal)}</span>
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            安値: <span className="text-slate-500 dark:text-slate-400">{formatCurrencyJpy(minVal)}</span>
          </div>
        </div>

        {/* FX Rate in Period */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              為替レート推移 (USD/JPY)
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
            ¥{startPoint?.fxRateUsd?.toFixed(1) || '130.0'} ➔ ¥
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
          <AreaChart data={chartData}>
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
                return timeframe === 'day' ? `${parts[1]}/${parts[2]}` : `${parts[0].slice(2)}/${parts[1]}`;
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

      {/* Breakdown Table for selected history */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <span>{title} の時系列履歴ログ</span>
          <span className="text-[10px] font-normal text-slate-400">
            ({chartData.length} 件のデータ)
          </span>
        </h3>

        <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2 px-3">日付</th>
                <th className="py-2 px-3 text-right">評価額 (円)</th>
                <th className="py-2 px-3 text-right">投資元本 (円)</th>
                <th className="py-2 px-3 text-right">損益 (損益率)</th>
                <th className="py-2 px-3 text-right">為替 (USD/JPY)</th>
                <th className="py-2 px-3">備考・イベント</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
              {chartData
                .slice()
                .reverse()
                .map((row) => {
                  const gain = row.currentValJpy - row.purchaseAmountJpy;
                  const gainPct =
                    row.purchaseAmountJpy > 0 ? (gain / row.purchaseAmountJpy) * 100 : 0;

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
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400">
                        {formatCurrencyJpy(row.purchaseAmountJpy)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold">
                        <span className={gain >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                          {formatCurrencyJpy(gain, true)} ({formatPercent(gainPct, true)})
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
