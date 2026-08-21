import { Account, AssetHolding, RecurringPlan, AccumulationLog, HoldingHistoryPoint, ExchangeRates } from '@/types';
import { DEFAULT_EXCHANGE_RATES, INITIAL_ACCOUNTS, INITIAL_HOLDINGS, INITIAL_RECURRING_PLANS } from './constants';
import { generateInitialHoldingHistories } from './historyGenerator';

const STORAGE_KEYS = {
  ACCOUNTS: 'sisan_accounts_v4',
  HOLDINGS: 'sisan_holdings_v4',
  RECURRING: 'sisan_recurring_v4',
  LOGS: 'sisan_accum_logs_v4',
  HISTORY: 'sisan_history_points_v4',
  RATES: 'sisan_rates_v4',
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
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_ACCOUNTS;
    return parsed;
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
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_HOLDINGS;
    
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
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_RECURRING_PLANS;
    return parsed;
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
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
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
    const parsed: HoldingHistoryPoint[] = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return generateInitialHoldingHistories(holdings);
    }
    return parsed;
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
    const parsed = JSON.parse(data);
    if (!parsed || !parsed.USD) return DEFAULT_EXCHANGE_RATES;
    return parsed;
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

/**
 * 全データのJSONエクスポート
 */
export function exportAllData(
  accounts: Account[],
  holdings: AssetHolding[],
  recurringPlans: RecurringPlan[],
  exchangeRates: ExchangeRates,
  accumulationLogs?: AccumulationLog[],
  historyPoints?: HoldingHistoryPoint[]
): string {
  const exportPayload: ExportData = {
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    accounts,
    holdings,
    recurringPlans,
    accumulationLogs,
    historyPoints,
    exchangeRates,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function exportToJson(
  accounts: Account[],
  holdings: AssetHolding[],
  recurringPlans: RecurringPlan[],
  exchangeRates: ExchangeRates,
  accumulationLogs?: AccumulationLog[],
  historyPoints?: HoldingHistoryPoint[]
): void {
  if (typeof window === 'undefined') return;
  const jsonStr = exportAllData(accounts, holdings, recurringPlans, exchangeRates, accumulationLogs, historyPoints);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sisan_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(holdings: AssetHolding[], accounts: Account[]): void {
  if (typeof window === 'undefined') return;
  const headers = ['銘柄名', '口座', '種別', '通貨', '取得金額(円)', '現在評価額(円)', '含み損益(円)', '損益率(%)', '前日比(円)', '前日比(%)'];
  const accountMap = new Map<string, string>();
  accounts.forEach((a) => accountMap.set(a.id, a.name));

  const rows = holdings.map((h) => {
    const accName = accountMap.get(h.accountId) || h.accountId;
    const gainVal = h.currentValJpy - h.purchaseAmountJpy;
    const gainPct = h.purchaseAmountJpy > 0 ? (gainVal / h.purchaseAmountJpy) * 100 : 0;
    return [
      `"${h.name.replace(/"/g, '""')}"`,
      `"${accName.replace(/"/g, '""')}"`,
      `"${h.category}"`,
      `"${h.baseCurrency}"`,
      h.purchaseAmountJpy,
      h.currentValJpy,
      gainVal,
      gainPct.toFixed(2),
      h.dailyChangeVal || 0,
      (h.dailyChangePct || 0).toFixed(2),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sisan_holdings_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * JSONファイルからのインポート復元
 */
export function importAllData(jsonString: string): ExportData | null {
  try {
    const data = JSON.parse(jsonString) as ExportData;
    if (!data.accounts || !data.holdings || !data.recurringPlans) {
      throw new Error('必須データ（口座・保有銘柄・積立設定）が不足しています。');
    }
    saveAccounts(data.accounts);
    saveHoldings(data.holdings);
    saveRecurringPlans(data.recurringPlans);
    if (data.accumulationLogs) saveAccumulationLogs(data.accumulationLogs);
    if (data.historyPoints) saveHistoryPoints(data.historyPoints);
    if (data.exchangeRates) saveRates(data.exchangeRates);
    return data;
  } catch (e) {
    console.error('Failed to import data:', e);
    return null;
  }
}

/**
 * データを初期状態にリセット
 */
export function resetAllDataToDefault(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
  localStorage.removeItem(STORAGE_KEYS.HOLDINGS);
  localStorage.removeItem(STORAGE_KEYS.RECURRING);
  localStorage.removeItem(STORAGE_KEYS.LOGS);
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
  localStorage.removeItem(STORAGE_KEYS.RATES);
  localStorage.removeItem('sisan_accounts_v2');
  localStorage.removeItem('sisan_holdings_v2');
  localStorage.removeItem('sisan_recurring_v2');
  localStorage.removeItem('sisan_accum_logs_v2');
  localStorage.removeItem('sisan_history_points_v2');
  localStorage.removeItem('sisan_rates_v2');
}
