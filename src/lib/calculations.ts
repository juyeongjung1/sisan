import {
  Account,
  AssetHolding,
  RecurringPlan,
  CategoryAllocation,
  AccountAllocation,
  CurrencyExposure,
  ExchangeRates,
  PortfolioSummary,
} from '@/types';
import { CATEGORY_CONFIG, CURRENCY_CONFIG } from './constants';

export interface HoldingAnalysis {
  holding: AssetHolding;
  account?: Account;
  currentValJpy: number;
  gainLossJpy: number;
  gainLossPercent: number;
  
  // 外貨建て分析
  isForeignUnhedged: boolean;
  currFxRate: number;
  currentValForeign: number;
  purchaseValForeign: number;
  foreignReturnPercent: number; // 原資産自体のリターン率（%）
  fxChangePercent: number;      // 為替変動率（%）
  
  // 損益分解（円）
  assetGrowthGainJpy: number;   // 株価・基準価額成長要因（円）
  fxGainJpy: number;            // 為替（円安/円高）要因（円）
  synergyGainJpy: number;       // 相乗要因（円）
  
  // シミュレーション
  simulatedValJpy: number;
  simulatedDiffJpy: number;

  // 積立設定（紐づく積立設定）
  recurringPlan?: RecurringPlan;
}

/**
 * 通貨に対応する現在為替レートを取得
 */
export function getRateForCurrency(currency: string, rates: ExchangeRates): number {
  if (currency === 'USD') return rates.USD;
  if (currency === 'EUR') return rates.EUR;
  if (currency === 'GBP') return rates.GBP;
  if (currency === 'AUD') return rates.AUD;
  if (currency === 'JPY') return 1.0;
  return rates.USD;
}

/**
 * 単一の保有資産を分析・計算する
 */
export function analyzeHolding(
  holding: AssetHolding,
  accounts: Account[],
  recurringPlans: RecurringPlan[],
  currentRates: ExchangeRates,
  simulatedUsdRate?: number
): HoldingAnalysis {
  const account = accounts.find((a) => a.id === holding.accountId);
  const categoryConfig = CATEGORY_CONFIG[holding.category];
  const recurringPlan = recurringPlans.find((r) => r.holdingId === holding.id && r.isActive);
  
  const isForeign = categoryConfig.isForeign && holding.baseCurrency !== 'JPY';
  const isForeignUnhedged = isForeign && !holding.hasFxHedge;
  
  const currFxRate = getRateForCurrency(holding.baseCurrency, currentRates);
  const purchaseFxRate = holding.purchaseFxRate > 0 ? holding.purchaseFxRate : currFxRate;
  
  const purchaseJpy = holding.purchaseAmountJpy;
  const currentValJpy = holding.currentValJpy;
  const gainLossJpy = currentValJpy - purchaseJpy;
  const gainLossPercent = purchaseJpy > 0 ? (gainLossJpy / purchaseJpy) * 100 : 0;
  
  let currentValForeign = 0;
  let purchaseValForeign = 0;
  let foreignReturnPercent = 0;
  let fxChangePercent = 0;
  let assetGrowthGainJpy = 0;
  let fxGainJpy = 0;
  let synergyGainJpy = 0;
  let simulatedValJpy = currentValJpy;

  if (isForeignUnhedged && purchaseFxRate > 0 && currFxRate > 0) {
    // 外貨建ての評価額と元本
    currentValForeign = currentValJpy / currFxRate;
    purchaseValForeign = purchaseJpy / purchaseFxRate;
    
    // 各変動率
    if (purchaseValForeign > 0) {
      foreignReturnPercent = ((currentValForeign - purchaseValForeign) / purchaseValForeign) * 100;
    }
    fxChangePercent = ((currFxRate - purchaseFxRate) / purchaseFxRate) * 100;
    
    // 損益分解
    const gAsset = foreignReturnPercent / 100;
    const gFx = fxChangePercent / 100;
    
    assetGrowthGainJpy = purchaseJpy * gAsset;
    fxGainJpy = purchaseJpy * gFx;
    synergyGainJpy = purchaseJpy * (gAsset * gFx);
    
    // シミュレーションレート適用時
    if (simulatedUsdRate !== undefined && simulatedUsdRate > 0) {
      if (holding.baseCurrency === 'USD') {
        simulatedValJpy = currentValForeign * simulatedUsdRate;
      } else {
        const scale = simulatedUsdRate / currentRates.USD;
        simulatedValJpy = currentValForeign * (currFxRate * scale);
      }
    }
  } else {
    assetGrowthGainJpy = gainLossJpy;
    fxGainJpy = 0;
    synergyGainJpy = 0;
    simulatedValJpy = currentValJpy;
  }

  const simulatedDiffJpy = simulatedValJpy - currentValJpy;

  return {
    holding,
    account,
    currentValJpy,
    gainLossJpy,
    gainLossPercent,
    isForeignUnhedged,
    currFxRate,
    currentValForeign,
    purchaseValForeign,
    foreignReturnPercent,
    fxChangePercent,
    assetGrowthGainJpy,
    fxGainJpy,
    synergyGainJpy,
    simulatedValJpy,
    simulatedDiffJpy,
    recurringPlan,
  };
}

/**
 * ポートフォリオ全体の集計および各アロケーションの計算
 */
