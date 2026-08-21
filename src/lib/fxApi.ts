import { ExchangeRates } from '@/types';
import { DEFAULT_EXCHANGE_RATES } from './constants';

export async function fetchLiveExchangeRates(): Promise<ExchangeRates> {
  try {
    // Frankfurter API (USDベース)
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=JPY,EUR,GBP,AUD', {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }

    const data = await res.json();
    // data.rates: { JPY: 153.25, EUR: 0.92, GBP: 0.78, AUD: 1.55 }
    // JPY rate = data.rates.JPY (1 USD = X JPY)
    // EUR rate in JPY = JPY / EUR
    const usdJpy = data.rates.JPY;
    const eurUsd = 1 / data.rates.EUR;
    const eurJpy = eurUsd * usdJpy;
    const gbpUsd = 1 / data.rates.GBP;
    const gbpJpy = gbpUsd * usdJpy;
    const audUsd = 1 / data.rates.AUD;
    const audJpy = audUsd * usdJpy;

    return {
      USD: parseFloat(usdJpy.toFixed(2)),
      EUR: parseFloat(eurJpy.toFixed(2)),
      GBP: parseFloat(gbpJpy.toFixed(2)),
      AUD: parseFloat(audJpy.toFixed(2)),
      lastUpdated: new Date().toISOString(),
      isCustom: false,
    };
  } catch (error) {
    console.warn('為替レート自動取得失敗（フォールバックを使用します）:', error);
    return {
      ...DEFAULT_EXCHANGE_RATES,
      lastUpdated: new Date().toISOString(),
    };
  }
}
