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
  FileText,
  Clock,
  CheckCircle2,
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
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // 1日1回の自動同期判定 & データ読み込み
  const fetchFundData = async (sync = false) => {
    if (!fundKey) return;
    if (sync) setIsSyncing(true);
    else setIsLoading(true);

    try {
      const res = await fetch(`/api/fund-constituents?key=${fundKey}${sync ? '&sync=true' : ''}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDetail(json.data);
          const todayStr = new Date().toISOString().split('T')[0];
          localStorage.setItem(`fund_sync_${fundKey}`, todayStr);
          if (sync) {
            setSyncToast(
              lang === 'ko'
                ? '최신 월간 리포트 및 구성종목 데이터가 갱신되었습니다.'
                : '最新の月次レポート・構成銘柄データに更新されました。'
            );
            setTimeout(() => setSyncToast(null), 3000);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load fund constituents:', e);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !fundKey) return;

    // 1日1回自動同期チェック
    const todayStr = new Date().toISOString().split('T')[0];
    const lastSync = localStorage.getItem(`fund_sync_${fundKey}`);
    const shouldDailySync = lastSync !== todayStr;

    fetchFundData(shouldDailySync);
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
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 my-auto cursor-default text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchFundData(true)}
              disabled={isSyncing}
              title={lang === 'ko' ? '1일 1회 자동 갱신 (수동 즉시 동기화)' : '1日1回自動更新 (手動即時同期)'}
              className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 px-3 py-1.5 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-500' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing
                  ? lang === 'ko'
                    ? '동기화 중...'
                    : '同期中...'
                  : lang === 'ko'
                  ? '최신 월보 갱신'
                  : '最新月報を更新'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Toast Notification */}
        {syncToast && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncToast}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {lang === 'ko' ? '공식 최신 월보 데이터를 불러오는 중입니다...' : '公式の最新月報データを取得中...'}
            </p>
          </div>
        ) : detail ? (
          <div className="space-y-5">
            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">
                  {lang === 'ko' ? '총 편입 종목 수' : '総組入銘柄数'}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {detail.totalHoldingsCount} {lang === 'ko' ? '개 종목' : '銘柄'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">
                  {lang === 'ko' ? '상위 10개 비중' : '上位10銘柄集中度'}
                </span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                  {detail.top10WeightPct}%
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">
                  {lang === 'ko' ? '내 포트폴리오 비중' : '保有配分比率'}
                </span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {productPercentage !== undefined ? `${productPercentage.toFixed(1)}%` : '-'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">
                  {lang === 'ko' ? '내 평가액' : '保有評価額'}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {productAmountJpy !== undefined ? formatVal(productAmountJpy) : '-'}
                </span>
              </div>
            </div>

            {/* Official Report Links Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>
                  <strong>{lang === 'ko' ? '기준일: ' : '公表基準: '}</strong>
                  {detail.asOfDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {detail.monthlyReportPdfUrl && (
                  <a
                    href={detail.monthlyReportPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{lang === 'ko' ? '공식 월간 리포트 (PDF)' : '公式月次レポート (PDF)'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {detail.officialUrl && (
                  <a
                    href={detail.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                  >
                    <span>{lang === 'ko' ? '운용사 상세' : '運用会社詳細'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Rebalance & Investment Policy Box */}
            <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{lang === 'ko' ? '종목 선정 및 리밸런싱 운용 규칙' : '銘柄選定およびリバランス運用ルール'}</span>
              </div>
              <p className="text-xs text-amber-950/90 dark:text-amber-200/90 leading-relaxed">
                {lang === 'ko' ? detail.rebalanceRulesKo : detail.rebalanceRules}
              </p>
            </div>

            {/* Sector / Country Breakdown Progress */}
            {detail.sectorBreakdown && detail.sectorBreakdown.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <PieIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{lang === 'ko' ? '섹터 및 지역별 구성 비중' : 'セクター・地域別構成比率'}</span>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
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
                  <span>{lang === 'ko' ? '편입 종목 상세 리스트 (상위 순)' : '組入銘柄一覧・詳細 (比率順)'}</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {lang === 'ko' ? '1일 1회 자동 동기화' : '1日1回自動同期'}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 sticky top-0 z-10">
                    <tr className="border-b border-slate-200 dark:border-slate-700 font-semibold">
                      <th className="py-2.5 px-3 w-12 text-center">{lang === 'ko' ? '순위' : '順位'}</th>
                      <th className="py-2.5 px-3">{lang === 'ko' ? '종목명 / 국가' : '銘柄名 / 国・地域'}</th>
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
                          <div className="font-bold text-slate-900 dark:text-white">
                            {lang === 'ko' ? item.nameKo : item.name}
                          </div>
                          <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 block">
                            {item.symbol}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
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
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <span>{lang === 'ko' ? '출처: 각 운용사 공식 월간 리포트(PDF) 및 지수 공시 데이터' : '出典: 各運用会社公式月次レポート(PDF)・目論見書'}</span>
              <div className="flex items-center gap-3">
                {detail.monthlyReportPdfUrl && (
                  <a
                    href={detail.monthlyReportPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                  >
                    <span>{lang === 'ko' ? '월간 리포트(PDF)' : '月次レポート(PDF)'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {detail.officialUrl && (
                  <a
                    href={detail.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    <span>{lang === 'ko' ? '운용사 사이트' : '運用会社サイト'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
