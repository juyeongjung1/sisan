import { Account, AssetHolding, RecurringPlan, AccumulationLog, HoldingHistoryPoint, ExchangeRates } from '@/types';
import { DEFAULT_EXCHANGE_RATES, INITIAL_ACCOUNTS, INITIAL_HOLDINGS, INITIAL_RECURRING_PLANS } from './constants';
import { generateInitialHoldingHistories } from './historyGenerator';

const STORAGE_KEYS = {
  ACCOUNTS: 'sisan_accounts_v3',
  HOLDINGS: 'sisan_holdings_v3',
  RECURRING: 'sisan_recurring_v3',
  LOGS: 'sisan_accum_logs_v3',
  HISTORY: 'sisan_history_points_v3',
  RATES: 'sisan_rates_v3',
};

export interface ExportData {
  version: string;
  exportedAt: string;
  accounts: Account[];
  holdings: AssetHolding[];
  recurringPlans: RecurringPlan[];
  accumulationLogs?: AccumulationLog[];
  historyPoints?: HoldingHistoryPoint[];
  exchangeRates: ExchangeRates;
}

export function loadSavedAccounts(): Account[] {
  if (typeof window === 'undefined') return INITIAL_ACCOUNTS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || localStorage.getItem('sisan_accounts_v2');
    if (!data) return INITIAL_ACCOUNTS;
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load accounts:', e);
    return INITIAL_ACCOUNTS;
  }
}

export function saveAccounts(accounts: Account[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts:', e);
  }
}

export function loadSavedHoldings(): AssetHolding[] {
  if (typeof window === 'undefined') return INITIAL_HOLDINGS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HOLDINGS) || localStorage.getItem('sisan_holdings_v2');
    if (!data) return INITIAL_HOLDINGS;
    const parsed: AssetHolding[] = JSON.parse(data);
    
    // 自動マイグレーション: 既存の保存データに fundCode / units / latestNavPrice がない場合は補完
    return parsed.map((p) => {
      const init = INITIAL_HOLDINGS.find((h) => h.id === p.id);
      if (init) {
        return {
          ...p,
          fundCode: p.fundCode || init.fundCode,
          units: p.units || init.units,
          latestNavPrice: p.latestNavPrice || init.latestNavPrice,
          dailyChangeVal: p.dailyChangeVal !== undefined ? p.dailyChangeVal : init.dailyChangeVal,
          dailyChangePct: p.dailyChangePct !== undefined ? p.dailyChangePct : init.dailyChangePct,
        };
      }
      return p;
    });
  } catch (e) {
    console.error('Failed to load holdings:', e);
    return INITIAL_HOLDINGS;
  }
}

export function saveHoldings(holdings: AssetHolding[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.HOLDINGS, JSON.stringify(holdings));
  } catch (e) {
    console.error('Failed to save holdings:', e);
  }
}

export function loadSavedRecurringPlans(): RecurringPlan[] {
  if (typeof window === 'undefined') return INITIAL_RECURRING_PLANS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECURRING) || localStorage.getItem('sisan_recurring_v2');
    if (!data) return INITIAL_RECURRING_PLANS;
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load recurring plans:', e);
    return INITIAL_RECURRING_PLANS;
  }
}

export function saveRecurringPlans(plans: RecurringPlan[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save recurring plans:', e);
  }
}

export function loadSavedAccumulationLogs(): AccumulationLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS) || localStorage.getItem('sisan_accum_logs_v2');
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load accumulation logs:', e);
    return [];
  }
}

export function saveAccumulationLogs(logs: AccumulationLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save accumulation logs:', e);
  }
}

export function loadSavedHistoryPoints(holdings: AssetHolding[]): HoldingHistoryPoint[] {
  if (typeof window === 'undefined') return generateInitialHoldingHistories(holdings);
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY) || localStorage.getItem('sisan_history_points_v2');
    if (!data) return generateInitialHoldingHistories(holdings);
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load history points:', e);
    return generateInitialHoldingHistories(holdings);
  }
}

export function saveHistoryPoints(points: HoldingHistoryPoint[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(points));
  } catch (e) {
    console.error('Failed to save history points:', e);
  }
}

export function loadSavedRates(): ExchangeRates {
  if (typeof window === 'undefined') return DEFAULT_EXCHANGE_RATES;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RATES) || localStorage.getItem('sisan_rates_v2');
    if (!data) return DEFAULT_EXCHANGE_RATES;
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load rates:', e);
    return DEFAULT_EXCHANGE_RATES;
  }
}

export function saveRates(rates: ExchangeRates): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
  } catch (e) {
    console.error('Failed to save rates:', e);
  }
}

export function exportToJson(
  accounts: Account[],
  holdings: AssetHolding[],
  recurringPlans: RecurringPlan[],
  exchangeRates: ExchangeRates,
  accumulationLogs: AccumulationLog[] = [],
  historyPoints: HoldingHistoryPoint[] = []
): void {
  const exportObj: ExportData = {
    version: '1.5.0',
    exportedAt: new Date().toISOString(),
    accounts,
    holdings,
    recurringPlans,
    accumulationLogs,
    historyPoints,
    exchangeRates,
  };
  const jsonStr = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `sisan_backup_${dateStr}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(holdings: AssetHolding[], accounts: Account[]): void {
  const headers = [
    '銘柄名',
    '口座名',
    'カテゴリ',
    '原通貨',
    '為替ヘッジ',
    '投資元本(円)',
    '購入時為替レート',
    '現在評価額(円)',
    '公表基準価額',
    '公表前日比(%)',
    '備考',
  ];

  const rows = holdings.map((h) => {
    const acc = accounts.find((a) => a.id === h.accountId);
    return [
      `"${h.name.replace(/"/g, '""')}"`,
      `"${(acc?.name || '').replace(/"/g, '""')}"`,
      `"${h.category}"`,
      h.baseCurrency,
      h.hasFxHedge ? 'あり' : 'なし',
      h.purchaseAmountJpy,
      h.purchaseFxRate,
      h.currentValJpy,
      h.latestNavPrice || '-',
      h.dailyChangePct !== undefined ? `${h.dailyChangePct}%` : '-',
      `"${(h.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `sisan_holdings_${dateStr}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
