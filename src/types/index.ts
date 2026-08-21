export type Currency = 'JPY' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'OTHER';

export type AccountType = 'brokerage' | 'bank' | 'crypto' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  color: string;
  notes?: string;
}

export type AssetCategory =
  | 'foreign_equity_fund'  // 海外株式投信（オルカン、S&P500等）
  | 'foreign_bond_fund'    // 海外債券投信
  | 'domestic_equity'      // 国内株式
  | 'domestic_fund'        // 国内投信
  | 'crypto'               // 暗号資産
  | 'cash_jpy'             // 日本円現金・預金
  | 'cash_foreign'         // 外貨預金・MMF
  | 'other';               // その他

export interface AssetHolding {
  id: string;
  accountId: string;
  name: string;
  category: AssetCategory;
  baseCurrency: Currency;   // 原資産の通貨（例: USD）
  hasFxHedge: boolean;      // 為替ヘッジあり/なし
  purchaseAmountJpy: number;// 投資元本（円）
  purchaseFxRate: number;   // 購入時の平均為替レート（例: 1ドル=138.5円）
  currentValJpy: number;    // 現在の評価額（円）
  
  // 公開Webデータ連携用プロパティ
  fundCode?: string;        // 投信コード/ETFコード (例: '04311181')
  units?: number;           // 保有口数 (または株数)
  latestNavPrice?: number;  // 取得した最新基準価額 (円)
  dailyChangeVal?: number;  // 公式公表前日比 (円)
  dailyChangePct?: number;  // 公式公表前日比 (%)

  notes?: string;
  updatedAt: string;
}

export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'balance' | 'other';

export interface RecurringPlan {
  id: string;
  holdingId: string;        // 対象の保有銘柄
  accountId: string;        // 引き落とし/積立口座
  monthlyAmountJpy: number; // 毎月の積立額（円）
  dayOfMonth: number;       // 毎月の積立指定日 (1〜31)
  paymentMethod: PaymentMethod;
  isActive: boolean;
  notes?: string;
  lastProcessedYearMonth?: string; // 最後に積立反映された年月 (例: "2026-08")
}

export interface AccumulationLog {
  id: string;
  planId: string;
  holdingId: string;
  holdingName: string;
  amountJpy: number;
  executedAt: string;
  yearMonth: string;
}

// 銘柄（商品）ごとの日・週・月・年 推移履歴データ
export interface HoldingHistoryPoint {
  id: string;
  holdingId: string;         // 'all' または 特定の銘柄ID
  date: string;              // YYYY-MM-DD
  currentValJpy: number;     // その時点の評価額 (円)
  purchaseAmountJpy: number; // その時点の投資元本 (円)
  fxRateUsd?: number;        // その時点の為替レート (USD/JPY)
  notes?: string;            // イベント
}

export type TimeframeOption = 'day' | 'week' | 'month' | 'year' | 'all';

export interface ExchangeRates {
  USD: number;
  EUR: number;
  GBP: number;
  AUD: number;
  lastUpdated: string;
  isCustom?: boolean;
}

export interface PortfolioSummary {
  totalPurchaseJpy: number;     // 総投資元本（円）
  totalCurrentValJpy: number;    // 現在の総評価額（円）
  totalGainLossJpy: number;      // 総損益（円）
  totalGainLossPercent: number;  // 総損益率（%）
  
  // 為替分解（海外資産・ヘッジなし対象）
  assetGrowthGainJpy: number;    // 原資産成長（株高等）による損益（円）
  fxGainJpy: number;             // 為替（円安/円高）による損益（円）
  synergyGainJpy: number;        // 相乗要因（円）
  foreignAssetsCount: number;    // 海外資産の件数
  
  // シミュレーション時の値
  simulatedTotalValJpy: number;  // シミュレーション総評価額
  simulatedDiffJpy: number;      // 現在評価額との差額

  // 毎月の積立合計
  monthlyTotalInvestmentJpy: number;
}

export interface CurrencyExposure {
  currency: Currency;
  label: string;
  amountJpy: number;
  percentage: number;
  color: string;
}

export interface CategoryAllocation {
  category: AssetCategory;
  label: string;
  amountJpy: number;
  percentage: number;
  color: string;
}

export interface AccountAllocation {
  accountId: string;
  name: string;
  amountJpy: number;
  percentage: number;
  color: string;
}

export interface ProductAllocation {
  id: string;
  name: string;
  amountJpy: number;
  percentage: number;
  color: string;
  fundCode?: string;
  mergedAccounts?: string[];
}
