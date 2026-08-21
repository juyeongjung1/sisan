'use client';

import React, { useState } from 'react';
import { CurrencyExposure, CategoryAllocation, AccountAllocation } from '@/types';
import { formatCurrencyJpy, formatPercent } from '@/lib/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon, Coins, Layers, Landmark } from 'lucide-react';

interface AllocationsChartProps {
  currencyExposures: CurrencyExposure[];
  categoryAllocations: CategoryAllocation[];
  accountAllocations: AccountAllocation[];
}

type TabType = 'currency' | 'category' | 'account';

export const AllocationsChart: React.FC<AllocationsChartProps> = ({
  currencyExposures,
  categoryAllocations,
  accountAllocations,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('currency');

  const getActiveData = () => {
    switch (activeTab) {
      case 'currency':
        return currencyExposures.map((d) => ({
          name: d.label,
          value: d.amountJpy,
          percentage: d.percentage,
          color: d.color,
        }));
      case 'category':
        return categoryAllocations.map((d) => ({
          name: d.label,
          value: d.amountJpy,
          percentage: d.percentage,
          color: d.color,
        }));
      case 'account':
        return accountAllocations.map((d) => ({
          name: d.name,
          value: d.amountJpy,
          percentage: d.percentage,
          color: d.color,
        }));
    }
  };

  const chartData = getActiveData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>評価額:</span>
            <span className="font-bold text-white">{formatCurrencyJpy(data.value)}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300 mt-0.5">
            <span>構成比:</span>
            <span className="font-bold text-cyan-400">{formatPercent(data.percentage, false)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              ポートフォリオ・アロケーション
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              実質通貨比率・資産種別・口座別の構成バランス
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('currency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'currency'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>通貨別エクスポージャー</span>
          </button>

          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'category'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>資産別</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'account'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>口座別</span>
          </button>
        </div>
      </div>

      {/* Chart & Legend Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Recharts Pie Chart (5 cols) */}
        <div className="md:col-span-5 h-64 flex items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-slate-400">データがありません</span>
          )}
        </div>

        {/* Right: Breakdown List Table (7 cols) */}
        <div className="md:col-span-7 space-y-2">
          {activeTab === 'currency' && (
            <div className="mb-2 p-2.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl text-xs text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
              💡 <strong>通貨エクスポージャーとは？</strong>
              <br />
              円建てで購入していても、オルカンやS&P500などは実質的に米ドル等の外貨建て資産です。実質的な通貨保有リスクを可視化しています。
            </div>
          )}

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {chartData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrencyJpy(item.value)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold w-12 text-right">
                    {formatPercent(item.percentage, false)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
