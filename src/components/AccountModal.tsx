'use client';

import React, { useState } from 'react';
import { Account, AccountType } from '@/types';
import { X, Plus, Trash2, Landmark, Check } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSaveAccounts: (accounts: Account[]) => void;
}

const PRESET_COLORS = [
  '#BE185D', // Pink/Red (Rakuten)
  '#1D4ED8', // Blue (SBI)
  '#D97706', // Amber (Monex)
  '#059669', // Emerald (Bank)
  '#7C3AED', // Purple
  '#DC2626', // Red
  '#0891B2', // Cyan
  '#4B5563', // Gray
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onSaveAccounts,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('brokerage');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [notes, setNotes] = useState('');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAccount: Account = {
      id: `acc_${Date.now()}`,
      name: name.trim(),
      type,
      color,
      notes: notes.trim(),
    };

    onSaveAccounts([...accounts, newAccount]);
    setName('');
    setNotes('');
  };

  const handleDeleteAccount = (id: string) => {
    if (accounts.length <= 1) {
      alert('最低1つの口座が必要です。');
      return;
    }
    if (confirm('この口座を削除しますか？紐づく資産の設定にご注意ください。')) {
      onSaveAccounts(accounts.filter((a) => a.id !== id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              口座・プラットフォーム管理
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Accounts List */}
        <div className="mt-4 space-y-2 max-h-52 overflow-y-auto pr-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            登録済みの口座一覧 ({accounts.length})
          </span>
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: acc.color }}
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {acc.name}
                </span>
                {acc.notes && (
                  <span className="text-[10px] text-slate-400 hidden sm:inline truncate">
                    ({acc.notes})
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteAccount(acc.id)}
                className="p-1 text-slate-400 hover:text-rose-600 transition"
                title="削除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Account Form */}
        <form onSubmit={handleAddAccount} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            新規口座の追加
          </span>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
              口座名 / 金融機関名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例: SBI証券, 楽天証券, auカブコム証券..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                種別
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs outline-none"
              >
                <option value="brokerage">証券口座 (NISA等)</option>
                <option value="bank">銀行・預金</option>
                <option value="crypto">暗号資産取引所</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                識別カラー
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {PRESET_COLORS.slice(0, 5).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-5 h-5 rounded-full flex items-center justify-center transition border border-white dark:border-slate-900 shadow-sm"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
              メモ (任意)
            </label>
            <input
              type="text"
              placeholder="例: クレカ積立用"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>口座を追加</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
