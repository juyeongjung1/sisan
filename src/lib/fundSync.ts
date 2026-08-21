import { AssetHolding } from '@/types';
import { FundPriceResponse } from '@/app/api/funds/route';

const LAST_SYNC_KEY = 'sisan_funds_last_sync_v2';
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

export async function fetchLiveFundPrices(): Promise<FundPriceResponse[]> {
  try {
    const res = await fetch('/api/funds', {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    return data.funds || [];
  } catch (e) {
    console.error('Failed to fetch fund prices from API:', e);
    return [];
  }
}

/**
 * 保有銘柄に最新の公表基準価額を反映し、保有口数から最新評価額を再計算する
 */
export function syncHoldingsWithFundPrices(
  holdings: AssetHolding[],
  prices: FundPriceResponse[]
): {
  updatedHoldings: AssetHolding[];
  hasChanges: boolean;
} {
  let hasChanges = false;
  const updatedHoldings = holdings.map((h) => {
    if (!h.fundCode) return h;

    const matched = prices.find((p) => p.code === h.fundCode);
    if (!matched || matched.navPrice <= 0) return h;

    // 保有口数（units）から最新評価額を算出
    // 日本の投資信託は 10,000口あたりの基準価額。ETFは 1口あたり。
    const isEtf = h.fundCode.includes('.T');
    let newValJpy = h.currentValJpy;
    
    if (h.units && h.units > 0) {
      if (isEtf) {
        newValJpy = Math.round(h.units * matched.navPrice);
      } else {
        newValJpy = Math.round((h.units * matched.navPrice) / 10000);
      }
    }

    if (
      newValJpy !== h.currentValJpy ||
      h.latestNavPrice !== matched.navPrice ||
      h.dailyChangePct !== matched.changePct
    ) {
      hasChanges = true;
      return {
        ...h,
        currentValJpy: newValJpy,
        latestNavPrice: matched.navPrice,
        dailyChangeVal: matched.changeVal,
        dailyChangePct: matched.changePct,
        updatedAt: new Date().toISOString(),
      };
    }

    return h;
  });

  return { updatedHoldings, hasChanges };
}

export function shouldAutoSyncFunds(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (!lastSync) return true;
    const lastTime = new Date(lastSync).getTime();
    return Date.now() - lastTime > THREE_HOURS_MS;
  } catch {
    return true;
  }
}

export function recordFundSyncTime(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch {}
}

export function getLastFundSyncTime(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LAST_SYNC_KEY);
  } catch {
    return null;
  }
}
