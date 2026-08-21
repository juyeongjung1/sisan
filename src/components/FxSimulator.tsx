'use client';

import React from 'react';
import { formatCurrencyJpy } from '@/lib/calculations';
import { Language } from '@/lib/i18n';
import { Sliders, RotateCcw, AlertTriangle, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';

interface FxSimulatorProps {
  currentUsdRate: number;
  simulatedUsdRate: number;
  onRateChange: (rate: number) => void;
  onResetRate: () => void;
  totalCurrentValJpy: number;
  simulatedTotalValJpy: number;
  simulatedDiffJpy: number;
  lang?: Language;
  isMasked?: boolean;
}

export const FxSimulator: React.FC<FxSimulatorProps> = ({
  currentUsdRate,
  simulatedUsdRate,
  onRateChange,
  onResetRate,
  totalCurrentValJpy,
  simulatedTotalValJpy,
  simulatedDiffJpy,
  lang = 'ja',
  isMasked = false,
}) => {
  const isChanged = Math.abs(simulatedUsdRate - currentUsdRate) > 0.01;
  const isYenAppreciation = simulatedUsdRate < currentUsdRate; // 円高

  const formatVal = (val: number, showSign: boolean = false) => {
    if (isMasked) {
      if (showSign && val > 0) return '+¥***,***';
      if (showSign && val < 0) return '-¥***,***';
      return '¥***,***';
    }
    return formatCurrencyJpy(val, showSign);
  };

  const presets = [
    { label: lang === 'ko' ? '초강세 (110엔)' : '超円高 (110円)', rate: 110 },
    { label: lang === 'ko' ? '강세 (125엔)' : '円高 (125円)', rate: 125 },
    { label: lang === 'ko' ? '표준 (135엔)' : '標準 (135円)', rate: 135 },
    { label: lang === 'ko' ? `현재값 (${currentUsdRate.toFixed(1)}엔)` : `現在値 (${currentUsdRate.toFixed(1)}円)`, rate: currentUsdRate },
    { label: lang === 'ko' ? '약세 (160엔)' : '円安 (160円)', rate: 160 },
    { label: lang === 'ko' ? '초약세 (170엔)' : '超円安 (170円)', rate: 170 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {lang === 'ko' ? '환율 변동 감응도 시뮬레이터' : '為替変動シミュレーター'}
              {isChanged && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                  {lang === 'ko' ? '시뮬레이션 중' : 'シミュレーション中'}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'ko' ? '환율(USD/JPY) 변동에 따른 외화 자산의 평가액 및 총자산 증감 실시간 예측' : 'ドル円相場が変動した場合の外貨資産評価額と総資産への影響度'}
            </p>
          </div>
        </div>

        {isChanged && (
          <button
            onClick={onResetRate}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'ko' ? '현재 환율로 복귀' : '実勢レートに戻す'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-center">
        {/* Slider & Presets Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'ko' ? '시뮬레이션 환율 (USD/JPY):' : '想定為替レート (USD/JPY):'}
            </span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              1 USD = ¥{simulatedUsdRate.toFixed(1)}
            </span>
          </div>

          {/* Slider input */}
          <div className="space-y-1">
            <input
              type="range"
              min="90"
              max="200"
              step="1"
              value={simulatedUsdRate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>90円</span>
              <span>120円</span>
              <span>150円</span>
              <span>180円</span>
              <span>200円</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onRateChange(p.rate)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  Math.abs(simulatedUsdRate - p.rate) < 0.1
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Result Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/90 dark:to-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'ko' ? '추정 총 평가 자산:' : '試算後の総資産:'}
            </span>
            <span className="font-extrabold text-base text-slate-900 dark:text-white">
              {formatVal(simulatedTotalValJpy)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              {lang === 'ko' ? '현재 대비 변동 손익:' : '現在からの資産変動:'}
            </span>
            <div
              className={`text-lg font-extrabold flex items-center gap-0.5 ${
                simulatedDiffJpy >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {simulatedDiffJpy >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span>{formatVal(simulatedDiffJpy, true)}</span>
            </div>
          </div>

          {/* Advice Banner */}
          <div className="text-[11px] pt-1">
            {isYenAppreciation ? (
              <div className="flex items-start gap-1 text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  {lang === 'ko' ? '강세 시 외화 자산의 평가액이 감소하지만, 저가 매수의 좋은 기회가 됩니다.' : '円高局面では外貨資産の円換算額が減少し含み益が圧縮されます。'}
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-1 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  {lang === 'ko' ? '약세(외화 강세) 시 외화 노출 펀드가 환차익으로 포트폴리오를 부스팅합니다.' : '円安局面では外貨建て投信の押し上げ効果により円換算資産が増加します。'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
