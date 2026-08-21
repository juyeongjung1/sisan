import { AssetHolding, RecurringPlan, AccumulationLog, ExchangeRates } from '@/types';

/**
 * 年月文字列のヘルパー (例: "2026-08")
 */
export function getYearMonthString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * 2つの年月の月数差を計算
 */
function getMonthDifference(fromYm: string, toYm: string): number {
  const [fromY, fromM] = fromYm.split('-').map(Number);
  const [toY, toM] = toYm.split('-').map(Number);
  return (toY - fromY) * 12 + (toM - fromM);
}

/**
 * 日付の経過に基づいて未処理の積立を自動検知・反映する
 */
export function checkAndProcessAccumulations(
  holdings: AssetHolding[],
  plans: RecurringPlan[],
  now: Date = new Date()
): {
  hasUpdated: boolean;
  updatedHoldings: AssetHolding[];
  updatedPlans: RecurringPlan[];
  generatedLogs: AccumulationLog[];
} {
  const currentYm = getYearMonthString(now);
  const currentDay = now.getDate();

  let hasUpdated = false;
  const updatedHoldings = [...holdings];
  const updatedPlans = [...plans];
  const generatedLogs: AccumulationLog[] = [];

  updatedPlans.forEach((plan, planIdx) => {
    if (!plan.isActive) return;

    const lastYm = plan.lastProcessedYearMonth || currentYm;
    const monthDiff = getMonthDifference(lastYm, currentYm);

    // まだ今月分が未処理で、かつ積立日当日または経過している場合、あるいは過去月分が未処理の場合
    let monthsToProcess = 0;
    if (monthDiff > 0) {
      // 過去月は無条件で処理 + 今月は積立日を迎えていれば処理
      monthsToProcess = monthDiff - 1 + (currentDay >= plan.dayOfMonth ? 1 : 0);
    } else if (monthDiff === 0 && currentDay >= plan.dayOfMonth && !plan.lastProcessedYearMonth) {
      monthsToProcess = 1;
    }

    if (monthsToProcess > 0) {
      const holdingIdx = updatedHoldings.findIndex((h) => h.id === plan.holdingId);
      if (holdingIdx !== -1) {
        const holding = updatedHoldings[holdingIdx];
        const addAmount = plan.monthlyAmountJpy * monthsToProcess;

        // 元本および評価額に加算
        updatedHoldings[holdingIdx] = {
          ...holding,
          purchaseAmountJpy: holding.purchaseAmountJpy + addAmount,
          currentValJpy: holding.currentValJpy + addAmount,
          updatedAt: now.toISOString(),
        };

        // プランの最終処理年月を今月に更新
        updatedPlans[planIdx] = {
          ...plan,
          lastProcessedYearMonth: currentYm,
        };

        generatedLogs.push({
          id: `log_${Date.now()}_${plan.id}`,
          planId: plan.id,
          holdingId: holding.id,
          holdingName: holding.name,
          amountJpy: addAmount,
          executedAt: now.toISOString(),
          yearMonth: currentYm,
        });

        hasUpdated = true;
      }
    }
  });

  return {
    hasUpdated,
    updatedHoldings,
    updatedPlans,
    generatedLogs,
  };
}

/**
 * 手動で即座に積立を実行・反映する
 */
export function executeManualAccumulation(
  planId: string,
  holdings: AssetHolding[],
  plans: RecurringPlan[],
  now: Date = new Date()
): {
  updatedHoldings: AssetHolding[];
  updatedPlans: RecurringPlan[];
  log: AccumulationLog | null;
} {
  const planIdx = plans.findIndex((p) => p.id === planId);
  if (planIdx === -1) {
    return { updatedHoldings: holdings, updatedPlans: plans, log: null };
  }

  const plan = plans[planIdx];
  const holdingIdx = holdings.findIndex((h) => h.id === plan.holdingId);
  if (holdingIdx === -1) {
    return { updatedHoldings: holdings, updatedPlans: plans, log: null };
  }

  const holding = holdings[holdingIdx];
  const currentYm = getYearMonthString(now);

  const updatedHoldings = [...holdings];
  updatedHoldings[holdingIdx] = {
    ...holding,
    purchaseAmountJpy: holding.purchaseAmountJpy + plan.monthlyAmountJpy,
    currentValJpy: holding.currentValJpy + plan.monthlyAmountJpy,
    updatedAt: now.toISOString(),
  };

  const updatedPlans = [...plans];
  updatedPlans[planIdx] = {
    ...plan,
    lastProcessedYearMonth: currentYm,
  };

  const log: AccumulationLog = {
    id: `log_${Date.now()}_${plan.id}`,
    planId: plan.id,
    holdingId: holding.id,
    holdingName: holding.name,
    amountJpy: plan.monthlyAmountJpy,
    executedAt: now.toISOString(),
    yearMonth: currentYm,
  };

  return {
    updatedHoldings,
    updatedPlans,
    log,
  };
}
