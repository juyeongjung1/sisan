'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/lib/i18n';
import { FundConstituentsDetail, FundConstituentItem } from '@/app/api/fund-constituents/route';
import { formatCurrencyJpy, formatPercent } from '@/lib/calculations';
import {
  X,
  Sparkles,
  ExternalLink,
  Layers,
  PieChart as PieIcon,
  ShieldCheck,
  Building,
  Info,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

interface FundConstituentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundKey: string | null;
  productName?: string;
  productAmountJpy?: number;
  productPercentage?: number;
  lang?: Language;
  isMasked?: boolean;
}

export const FundConstituentsModal: React.FC<FundConstituentsModalProps> = ({
  isOpen,
  onClose,
  fundKey,
  productName,
  productAmountJpy,
  productPercentage,
  lang = 'ja',
  isMasked = false,
}) => {
  const [detail, setDetail] = useState<FundConstituentsDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !fundKey) return;

    async function loadConstituents() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/fund-constituents?key=${fundKey}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setDetail(json.data);
          }
        }
      } catch (e) {
        console.error('Failed to load fund constituents:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadConstituents();
  }, [isOpen, fundKey]);

  if (!isOpen || !fundKey) return null;

  const formatVal = (val: number) => {
    if (isMasked) return '¥***,***';
    return formatCurrencyJpy(val);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 my-auto cursor-default text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400 mt-0.5">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {detail
                    ? lang === 'ko'
                      ? detail.fundNameKo
                      : detail.fundName
                    : productName || fundKey}
                </h2>
                {detail?.managementCompany && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-slate-200 dark:border-slate-700">
                    {lang === 'ko' ? detail.managementCompanyKo : detail.managementCompany}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {detail
                  ? lang === 'ko'
                    ? detail.benchmarkIndexKo
                    : detail.benchmarkIndex
                  : lang === 'ko'
                  ? '공식 공시 기준 구성종목 및 편입 비중'
                  : '公式開示情報に基づく構成銘柄および組入比率'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-xs font-semibold">
              {lang === 'ko' ? '공식 구성종목 데이터를 불러오는 중...' : '公式構成銘柄データを読み込み中...'}
            </span>
          </div>
        ) : detail ? (
          <div className="space-y-6">
            {/* Quick Stat Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  {lang === 'ko' ? '총 편입 종목 수' : '総組入銘柄数'}
                </span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                  {detail.totalHoldingsCount} {lang === 'ko' ? '개 종목' : '銘柄'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  {lang === 'ko' ? '상위 10개 비중' : '上位10銘柄比率'}
                </span>
                <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                  {detail.top10WeightPct}%
                </span>
              </div>

              {productAmountJpy !== undefined && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                    {lang === 'ko' ? '내 보유 평가액' : '現在の保有評価額'}
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                    {formatVal(productAmountJpy)}
                  </span>
                </div>
              )}

              {productPercentage !== undefined && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                    {lang === 'ko' ? '포트폴리오 비중' : 'ポートフォリオ全体比率'}
                  </span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {formatPercent(productPercentage)}
                  </span>
                </div>
              )}
            </div>

            {/* Rebalance Rule Box */}
            <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/70 dark:border-indigo-900/40 space-y-1.5 text-xs text-indigo-950 dark:text-indigo-200">
              <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300">
                <Info className="w-4 h-4" />
                <span>{lang === 'ko' ? '📌 펀드 종목 선정 & 리밸런싱 규칙' : '📌 銘柄選定・リバランスルール'}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-900/90 dark:text-indigo-300/80">
                {lang === 'ko' ? detail.rebalanceRulesKo : detail.rebalanceRules}
              </p>
            </div>

            {/* Sector Breakdown */}
            {detail.sectorBreakdown && detail.sectorBreakdown.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{lang === 'ko' ? '섹터 및 테마별 비중' : 'セクター・テーマ別構成比'}</span>
                  </span>
                  <span className="text-[11px] text-slate-400">{detail.asOfDate}</span>
                </div>

                {/* Progress Stack Bar */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
                  {detail.sectorBreakdown.map((s, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${s.weightPct}%`, backgroundColor: s.color }}
                      className="h-full transition-all"
                      title={`${lang === 'ko' ? s.sectorKo : s.sector}: ${s.weightPct}%`}
                    />
                  ))}
                </div>

                {/* Sector Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {detail.sectorBreakdown.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-xs bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {lang === 'ko' ? s.sectorKo : s.sector}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{s.weightPct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Holdings Breakdown Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{lang === 'ko' ? '편입 종목 상세 리스트' : '組入銘柄一覧・詳細'}</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {lang === 'ko' ? '비중 순 정렬' : '組入比率順'}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 sticky top-0 z-10">
                    <tr className="border-b border-slate-200 dark:border-slate-700 font-semibold">
                      <th className="py-2.5 px-3 w-12 text-center">{lang === 'ko' ? '순위' : '順位'}</th>
                      <th className="py-2.5 px-3">{lang === 'ko' ? '종목명 / 티커' : '銘柄名 / ティッカー'}</th>
                      <th className="py-2.5 px-3">{lang === 'ko' ? '섹터' : 'セクター'}</th>
                      <th className="py-2.5 px-3 text-right w-28">{lang === 'ko' ? '편입 비중' : '組入比率'}</th>
                      <th className="py-2.5 px-3">{lang === 'ko' ? '핵심 역할 및 특징' : '主な役割・特徴'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {detail.constituents.map((item) => (
                      <tr
                        key={item.symbol + item.rank}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                          {item.rank}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{lang === 'ko' ? item.nameKo : item.name}</span>
                            <span className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                              {item.symbol}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          <span className="bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
                            {lang === 'ko' ? item.sectorKo : item.sector}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            {item.weightPct}%
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, item.weightPct * 7)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                          {lang === 'ko' ? item.descriptionKo : item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Website Link Footer */}
            {detail.officialUrl && (
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span>{lang === 'ko' ? '출처: 각 운용사 공식 월보 및 지수 산출기관 공시 데이터' : '出典: 各運用会社公式月報・目論見書・指数算出会社'}</span>
                <a
                  href={detail.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  <span>{lang === 'ko' ? '공식 상세 페이지' : '公式サイトで確認'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
