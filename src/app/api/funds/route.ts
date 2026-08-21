import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface FundPriceResponse {
  code: string;
  name: string;
  navPrice: number;    // 最新基準価額 (円) または ETF株価
  changeVal: number;   // 前日比 (円)
  changePct: number;   // 前日比 (%)
  asOf: string;        // 基準日
  updatedAt: string;
}

// 登録されている公募投信・ETFコード一覧
const FUND_CODES = [
  { code: '04311181', defaultName: 'iFreeNEXT FANG+インデックス' },
  { code: '0431124C', defaultName: 'iFreePlus 世界トレンド・テクノロジー株(Zテック20)' },
  { code: '9I31121B', defaultName: '楽天・レバレッジ・NASDAQ-100(レバナス)' },
  { code: '03311187', defaultName: 'eMAXIS Slim 米国株式(S&P500)' },
  { code: '2621.T', defaultName: 'iシェアーズ 米国債20年超 ETF (為替ヘッジあり)' },
  { code: '49313104', defaultName: '東京海上セレクション・外国株式インデックス' },
];

async function fetchSingleFundPrice(code: string, defaultName: string): Promise<FundPriceResponse> {
  try {
    const url = `https://finance.yahoo.co.jp/quote/${code}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.text();
    let price = 0;
    let changeVal = 0;
    let changePct = 0;
    const title = data.match(/<title>([^<]+)<\/title>/)?.[1] || defaultName;

    // 1. 基準価額 (Fund) または 現在値 (Stock/ETF)
    const priceMatch =
      data.match(/PriceBoard__price[^"]*"[^>]*>[\s\S]*?StyledNumber__value[^"]*">([0-9,]+)<\/span>/) ||
      data.match(/class="[^"]*_100"[^>]*>([0-9,]+)<\/span>/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/,/g, ''));
    }

    // 2. 前日比 (額)
    const changeValMatch = data.match(
      /PriceChangeLabel__primary[^"]*"[^>]*>[\s\S]*?StyledNumber__value[^"]*">([+-]?[0-9,]+)<\/span>/
    );
    if (changeValMatch) {
      changeVal = parseFloat(changeValMatch[1].replace(/,/g, ''));
    }

    // 3. 前日比 (%)
    const changePctMatch = data.match(
      /PriceChangeLabel__secondary[^"]*"[^>]*>[\s\S]*?StyledNumber__value[^"]*">([+-]?[0-9.]+)<\/span>/
    );
    if (changePctMatch) {
      changePct = parseFloat(changePctMatch[1]);
    }

    return {
      code,
      name: title.split('【')[0].split(' - ')[0].trim() || defaultName,
      navPrice: price,
      changeVal,
      changePct,
      asOf: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to scrape fund ${code}:`, error);
    return {
      code,
      name: defaultName,
      navPrice: 0,
      changeVal: 0,
      changePct: 0,
      asOf: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function GET() {
  try {
    const results = await Promise.all(
      FUND_CODES.map((f) => fetchSingleFundPrice(f.code, f.defaultName))
    );

    return NextResponse.json(
      {
        success: true,
        updatedAt: new Date().toISOString(),
        intervalHours: 3,
        funds: results,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10800, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch fund prices' },
      { status: 500 }
    );
  }
}
