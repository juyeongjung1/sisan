'use client';

import React, { useRef } from 'react';
import { Account, AssetHolding, RecurringPlan, ExchangeRates } from '@/types';
import { exportToJson, exportToCsv, ExportData } from '@/lib/storage';
import { INITIAL_ACCOUNTS, INITIAL_HOLDINGS, INITIAL_RECURRING_PLANS, DEFAULT_EXCHANGE_RATES } from '@/lib/constants';
import { X, Download, Upload, FileSpreadsheet, RotateCcw, Database } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  holdings: AssetHolding[];
  recurringPlans: RecurringPlan[];
  exchangeRates: ExchangeRates;
  onImportData: (data: ExportData) => void;
  onResetToSample: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  accounts,
  holdings,
  recurringPlans,
  exchangeRates,
  onImportData,
  onResetToSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.accounts && json.holdings) {
          onImportData({
            version: json.version || '1.0.0',
            exportedAt: json.exportedAt || new Date().toISOString(),
            accounts: json.accounts,
            holdings: json.holdings,
            recurringPlans: json.recurringPlans || [],
            exchangeRates: json.exchangeRates || DEFAULT_EXCHANGE_RATES,
          });
          alert('バックアップデータを正常に読み込みました。');
          onClose();
        } else {
          alert('無効なデータ形式です。');
        }
      } catch (err) {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              データ管理・バックアップ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            登録された資産・口座・積立データは、お使いの端末のブラウザ内（LocalStorage）に安全に保存されています。外部サーバーには送信されません。
          </p>

          {/* Export JSON */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                JSONバックアップを保存
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                すべての設定・資産・積立データを完全保存
              </span>
            </div>
            <button
              onClick={() => exportToJson(accounts, holdings, recurringPlans, exchangeRates)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-sm transition shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>保存</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                JSONバックアップを復元
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                保存したJSONファイルからデータを復元
              </span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold shadow-sm transition shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>読込</span>
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                CSVファイルで出力
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Excelやスプレッドシート用
              </span>
            </div>
            <button
              onClick={() => exportToCsv(holdings, accounts)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-sm transition shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>

          {/* Reset to Sample */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-[11px] text-slate-400">
              初期デモデータに戻したい場合:
            </span>
            <button
              onClick={() => {
                if (confirm('すべてのデータを初期サンプルデータにリセットしますか？')) {
                  onResetToSample();
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium px-2 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>サンプルデータにリセット</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
