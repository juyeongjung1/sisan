import { Account, AssetHolding, RecurringPlan, AssetCategory, Currency, PaymentMethod } from '@/types';

export const CATEGORY_CONFIG: Record<
  AssetCategory,
  { label: string; color: string; defaultCurrency: Currency; isForeign: boolean }
> = {
  foreign_equity_fund: {
    label: '海外株式投信 (FANG+/Zテック/S&P500等)',
    color: '#3B82F6', // Blue
    defaultCurrency: 'USD',
    isForeign: true,
  },
  foreign_bond_fund: {
    label: '海外債券投信 (為替ヘッジあり/なし)',
    color: '#6366F1', // Indigo
    defaultCurrency: 'USD',
    isForeign: true,
  },
  domestic_equity: {
    label: '国内株式',
    color: '#10B981', // Emerald
    defaultCurrency: 'JPY',
    isForeign: false,
  },
  domestic_fund: {
    label: '国内投信',
    color: '#14B8A6', // Teal
    defaultCurrency: 'JPY',
    isForeign: false,
  },
  crypto: {
    label: '暗号資産 (仮想通貨)',
    color: '#F59E0B', // Amber
    defaultCurrency: 'USD',
    isForeign: true,
  },
  cash_jpy: {
    label: '日本円 現金・預金・待機資金',
    color: '#6B7280', // Gray
    defaultCurrency: 'JPY',
    isForeign: false,
  },
  cash_foreign: {
    label: '外貨預金・外貨MMF',
    color: '#8B5CF6', // Purple
    defaultCurrency: 'USD',
    isForeign: true,
  },
  other: {
    label: 'その他資産',
    color: '#EC4899', // Pink
    defaultCurrency: 'JPY',
    isForeign: false,
  },
};

export const CURRENCY_CONFIG: Record<Currency, { label: string; symbol: string; color: string }> = {
  JPY: { label: '日本円 (JPY)', symbol: '¥', color: '#10B981' },
  USD: { label: '米ドル (USD)', symbol: '$', color: '#3B82F6' },
  EUR: { label: 'ユーロ (EUR)', symbol: '€', color: '#8B5CF6' },
  GBP: { label: '英ポンド (GBP)', symbol: '£', color: '#EC4899' },
  AUD: { label: '豪ドル (AUD)', symbol: 'A$', color: '#F59E0B' },
  OTHER: { label: 'その他通貨', symbol: '¤', color: '#6B7280' },
};

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string }> = {
  credit_card: { label: 'クレジットカード積立' },
  bank_transfer: { label: '給与天引き / 口座振替' },
  balance: { label: '証券口座残高・自動入金' },
  other: { label: 'その他' },
};

export const DEFAULT_EXCHANGE_RATES = {
  USD: 153.5,
  EUR: 165.2,
  GBP: 195.8,
  AUD: 98.4,
  lastUpdated: new Date().toISOString(),
  isCustom: false,
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_john_rakuten',
    name: 'ジョンの楽天証券口座',
    type: 'brokerage',
    color: '#BE185D',
    notes: '特定口座・旧NISA・つみたてNISA',
  },
  {
    id: 'acc_miki',
    name: 'ミキの口座',
    type: 'brokerage',
    color: '#8B5CF6',
    notes: '妻の口座 (実質管理)',
  },
  {
    id: 'acc_john_dc',
    name: 'ジョンの確定拠出年金 (東京海上日動401k)',
    type: 'brokerage',
    color: '#059669',
    notes: '東京海上日動なっとく401kプラン',
  },
  {
    id: 'acc_kids',
    name: '子供の証券口座 (子供NISA)',
    type: 'brokerage',
    color: '#F59E0B',
    notes: 'ジュニアNISA・待機資金',
  },
];

