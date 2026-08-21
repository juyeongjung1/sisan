import { AssetHolding, HoldingHistoryPoint, TimeframeOption } from '@/types';

/**
 * 各商品およびポートフォリオ全体のリアルな時系列推移データを生成
 */
export function generateInitialHoldingHistories(holdings: AssetHolding[]): HoldingHistoryPoint[] {
  const points: HoldingHistoryPoint[] = [];

  // 基準日: 2026-08-21
  const baseDate = new Date(2026, 7, 21); // 2026-08-21

  // 1. 各銘柄の履歴を生成
  holdings.forEach((h) => {
    const isAccumulating = h.notes?.includes('積立');
    const totalGainRatio = h.purchaseAmountJpy > 0 ? h.currentValJpy / h.purchaseAmountJpy : 1;

    // 過去3年分 (月次: 36ヶ月)
    for (let m = 36; m >= 0; m--) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() - m);
      const dateStr = d.toISOString().split('T')[0];

      const progress = (36 - m) / 36; // 0 (3年前) -> 1 (現在)
      
      // 元本の推移（積立の場合は徐々に増加、一括の場合は一定）
      let histPrincipal = h.purchaseAmountJpy;
      if (isAccumulating) {
        histPrincipal = Math.round(h.purchaseAmountJpy * (0.2 + 0.8 * progress));
      }

      // 評価額の推移（波打ちながら成長）
      // 季節性・ボラティリティのシミュレーション波
      const wave = Math.sin(progress * Math.PI * 4) * 0.08 + Math.cos(progress * Math.PI * 2) * 0.05;
      const effectiveGainRatio = 1 + (totalGainRatio - 1) * Math.pow(progress, 1.2) + wave * progress;
      const histVal = Math.round(histPrincipal * Math.max(0.5, effectiveGainRatio));

      // 為替レート推移 (130円 -> 153.5円へ円安進行)
      const fxRate = 130 + 23.5 * progress + Math.sin(progress * 8) * 3;

      points.push({
        id: `hist_${h.id}_m_${m}`,
        holdingId: h.id,
        date: dateStr,
        currentValJpy: m === 0 ? h.currentValJpy : histVal,
        purchaseAmountJpy: m === 0 ? h.purchaseAmountJpy : histPrincipal,
        fxRateUsd: parseFloat(fxRate.toFixed(1)),
        notes: m === 0 ? '最新評価額' : (m % 6 === 0 ? '定期買付反映' : undefined),
      });
    }

    // 直近30日間 (日次: 30日)
    for (let day = 30; day >= 1; day--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - day);
      const dateStr = d.toISOString().split('T')[0];
      const dayProgress = (30 - day) / 30; // 0 -> 1

      // 直近のわずかな日次ランダムウォーク
      const dailyFluctuation = (Math.sin(day * 1.5) * 0.015) + (dayProgress * 0.01);
      const histVal = Math.round(h.currentValJpy * (1 - 0.015 + dailyFluctuation));
      const fxRate = 153.5 - (day * 0.05) + Math.sin(day) * 0.4;

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
    case 'day': // 直近7日間
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      break;
    case 'week': // 直近4週間 (28日)
      cutoffDate.setDate(cutoffDate.getDate() - 28);
      break;
    case 'month': // 直近12ヶ月 (1年間)
      cutoffDate.setMonth(cutoffDate.getMonth() - 12);
      break;
    case 'year': // 直近3年間
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 3);
      break;
    case 'all':
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
