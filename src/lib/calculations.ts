import {
  Account,
  AssetHolding,
  RecurringPlan,
  CategoryAllocation,
  AccountAllocation,
  ProductAllocation,
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
  synergyGainJpy: number;       // 為替×株価相乗効果（円）
  
  // シミュレーション
  simulatedValJpy: number;
  simulatedDiffJpy: number;
  
  // 積立設定
  recurringPlan?: RecurringPlan;
}

/**
 * 個別銘柄の損益と為替要因の分解計算
 */
export function analyzeHolding(
  holding: AssetHolding,
  accounts: Account[],
  recurringPlans: RecurringPlan[],
  currentRates: ExchangeRates,
  simulatedUsdRate?: number
): HoldingAnalysis {
  const account = accounts.find((a) => a.id === holding.accountId);
  const recurringPlan = recurringPlans.find((r) => r.holdingId === holding.id && r.isActive);
  const categoryConfig = CATEGORY_CONFIG[holding.category];

  const currentValJpy = holding.currentValJpy;
  const purchaseAmountJpy = holding.purchaseAmountJpy;
  const gainLossJpy = currentValJpy - purchaseAmountJpy;
  const gainLossPercent = purchaseAmountJpy > 0 ? (gainLossJpy / purchaseAmountJpy) * 100 : 0;

  // 為替変動の影響を受けるか（海外資産かつ為替ヘッジなし）
  const isForeignUnhedged = categoryConfig.isForeign && !holding.hasFxHedge;

  let currFxRate = 1.0;
  if (holding.baseCurrency === 'USD') currFxRate = currentRates.USD;
  else if (holding.baseCurrency === 'EUR') currFxRate = currentRates.EUR;
  else if (holding.baseCurrency === 'GBP') currFxRate = currentRates.GBP;
  else if (holding.baseCurrency === 'AUD') currFxRate = currentRates.AUD;

  const purchaseFxRate = holding.purchaseFxRate > 0 ? holding.purchaseFxRate : currFxRate;

  let currentValForeign = 0;
  let purchaseValForeign = 0;
  let foreignReturnPercent = 0;
  let fxChangePercent = 0;
  let assetGrowthGainJpy = 0;
  let fxGainJpy = 0;
  let synergyGainJpy = 0;
  let simulatedValJpy = currentValJpy;

  if (isForeignUnhedged && purchaseFxRate > 0 && currFxRate > 0) {
    // 外貨建てベースの価値を復元
    purchaseValForeign = purchaseAmountJpy / purchaseFxRate;
    currentValForeign = currentValJpy / currFxRate;

    foreignReturnPercent =
      purchaseValForeign > 0
        ? ((currentValForeign - purchaseValForeign) / purchaseValForeign) * 100
        : 0;

    fxChangePercent = ((currFxRate - purchaseFxRate) / purchaseFxRate) * 100;

    // 損益の3分解（円建て）
    assetGrowthGainJpy = (currentValForeign - purchaseValForeign) * purchaseFxRate;
    fxGainJpy = purchaseValForeign * (currFxRate - purchaseFxRate);
    synergyGainJpy = (currentValForeign - purchaseValForeign) * (currFxRate - purchaseFxRate);

    // 為替シミュレーション値
    if (simulatedUsdRate !== undefined) {
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
 * 商品（銘柄）ごとの合算グルーピング関数
 * （例: ZTech20は本人分と妻分を統合して1つの商品として合算）
 */
export function getProductGrouping(holding: AssetHolding): { key: string; name: string; color: string } {
  const name = holding.name;
  if (name.includes('Zテック') || name.includes('ZTech') || name.includes('Z테크') || holding.fundCode === '0431124C') {
    return {
      key: 'ztech20',
      name: 'iFreePlus 世界トレンド・テクノロジー株 (Zテック20)',
      color: '#6366F1', // Indigo
    };
  }
  if (name.includes('東京海上') || name.includes('外国株式') || name.includes('외국주식') || holding.fundCode === '49313104') {
    return {
      key: 'tokyomarine_foreign',
      name: '東京海上セレクション・外国株式インデックス (401k)',
      color: '#059669', // Emerald
    };
  }
  if (name.includes('レバナス') || name.includes('NASDAQ-100') || name.includes('레바나스') || holding.fundCode === '9I31121B') {
    return {
      key: 'levnas',
      name: '楽天レバレッジNASDAQ-100 (レバナス)',
      color: '#EC4899', // Pink
    };
  }
  if (name.includes('現金') || name.includes('待機資金') || name.includes('현금') || holding.category === 'cash_jpy') {
    return {
      key: 'cash_jpy',
      name: '日本円 現金・預金 (待機資金)',
      color: '#64748B', // Slate
    };
  }
  if (name.includes('FANG+') || holding.fundCode === '04311181') {
    return {
      key: 'fang_plus',
      name: 'iFreeNext FANG+インデックス',
      color: '#F59E0B', // Amber
    };
  }
  if (name.includes('IS米国債') || name.includes('米国債') || name.includes('2621') || holding.fundCode === '2621.T') {
    return {
      key: 'us_bond_20y',
      name: 'iShares 米国債20年ヘッジ (IS米国債)',
      color: '#0EA5E9', // Sky Blue
    };
  }
  if (name.includes('S&P') || name.includes('Slim') || holding.fundCode === '03311187') {
    return {
      key: 'sp500',
      name: 'eMAXIS Slim 米国株式 (S&P 500)',
      color: '#8B5CF6', // Purple
    };
  }

  return {
    key: holding.fundCode || holding.id,
    name: holding.name,
    color: '#14B8A6',
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
  productAllocations: ProductAllocation[];
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
  const productMap: Record<
    string,
    { name: string; amountJpy: number; color: string; fundCode?: string; mergedAccounts: string[] }
  > = {};

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

    // 商品別合算集計（ZTech20など複数口座の同一商品を合算）
    const group = getProductGrouping(item.holding);
    if (!productMap[group.key]) {
      productMap[group.key] = {
        name: group.name,
        amountJpy: 0,
        color: group.color,
        fundCode: item.holding.fundCode,
        mergedAccounts: [],
      };
    }
    productMap[group.key].amountJpy += item.currentValJpy;
    const accName = item.account ? item.account.name : '口座';
    if (!productMap[group.key].mergedAccounts.includes(accName)) {
      productMap[group.key].mergedAccounts.push(accName);
    }
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

  const productAllocations: ProductAllocation[] = Object.keys(productMap).map((pKey) => {
    const p = productMap[pKey];
    const pct = totalCurrentValJpy > 0 ? (p.amountJpy / totalCurrentValJpy) * 100 : 0;
    return {
      id: pKey,
      name: p.name,
      amountJpy: p.amountJpy,
      percentage: pct,
      color: p.color,
      fundCode: p.fundCode,
      mergedAccounts: p.mergedAccounts,
    };
  }).sort((a, b) => b.amountJpy - a.amountJpy);

  return {
    summary,
    analyzedHoldings,
    currencyExposures,
    categoryAllocations,
    accountAllocations,
    productAllocations,
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

export function getRateForCurrency(currency: string, rates: ExchangeRates): number {
  if (currency === 'USD') return rates.USD;
  if (currency === 'EUR') return rates.EUR;
  if (currency === 'GBP') return rates.GBP;
  if (currency === 'AUD') return rates.AUD;
  return 1.0;
}
