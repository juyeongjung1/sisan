'use client';

import React, { useState } from 'react';
import { Account, AssetHolding, AssetCategory } from '@/types';
import { HoldingAnalysis, formatCurrencyJpy, formatPercent } from '@/lib/calculations';
import { CATEGORY_CONFIG, CURRENCY_CONFIG } from '@/lib/constants';
import {
  ListFilter,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Repeat,
  Info,
  Radio,
} from 'lucide-react';

interface HoldingsTableProps {
  analyzedHoldings: HoldingAnalysis[];
  accounts: Account[];
  onOpenAddModal: () => void;
  onEditHolding: (holding: AssetHolding) => void;
  onDeleteHolding: (id: string) => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  analyzedHoldings,
  accounts,
  onOpenAddModal,
  onEditHolding,
  onDeleteHolding,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredHoldings = analyzedHoldings.filter((item) => {
    if (selectedAccount !== 'all' && item.holding.accountId !== selectedAccount) {
      return false;
    }
    if (selectedCategory !== 'all' && item.holding.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Table Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            保有資産・銘柄一覧
            <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
              {filteredHoldings.length} 件
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            口座ごとの銘柄詳細・3時間毎の公表基準価額連動
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Account Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <ListFilter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">すべての口座</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">すべての資産種別</option>
              {Object.keys(CATEGORY_CONFIG).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {CATEGORY_CONFIG[catKey as AssetCategory].label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition ml-auto md:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>追加</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="pb-3 pl-2">銘柄名 / カテゴリ / 備考</th>
              <th className="pb-3">口座</th>
              <th className="pb-3 text-right">投資元本 (円)</th>
              <th className="pb-3 text-right">購入時レート</th>
              <th className="pb-3 text-right">現在評価額 / 公表基準価額</th>
              <th className="pb-3 text-right">トータル損益</th>
              <th className="pb-3 text-right">為替要因 / 株価要因</th>
              <th className="pb-3 text-center pr-2">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredHoldings.map((item) => {
              const h = item.holding;
              const isGainPositive = item.gainLossJpy >= 0;
              const catConfig = CATEGORY_CONFIG[h.category];
              const currConfig = CURRENCY_CONFIG[h.baseCurrency];

              return (
                <tr
                  key={h.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
                >
                  {/* Name & Category */}
                  <td className="py-3 pl-2 max-w-sm">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                      <span>{h.name}</span>
                      {item.recurringPlan && (
                        <span
                          className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-0.5 shrink-0"
                          title={`毎月${item.recurringPlan.dayOfMonth}日に${formatCurrencyJpy(item.recurringPlan.monthlyAmountJpy)}積立中`}
                        >
                          <Repeat className="w-2.5 h-2.5" />
                          <span>毎月{item.recurringPlan.dayOfMonth}日 {formatCurrencyJpy(item.recurringPlan.monthlyAmountJpy)}積立</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium text-white"
                        style={{ backgroundColor: catConfig.color }}
                      >
                        {catConfig.label.split(' ')[0]}
                      </span>
                      {item.isForeignUnhedged ? (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-0.5 font-medium">
                          <Globe className="w-2.5 h-2.5" />
                          <span>実質{currConfig.label.split(' ')[0]}建て (ヘッジ無)</span>
                        </span>
                      ) : h.hasFxHedge ? (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                          🛡️ 為替ヘッジあり
                        </span>
                      ) : null}
                      {h.fundCode && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          [{h.fundCode}]
                        </span>
                      )}
                    </div>
                    {h.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 bg-slate-100/60 dark:bg-slate-800/50 px-2 py-0.5 rounded flex items-center gap-1">
                        <Info className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{h.notes}</span>
                      </p>
                    )}
                  </td>

                  {/* Account */}
                  <td className="py-3 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.account?.color || '#9CA3AF' }}
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.account?.name || '未設定'}
                      </span>
                    </div>
                  </td>

                  {/* Principal */}
                  <td className="py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrencyJpy(h.purchaseAmountJpy)}
                  </td>

                  {/* Purchase FX Rate */}
                  <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                    {item.isForeignUnhedged ? (
                      <div>
                        <span className="font-medium">¥{h.purchaseFxRate.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400 block">
                          (現在: ¥{item.currFxRate.toFixed(1)})
                        </span>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>

                  {/* Current Value & Live Web NAV Price */}
                  <td className="py-3 text-right">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {formatCurrencyJpy(h.currentValJpy)}
                    </div>
                    {h.latestNavPrice ? (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-end gap-1">
                        <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                        <span>基準値: ¥{h.latestNavPrice.toLocaleString()}</span>
                        {h.dailyChangePct !== undefined && (
                          <span
                            className={
                              h.dailyChangePct >= 0 ? 'text-emerald-500' : 'text-rose-500'
                            }
                          >
                            ({h.dailyChangePct >= 0 ? '+' : ''}
                            {h.dailyChangePct}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">固定/現金</span>
                    )}
                  </td>

                  {/* Total Gain/Loss */}
                  <td className="py-3 text-right">
                    <div
                      className={`font-bold ${
                        isGainPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatCurrencyJpy(item.gainLossJpy, true)}
                    </div>
                    <span
                      className={`text-[10px] font-medium block ${
                        isGainPositive ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {formatPercent(item.gainLossPercent, true)}
                    </span>
                  </td>

                  {/* FX vs Asset Breakdown */}
                  <td className="py-3 text-right text-[11px]">
                    {item.isForeignUnhedged ? (
                      <div className="space-y-0.5">
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          株価: {formatCurrencyJpy(item.assetGrowthGainJpy, true)}
                        </div>
                        <div className="text-amber-600 dark:text-amber-400 font-medium">
                          為替: {formatCurrencyJpy(item.fxGainJpy + item.synergyGainJpy, true)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">為替影響なし</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 pr-2 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onEditHolding(h)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="編集"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteHolding(h.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Optimized for Smartphones) */}
      <div className="lg:hidden space-y-3">
        {filteredHoldings.map((item) => {
          const h = item.holding;
          const isGainPositive = item.gainLossJpy >= 0;
          const catConfig = CATEGORY_CONFIG[h.category];

          return (
            <div
              key={h.id}
              className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.account?.color || '#9CA3AF' }}
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-bold truncate">
                      {item.account?.name || '口座未設定'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {h.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditHolding(h)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteHolding(h.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium"
                  style={{ backgroundColor: catConfig.color }}
                >
                  {catConfig.label.split(' ')[0]}
                </span>
                {item.recurringPlan && (
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <Repeat className="w-2.5 h-2.5" />
                    毎月{item.recurringPlan.dayOfMonth}日 {formatCurrencyJpy(item.recurringPlan.monthlyAmountJpy)}積立中
                  </span>
                )}
                {h.hasFxHedge && (
                  <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-medium border border-indigo-300 dark:border-indigo-800">
                    為替ヘッジあり
                  </span>
                )}
              </div>

              {/* Live Web NAV Price info */}
              {h.latestNavPrice && (
                <div className="flex items-center gap-2 text-[11px] bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span>公表基準価額: <strong>¥{h.latestNavPrice.toLocaleString()}</strong></span>
                  {h.dailyChangePct !== undefined && (
                    <span className={h.dailyChangePct >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      (前日比 {h.dailyChangePct >= 0 ? '+' : ''}{h.dailyChangePct}%)
                    </span>
                  )}
                </div>
              )}

              {/* Notes */}
              {h.notes && (
                <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  {h.notes}
                </div>
              )}

              {/* Main Financial Values */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    投資元本:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrencyJpy(h.purchaseAmountJpy)}
                  </span>
                  {item.isForeignUnhedged && (
                    <span className="text-[10px] text-slate-400 block">
                      (買付想定: ¥{h.purchaseFxRate.toFixed(1)})
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    現在評価額:
                  </span>
                  <span className="font-bold text-base text-slate-900 dark:text-white">
                    {formatCurrencyJpy(h.currentValJpy)}
                  </span>
                </div>
              </div>

              {/* Gain/Loss & FX Breakdown */}
              <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/70 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-600 dark:text-slate-300">トータル損益:</span>
                  <span
                    className={
                      isGainPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {formatCurrencyJpy(item.gainLossJpy, true)} (
                    {formatPercent(item.gainLossPercent, true)})
                  </span>
                </div>

                {item.isForeignUnhedged && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1 text-[11px]">
                    <div className="text-blue-600 dark:text-blue-400">
                      📈 株価成長: {formatCurrencyJpy(item.assetGrowthGainJpy, true)}
                    </div>
                    <div className="text-amber-600 dark:text-amber-400 text-right">
                      💱 為替効果: {formatCurrencyJpy(item.fxGainJpy + item.synergyGainJpy, true)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