export function calculatePortfolio(
  holdings: AssetHolding[],
  accounts: Account[],
  recurringPlans: RecurringPlan[],
  currentRates: ExchangeRates,
  simulatedUsdRate?: number
): {
  summary: PortfolioSummary;
  analyzedHoldings: HoldingAnalysis[];
  currencyExposures: CurrencyExposure[];
  categoryAllocations: CategoryAllocation[];
  accountAllocations: AccountAllocation[];
} {
  const analyzedHoldings = holdings.map((h) =>
    analyzeHolding(h, accounts, recurringPlans, currentRates, simulatedUsdRate)
  );

  let totalPurchaseJpy = 0;
  let totalCurrentValJpy = 0;
  let assetGrowthGainJpy = 0;
  let fxGainJpy = 0;
  let synergyGainJpy = 0;
  let foreignAssetsCount = 0;
  let simulatedTotalValJpy = 0;

  const currencyMap: Record<string, number> = {};
  const categoryMap: Record<string, number> = {};
  const accountMap: Record<string, number> = {};

  analyzedHoldings.forEach((item) => {
    totalPurchaseJpy += item.holding.purchaseAmountJpy;
    totalCurrentValJpy += item.currentValJpy;
    simulatedTotalValJpy += item.simulatedValJpy;

    assetGrowthGainJpy += item.assetGrowthGainJpy;
    fxGainJpy += item.fxGainJpy;
    synergyGainJpy += item.synergyGainJpy;

    if (item.isForeignUnhedged) {
      foreignAssetsCount += 1;
    }

    const effectiveCurrency =
      item.holding.hasFxHedge || !CATEGORY_CONFIG[item.holding.category].isForeign
        ? 'JPY'
        : item.holding.baseCurrency;
    currencyMap[effectiveCurrency] = (currencyMap[effectiveCurrency] || 0) + item.currentValJpy;

    categoryMap[item.holding.category] =
      (categoryMap[item.holding.category] || 0) + item.currentValJpy;

    accountMap[item.holding.accountId] =
      (accountMap[item.holding.accountId] || 0) + item.currentValJpy;
  });

  // 毎月の有効な積立合計
  const monthlyTotalInvestmentJpy = recurringPlans
    .filter((r) => r.isActive)
    .reduce((sum, r) => sum + r.monthlyAmountJpy, 0);

  const totalGainLossJpy = totalCurrentValJpy - totalPurchaseJpy;
  const totalGainLossPercent =
    totalPurchaseJpy > 0 ? (totalGainLossJpy / totalPurchaseJpy) * 100 : 0;
  const simulatedDiffJpy = simulatedTotalValJpy - totalCurrentValJpy;

  const summary: PortfolioSummary = {
    totalPurchaseJpy,
    totalCurrentValJpy,
    totalGainLossJpy,
    totalGainLossPercent,
    assetGrowthGainJpy,
    fxGainJpy,
    synergyGainJpy,
    foreignAssetsCount,
    simulatedTotalValJpy,
    simulatedDiffJpy,
    monthlyTotalInvestmentJpy,
  };

  const currencyExposures: CurrencyExposure[] = Object.keys(currencyMap).map((currKey) => {
    const amount = currencyMap[currKey];
    const pct = totalCurrentValJpy > 0 ? (amount / totalCurrentValJpy) * 100 : 0;
    const config = CURRENCY_CONFIG[currKey as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.OTHER;
    return {
      currency: currKey as any,
      label: config.label,
      amountJpy: amount,
      percentage: pct,
      color: config.color,
    };
  }).sort((a, b) => b.amountJpy - a.amountJpy);

  const categoryAllocations: CategoryAllocation[] = Object.keys(categoryMap).map((catKey) => {
    const amount = categoryMap[catKey];
    const pct = totalCurrentValJpy > 0 ? (amount / totalCurrentValJpy) * 100 : 0;
    const config = CATEGORY_CONFIG[catKey as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other;
    return {
      category: catKey as any,
      label: config.label,
      amountJpy: amount,
      percentage: pct,
      color: config.color,
    };
  }).sort((a, b) => b.amountJpy - a.amountJpy);

  const accountAllocations: AccountAllocation[] = Object.keys(accountMap).map((accId) => {
    const amount = accountMap[accId];
    const pct = totalCurrentValJpy > 0 ? (amount / totalCurrentValJpy) * 100 : 0;
    const acc = accounts.find((a) => a.id === accId);
    return {
      accountId: accId,
      name: acc ? acc.name : '不明な口座',
      amountJpy: amount,
      percentage: pct,
      color: acc?.color || '#9CA3AF',
    };
  }).sort((a, b) => b.amountJpy - a.amountJpy);

  return {
    summary,
    analyzedHoldings,
    currencyExposures,
    categoryAllocations,
    accountAllocations,
  };
}

export function formatCurrencyJpy(amount: number, showSign = false): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(Math.abs(rounded));

  if (showSign) {
    if (rounded > 0) return `+${formatted}`;
    if (rounded < 0) return `-${formatted}`;
  }
  return rounded < 0 ? `-${formatted}` : formatted;
}

export function formatPercent(val: number, showSign = true): string {
  const formatted = val.toFixed(1) + '%';
  if (showSign && val > 0) return `+${formatted}`;
  return formatted;
}
