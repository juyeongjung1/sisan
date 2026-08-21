'use client';

import React, { useState, useEffect } from 'react';
import { Account, AssetHolding, RecurringPlan, PaymentMethod } from '@/types';
import { PAYMENT_METHOD_CONFIG } from '@/lib/constants';
import { X, Calendar } from 'lucide-react';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: RecurringPlan) => void;
  editingPlan?: RecurringPlan | null;
  holdings: AssetHolding[];
  accounts: Account[];
}

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPlan,
  holdings,
  accounts,
}) => {
  const [holdingId, setHoldingId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [monthlyAmountJpy, setMonthlyAmountJpy] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingPlan) {
      setHoldingId(editingPlan.holdingId);
      setAccountId(editingPlan.accountId);
      setMonthlyAmountJpy(editingPlan.monthlyAmountJpy.toString());
      setDayOfMonth(editingPlan.dayOfMonth);
      setPaymentMethod(editingPlan.paymentMethod);
      setIsActive(editingPlan.isActive);
      setNotes(editingPlan.notes || '');
    } else {
      setHoldingId(holdings[0]?.id || '');
      setAccountId(accounts[0]?.id || '');
      setMonthlyAmountJpy('50000');
      setDayOfMonth(1);
      setPaymentMethod('credit_card');
      setIsActive(true);
      setNotes('');
    }
  }, [editingPlan, isOpen, holdings, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdingId || !monthlyAmountJpy) return;

    const newPlan: RecurringPlan = {
      id: editingPlan ? editingPlan.id : `rec_${Date.now()}`,
      holdingId,
      accountId: accountId || accounts[0]?.id || '',
      monthlyAmountJpy: parseFloat(monthlyAmountJpy) || 0,
      dayOfMonth: Number(dayOfMonth) || 1,
      paymentMethod,
      isActive,
      notes: notes.trim(),
    };

    onSave(newPlan);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto cursor-pointer">
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 cursor-default">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingPlan ? '積立設定の編集' : '毎月の積立設定を追加'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Target Holding */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              積立対象の銘柄 <span className="text-rose-500">*</span>
            </label>
            <select
              value={holdingId}
              onChange={(e) => setHoldingId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-xs outline-none font-medium"
            >
              {holdings.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              引落 / 積立口座
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-xs outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Monthly Amount & Day */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                毎月の積立額 (円) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">¥</span>
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={monthlyAmountJpy}
                  onChange={(e) => setMonthlyAmountJpy(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-xs outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                毎月の積立指定日 (日)
              </label>
              <select
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-xs outline-none font-medium"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    毎月 {d} 日
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              決済・積立方法
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-xs outline-none"
            >
              {Object.keys(PAYMENT_METHOD_CONFIG).map((mKey) => (
                <option key={mKey} value={mKey}>
                  {PAYMENT_METHOD_CONFIG[mKey as PaymentMethod].label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              メモ (任意)
            </label>
            <input
              type="text"
              placeholder="例: クレカ積立5万円枠でポイント還元"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-xs outline-none"
            />
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPlanActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <label
              htmlFor="isPlanActive"
              className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              この積立設定を有効にする
            </label>
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-600/30 transition"
            >
              設定を保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
