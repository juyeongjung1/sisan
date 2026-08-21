'use client';

import React, { useState, useEffect } from 'react';
import { ExchangeRates } from '@/types';
import { DEFAULT_EXCHANGE_RATES } from '@/lib/constants';
import { X, DollarSign, RotateCcw } from 'lucide-react';

interface CustomRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: ExchangeRates;
  onSaveRates: (rates: ExchangeRates) => void;
}

export const CustomRateModal: React.FC<CustomRateModalProps> = ({
  isOpen,
  onClose,
  rates,
  onSaveRates,
}) => {
  const [usd, setUsd] = useState('');
  const [eur, setEur] = useState('');
  const [gbp, setGbp] = useState('');
  const [aud, setAud] = useState('');

  useEffect(() => {
    if (rates) {
      setUsd(rates.USD.toString());
      setEur(rates.EUR.toString());
      setGbp(rates.GBP.toString());
      setAud(rates.AUD.toString());
    }
  }, [rates, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRates({
      USD: parseFloat(usd) || DEFAULT_EXCHANGE_RATES.USD,
      EUR: parseFloat(eur) || DEFAULT_EXCHANGE_RATES.EUR,
      GBP: parseFloat(gbp) || DEFAULT_EXCHANGE_RATES.GBP,
      AUD: parseFloat(aud) || DEFAULT_EXCHANGE_RATES.AUD,
      lastUpdated: new Date().toISOString(),
      isCustom: true,
    });
    onClose();
  };

  const handleReset = () => {
    onSaveRates({
      ...DEFAULT_EXCHANGE_RATES,
      lastUpdated: new Date().toISOString(),
      isCustom: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              為替レートの手動調整
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            計算に使用する基準為替レート（対円）を手動で固定・調整できます。
          </p>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              米ドル (USD/JPY)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-bold">¥</span>
              <input
                type="number"
                step="0.01"
                required
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-bold text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                ユーロ (EUR/JPY)
              </label>
              <input
                type="number"
                step="0.01"
                value={eur}
                onChange={(e) => setEur(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                英ポンド (GBP/JPY)
              </label>
              <input
                type="number"
                step="0.01"
                value={gbp}
                onChange={(e) => setGbp(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <RotateCcw className="w-3 h-3" />
              <span>標準値に戻す</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
              >
                閉じる
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-sm"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
