import { AssetHolding, HoldingHistoryPoint, TimeframeOption } from '@/types';

// 各銘柄の実際の運用開始期間（月数）
const HOLDING_START_MONTHS: Record<string, number> = {
  hold_john_1: 24,       // IS米国債20年ヘッジ (約2年前)
  hold_john_2: 60,       // 楽天レバナス (5年間積立)
  hold_john_3: 24,       // iFreeNext FANG+ (約2年間積立)
  hold_john_4: 24,       // Zテック20 (約2年間積立)
  hold_miki_1: 24,       // ミキ Zテック20 (約2年前一括)
  hold_miki_2: 60,       // ミキ S&P500 (約5年前)
  hold_john_dc_1: 96,    // 確定拠出年金 (長期・約8年間積立)
  hold_kids_1: 36,       // 子供NISA現金
};

/**
 * 各商品およびポートフォリオ全体のリアルな時系列推移データを生成
 */
export function generateInitialHoldingHistories(holdings: AssetHolding[]): HoldingHistoryPoint[] {
  const points: HoldingHistoryPoint[] = [];

  // 基準日: 2026-08-21
  const baseDate = new Date(2026, 7, 21);

  // 1. 各銘柄の履歴を生成（最大8年 = 96ヶ月）
  holdings.forEach((h) => {
    const isAccumulating = h.notes?.includes('積立');
    const totalGainRatio = h.purchaseAmountJpy > 0 ? h.currentValJpy / h.purchaseAmountJpy : 1;
    const startMonthsAgo = HOLDING_START_MONTHS[h.id] || 36;

    // 過去96ヶ月分 (月次)
    for (let m = 96; m >= 0; m--) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() - m);
      const dateStr = d.toISOString().split('T')[0];

      // この商品の投資開始前であればデータを作らない（または元本0/評価0）
      if (m > startMonthsAgo) {
        continue;
      }

      const activeMonths = startMonthsAgo - m;
      const progress = startMonthsAgo > 0 ? activeMonths / startMonthsAgo : 1; // 0 (開始時) -> 1 (現在)

      // 元本の推移
      let histPrincipal = h.purchaseAmountJpy;
      if (isAccumulating && startMonthsAgo > 0) {
        // 積立の場合は月数に応じて均等に元本が積み上がる
        const minRatio = 1 / startMonthsAgo;
        histPrincipal = Math.round(h.purchaseAmountJpy * (minRatio + (1 - minRatio) * progress));
      }

      // 評価額の推移（レバナスは2022年の下落と2023-2024年の爆発的成長をリアルに再現）
      let effectiveGainRatio = 1;
      if (h.id === 'hold_john_2') {
        // レバナス特有の曲線 (2021高値 -> 2022-2023大底 -60% -> 2024-2026急上昇 +170%)
        if (progress < 0.3) {
          effectiveGainRatio = 1 + 0.3 * (progress / 0.3);
        } else if (progress < 0.5) {
          effectiveGainRatio = 0.5 + 0.1 * Math.sin(progress * 10); // 大底
        } else {
          const recoveryProg = (progress - 0.5) / 0.5;
          effectiveGainRatio = 0.6 + (totalGainRatio - 0.6) * Math.pow(recoveryProg, 1.6);
        }
      } else {
        // 一般的な資産の推移
        const wave = Math.sin(progress * Math.PI * 3) * 0.04;
        effectiveGainRatio = 1 + (totalGainRatio - 1) * Math.pow(progress, 1.1) + wave * progress;
      }

      const histVal = Math.round(histPrincipal * Math.max(0.4, effectiveGainRatio));

      // 為替レート推移 (5年前: 110円 -> 2年前: 140円 -> 現在: 153.5円)
      const fxRate = 110 + 43.5 * (1 - m / 96) + Math.sin(m) * 1.5;

      points.push({
        id: `hist_${h.id}_m_${m}`,
        holdingId: h.id,
        date: dateStr,
        currentValJpy: m === 0 ? h.currentValJpy : histVal,
        purchaseAmountJpy: m === 0 ? h.purchaseAmountJpy : histPrincipal,
        fxRateUsd: parseFloat(fxRate.toFixed(1)),
        notes: m === 0 ? '最新評価額' : (m === startMonthsAgo ? '投資開始' : (m % 6 === 0 ? '定期積立' : undefined)),
      });
    }

    // 直近30日間 (日次: 30日)
    for (let day = 30; day >= 1; day--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - day);
      const dateStr = d.toISOString().split('T')[0];
      const dayProgress = (30 - day) / 30; // 0 -> 1

      // 直近の日次ランダムウォーク（最新日は確実に現在評価額へ収束）
      const dailyFluctuation = (Math.sin(day * 0.8) * 0.008) - ((1 - dayProgress) * 0.005);
      const histVal = Math.round(h.currentValJpy * (1 + dailyFluctuation));
      const fxRate = 153.5 - (day * 0.04) + Math.sin(day) * 0.2;

      points.push({
        id: `hist_${h.id}_d_${day}`,
        holdingId: h.id,
        date: dateStr,
        currentValJpy: histVal,
        purchaseAmountJpy: h.purchaseAmountJpy,
        fxRateUsd: parseFloat(fxRate.toFixed(1)),
      });
    }
  });

  // 日付順にソート
  return points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * 選択された期間（日・週・月・年・全期間）および選択された銘柄でデータをフィルタリング
 */
export function filterHistoryByTimeframe(
  historyPoints: HoldingHistoryPoint[],
  selectedHoldingId: string, // 'all' または 特定のholdingId
  timeframe: TimeframeOption,
  now: Date = new Date(2026, 7, 21)
): HoldingHistoryPoint[] {
  let filtered = historyPoints;

  // 1. 銘柄フィルタ
  if (selectedHoldingId !== 'all') {
    filtered = filtered.filter((p) => p.holdingId === selectedHoldingId);
  } else {
    // 全銘柄合計のポイントを集計 (日付ごとにグループ化)
    const dateMap = new Map<string, { currentValJpy: number; purchaseAmountJpy: number; fxRateUsd?: number }>();
    filtered.forEach((p) => {
      const existing = dateMap.get(p.date) || { currentValJpy: 0, purchaseAmountJpy: 0, fxRateUsd: p.fxRateUsd };
      existing.currentValJpy += p.currentValJpy;
      existing.purchaseAmountJpy += p.purchaseAmountJpy;
      dateMap.set(p.date, existing);
    });

    filtered = Array.from(dateMap.entries()).map(([date, val], idx) => ({
      id: `agg_${date}_${idx}`,
      holdingId: 'all',
      date,
      currentValJpy: val.currentValJpy,
      purchaseAmountJpy: val.purchaseAmountJpy,
      fxRateUsd: val.fxRateUsd,
    }));
  }

  // 2. 期間フィルタ
  const cutoffDate = new Date(now);
  switch (timeframe) {
    case 'day': // 直近7日間 (日次)
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      break;
    case 'week': // 直近4週間 (28日)
      cutoffDate.setDate(cutoffDate.getDate() - 28);
      break;
    case 'month': // 直近12ヶ月 (1年)
      cutoffDate.setMonth(cutoffDate.getMonth() - 12);
      break;
    case 'year': // 直近3年間
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 3);
      break;
    case 'all': // 全期間（8年間）
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 10);
      break;
  }

  const result = filtered.filter((p) => new Date(p.date) >= cutoffDate);
  
  // 日付順にソートし重複日付を除去
  const uniqueMap = new Map<string, HoldingHistoryPoint>();
  result.forEach((p) => uniqueMap.set(p.date, p));
  return Array.from(uniqueMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
