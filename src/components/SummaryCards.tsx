'use client';

import React from 'react';
import { PortfolioSummary } from '@/types';
import { formatCurrencyJpy, formatPercent } from '@/lib/calculations';
import { Language, DICTIONARY } from '@/lib/i18n';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, Globe, Layers, Calendar, Sparkles } from 'lucide-react';

interface SummaryCardsProps {
  summary: PortfolioSummary;
  lang?: Language;
  isMasked?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  lang = 'ja',
  isMasked = false,
}) => {
  const t = DICTIONARY[lang];
  const isPositive = summary.totalGainLossJpy >= 0;
  const isSimulated = summary.simulatedDiffJpy !== 0;

  // 為替要因が利益全体に占める割合
  const foreignTotalGain = summary.assetGrowthGainJpy + summary.fxGainJpy + summary.synergyGainJpy;
  const fxContributionPercent =
    foreignTotalGain > 0 ? (summary.fxGainJpy / foreignTotalGain) * 100 : 0;

  const formatVal = (val: number, showSign: boolean = false) => {
    if (isMasked) {
      if (showSign && val > 0) return '+¥***,***';
      if (showSign && val < 0) return '-¥***,***';
      return '¥***,***';
    }
    return formatCurrencyJpy(val, showSign);
  };

  return (
    <div className="space-y-4">
      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Assets Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.totalAssets}
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {formatVal(summary.totalCurrentValJpy)}
            </span>
          </div>

          {isSimulated ? (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {lang === 'ko' ? '환율 시뮬레이션 추정액:' : 'シミュレーション試算額:'}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatVal(summary.simulatedTotalValJpy)} (
                <span className={summary.simulatedDiffJpy >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                  {formatVal(summary.simulatedDiffJpy, true)}
                </span>
                )
              </span>
            </div>
          ) : (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{t.totalPrincipal}:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatVal(summary.totalPurchaseJpy)}
              </span>
            </div>
          )}
        </div>

        {/* Total Gain / Loss Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.totalGain}
            </span>
            <div
              className={`p-2 rounded-xl ${
                isPositive
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatVal(summary.totalGainLossJpy, true)}
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{lang === 'ko' ? '수익률:' : '運用利回り:'}</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full ${
                isPositive
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
              }`}
            >
              {formatPercent(summary.totalGainLossPercent, true)}
            </span>
          </div>
        </div>

        {/* Foreign Asset / FX Exposure Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.fxGain}
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                summary.fxGainJpy >= 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatVal(summary.fxGainJpy + summary.synergyGainJpy, true)}
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{lang === 'ko' ? '외화 노출 종목수:' : '外貨建て銘柄数:'}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {summary.foreignAssetsCount} {lang === 'ko' ? '개 종목' : '銘柄'}
            </span>
          </div>
        </div>
      </div>

      {/* FX Breakdown Insight Banner */}
      <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900 text-white rounded-2xl p-5 border border-indigo-700/50 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                {lang === 'ko' ? '환율 요인 vs 자산 성장 요인의 손익 분해 분석' : '為替要因 vs 資産成長要因の損益分解分析'}
              </h2>
              <span className="bg-cyan-500/20 text-cyan-300 text-[11px] px-2 py-0.5 rounded-full border border-cyan-500/30">
                {lang === 'ko' ? '해외 펀드 특화' : '海外投信特化'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {lang === 'ko'
                ? '원화/엔화로 매수한 해외 투자신탁의 이익을「원자산(주가) 자체의 성장」과「환율(원저/엔저)에 의한 상승 효과」로 정밀 분해하고 있습니다.'
                : '円建てで購入した海外投資信託の利益を、「原資産（株価）自体の成長」と「円安による押し上げ効果」に分解しています。'}
            </p>
          </div>

          {/* Quick Insight Badge */}
          {summary.fxGainJpy > 0 && (
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 px-3.5 py-2 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs">
                <span className="text-slate-400">{lang === 'ko' ? '환율(통화) 기여도: ' : '為替（円安）の寄与度: '}</span>
                <span className="font-bold text-amber-300 text-sm">
                  {fxContributionPercent > 0 ? `${fxContributionPercent.toFixed(1)}%` : '0%'}
                </span>
                <span className="text-slate-400 text-[11px] ml-1">
                  ({formatVal(summary.fxGainJpy + summary.synergyGainJpy, true)})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3 Breakdown Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-700/60">
          {/* Asset Growth */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-200">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                {lang === 'ko' ? '① 원자산 성장 요인 (주가 등)' : '① 原資産の成長要因 (株価等)'}
              </span>
              <span className="text-[10px] text-blue-300 font-medium">
                {lang === 'ko' ? '외화 가치 상승' : '外貨価値の上昇'}
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-lg font-bold text-white">
                {formatVal(summary.assetGrowthGainJpy, true)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              {lang === 'ko'
                ? '환율이 매수 시점과 동일하다고 가정한 경우의 순수 주가 상승분'
                : '為替が購入時から変わらなかったと仮定した場合の株価上昇益'}
            </p>
          </div>

          {/* FX Gain */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {lang === 'ko' ? '② 환율 변동 요인 (환율 차익)' : '② 為替変動要因 (円安/円高)'}
              </span>
              <span className="text-[10px] text-amber-300 font-medium">
                {lang === 'ko' ? '환율 차이' : '為替レート差'}
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-lg font-bold text-amber-300">
                {formatVal(summary.fxGainJpy, true)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              {lang === 'ko'
                ? '매수 환율 대비 현재 환율 상승에 따른 순수 환차익'
                : '購入時レートと現在レートの差による純粋な為替損益'}
            </p>
          </div>

          {/* Synergy Effect */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-indigo-200">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                {lang === 'ko' ? '③ 시너지 요인 (주가 × 환율)' : '③ 相乗要因 (株高 × 円安)'}
              </span>
              <span className="text-[10px] text-indigo-300 font-medium">
                {lang === 'ko' ? '곱셈 효과' : '掛け算効果'}
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-lg font-bold text-indigo-200">
                {formatVal(summary.synergyGainJpy, true)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              {lang === 'ko'
                ? '증가한 외화 수익에 환율 상승이 곱해져 발생한 복합 시너지 효과'
                : '増えた外貨建て利益に対して円安が乗算された追加効果'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
