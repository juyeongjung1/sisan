'use client';

import React, { useState } from 'react';
import { CurrencyExposure, CategoryAllocation, AccountAllocation } from '@/types';
import { formatCurrencyJpy, formatPercent } from '@/lib/calculations';
import { Language, translateAccountName } from '@/lib/i18n';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, Coins, Layers, Landmark } from 'lucide-react';

interface AllocationsChartProps {
  currencyExposures: CurrencyExposure[];
  categoryAllocations: CategoryAllocation[];
  accountAllocations: AccountAllocation[];
  lang?: Language;
  isMasked?: boolean;
}

type TabType = 'currency' | 'category' | 'account';

export const AllocationsChart: React.FC<AllocationsChartProps> = ({
  currencyExposures,
  categoryAllocations,
  accountAllocations,
  lang = 'ja',
  isMasked = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('currency');

  const formatVal = (val: number) => {
    if (isMasked) return '¥***,***';
    return formatCurrencyJpy(val);
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'currency':
        return currencyExposures.map((d) => ({
          name: lang === 'ko' ? (d.currency === 'USD' ? '미국 달러 (USD)' : d.currency === 'JPY' ? '일본 엔 (JPY)' : d.label) : d.label,
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
          name: translateAccountName(d.name, lang),
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
        <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1 text-white backdrop-blur-md">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>{lang === 'ko' ? '평가액:' : '評価額:'}</span>
            <span className="font-bold text-white">{formatVal(data.value)}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>{lang === 'ko' ? '구성비:' : '構成比:'}</span>
            <span className="font-bold text-blue-400">{formatPercent(data.percentage)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'ko' ? '포트폴리오 배분 비중 (리스크 분산)' : 'ポートフォリオ配分比率 (分散状況)'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'ko' ? '통화별 환노출 / 자산군별 / 계좌별 다각도 분석' : '通貨別為替エクスポージャー / 資産クラス別 / 口座別の一元管理'}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('currency')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'currency'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{lang === 'ko' ? '통화별 (환노출)' : '通貨別 (為替)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'category'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'ko' ? '자산 종류별' : '資産種別'}</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'account'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>{lang === 'ko' ? '계좌별' : '口座別'}</span>
          </button>
        </div>
      </div>

      {/* Chart & Legend Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Pie Chart */}
        <div className="md:col-span-5 h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend List */}
        <div className="md:col-span-7 space-y-2">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatVal(item.value)}
                </span>
                <span
                  className="font-bold text-xs px-2 py-0.5 rounded-full text-white shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  {formatPercent(item.percentage)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