export const INITIAL_HOLDINGS: AssetHolding[] = [
  // 1. ジョンの楽天証券口座
  {
    id: 'hold_john_1',
    accountId: 'acc_john_rakuten',
    name: 'IS米国債20年ヘッジ (特定)',
    category: 'foreign_bond_fund',
    baseCurrency: 'USD',
    hasFxHedge: true,
    purchaseAmountJpy: 286600,
    purchaseFxRate: 153.5,
    currentValJpy: 199600,
    fundCode: '2621.T',
    units: 200,
    latestNavPrice: 998,
    dailyChangeVal: -6,
    dailyChangePct: -0.6,
    notes: '為替ヘッジあり（-87,000円 -30.35%）。積み立て無し',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hold_john_2',
    accountId: 'acc_john_rakuten',
    name: '楽天レバレッジNASDAQ-100(レバナス) (旧NISA)',
    category: 'foreign_equity_fund',
    baseCurrency: 'USD',
    hasFxHedge: false,
    purchaseAmountJpy: 709930,
    purchaseFxRate: 115.0,
    currentValJpy: 1923404,
    fundCode: '9I31121B',
    units: 1205518,
    latestNavPrice: 15955,
    dailyChangeVal: -78,
    dailyChangePct: -0.49,
    notes: '旧NISAが今年12月で終了するため、12月まで毎月40万円ずつ取り崩して他投資へ移行中',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hold_john_3',
    accountId: 'acc_john_rakuten',
    name: 'iFreeNext FANG+インデックス (積み立てNISA)',
    category: 'foreign_equity_fund',
    baseCurrency: 'USD',
    hasFxHedge: false,
    purchaseAmountJpy: 615000,
    purchaseFxRate: 140.0,
    currentValJpy: 747638,
    fundCode: '04311181',
    units: 76380,
    latestNavPrice: 97884,
    dailyChangeVal: -4,
    dailyChangePct: 0,
    notes: '毎月8日(休日なら9日)に36,000円積立設定中',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hold_john_4',
    accountId: 'acc_john_rakuten',
    name: 'iFreePlus世界トレンド・テクノロジー株(Zテック20)',
    category: 'foreign_equity_fund',
    baseCurrency: 'USD',
    hasFxHedge: false,
    purchaseAmountJpy: 1651500,
    purchaseFxRate: 145.0,
    currentValJpy: 1903120,
    fundCode: '0431124C',
    units: 1319412,
    latestNavPrice: 14424,
    dailyChangeVal: -170,
    dailyChangePct: -1.16,
    notes: '毎月8日(休日なら9日)に64,000円積立設定中',
    updatedAt: new Date().toISOString(),
  },

  // 2. ミキの口座
  {
    id: 'hold_miki_1',
    accountId: 'acc_miki',
    name: 'iFreePlus世界トレンド・テクノロジー株(Zテック20)',
    category: 'foreign_equity_fund',
    baseCurrency: 'USD',
    hasFxHedge: false,
    purchaseAmountJpy: 950000,
    purchaseFxRate: 143.0,
    currentValJpy: 1120883,
    fundCode: '0431124C',
    units: 777095,
    latestNavPrice: 14424,
    dailyChangeVal: -170,
    dailyChangePct: -1.16,
    notes: '積み立て無し (一括投資分)',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hold_miki_2',
    accountId: 'acc_miki',
    name: 'eMAXIS Slim 米国株式(S&P 500)',
    category: 'foreign_equity_fund',
    baseCurrency: 'USD',
    hasFxHedge: false,
    purchaseAmountJpy: 66666,
    purchaseFxRate: 110.0,
    currentValJpy: 154342,
    fundCode: '03311187',
    units: 34344,
    latestNavPrice: 44940,
    dailyChangeVal: -171,
    dailyChangePct: -0.38,
    notes: '長期保有・含み益大 (+131.51%)',
    updatedAt: new Date().toISOString(),
  },

  // 3. ジョンの確定拠出年金口座
  {
    id: 'hold_john_dc_1',
    accountId: 'acc_john_dc',
    name: '東京海上セレクション・外国株式インデックス',
    category: 'foreign_equity_fund',
    baseCurrency: 'USD',
    hasFxHedge: false,
    purchaseAmountJpy: 1806000,
    purchaseFxRate: 125.0,
    currentValJpy: 3052385,
    fundCode: '49313104',
    units: 324752,
    latestNavPrice: 93991,
    dailyChangeVal: -283,
    dailyChangePct: -0.3,
    notes: '東京海上日動401k。毎月29日に15,000円積立設定中',
    updatedAt: new Date().toISOString(),
  },

  // 4. 子供の証券口座
  {
    id: 'hold_kids_1',
    accountId: 'acc_kids',
    name: '日本円 現金 (待機資金)',
    category: 'cash_jpy',
    baseCurrency: 'JPY',
    hasFxHedge: false,
    purchaseAmountJpy: 1100000,
    purchaseFxRate: 1.0,
    currentValJpy: 1100000,
    units: 1100000,
    notes: '子供NISA・無リスク現金待機資金',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_RECURRING_PLANS: RecurringPlan[] = [
  {
    id: 'rec_john_fang',
    holdingId: 'hold_john_3',
    accountId: 'acc_john_rakuten',
    monthlyAmountJpy: 36000,
    dayOfMonth: 8,
    paymentMethod: 'credit_card',
    isActive: true,
    notes: '毎月8日(休日は9日)に36,000円積立',
    lastProcessedYearMonth: '2026-08',
  },
  {
    id: 'rec_john_ztech',
    holdingId: 'hold_john_4',
    accountId: 'acc_john_rakuten',
    monthlyAmountJpy: 64000,
    dayOfMonth: 8,
    paymentMethod: 'credit_card',
    isActive: true,
    notes: '毎月8日(休日は9日)に64,000円積立',
    lastProcessedYearMonth: '2026-08',
  },
  {
    id: 'rec_john_dc',
    holdingId: 'hold_john_dc_1',
    accountId: 'acc_john_dc',
    monthlyAmountJpy: 15000,
    dayOfMonth: 29,
    paymentMethod: 'bank_transfer',
    isActive: true,
    notes: '確定拠出年金 毎月29日に15,000円積立',
    lastProcessedYearMonth: '2026-08',
  },
];
