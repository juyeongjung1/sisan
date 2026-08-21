'use client';

import React, { useState, useEffect } from 'react';
import { Account, AssetHolding, RecurringPlan, AccumulationLog, HoldingHistoryPoint, ExchangeRates } from '@/types';
import {
  loadSavedAccounts,
  saveAccounts,
  loadSavedHoldings,
  saveHoldings,
  loadSavedRecurringPlans,
  saveRecurringPlans,
  loadSavedAccumulationLogs,
  saveAccumulationLogs,
  loadSavedHistoryPoints,
  saveHistoryPoints,
  loadSavedRates,
  saveRates,
  ExportData,
} from '@/lib/storage';
import { calculatePortfolio } from '@/lib/calculations';
import { fetchLiveExchangeRates } from '@/lib/fxApi';
import { checkAndProcessAccumulations, executeManualAccumulation } from '@/lib/accumulation';
import {
  fetchLiveFundPrices,
  syncHoldingsWithFundPrices,
  recordFundSyncTime,
  getLastFundSyncTime,
} from '@/lib/fundSync';
import { syncHistoryWithHoldings } from '@/lib/historyGenerator';
import {
  INITIAL_ACCOUNTS,
  INITIAL_HOLDINGS,
  INITIAL_RECURRING_PLANS,
  DEFAULT_EXCHANGE_RATES,
} from '@/lib/constants';

import { Header } from '@/components/Header';
import { SummaryCards } from '@/components/SummaryCards';
import { DailyContributionAnalysis } from '@/components/DailyContributionAnalysis';
import { HoldingPerformanceHistory } from '@/components/HoldingPerformanceHistory';
import { FxSimulator } from '@/components/FxSimulator';
import { AllocationsChart } from '@/components/AllocationsChart';
import { RecurringPlanSection } from '@/components/RecurringPlanSection';
import { HoldingsTable } from '@/components/HoldingsTable';

import { HistoryModal } from '@/components/HistoryModal';
import { HoldingModal } from '@/components/HoldingModal';
import { RecurringModal } from '@/components/RecurringModal';
import { AccountModal } from '@/components/AccountModal';
import { BackupModal } from '@/components/BackupModal';
import { CustomRateModal } from '@/components/CustomRateModal';

import {
  LayoutDashboard,
  Zap,
  Sliders,
  Calendar,
  ListChecks,
  LineChart,
  CheckCircle,
  X,
} from 'lucide-react';

