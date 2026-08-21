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
import { Language, DICTIONARY } from '@/lib/i18n';

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

  // 多言語 & プライバシーマスク管理
  const [lang, setLang] = useState<Language>('ja');
  const [isMasked, setIsMasked] = useState<boolean>(false);

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

  const t = DICTIONARY[lang];

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

    const savedLang = localStorage.getItem('sisan_lang') as Language | null;
    if (savedLang === 'ko' || savedLang === 'ja') {
      setLang(savedLang);
    }

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

  // 言語切り替え
  const handleToggleLanguage = () => {
    const nextLang = lang === 'ja' ? 'ko' : 'ja';
    setLang(nextLang);
    localStorage.setItem('sisan_lang', nextLang);
  };

  // プライバシーマスク切り替え
  const handleToggleMask = () => {
    setIsMasked((prev) => !prev);
  };

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
    saveRates(exchangeRates);
  }, [exchangeRates, isClient]);

  // 為替レート手動/自動更新
  const handleRefreshRates = async () => {
    if (exchangeRates.isCustom) return;
    setIsFetchingRates(true);
    try {
      const live = await fetchLiveExchangeRates();
      setExchangeRates(live);
      setSimulatedUsdRate(live.USD);
    } catch (e) {
      console.error('Failed to update FX rates', e);
    } finally {
      setIsFetchingRates(false);
    }
  };

  // 投資信託の基準価額同期
  const handleRefreshFundPrices = async (targetHoldings = holdings) => {
    setIsFetchingFunds(true);
    try {
      const liveFunds = await fetchLiveFundPrices();
      if (Object.keys(liveFunds).length > 0) {
        const { updatedHoldings, hasChanges } = syncHoldingsWithFundPrices(targetHoldings, liveFunds);
        if (hasChanges) {
          setHoldings(updatedHoldings);
          saveHoldings(updatedHoldings);

          const syncedHistory = syncHistoryWithHoldings(historyPoints, updatedHoldings);
          setHistoryPoints(syncedHistory);
          saveHistoryPoints(syncedHistory);
        }
        recordFundSyncTime();
        setLastFundSyncTime(getLastFundSyncTime());
      }
    } catch (e) {
      console.error('Failed to refresh fund prices', e);
    } finally {
      setIsFetchingFunds(false);
    }
  };

  // 保有資産の追加・編集
  const handleSaveHolding = (saved: AssetHolding) => {
    let updated: AssetHolding[];
    const exists = holdings.some((h) => h.id === saved.id);
    if (exists) {
      updated = holdings.map((h) => (h.id === saved.id ? saved : h));
    } else {
      updated = [...holdings, saved];
    }
    setHoldings(updated);
    setIsHoldingModalOpen(false);
    setEditingHolding(null);

    const syncedHistory = syncHistoryWithHoldings(historyPoints, updated);
    setHistoryPoints(syncedHistory);
    saveHistoryPoints(syncedHistory);
  };

  // 保有資産の削除
  const handleDeleteHolding = (id: string) => {
    if (confirm(lang === 'ko' ? '정말 이 종목을 삭제하시겠습니까?' : 'この保有資産を削除してもよろしいですか？')) {
      const updated = holdings.filter((h) => h.id !== id);
      setHoldings(updated);
      const syncedHistory = syncHistoryWithHoldings(historyPoints, updated);
      setHistoryPoints(syncedHistory);
      saveHistoryPoints(syncedHistory);
    }
  };

  // 積立プランの追加・編集
  const handleSaveRecurringPlan = (saved: RecurringPlan) => {
    let updated: RecurringPlan[];
    const exists = recurringPlans.some((p) => p.id === saved.id);
    if (exists) {
      updated = recurringPlans.map((p) => (p.id === saved.id ? saved : p));
    } else {
      updated = [...recurringPlans, saved];
    }
    setRecurringPlans(updated);
    setIsRecurringModalOpen(false);
    setEditingPlan(null);
  };

  // 積立プランの有効/無効トグル
  const handleToggleRecurringActive = (id: string) => {
    setRecurringPlans(
      recurringPlans.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  // 積立プランの削除
  const handleDeleteRecurringPlan = (id: string) => {
    if (confirm(lang === 'ko' ? '이 적립 설정을 삭제하시겠습니까?' : 'この積立設定を削除してもよろしいですか？')) {
      setRecurringPlans(recurringPlans.filter((p) => p.id !== id));
    }
  };

  // 積立プランの手動即時実行
  const handleExecuteManual = (planId: string) => {
    const plan = recurringPlans.find((p) => p.id === planId);
    if (!plan) return;

    if (
      confirm(
        lang === 'ko'
          ? `지금 즉시 ${plan.monthlyAmountJpy.toLocaleString()}엔의 적립을 자산에 가산 반영하시겠습니까?`
          : `今すぐ「${plan.monthlyAmountJpy.toLocaleString()}円」の積立を資産へ加算反映しますか？`
      )
    ) {
      const { updatedHoldings, updatedPlans, log } = executeManualAccumulation(planId, holdings, recurringPlans);
      setHoldings(updatedHoldings);
      saveHoldings(updatedHoldings);
      setRecurringPlans(updatedPlans);
      saveRecurringPlans(updatedPlans);

      if (log) {
        const newLogs = [log, ...accumulationLogs];
        setAccumulationLogs(newLogs);
        saveAccumulationLogs(newLogs);
      }

      const syncedHistory = syncHistoryWithHoldings(historyPoints, updatedHoldings);
      setHistoryPoints(syncedHistory);
      saveHistoryPoints(syncedHistory);

      setNotificationMsg(
        lang === 'ko'
          ? `⚡ ${plan.monthlyAmountJpy.toLocaleString()}엔의 적립을 포트폴리오에 반영했습니다.`
          : `⚡ ${plan.monthlyAmountJpy.toLocaleString()}円の積立を即時反映しました！`
      );
    }
  };

  // バックアップ復元
  const handleImportData = (data: ExportData) => {
    if (data.accounts) setAccounts(data.accounts);
    if (data.holdings) setHoldings(data.holdings);
    if (data.recurringPlans) setRecurringPlans(data.recurringPlans);
    if (data.accumulationLogs) setAccumulationLogs(data.accumulationLogs);
    if (data.historyPoints) setHistoryPoints(data.historyPoints);
    if (data.exchangeRates) {
      setExchangeRates(data.exchangeRates);
      setSimulatedUsdRate(data.exchangeRates.USD);
    }
    setIsBackupModalOpen(false);
    alert(lang === 'ko' ? '데이터가 성공적으로 복원되었습니다.' : 'データのインポートが完了しました。');
  };

  // 初期サンプルデータへのリセット
  const handleResetToSample = () => {
    if (confirm(lang === 'ko' ? '모든 데이터를 기본 샘플 상태로 리셋하시겠습니까?' : 'すべてのデータを初期サンプル状態にリセットしますか？')) {
      setAccounts(INITIAL_ACCOUNTS);
      setHoldings(INITIAL_HOLDINGS);
      setRecurringPlans(INITIAL_RECURRING_PLANS);
      setAccumulationLogs([]);
      const defaultHistory = syncHistoryWithHoldings([], INITIAL_HOLDINGS);
      setHistoryPoints(defaultHistory);
      setExchangeRates(DEFAULT_EXCHANGE_RATES);
      setSimulatedUsdRate(DEFAULT_EXCHANGE_RATES.USD);
      setIsBackupModalOpen(false);
    }
  };

  // ポートフォリオ計算
  const {
    summary,
    analyzedHoldings,
    currencyExposures,
    categoryAllocations,
    accountAllocations,
    productAllocations,
  } = calculatePortfolio(holdings, accounts, recurringPlans, exchangeRates, simulatedUsdRate);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 md:pb-12">
      {/* Top Header */}
      <Header
        exchangeRates={exchangeRates}
        isFetchingRates={isFetchingRates}
        isFetchingFunds={isFetchingFunds}
        lastFundSyncTime={lastFundSyncTime}
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
        isMasked={isMasked}
        onToggleMask={handleToggleMask}
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
            <SummaryCards summary={summary} lang={lang} isMasked={isMasked} />
          </div>

          {/* Section 2: Daily Contribution & US Stock Driver Analysis */}
          <div className={mobileTab === 'contribution' || mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <DailyContributionAnalysis holdings={holdings} lang={lang} isMasked={isMasked} />
          </div>

          {/* Section 3: Product Performance Trend (Day/Week/Month/Year) */}
          <div className={mobileTab === 'history' || mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <HoldingPerformanceHistory
              holdings={holdings}
              historyPoints={historyPoints}
              lang={lang}
              isMasked={isMasked}
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
              lang={lang}
              isMasked={isMasked}
            />
          </div>

          {/* Section 5: Portfolio Allocations (Product, Category, Currency, Account) */}
          <div className={mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <AllocationsChart
              currencyExposures={currencyExposures}
              categoryAllocations={categoryAllocations}
              accountAllocations={accountAllocations}
              productAllocations={productAllocations}
              lang={lang}
              isMasked={isMasked}
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
              lang={lang}
              isMasked={isMasked}
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
              lang={lang}
              isMasked={isMasked}
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
          <span>{t.navSummary}</span>
        </button>

        <button
          onClick={() => setMobileTab('contribution')}
          className={`flex flex-col items-center p-1 rounded-lg text-[9px] font-medium transition ${
            mobileTab === 'contribution' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Zap className="w-4 h-4 mb-0.5" />
          <span>{t.navContribution}</span>
        </button>

        <button
          onClick={() => setMobileTab('history')}
          className={`flex flex-col items-center p-1 rounded-lg text-[9px] font-medium transition ${
            mobileTab === 'history' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LineChart className="w-4 h-4 mb-0.5" />
          <span>{t.navHistory}</span>
        </button>

        <button
          onClick={() => setMobileTab('simulator')}
          className={`flex flex-col items-center p-1 rounded-lg text-[9px] font-medium transition ${
            mobileTab === 'simulator' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4 mb-0.5" />
          <span>{t.navSimulator}</span>
        </button>

        <button
          onClick={() => setMobileTab('recurring')}
          className={`flex flex-col items-center p-1 rounded-lg text-[9px] font-medium transition ${
            mobileTab === 'recurring' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span>{t.navRecurring}</span>
        </button>

        <button
          onClick={() => setMobileTab('holdings')}
          className={`flex flex-col items-center p-1 rounded-lg text-[9px] font-medium transition ${
            mobileTab === 'holdings' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ListChecks className="w-4 h-4 mb-0.5" />
          <span>{t.navHoldings}</span>
        </button>
      </nav>

      {/* Auto / Manual History Pop-up Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        holdings={holdings}
        historyPoints={historyPoints}
        lang={lang}
        isMasked={isMasked}
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
