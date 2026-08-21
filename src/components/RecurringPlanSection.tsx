'use client';

import React, { useState } from 'react';
import { Account, AssetHolding, RecurringPlan, AccumulationLog } from '@/types';
import { formatCurrencyJpy } from '@/lib/calculations';
import { PAYMENT_METHOD_CONFIG } from '@/lib/constants';
import { Language, translateHoldingName, translateAccountName } from '@/lib/i18n';
import {
  Calendar,
  Plus,
  CreditCard,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  Zap,
  Edit2,
  Trash2,
  History,
  Info,
  Clock,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RecurringPlanSectionProps {
  recurringPlans: RecurringPlan[];
  holdings: AssetHolding[];
  accounts: Account[];
  accumulationLogs: AccumulationLog[];
  onOpenAddModal: () => void;
  onEditPlan: (plan: RecurringPlan) => void;
  onToggleActive: (id: string) => void;
  onDeletePlan: (id: string) => void;
  onExecuteManual: (planId: string) => void;
  currentTotalValJpy: number;
  lang?: Language;
  isMasked?: boolean;
}

export const RecurringPlanSection: React.FC<RecurringPlanSectionProps> = ({
  recurringPlans,
  holdings,
  accounts,
  accumulationLogs,
  onOpenAddModal,
  onEditPlan,
  onToggleActive,
  onDeletePlan,
  onExecuteManual,
  currentTotalValJpy,
  lang = 'ja',
  isMasked = false,
}) => {
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(5);
  const [simulationHorizon, setSimulationHorizon] = useState<number>(10); // 10, 15, 20, 25, 30
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const formatVal = (val: number) => {
    if (isMasked) return '¥***,***';
    return formatCurrencyJpy(val);
  };

  // 稼働中の積立プラン合計額
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
    nextDay = sortedDays[0];
  }

  // 将来推移シミュレーションデータ（複利計算）
  const r = expectedReturnRate / 100 / 12;
  const projectionData = [
    { year: lang === 'ko' ? '현재' : '現在', total: Math.round(currentTotalValJpy), invested: Math.round(currentTotalValJpy) },
  ];

  let simVal = currentTotalValJpy;
  let simInvested = currentTotalValJpy;

  for (let year = 1; year <= simulationHorizon; year++) {
    for (let m = 1; m <= 12; m++) {
      simVal = simVal * (1 + r) + monthlyTotal;
      simInvested += monthlyTotal;
    }
    // グラフのデータ点（間引き・最適化）
    projectionData.push({
      year: lang === 'ko' ? `${year}년 후` : `${year}年後`,
      total: Math.round(simVal),
      invested: Math.round(simInvested),
    });
  }

  // マイルストーン表示用の代表年
  const milestoneYears = [
    1,
    5,
    Math.min(10, simulationHorizon),
    simulationHorizon,
  ].filter((v, i, a) => a.indexOf(v) === i);

  const getHoldingName = (holdingId: string) => {
    const h = holdings.find((item) => item.id === holdingId);
    return h ? translateHoldingName(h.name, lang) : holdingId;
  };

  const getAccountName = (accountId: string) => {
    const a = accounts.find((item) => item.id === accountId);
    return a ? translateAccountName(a.name, lang) : accountId;
  };

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
              {lang === 'ko' ? '정기 적립 투자 플랜 (자동 적립)' : '毎月の積立投資設定 (定期積立)'}
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-medium">
                {lang === 'ko' ? `매월 ${formatVal(monthlyTotal)}` : `毎月 ${formatVal(monthlyTotal)}`}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'ko' ? '지정일이 되면 자동으로 자산에 가산 반영됩니다' : '指定日を迎えると自動で資産へ加算反映されます'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {accumulationLogs.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
            >
              <History className="w-3.5 h-3.5" />
              <span>{lang === 'ko' ? `적립 이력 (${accumulationLogs.length})` : `積立履歴 (${accumulationLogs.length})`}</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ko' ? '적립 설정 추가' : '積立設定を追加'}</span>
          </button>
        </div>
      </div>

      {/* Auto-accumulation Info Banner */}
      <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong>⚡ {lang === 'ko' ? '자동 적립 반영 기능 활성화' : '自動積立反映機能が有効です'}</strong>
          <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
            {lang === 'ko'
              ? '매월의 적립일(예: 8일, 29일)을 지난 상태로 접속하면 자동으로 원금과 평가액에 적립이 가산 반영됩니다.'
              : '毎月の積立日（例: 8日、29日）を過ぎた状態でサイトを開くと、自動で元本と評価額に積立額が加算反映されます。手動で即時反映したい場合は各プランの「今すぐ積立」ボタンを押してください。'}
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'ko' ? '매월 적립 합계액' : '毎月の積立合計額'}
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatVal(monthlyTotal)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {lang === 'ko' ? `연간 적립 합계: ${formatVal(yearlyTotal)}` : `年間積立合計: ${formatVal(yearlyTotal)}`}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'ko' ? '가동 중인 적립 플랜' : '稼働中の積立設定'}
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {activePlans.length} {lang === 'ko' ? '건' : '件'}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {lang === 'ko' ? `전체 ${recurringPlans.length}개 플랜 중` : `全 ${recurringPlans.length} 件中`}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'ko' ? '다음 적립 예정일' : '次回の積立予定日'}
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {nextDay ? (lang === 'ko' ? `매월 ${nextDay}일` : `毎月 ${nextDay} 日`) : (lang === 'ko' ? '설정 없음' : '設定なし')}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block font-medium">
            {nextDay ? (lang === 'ko' ? '지정일에 자동 가산됩니다' : '指定日に自動加算されます') : '-'}
          </span>
        </div>
      </div>

      {/* Accumulation Execution History Panel (Toggleable) */}
      {showHistory && accumulationLogs.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'ko' ? '자동 적립 실행 이력 (최근)' : '自動積立の実行履歴 (直近)'}</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              {lang === 'ko' ? `전체 ${accumulationLogs.length}회 실행` : `全 ${accumulationLogs.length} 回の積立実行`}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700/60 text-xs">
            {accumulationLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {getHoldingName(log.holdingId)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {log.executedAt.replace('T', ' ').substring(0, 16)} • {lang === 'ko' ? '자동 반영 완료' : '自動反映済'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                    +{formatVal(log.amountJpy)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {lang === 'ko' ? '원금 및 평가액 가산 완료' : '元本＆評価額へ加算済'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {recurringPlans.map((plan) => {
          const methodLabel = PAYMENT_METHOD_CONFIG[plan.paymentMethod]?.label || plan.paymentMethod;
          return (
            <div
              key={plan.id}
              className={`p-4 rounded-xl border transition relative overflow-hidden group ${
                plan.isActive
                  ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
                  : 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                    {getHoldingName(plan.holdingId)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
                    {getAccountName(plan.accountId)}
                  </span>
                </div>

                <button
                  onClick={() => onToggleActive(plan.id)}
                  className={`p-1 rounded-lg transition shrink-0 ${
                    plan.isActive
                      ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                      : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                  title={plan.isActive ? (lang === 'ko' ? '일시 정지' : '一時停止する') : (lang === 'ko' ? '재개' : '再開する')}
                >
                  {plan.isActive ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {lang === 'ko' ? '매월 적립액' : '毎月の積立額'}
                  </span>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {formatVal(plan.monthlyAmountJpy)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {lang === 'ko' ? '적립일' : '積立日'}
                  </span>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'ko' ? `매월 ${plan.dayOfMonth}일` : `毎月 ${plan.dayOfMonth} 日`}
                  </div>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-slate-400" />
                  <span>{methodLabel}</span>
                </div>

                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
                  <button
                    onClick={() => onExecuteManual(plan.id)}
                    className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 rounded font-semibold transition"
                    title={lang === 'ko' ? '수동으로 지금 즉시 자산에 가산 반영' : '手動で今すぐこの積立額を資産へ加算反映する'}
                  >
                    <Zap className="w-3 h-3" />
                    <span>{lang === 'ko' ? '즉시 적립' : '今すぐ積立'}</span>
                  </button>
                  <button
                    onClick={() => onEditPlan(plan)}
                    className="p-1 hover:text-blue-500 rounded transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeletePlan(plan.id)}
                    className="p-1 hover:text-rose-500 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extended Future Simulation (10 / 15 / 20 / 25 / 30 Years) */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                {lang === 'ko'
                  ? `${simulationHorizon}년 복리 자산 성장 시뮬레이션 (매월 ${formatVal(monthlyTotal)} 적립)`
                  : `将来資産シミュレーション (毎月 ${formatVal(monthlyTotal)} 積立)`}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'ko'
                ? '현재 총자산을 기반으로 연복리와 매월 정기 적립을 지속했을 때의 자산 성장 예측'
                : '現在の総資産を元手に、年利複利と毎月の定期積立を継続した場合の資産成長予測'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Horizon Selector (10 / 15 / 20 / 25 / 30 Years) */}
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
              <span className="text-[11px] text-slate-400 pl-1.5 pr-0.5 font-medium">{lang === 'ko' ? '기간:' : '期間:'}</span>
              {[10, 15, 20, 25, 30].map((h) => (
                <button
                  key={h}
                  onClick={() => setSimulationHorizon(h)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                    simulationHorizon === h
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {h}{lang === 'ko' ? '년' : '年'}
                </button>
              ))}
            </div>

            {/* Return Rate Selector */}
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
              <span className="text-[11px] text-slate-400 pl-1.5 pr-0.5 font-medium">{lang === 'ko' ? '상정연리:' : '想定年利:'}</span>
              {[3, 5, 7, 10, 15].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setExpectedReturnRate(rate)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                    expectedReturnRate === rate
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projection Chart */}
        <div className="h-56 w-full pt-2">
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
                tickFormatter={(v) => isMasked ? '***' : `${(v / 10000).toFixed(0)}万`}
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  formatVal(val),
                  name === 'total' ? (lang === 'ko' ? `자산 총액(연 ${expectedReturnRate}%)` : `資産総額(年利${expectedReturnRate}%)`) : (lang === 'ko' ? '원금 합계' : '元本合計'),
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

        {/* Dynamic Milestones */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
          {milestoneYears.map((yr) => {
            const pt = projectionData[yr];
            return (
              <div key={yr} className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[11px]">{lang === 'ko' ? `${yr}년 후 상정 총액` : `${yr}年後 想定総額`}</span>
                <span className={`font-bold text-sm ${yr === simulationHorizon ? 'text-emerald-400' : 'text-indigo-300'}`}>
                  {formatVal(pt?.total || 0)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {lang === 'ko' ? '원금:' : '元本:'} {formatVal(pt?.invested || 0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
