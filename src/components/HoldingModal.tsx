'use client';

import React, { useState, useEffect } from 'react';
import { Account, AssetHolding, AssetCategory, Currency, ExchangeRates } from '@/types';
import { CATEGORY_CONFIG, CURRENCY_CONFIG } from '@/lib/constants';
import { getRateForCurrency } from '@/lib/calculations';
import { X, HelpCircle, AlertCircle } from 'lucide-react';

interface HoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (holding: AssetHolding) => void;
  editingHolding?: AssetHolding | null;
  accounts: Account[];
  currentRates: ExchangeRates;
}

export const HoldingModal: React.FC<HoldingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHolding,
  accounts,
  currentRates,
}) => {
  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState<AssetCategory>('foreign_equity_fund');
  const [baseCurrency, setBaseCurrency] = useState<Currency>('USD');
  const [hasFxHedge, setHasFxHedge] = useState(false);
  const [purchaseAmountJpy, setPurchaseAmountJpy] = useState('');
  const [purchaseFxRate, setPurchaseFxRate] = useState('');
  const [currentValJpy, setCurrentValJpy] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingHolding) {
      setName(editingHolding.name);
      setAccountId(editingHolding.accountId);
      setCategory(editingHolding.category);
      setBaseCurrency(editingHolding.baseCurrency);
      setHasFxHedge(editingHolding.hasFxHedge);
      setPurchaseAmountJpy(editingHolding.purchaseAmountJpy.toString());
      setPurchaseFxRate(editingHolding.purchaseFxRate.toString());
      setCurrentValJpy(editingHolding.currentValJpy.toString());
      setNotes(editingHolding.notes || '');
    } else {
      setName('');
      setAccountId(accounts[0]?.id || '');
      setCategory('foreign_equity_fund');
      setBaseCurrency('USD');
      setHasFxHedge(false);
      setPurchaseAmountJpy('');
      setPurchaseFxRate(currentRates.USD.toString());
      setCurrentValJpy('');
      setNotes('');
    }
  }, [editingHolding, isOpen, accounts, currentRates]);

  const handleCategoryChange = (cat: AssetCategory) => {
    setCategory(cat);
    const config = CATEGORY_CONFIG[cat];
    setBaseCurrency(config.defaultCurrency);
    if (config.defaultCurrency !== 'JPY') {
      const rate = getRateForCurrency(config.defaultCurrency, currentRates);
      if (!purchaseFxRate || purchaseFxRate === '1') {
        setPurchaseFxRate(rate.toString());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newHolding: AssetHolding = {
      id: editingHolding ? editingHolding.id : `hold_${Date.now()}`,
      accountId: accountId || accounts[0]?.id || 'acc_default',
      name: name.trim(),
      category,
      baseCurrency,
      hasFxHedge,
      purchaseAmountJpy: parseFloat(purchaseAmountJpy) || 0,
      purchaseFxRate: parseFloat(purchaseFxRate) || getRateForCurrency(baseCurrency, currentRates),
      currentValJpy: parseFloat(currentValJpy) || 0,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newHolding);
    onClose();
  };

  if (!isOpen) return null;

  const isForeign = CATEGORY_CONFIG[category].isForeign && baseCurrency !== 'JPY';

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto cursor-pointer">
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 cursor-default">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {editingHolding ? '資産・銘柄の編集' : '新しい資産・銘柄を追加'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              銘柄名 / 資産名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例: eMAXIS Slim 全世界株式 (オール・カントリー)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-xs outline-none"
            />
          </div>

          {/* Account & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Account */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                保有口座 / 証券会社
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-xs outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                資産カテゴリ
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as AssetCategory)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-xs outline-none"
              >
                {Object.keys(CATEGORY_CONFIG).map((catKey) => (
                  <option key={catKey} value={catKey}>
                    {CATEGORY_CONFIG[catKey as AssetCategory].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Foreign Currency Settings (if applicable) */}
          {CATEGORY_CONFIG[category].isForeign && (
            <div className="bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-3">
              <div className="flex items-center gap-1 text-blue-900 dark:text-blue-300 font-bold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>為替・外貨設定 (円建て海外投信)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    原資産の通貨 (基準通貨)
                  </label>
                  <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value as Currency)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                  >
                    {Object.keys(CURRENCY_CONFIG).map((currKey) => (
                      <option key={currKey} value={currKey}>
                        {CURRENCY_CONFIG[currKey as Currency].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    購入時の平均為替レート (円)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="例: 135.0"
                    value={purchaseFxRate}
                    onChange={(e) => setPurchaseFxRate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hasFxHedge"
                  checked={hasFxHedge}
                  onChange={(e) => setHasFxHedge(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <label
                  htmlFor="hasFxHedge"
                  className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  為替ヘッジあり（為替リスクを避ける設定の場合のみチェック）
                </label>
              </div>
            </div>
          )}

          {/* Money Amounts (JPY) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                投資元本 (円建て購入額) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">¥</span>
                <input
                  type="number"
                  required
                  placeholder="例: 500000"
                  value={purchaseAmountJpy}
                  onChange={(e) => setPurchaseAmountJpy(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-xs outline-none font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                現在の評価額 (円) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">¥</span>
                <input
                  type="number"
                  required
                  placeholder="例: 680000"
                  value={currentValJpy}
                  onChange={(e) => setCurrentValJpy(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-xs outline-none font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              備考・メモ (任意)
            </label>
            <input
              type="text"
              placeholder="例: 新NISAつみたて枠で月5万円積立中"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-xs outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition"
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
