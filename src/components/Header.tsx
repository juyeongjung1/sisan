'use client';

import React from 'react';
import { ExchangeRates } from '@/types';
import { RefreshCw, Plus, Database, DollarSign, TrendingUp, LineChart, Globe } from 'lucide-react';

interface HeaderProps {
  exchangeRates: ExchangeRates;
  isFetchingRates: boolean;
  isFetchingFunds?: boolean;
  lastFundSyncTime?: string | null;
  onRefreshRates: () => void;
  onRefreshFunds?: () => void;
  onOpenAddModal: () => void;
  onOpenAccountModal: () => void;
  onOpenBackupModal: () => void;
  onOpenCustomRateModal: () => void;
  onOpenHistoryModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  exchangeRates,
  isFetchingRates,
  isFetchingFunds,
  lastFundSyncTime,
  onRefreshRates,
  onRefreshFunds,
  onOpenAddModal,
  onOpenAccountModal,
  onOpenBackupModal,
  onOpenCustomRateModal,
  onOpenHistoryModal,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                資産管理ダッシュボード
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>分散投資 & 為替要因・資産成長一元可視化</span>
                <span className="hidden sm:inline bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded border border-emerald-500/30">
                  3時間毎 基準価額自動連動
                </span>
              </div>
            </div>
          </div>

          {/* FX & Fund Live Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* USD/JPY Rate */}
            <div
              onClick={onOpenCustomRateModal}
              className="flex items-center gap-3 bg-slate-800/90 hover:bg-slate-800 transition-colors border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs cursor-pointer group"
              title="クリックして為替レートを手動編集"
            >
              <div className="flex items-center gap-1.5 text-blue-400 font-medium">
                <DollarSign className="w-3.5 h-3.5" />
                <span>USD/JPY:</span>
                <span className="text-white font-bold text-sm">
                  ¥{exchangeRates.USD.toFixed(2)}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-slate-400 border-l border-slate-700 pl-2">
                <span>EUR:</span>
                <span className="text-slate-200">¥{exchangeRates.EUR.toFixed(2)}</span>
              </div>
              {exchangeRates.isCustom && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30">
                  手動設定
                </span>
              )}
            </div>

            {/* Sync Live Prices Button (Funds & FX) */}
            {onRefreshFunds && (
              <button
                onClick={onRefreshFunds}
                disabled={isFetchingFunds}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 rounded-lg text-xs border border-blue-700/50 transition font-medium disabled:opacity-50"
                title="公表Webサイトから最新の投信基準価額・株価を今すぐ同期"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFunds ? 'animate-spin text-blue-400' : ''}`} />
                <span className="hidden sm:inline">投信・為替同期</span>
              </button>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-auto md:ml-2">
              {onOpenHistoryModal && (
                <button
                  onClick={onOpenHistoryModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 rounded-lg text-xs font-semibold border border-indigo-500/40 transition"
                >
                  <LineChart className="w-3.5 h-3.5 text-indigo-400" />
                  <span>推移分析</span>
                </button>
              )}

              <button
                onClick={onOpenBackupModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">データ管理</span>
              </button>

              <button
                onClick={onOpenAccountModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                <span>口座管理</span>
              </button>

              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>資産を追加</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
