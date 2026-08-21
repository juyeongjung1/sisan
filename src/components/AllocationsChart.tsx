'use client';

import React, { useState } from 'react';
import { CurrencyExposure, CategoryAllocation, AccountAllocation, ProductAllocation } from '@/types';
import { formatCurrencyJpy, formatPercent } from '@/lib/calculations';
import { Language, translateAccountName, translateProductName } from '@/lib/i18n';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, Coins, Layers, Landmark, Sparkles, Users } from 'lucide-react';

interface AllocationsChartProps {
  currencyExposures: CurrencyExposure[];
  categoryAllocations: CategoryAllocation[];
  accountAllocations: AccountAllocation[];
  productAllocations: ProductAllocation[];
  lang?: Language;
  isMasked?: boolean;
}

type TabType = 'product' | 'category' | 'currency' | 'account';

export const AllocationsChart: React.FC<AllocationsChartProps> = ({
  currencyExposures,
  categoryAllocations,
  accountAllocations,
  productAllocations,
  lang = 'ja',
  isMasked = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('product');

  const formatVal = (val: number) => {
    if (isMasked) return '¥***,***';
    return formatCurrencyJpy(val);
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'product':
        return productAllocations.map((d) => ({
          name: translateProductName(d.name, lang),
          value: d.amountJpy,
          percentage: d.percentage,
          color: d.color,
          mergedAccounts: d.mergedAccounts,
          fundCode: d.fundCode,
        }));
      case 'category':
        return categoryAllocations.map((d) => ({
          name: d.label,
          value: d.amountJpy,
          percentage: d.percentage,
          color: d.color,
        }));
      case 'currency':
        return currencyExposures.map((d) => ({
          name:
            lang === 'ko'
              ? d.currency === 'USD'
                ? '미국 달러 (USD)'
                : d.currency === 'JPY'
                ? '일본 엔 (JPY)'
                : d.label
              : d.label,
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
        <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1 text-white backdrop-blur-md min-w-[180px]">
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
          {data.mergedAccounts && data.mergedAccounts.length > 1 && (
            <div className="pt-1 border-t border-slate-800 text-[10px] text-indigo-300">
              <span>{lang === 'ko' ? '🔗 통합 계좌:' : '🔗 合算口座:'} {data.mergedAccounts.map((a: string) => translateAccountName(a, lang)).join(' + ')}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {lang === 'ko' ? '포트폴리오 배분 비중 (리스크 분산)' : 'ポートフォリオ配分比率 (分散状況)'}
              {activeTab === 'product' && (
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full font-bold">
                  {lang === 'ko' ? '상품별 정밀 분해 (부부 합산)' : '商品別詳細 (夫婦合算)'}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'ko'
                ? '상품별(ZTech20 부부 합산) / 자산 종류별 / 통화별 환노출 / 계좌별 다각도 분석'
                : '商品別（Zテック20夫婦合算）/ 資産種別 / 通貨別為替 / 口座別の一元管理'}
            </p>
          </div>
        </div>

        {/* 4 Tab Buttons */}
        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 self-start lg:self-auto">
          {/* 1. Product (New Feature) */}
          <button
            onClick={() => setActiveTab('product')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === 'product'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>{lang === 'ko' ? '상품별 (종목 합산)' : '商品別 (銘柄)'}</span>
          </button>

          {/* 2. Category */}
          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'category'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'ko' ? '자산 종류별' : '資産種別'}</span>
          </button>

          {/* 3. Currency */}
          <button
            onClick={() => setActiveTab('currency')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'currency'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{lang === 'ko' ? '통화별 (환노출)' : '通貨別 (為替)'}</span>
          </button>

          {/* 4. Account */}
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Pie Chart */}
        <div className="md:col-span-5 h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={88}
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
        <div className="md:col-span-7 space-y-2 max-h-72 overflow-y-auto pr-1">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </span>
                    {(item as any).mergedAccounts && (item as any).mergedAccounts.length > 1 && (
                      <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5 shrink-0">
                        <Users className="w-2.5 h-2.5" />
                        <span>{lang === 'ko' ? '2개 계좌 합산 (부부)' : '2口座合算 (本人+妻)'}</span>
                      </span>
                    )}
                  </div>
                  {(item as any).mergedAccounts && (item as any).mergedAccounts.length > 1 && (
                    <span className="text-[10px] text-slate-400 block truncate">
                      {(item as any).mergedAccounts.map((a: string) => translateAccountName(a, lang)).join(' • ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="font-bold text-slate-900 dark:text-white text-xs font-mono">
                  {formatVal(item.value)}
                </span>
                <span
                  className="font-bold text-[11px] px-2 py-0.5 rounded-full text-white shrink-0 font-mono shadow-sm"
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