export default function DashboardPage() {
  // 状態管理
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [holdings, setHoldings] = useState<AssetHolding[]>(INITIAL_HOLDINGS);
  const [recurringPlans, setRecurringPlans] = useState<RecurringPlan[]>(INITIAL_RECURRING_PLANS);
  const [accumulationLogs, setAccumulationLogs] = useState<AccumulationLog[]>([]);
  const [historyPoints, setHistoryPoints] = useState<HoldingHistoryPoint[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(DEFAULT_EXCHANGE_RATES);
  const [simulatedUsdRate, setSimulatedUsdRate] = useState<number>(DEFAULT_EXCHANGE_RATES.USD);
  const [isFetchingRates, setIsFetchingRates] = useState<boolean>(false);
  const [isFetchingFunds, setIsFetchingFunds] = useState<boolean>(false);
  const [lastFundSyncTime, setLastFundSyncTime] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  // 自動積立通知トースト
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // モーダル管理（初回自動表示のため初期値 true）
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(true);
  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState<boolean>(false);
  const [editingHolding, setEditingHolding] = useState<AssetHolding | null>(null);

  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<RecurringPlan | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isCustomRateModalOpen, setIsCustomRateModalOpen] = useState<boolean>(false);

  // スマホ用アクティブタブ
  const [mobileTab, setMobileTab] = useState<'dashboard' | 'contribution' | 'history' | 'simulator' | 'recurring' | 'holdings'>('dashboard');

  // クライアント初期化 & データ読み込み & 自動積立判定 & 3時間自動投信データ同期
  useEffect(() => {
    setIsClient(true);
    const loadedAccounts = loadSavedAccounts();
    const loadedHoldings = loadSavedHoldings();
    const loadedPlans = loadSavedRecurringPlans();
    const loadedLogs = loadSavedAccumulationLogs();
    const loadedHistory = loadSavedHistoryPoints(loadedHoldings);
    const loadedRates = loadSavedRates();
    const lastSync = getLastFundSyncTime();
    setLastFundSyncTime(lastSync);

    // 日付経過による自動積立チェック
    const { hasUpdated, updatedHoldings, updatedPlans, generatedLogs } =
      checkAndProcessAccumulations(loadedHoldings, loadedPlans, new Date());

    let currentHoldings = loadedHoldings;
    if (hasUpdated) {
      currentHoldings = updatedHoldings;
      setHoldings(updatedHoldings);
      setRecurringPlans(updatedPlans);
      const newLogs = [...generatedLogs, ...loadedLogs];
      setAccumulationLogs(newLogs);
      saveHoldings(updatedHoldings);
      saveRecurringPlans(updatedPlans);
      saveAccumulationLogs(newLogs);

      const totalAdd = generatedLogs.reduce((sum, l) => sum + l.amountJpy, 0);
      setNotificationMsg(`🎉 積立指定日を迎えました！ ${generatedLogs.length}件の積立（計¥${totalAdd.toLocaleString()}）を資産に自動反映しました。`);
    } else {
      setHoldings(loadedHoldings);
      setRecurringPlans(loadedPlans);
      setAccumulationLogs(loadedLogs);
    }

    setAccounts(loadedAccounts);

    // 時系列データと公表前日比（dailyChangePct）を完全一致同期
    const syncedHistory = syncHistoryWithHoldings(loadedHistory, currentHoldings);
    setHistoryPoints(syncedHistory);
    saveHistoryPoints(syncedHistory);

    setExchangeRates(loadedRates);
    setSimulatedUsdRate(loadedRates.USD);

    // 最新の為替レートを取得
    handleRefreshRates();

    // 最新の公表投信基準価額を自動同期
    handleRefreshFundPrices(currentHoldings);
  }, []);

  // データ変更時のLocalStorage自動保存
  useEffect(() => {
    if (!isClient) return;
    saveAccounts(accounts);
  }, [accounts, isClient]);

  useEffect(() => {
    if (!isClient) return;
    saveHoldings(holdings);
  }, [holdings, isClient]);

  useEffect(() => {
    if (!isClient) return;
    saveRecurringPlans(recurringPlans);
  }, [recurringPlans, isClient]);

  useEffect(() => {
    if (!isClient) return;
    saveAccumulationLogs(accumulationLogs);
  }, [accumulationLogs, isClient]);

  useEffect(() => {
    if (!isClient) return;
    saveHistoryPoints(historyPoints);
  }, [historyPoints, isClient]);

  useEffect(() => {
    if (!isClient) return;
    saveRates(exchangeRates);
  }, [exchangeRates, isClient]);

  // 為替レート取得
  const handleRefreshRates = async () => {
    setIsFetchingRates(true);
    try {
      const live = await fetchLiveExchangeRates();
      setExchangeRates(live);
      setSimulatedUsdRate(live.USD);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingRates(false);
    }
  };

  // 公表Web投信基準価額の自動同期
  const handleRefreshFundPrices = async (targetHoldings: AssetHolding[] = holdings) => {
    setIsFetchingFunds(true);
    try {
      const livePrices = await fetchLiveFundPrices();
      if (livePrices.length > 0) {
        const { updatedHoldings, hasChanges } = syncHoldingsWithFundPrices(targetHoldings, livePrices);
        if (hasChanges) {
          setHoldings(updatedHoldings);
          saveHoldings(updatedHoldings);

          // 時系列データも最新公表値に合わせて即時完全同期
          setHistoryPoints((prev) => {
            const synced = syncHistoryWithHoldings(prev, updatedHoldings);
            saveHistoryPoints(synced);
            return synced;
          });
        }
        recordFundSyncTime();
        setLastFundSyncTime(new Date().toISOString());
      }
    } catch (e) {
      console.error('Failed to sync fund prices:', e);
    } finally {
      setIsFetchingFunds(false);
    }
  };

  // 資産ハンドラ
  const handleSaveHolding = (holding: AssetHolding) => {
    setHoldings((prev) => {
      const exists = prev.some((h) => h.id === holding.id);
      if (exists) {
        return prev.map((h) => (h.id === holding.id ? holding : h));
      }
      return [...prev, holding];
    });
  };

  const handleDeleteHolding = (id: string) => {
    if (confirm('この資産を削除してもよろしいですか？')) {
      setHoldings((prev) => prev.filter((h) => h.id !== id));
      setRecurringPlans((prev) => prev.filter((r) => r.holdingId !== id));
    }
  };

  // 積立ハンドラ
  const handleSaveRecurringPlan = (plan: RecurringPlan) => {
    setRecurringPlans((prev) => {
      const exists = prev.some((p) => p.id === plan.id);
      if (exists) {
        return prev.map((p) => (p.id === plan.id ? plan : p));
      }
      return [...prev, plan];
    });
  };

  const handleToggleRecurringActive = (id: string) => {
    setRecurringPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleDeleteRecurringPlan = (id: string) => {
    if (confirm('この積立設定を削除しますか？')) {
      setRecurringPlans((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // 手動積立実行
  const handleExecuteManual = (planId: string) => {
    const { updatedHoldings, updatedPlans, log } = executeManualAccumulation(
      planId,
      holdings,
      recurringPlans,
      new Date()
    );
    setHoldings(updatedHoldings);
    setRecurringPlans(updatedPlans);
    if (log) {
      setAccumulationLogs((prev) => [log, ...prev]);
      setNotificationMsg(`⚡「${log.holdingName}」に ¥${log.amountJpy.toLocaleString()} の積立を加算反映しました！`);
    }
  };

  // バックアップ復元 / リセット
  const handleImportData = (data: ExportData) => {
    setAccounts(data.accounts);
    setHoldings(data.holdings);
    setRecurringPlans(data.recurringPlans || []);
    setAccumulationLogs(data.accumulationLogs || []);
    setHistoryPoints(data.historyPoints || []);
    if (data.exchangeRates) {
      setExchangeRates(data.exchangeRates);
      setSimulatedUsdRate(data.exchangeRates.USD);
    }
  };

  const handleResetToSample = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setHoldings(INITIAL_HOLDINGS);
    setRecurringPlans(INITIAL_RECURRING_PLANS);
    setAccumulationLogs([]);
    setHistoryPoints([]);
    setExchangeRates(DEFAULT_EXCHANGE_RATES);
    setSimulatedUsdRate(DEFAULT_EXCHANGE_RATES.USD);
  };

  // ポートフォリオ計算
  const { summary, analyzedHoldings, currencyExposures, categoryAllocations, accountAllocations } =
    calculatePortfolio(holdings, accounts, recurringPlans, exchangeRates, simulatedUsdRate);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 md:pb-12">
      {/* Top Header */}
      <Header
        exchangeRates={exchangeRates}
        isFetchingRates={isFetchingRates}
        isFetchingFunds={isFetchingFunds}
        lastFundSyncTime={lastFundSyncTime}
        onRefreshRates={handleRefreshRates}
        onRefreshFunds={() => handleRefreshFundPrices(holdings)}
        onOpenAddModal={() => {
          setEditingHolding(null);
          setIsHoldingModalOpen(true);
        }}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenCustomRateModal={() => setIsCustomRateModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
      />

      {/* Accumulation Notification Toast */}
      {notificationMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-fade-in text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-200" />
              <span>{notificationMsg}</span>
            </div>
            <button
              onClick={() => setNotificationMsg(null)}
              className="p-1 hover:bg-emerald-700 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="space-y-6">
          {/* Section 1: Top Summary & FX Breakdown */}
          <div className={mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <SummaryCards summary={summary} />
          </div>

          {/* Section 2: Daily Contribution & US Stock Driver Analysis */}
          <div className={mobileTab === 'contribution' || mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <DailyContributionAnalysis holdings={holdings} />
          </div>

          {/* Section 3: Product Performance Trend (Day/Week/Month/Year) */}
          <div className={mobileTab === 'history' || mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <HoldingPerformanceHistory
              holdings={holdings}
              historyPoints={historyPoints}
            />
          </div>

          {/* Section 4: FX Simulation Slider */}
          <div className={mobileTab === 'simulator' || mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <FxSimulator
              currentUsdRate={exchangeRates.USD}
              simulatedUsdRate={simulatedUsdRate}
              onRateChange={(rate) => setSimulatedUsdRate(rate)}
              onResetRate={() => setSimulatedUsdRate(exchangeRates.USD)}
              totalCurrentValJpy={summary.totalCurrentValJpy}
              simulatedTotalValJpy={summary.simulatedTotalValJpy}
              simulatedDiffJpy={summary.simulatedDiffJpy}
            />
          </div>

          {/* Section 5: Portfolio Allocations (Currency, Category, Account) */}
          <div className={mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <AllocationsChart
              currencyExposures={currencyExposures}
              categoryAllocations={categoryAllocations}
              accountAllocations={accountAllocations}
            />
          </div>

          {/* Section 6: Monthly Recurring Investment Plan */}
          <div className={mobileTab === 'recurring' || mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <RecurringPlanSection
              recurringPlans={recurringPlans}
              holdings={holdings}
              accounts={accounts}
              accumulationLogs={accumulationLogs}
              onOpenAddModal={() => {
                setEditingPlan(null);
                setIsRecurringModalOpen(true);
              }}
              onEditPlan={(plan) => {
                setEditingPlan(plan);
                setIsRecurringModalOpen(true);
              }}
              onToggleActive={handleToggleRecurringActive}
              onDeletePlan={handleDeleteRecurringPlan}
              onExecuteManual={handleExecuteManual}
              currentTotalValJpy={summary.totalCurrentValJpy}
            />
          </div>

          {/* Section 7: Holdings Table */}
          <div className={mobileTab === 'holdings' || mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <HoldingsTable
              analyzedHoldings={analyzedHoldings}
              accounts={accounts}
              onOpenAddModal={() => {
                setEditingHolding(null);
                setIsHoldingModalOpen(true);
              }}
              onEditHolding={(holding) => {
                setEditingHolding(holding);
                setIsHoldingModalOpen(true);
              }}
              onDeleteHolding={handleDeleteHolding}
            />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Fixed for Smartphones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-1.5 py-1.5 flex justify-around items-center">
        <button
          onClick={() => setMobileTab('dashboard')}
          className={`flex flex-col items-center p-1 rounded-lg text-[9px] font-medium transition ${
            mobileTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>概要</span>
        </button>

        <button
          onClick={() => setMobileTab('contribution')}
          className={`flex flex-col items-center p-1 rounded-lg text-[9px] font-medium transition ${
            mobileTab === 'contribution' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Zap className="w-4 h-4 mb-0.5" />
          <span>要因分析</span>
        </button>

        <button
          onClick={() => setMobileTab('history')}
          className={`flex flex-col items-center p-1 rounded-lg text-[9px] font-medium transition ${
            mobileTab === 'history' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LineChart className="w-4 h-4 mb-0.5" />
          <span>推移分析</span>
        </button>

        <button
          onClick={() => setMobileTab('simulator')}
          className={`flex flex-col items-center p-1 rounded-lg text-[9px] font-medium transition ${
            mobileTab === 'simulator' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4 mb-0.5" />
          <span>為替試算</span>
        </button>

        <button
          onClick={() => setMobileTab('recurring')}
          className={`flex flex-col items-center p-1 rounded-lg text-[9px] font-medium transition ${
            mobileTab === 'recurring' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span>積立設定</span>
        </button>

        <button
          onClick={() => setMobileTab('holdings')}
          className={`flex flex-col items-center p-1 rounded-lg text-[9px] font-medium transition ${
            mobileTab === 'holdings' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ListChecks className="w-4 h-4 mb-0.5" />
          <span>銘柄一覧</span>
        </button>
      </nav>

      {/* Auto / Manual History Pop-up Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        holdings={holdings}
        historyPoints={historyPoints}
      />

      {/* Other Modals */}
      <HoldingModal
        isOpen={isHoldingModalOpen}
        onClose={() => {
          setIsHoldingModalOpen(false);
          setEditingHolding(null);
        }}
        onSave={handleSaveHolding}
        editingHolding={editingHolding}
        accounts={accounts}
        currentRates={exchangeRates}
      />

      <RecurringModal
        isOpen={isRecurringModalOpen}
        onClose={() => {
          setIsRecurringModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={handleSaveRecurringPlan}
        editingPlan={editingPlan}
        holdings={holdings}
        accounts={accounts}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accounts={accounts}
        onSaveAccounts={(updated) => setAccounts(updated)}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        accounts={accounts}
        holdings={holdings}
        recurringPlans={recurringPlans}
        exchangeRates={exchangeRates}
        onImportData={handleImportData}
        onResetToSample={handleResetToSample}
      />

      <CustomRateModal
        isOpen={isCustomRateModalOpen}
        onClose={() => setIsCustomRateModalOpen(false)}
        rates={exchangeRates}
        onSaveRates={(rates) => {
          setExchangeRates(rates);
          setSimulatedUsdRate(rates.USD);
        }}
      />
    </div>
  );
}
