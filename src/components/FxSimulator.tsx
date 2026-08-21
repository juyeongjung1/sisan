'use client';

import React from 'react';
import { formatCurrencyJpy } from '@/lib/calculations';
import { Sliders, RotateCcw, AlertTriangle, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';

interface FxSimulatorProps {
  currentUsdRate: number;
  simulatedUsdRate: number;
  onRateChange: (rate: number) => void;
  onResetRate: () => void;
  totalCurrentValJpy: number;
  simulatedTotalValJpy: number;
  simulatedDiffJpy: number;
}

export const FxSimulator: React.FC<FxSimulatorProps> = ({
  currentUsdRate,
  simulatedUsdRate,
  onRateChange,
  onResetRate,
  totalCurrentValJpy,
  simulatedTotalValJpy,
  simulatedDiffJpy,
}) => {
  const isChanged = Math.abs(simulatedUsdRate - currentUsdRate) > 0.01;
  const isYenAppreciation = simulatedUsdRate < currentUsdRate; // 円高

  const presets = [
    { label: '超円高 (110円)', rate: 110 },
    { label: '円高 (125円)', rate: 125 },
    { label: '標準 (135円)', rate: 135 },
    { label: `現在値 (${currentUsdRate.toFixed(1)}円)`, rate: currentUsdRate },
    { label: '円安 (160円)', rate: 160 },
    { label: '超円安 (170円)', rate: 170 },
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
              為替変動シミュレーター
              {isChanged && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                  シミュレーション中
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              「もし1ドル＝〇〇円になったら？」海外投信の評価額への影響をリアルタイム試算
            </p>
          </div>
        </div>

        {isChanged && (
          <button
            onClick={onResetRate}
            className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>現在値に戻す</span>
          </button>
        )}
      </div>

      {/* Slider & Controls */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Slider & Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              想定為替レート (USD/JPY):
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                ¥{simulatedUsdRate.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ USD</span>
            </div>
          </div>

          {/* Range Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min="100"
              max="180"
              step="0.5"
              value={simulatedUsdRate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
              <span>¥100 (超円高)</span>
              <span>¥130</span>
              <span className="text-blue-500 font-bold">現在: ¥{currentUsdRate.toFixed(1)}</span>
              <span>¥160</span>
              <span>¥180 (超円安)</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {presets.map((p) => {
              const isSelected = Math.abs(simulatedUsdRate - p.rate) < 0.1;
              return (
                <button
                  key={p.label}
                  onClick={() => onRateChange(p.rate)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition font-medium border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Simulation Result Box (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            シミュレーション試算結果
          </span>

          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-slate-600 dark:text-slate-300">試算総資産額:</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrencyJpy(simulatedTotalValJpy)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
              {simulatedDiffJpy >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              )}
              現在との差額:
            </span>
            <span
              className={`text-sm font-bold ${
                simulatedDiffJpy >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrencyJpy(simulatedDiffJpy, true)}
            </span>
          </div>

          {/* Risk Note */}
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 bg-white dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
            {isYenAppreciation ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  円高になると海外投信の円換算額は減少しますが、外貨建て（ドルベース）の保有価値は変わりません。
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  円安進行により為替プレミアムが加算され、円換算での資産評価額が押し上げられます。
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
