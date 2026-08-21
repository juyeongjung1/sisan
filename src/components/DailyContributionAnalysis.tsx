'use client';

import React, { useState, useEffect } from 'react';
import { AssetHolding } from '@/types';
import { formatCurrencyJpy, formatPercent } from '@/lib/calculations';
import { Language, DICTIONARY, translateHoldingName } from '@/lib/i18n';
import { MarketInsightSummary, USStockData } from '@/app/api/market-insights/route';
import {
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Zap,
  Globe,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Clock,
  Layers,
} from 'lucide-react';

interface DailyContributionAnalysisProps {
  holdings: AssetHolding[];
  lang?: Language;
  isMasked?: boolean;
}

export const DailyContributionAnalysis: React.FC<DailyContributionAnalysisProps> = ({
  holdings,
  lang = 'ja',
  isMasked = false,
}) => {
  const t = DICTIONARY[lang];
  const [insights, setInsights] = useState<MarketInsightSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const res = await fetch('/api/market-insights');
        if (res.ok) {
          const data = await res.json();
          setInsights(data.insights);
        }
      } catch (e) {
        console.error('Failed to load market insights:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadInsights();
  }, []);

  const formatVal = (val: number, showSign: boolean = false) => {
    if (isMasked) {
      if (showSign && val > 0) return '+¥***,***';
      if (showSign && val < 0) return '-¥***,***';
      return '¥***,***';
    }
    return formatCurrencyJpy(val, showSign);
  };

  // 各銘柄の本日の変動額（寄与額）を算出
  const contributionItems = holdings.map((h) => {
    const changePct = h.dailyChangePct || 0;
    const diffJpy =
      changePct !== 0
        ? Math.round(h.currentValJpy - h.currentValJpy / (1 + changePct / 100))
        : 0;

    return {
      id: h.id,
      name: h.name,
      currentValJpy: h.currentValJpy,
      dailyChangePct: changePct,
      diffJpy,
      category: h.category,
    };
  });

  const totalDailyDiffJpy = contributionItems.reduce((sum, item) => sum + item.diffJpy, 0);
  const totalValJpy = holdings.reduce((sum, h) => sum + h.currentValJpy, 0);
  const previousTotalValJpy = totalValJpy - totalDailyDiffJpy;
  const portfolioDailyChangePct =
    previousTotalValJpy > 0 ? (totalDailyDiffJpy / previousTotalValJpy) * 100 : 0;

  const negativeContributors = contributionItems
    .filter((item) => item.diffJpy < 0)
    .sort((a, b) => a.diffJpy - b.diffJpy);

  const positiveContributors = contributionItems
    .filter((item) => item.diffJpy > 0)
    .sort((a, b) => b.diffJpy - a.diffJpy);

  const neutralContributors = contributionItems.filter((item) => item.diffJpy === 0);

  const totalNegativeJpy = negativeContributors.reduce((sum, item) => sum + item.diffJpy, 0);
  const totalPositiveJpy = positiveContributors.reduce((sum, item) => sum + item.diffJpy, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {t.contribTitle}
              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full font-bold">
                T+1 {lang === 'ko' ? '익일 반영 연동' : '翌日反映連動'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.contribSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{lang === 'ko' ? '공시 기준: 매일 17~19시 갱신' : '公表基準: 毎日17〜19時更新'}</span>
        </div>
      </div>

      {/* T+1 Delay Mechanism Notice Banner */}
      <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/30 rounded-xl border border-blue-200/80 dark:border-blue-900/40 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong>💡 {lang === 'ko' ? '투자신託의 기준가 반영 원리 (시차 요인)' : '投資信託の基準価額の反映の仕組み（タイムラグ要因）'}</strong>
          <p className="text-[11px] text-blue-800/90 dark:text-blue-300/80 leading-relaxed">
            {t.t1Notice}
          </p>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Total Change Today */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <span>{t.todayChange}</span>
          </span>
          <div
            className={`text-2xl font-extrabold mt-1.5 flex items-baseline gap-2 ${
              totalDailyDiffJpy >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            <span>{formatVal(totalDailyDiffJpy, true)}</span>
            <span className="text-xs font-bold">
              ({portfolioDailyChangePct >= 0 ? '+' : ''}
              {portfolioDailyChangePct.toFixed(2)}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {totalDailyDiffJpy < 0
              ? (lang === 'ko' ? '일부 자산 하락을 방어 자산이 완화' : '下落銘柄を相殺資産がクッション')
              : (lang === 'ko' ? '포트폴리오 전체 상승 기여' : '全体としてプラス寄与')}
          </span>
        </div>

        {/* Negative Pull-down Factors */}
        <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
          <span className="text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span>{t.dragFactors}</span>
          </span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1.5">
            {formatVal(totalNegativeJpy, true)}
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-1">
            {lang === 'ko' ? '주요 요인:' : '主な要因:'} {translateHoldingName(negativeContributors[0]?.name || '', lang).split('(')[0] || '-'} {lang === 'ko' ? '등' : '等'}
          </span>
        </div>

        {/* Cushion / Offset Factors */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t.cushionFactors}</span>
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">
            {totalPositiveJpy > 0 ? `+${formatVal(totalPositiveJpy)}` : (lang === 'ko' ? '현금 대기자금 방어' : '現金待機資金で防御')}
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-1">
            {lang === 'ko' ? '무위험 현금 및 분산 효과로 하방 경직성 확보' : '無リスク現金および他ファンドの分散効果'}
          </span>
        </div>
      </div>

      {/* Breakdown: Impact List by Product */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>{lang === 'ko' ? '각 상품별 오늘의 기여도 순위' : '各商品の本日寄与インパクト内訳'}</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Negative Drag List */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <span>{t.dragListTitle}</span>
              <span className="text-[11px] font-normal text-slate-500">
                {negativeContributors.length} {lang === 'ko' ? '건' : '銘柄'}
              </span>
            </div>

            <div className="space-y-2">
              {negativeContributors.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">
                      {translateHoldingName(c.name, lang)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {lang === 'ko' ? '평가액:' : '評価額:'} {formatVal(c.currentValJpy)}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-xs text-rose-600 dark:text-rose-400">
                      {formatVal(c.diffJpy, true)}
                    </div>
                    <span className="text-[10px] text-rose-500 font-semibold block">
                      {lang === 'ko' ? '전일비' : '前日比'} {c.dailyChangePct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cushion / Stable List */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>{t.cushionListTitle}</span>
              <span className="text-[11px] font-normal text-slate-500">
                {positiveContributors.length + neutralContributors.length} {lang === 'ko' ? '건' : '銘柄'}
              </span>
            </div>

            <div className="space-y-2">
              {[...positiveContributors, ...neutralContributors].map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">
                      {translateHoldingName(c.name, lang)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {lang === 'ko' ? '평가액:' : '評価額:'} {formatVal(c.currentValJpy)}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-extrabold text-xs ${
                        c.diffJpy > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {c.diffJpy > 0 ? `+${formatVal(c.diffJpy)}` : (lang === 'ko' ? '±0 (안전자산)' : '±0円 (安全資産)')}
                    </div>
                    <span
                      className={`text-[10px] font-semibold block ${
                        c.diffJpy > 0 ? 'text-emerald-500' : 'text-slate-400'
                      }`}
                    >
                      {c.diffJpy > 0 ? `${lang === 'ko' ? '전일비' : '前日比'} +${c.dailyChangePct}%` : (lang === 'ko' ? '변동 없음' : '無変動')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* US Market Drivers Section */}
      {insights && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t.usStocksTitle}
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              {lang === 'ko' ? '전날 밤 미국 장 마감 시세 연동' : '前夜米国市場の引け値連動'}
            </span>
          </div>

          {/* US Stock Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {insights.majorStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {stock.symbol}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                      stock.changePct >= 0
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60'
                        : 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60'
                    }`}
                  >
                    {stock.changePct >= 0 ? '+' : ''}
                    {stock.changePct}%
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[90px]">{stock.name.split('(')[0]}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                    ${stock.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Market Drivers List */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 border border-indigo-800/50 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t.marketDriversTitle}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {insights.keyDrivers.map((driver, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/70 p-3 rounded-lg border border-slate-700/60 flex items-start gap-2.5"
                >
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 mt-0.5 ${
                      driver.impact === 'positive'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : driver.impact === 'negative'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                    }`}
                  >
                    {driver.impact === 'positive'
                      ? (lang === 'ko' ? '상승요인' : '上昇要因')
                      : driver.impact === 'negative'
                      ? (lang === 'ko' ? '하락요인' : '下落要因')
                      : (lang === 'ko' ? '안정방어' : '安定防御')}
                  </span>
                  <div className="space-y-1 min-w-0">
                    <span className="font-bold text-xs text-white block leading-snug">
                      {driver.title}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {driver.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
