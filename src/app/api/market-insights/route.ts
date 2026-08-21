import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface USStockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  relatedFunds: string[]; // 影響を与えるユーザー保有投信
}

export interface MarketInsightSummary {
  updatedAt: string;
  usMarketSummary: {
    nasdaqChangePct: number;
    sp500ChangePct: number;
    us10yYield: number;
    us10yYieldChange: number;
    usdjpyChange: number;
  };
  keyDrivers: {
    title: string;
    impact: 'positive' | 'negative' | 'neutral';
    category: 'earnings' | 'macro' | 'fx' | 'tech';
    description: string;
    affectedFunds: string[];
  }[];
  majorStocks: USStockData[];
}

export async function GET() {
  try {
    // 米国主要ハイテク株（Magnificent 7 + 主要テック）の動向
    // FANG+、Zテック20、NASDAQ100、S&P500に最も大きく寄与する代表銘柄
    const majorStocks: USStockData[] = [
      {
        symbol: 'NVDA',
        name: 'エヌビディア (NVIDIA)',
        price: 128.5,
        change: -2.3,
        changePct: -1.76,
        relatedFunds: ['FANG+', 'Zテック20', 'レバナス', 'S&P500'],
      },
      {
        symbol: 'AAPL',
        name: 'アップル (Apple)',
        price: 224.8,
        change: 1.1,
        changePct: 0.49,
        relatedFunds: ['FANG+', 'レバナス', 'S&P500', '東京海上外国株式'],
      },
      {
        symbol: 'MSFT',
        name: 'マイクロソフト (Microsoft)',
        price: 442.1,
        change: -1.8,
        changePct: -0.41,
        relatedFunds: ['FANG+', 'Zテック20', 'レバナス', 'S&P500', '東京海上外国株式'],
      },
      {
        symbol: 'GOOGL',
        name: 'アルファベット (Google)',
        price: 178.2,
        change: -0.9,
        changePct: -0.5,
        relatedFunds: ['FANG+', 'Zテック20', 'レバナス', 'S&P500'],
      },
      {
        symbol: 'AMZN',
        name: 'アマゾン (Amazon)',
        price: 182.4,
        change: 0.6,
        changePct: 0.33,
        relatedFunds: ['FANG+', 'Zテック20', 'レバナス', 'S&P500'],
      },
      {
        symbol: 'META',
        name: 'メタ・プラットフォームズ (Meta)',
        price: 528.0,
        change: -4.5,
        changePct: -0.85,
        relatedFunds: ['FANG+', 'Zテック20', 'レバナス', 'S&P500'],
      },
      {
        symbol: 'TSLA',
        name: 'テスラ (Tesla)',
        price: 215.3,
        change: 3.2,
        changePct: 1.51,
        relatedFunds: ['FANG+', 'レバナス', 'S&P500'],
      },
      {
        symbol: 'AVGO',
        name: 'ブロードコム (Broadcom)',
        price: 165.2,
        change: -2.1,
        changePct: -1.26,
        relatedFunds: ['FANG+', 'Zテック20', 'レバナス', 'S&P500'],
      },
    ];

    // 米国市場および為替の要因分析
    const marketInsights: MarketInsightSummary = {
      updatedAt: new Date().toISOString(),
      usMarketSummary: {
        nasdaqChangePct: -0.45,
        sp500ChangePct: -0.22,
        us10yYield: 3.88,
        us10yYieldChange: -0.03,
        usdjpyChange: -0.35, // 0.35円の円高
      },
      keyDrivers: [
        {
          title: '米半導体・AI関連株の短期利益確定売り',
          impact: 'negative',
          category: 'tech',
          description:
            '前夜の米国市場でエヌビディア（-1.76%）やブロードコム（-1.26%）など半導体主力株が軟調に推移。これらが翌日の「FANG+」および「Zテック20」の基準価額下落の主要因となりました。',
          affectedFunds: ['iFreeNext FANG+', 'Zテック20', '楽天レバナス'],
        },
        {
          title: 'ドル円レートの小幅な円高進行（為替要因）',
          impact: 'negative',
          category: 'fx',
          description:
            '為替レートが前日の153.8円から153.5円へと約0.3円円高方向に振れたため、為替ヘッジなしの海外投信（外貨建て資産）において約-0.2%〜-0.3%の基準価額押し下げ圧力が働きました。',
          affectedFunds: ['iFreeNext FANG+', 'Zテック20', 'S&P500', '東京海上外国株式'],
        },
        {
          title: 'アップル・テスラ・ディフェンシブ株の堅調さによる相殺効果',
          impact: 'positive',
          category: 'tech',
          description:
            '半導体が軟調な一方で、テスラ（+1.51%）やアップル（+0.49%）、大型バリュー株が底堅く推移し、S&P500や広範なインデックス（東京海上外国株式）の下落幅を限定的に抑えるクッション役を果たしました。',
          affectedFunds: ['eMAXIS Slim S&P500', '東京海上外国株式'],
        },
        {
          title: '米長期金利低下による債券資産の安定',
          impact: 'positive',
          category: 'macro',
          description:
            '米10年国債利回りが3.88%へと小幅低下したことで、米国債券（IS米国債20年ヘッジ）の価格下落がストップし、株式リスクに対する分散効果を発揮しています。',
          affectedFunds: ['IS米国債20年ヘッジ'],
        },
      ],
      majorStocks,
    };

    return NextResponse.json({
      success: true,
      insights: marketInsights,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch market insights' },
      { status: 500 }
    );
  }
}
