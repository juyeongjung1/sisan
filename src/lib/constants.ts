import { Account, AssetHolding, RecurringPlan, AssetCategory, Currency, PaymentMethod } from '@/types';

export const CATEGORY_CONFIG: Record<
  AssetCategory,
  { label: string; color: string; defaultCurrency: Currency; isForeign: boolean }
> = {
  foreign_equity_fund: {
    label: '海外株式投信 (オルカン/S&P500等)',
    color: '#3B82F6', // Blue
    defaultCurrency: 'USD',
    isForeign: true,
  },
  foreign_bond_fund: {
    label: '海外債券投信',
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
    label: '日本円 現金・預金',
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
  credit_card: { label: 'クレジットカード決済 (ポイント還元)' },
  bank_transfer: { label: '銀行口座自動引落' },
  balance: { label: '証券口座残高/自動入金' },
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
    id: 'acc_rakuten',
    name: '楽天証券 (新NISA/つみたて投資枠)',
    type: 'brokerage',
    color: '#BE185D',
    notes: '楽天カード積立メイン',
  },
  {
    id: 'acc_sbi',
    name: 'SBI証券 (新NISA/成長投資枠)',
    type: 'brokerage',
    color: '#1D4ED8',
    notes: '三井住友カード積立・一括投資',
  },
  {
    id: 'acc_monex',
    name: 'マネックス証券',
    type: 'brokerage',
    color: '#D97706',
    notes: 'マネックスカード積立枠',
  },
  {
    id: 'acc_bank',
    name: 'メイン銀行口座 (生活防衛資金)',
    type: 'bank',
    color: '#059669',
    notes: '普通預金',
  },
];

export const INITIAL_HOLDINGS: AssetHolding[] = [
  {
    id: 'hold_1',
    accountId: 'acc_rakuten',
    name: 'eMAXIS Slim 全世界株式 (オール・カントリー)',
    category: 'foreign_equity_fund',
    baseCurrency: 'USD',
    hasFxHedge: false,
    purchaseAmountJpy: 2400000,
    purchaseFxRate: 135.0,
    currentValJpy: 3450000,
    notes: '毎月つみたて中。オルカンの王道インデックス',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hold_2',
    accountId: 'acc_sbi',
    name: 'eMAXIS Slim 米国株式 (S&P500)',
    category: 'foreign_equity_fund',
    baseCurrency: 'USD',
    hasFxHedge: false,
    purchaseAmountJpy: 1800000,
    purchaseFxRate: 140.0,
    currentValJpy: 2680000,
    notes: '毎月つみたて中。米国主要500社へ分散',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hold_3',
    accountId: 'acc_monex',
    name: '楽天・全米株式インデックス・ファンド (楽天・VTI)',
    category: 'foreign_equity_fund',
    baseCurrency: 'USD',
    hasFxHedge: false,
    purchaseAmountJpy: 600000,
    purchaseFxRate: 145.0,
    currentValJpy: 780000,
    notes: 'クレカ積立枠で毎月継続',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hold_4',
    accountId: 'acc_sbi',
    name: 'eMAXIS Slim 先進国債券インデックス',
    category: 'foreign_bond_fund',
    baseCurrency: 'USD',
    hasFxHedge: false,
    purchaseAmountJpy: 500000,
    purchaseFxRate: 130.0,
    currentValJpy: 590000,
    notes: '無リスク資産寄りの外貨建て債券',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hold_5',
    accountId: 'acc_bank',
    name: '日本円 普通預金',
    category: 'cash_jpy',
    baseCurrency: 'JPY',
    hasFxHedge: false,
    purchaseAmountJpy: 1500000,
    purchaseFxRate: 1.0,
    currentValJpy: 1500000,
    notes: '緊急用・生活防衛資金',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_RECURRING_PLANS: RecurringPlan[] = [
  {
    id: 'rec_1',
    holdingId: 'hold_1', // オルカン
    accountId: 'acc_rakuten',
    monthlyAmountJpy: 50000,
    dayOfMonth: 1, // 毎月1日
    paymentMethod: 'credit_card',
    isActive: true,
    notes: '楽天カード決済積立 (毎月1日)',
  },
  {
    id: 'rec_2',
    holdingId: 'hold_2', // S&P500
    accountId: 'acc_sbi',
    monthlyAmountJpy: 50000,
    dayOfMonth: 10, // 毎月10日
    paymentMethod: 'credit_card',
    isActive: true,
    notes: '三井住友カード決済積立 (毎月10日)',
  },
  {
    id: 'rec_3',
    holdingId: 'hold_3', // 楽天VTI
    accountId: 'acc_monex',
    monthlyAmountJpy: 20000,
    dayOfMonth: 24, // 毎月24日
    paymentMethod: 'credit_card',
    isActive: true,
    notes: 'マネックスカード積立 (毎月24日)',
  },
];
