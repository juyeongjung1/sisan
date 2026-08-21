'use client';

import React, { useState } from 'react';
import { Account, AssetHolding, RecurringPlan } from '@/types';
import { formatCurrencyJpy } from '@/lib/calculations';
import { PAYMENT_METHOD_CONFIG } from '@/lib/constants';
import { Calendar, Plus, CreditCard, ArrowRight, TrendingUp, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RecurringPlanSectionProps {
  recurringPlans: RecurringPlan[];
  holdings: AssetHolding[];
  accounts: Account[];
  onOpenAddModal: () => void;
  onEditPlan: (plan: RecurringPlan) => void;
  onToggleActive: (id: string) => void;
  onDeletePlan: (id: string) => void;
  currentTotalValJpy: number;
}

export const RecurringPlanSection: React.FC<RecurringPlanSectionProps> = ({
  recurringPlans,
  holdings,
  accounts,
  onOpenAddModal,
  onEditPlan,
  onToggleActive,
  onDeletePlan,
  currentTotalValJpy,
}) => {
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(5); // 年利5%想定
  const [showProjection, setShowProjection] = useState<boolean>(true);

  const activePlans = recurringPlans.filter((p) => p.isActive);
  const monthlyTotal = activePlans.reduce((sum, p) => sum + p.monthlyAmountJpy, 0);
  const yearlyTotal = monthlyTotal * 12;

  // 今日の日付から最も近い次回の積立日を算出
  const today = new Date();
  const currentDay = today.getDate();
  const sortedDays = activePlans
    .map((p) => p.dayOfMonth)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => a - b);

  let nextDay = sortedDays.find((d) => d >= currentDay);
  if (!nextDay && sortedDays.length > 0) {
    nextDay = sortedDays[0]; // 来月の最初
  }

  // 1年後〜10年後の推移シミュレーションデータ生成（複利計算）
  const r = expectedReturnRate / 100 / 12; // 月利
  const projectionData = [
    { year: '現在', total: Math.round(currentTotalValJpy), invested: Math.round(currentTotalValJpy) },
  ];

  let simVal = currentTotalValJpy;
  let simInvested = currentTotalValJpy;

  for (let year = 1; year <= 10; year++) {
    for (let m = 1; m <= 12; m++) {
      simVal = simVal * (1 + r) + monthlyTotal;
      simInvested += monthlyTotal;
    }
    if (year === 1 || year === 3 || year === 5 || year === 7 || year === 10) {
      projectionData.push({
        year: `${year}年後`,
        total: Math.round(simVal),
        invested: Math.round(simInvested),
      });
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              毎月の積立投資設定 (定期積立)
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-medium">
                毎月 {formatCurrencyJpy(monthlyTotal)}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              各証券会社・クレカでの毎月の積立ルールと将来の資産形成推移
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>積立設定を追加</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            毎月の積立合計額
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrencyJpy(monthlyTotal)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            年間合計: {formatCurrencyJpy(yearlyTotal)}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            稼働中の積立設定
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {activePlans.length} 件
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            全 {recurringPlans.length} 件中
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            直近の積立予定日
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {nextDay ? `毎月 ${nextDay} 日` : '設定なし'}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            自動で入金・買付を実行
          </span>
        </div>
      </div>

      {/* Plan Cards List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          積立中の銘柄一覧
        </h3>

        {recurringPlans.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            まだ積立設定がありません。「積立設定を追加」から登録してください。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recurringPlans.map((plan) => {
              const holding = holdings.find((h) => h.id === plan.holdingId);
              const account = accounts.find((a) => a.id === plan.accountId);
              const payMethod = PAYMENT_METHOD_CONFIG[plan.paymentMethod]?.label || 'その他';

              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-xl border transition ${
                    plan.isActive
                      ? 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-sm'
                      : 'bg-slate-100/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: account?.color || '#3B82F6' }}
                        />
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          {account?.name || '指定口座'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1 truncate">
                        {holding?.name || '指定銘柄'}
                      </h4>
                    </div>

                    <button
                      onClick={() => onToggleActive(plan.id)}
                      className={`p-1 rounded-lg transition ${
                        plan.isActive
                          ? 'text-emerald-500 hover:text-emerald-600'
                          : 'text-slate-400 hover:text-slate-500'
                      }`}
                      title={plan.isActive ? '一時停止する' : '再開する'}
                    >
                      {plan.isActive ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>{payMethod}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        毎月 {plan.dayOfMonth} 日
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatCurrencyJpy(plan.monthlyAmountJpy)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/ 月</span>
                    </div>
                  </div>

                  {plan.notes && (
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded">
                      {plan.notes}
                    </p>
                  )}

                  <div className="mt-3 flex justify-end gap-2 text-xs">
                    <button
                      onClick={() => onEditPlan(plan)}
                      className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded transition font-medium"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => onDeletePlan(plan.id)}
                      className="text-rose-500 hover:text-rose-600 px-2 py-1 rounded transition font-medium"
                    >
                      削除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Projection Simulator Section */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 border border-indigo-800/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">
              毎月の積立を継続した場合の将来資産シミュレーション
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-300">想定年利:</span>
            {[3, 5, 7].map((rate) => (
              <button
                key={rate}
                onClick={() => setExpectedReturnRate(rate)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  expectedReturnRate === rate
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* Projection Chart */}
        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" stroke="#94A3B8" fontSize={11} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  formatCurrencyJpy(val),
                  name === 'total' ? `資産総額(年利${expectedReturnRate}%)` : '元本合計',
                ]}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366F1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="total"
              />
              <Area
                type="monotone"
                dataKey="invested"
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fillOpacity={1}
                fill="url(#colorInvested)"
                name="invested"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 5 Year & 10 Year Milestones */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-2.5 rounded-lg">
            <span className="text-slate-400 block text-[11px]">1年後 想定総額</span>
            <span className="font-bold text-white text-sm">
              {formatCurrencyJpy(projectionData[1]?.total || 0)}
            </span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-lg">
            <span className="text-slate-400 block text-[11px]">3年後 想定総額</span>
            <span className="font-bold text-white text-sm">
              {formatCurrencyJpy(projectionData[2]?.total || 0)}
            </span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-lg">
            <span className="text-slate-400 block text-[11px]">5年後 想定総額</span>
            <span className="font-bold text-indigo-300 text-sm">
              {formatCurrencyJpy(projectionData[3]?.total || 0)}
            </span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-lg">
            <span className="text-slate-400 block text-[11px]">10年後 想定総額</span>
            <span className="font-bold text-emerald-400 text-sm">
              {formatCurrencyJpy(projectionData[5]?.total || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
