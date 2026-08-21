'use client';

import React, { useState, useEffect } from 'react';
import { Account, AssetHolding, RecurringPlan, ExchangeRates } from '@/types';
import {
  loadSavedAccounts,
  saveAccounts,
  loadSavedHoldings,
  saveHoldings,
  loadSavedRecurringPlans,
  saveRecurringPlans,
  loadSavedRates,
  saveRates,
  ExportData,
} from '@/lib/storage';
import { calculatePortfolio } from '@/lib/calculations';
import { fetchLiveExchangeRates } from '@/lib/fxApi';
import {
  INITIAL_ACCOUNTS,
  INITIAL_HOLDINGS,
  INITIAL_RECURRING_PLANS,
  DEFAULT_EXCHANGE_RATES,
} from '@/lib/constants';

import { Header } from '@/components/Header';
import { SummaryCards } from '@/components/SummaryCards';
import { FxSimulator } from '@/components/FxSimulator';
import { AllocationsChart } from '@/components/AllocationsChart';
import { RecurringPlanSection } from '@/components/RecurringPlanSection';
import { HoldingsTable } from '@/components/HoldingsTable';

import { HoldingModal } from '@/components/HoldingModal';
import { RecurringModal } from '@/components/RecurringModal';
import { AccountModal } from '@/components/AccountModal';
import { BackupModal } from '@/components/BackupModal';
import { CustomRateModal } from '@/components/CustomRateModal';

import { LayoutDashboard, Sliders, Calendar, ListChecks } from 'lucide-react';

export default function DashboardPage() {
  // 状態管理
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [holdings, setHoldings] = useState<AssetHolding[]>(INITIAL_HOLDINGS);
  const [recurringPlans, setRecurringPlans] = useState<RecurringPlan[]>(INITIAL_RECURRING_PLANS);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(DEFAULT_EXCHANGE_RATES);
  const [simulatedUsdRate, setSimulatedUsdRate] = useState<number>(DEFAULT_EXCHANGE_RATES.USD);
  const [isFetchingRates, setIsFetchingRates] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  // モーダル管理
  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState<boolean>(false);
  const [editingHolding, setEditingHolding] = useState<AssetHolding | null>(null);

  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<RecurringPlan | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isCustomRateModalOpen, setIsCustomRateModalOpen] = useState<boolean>(false);

  // スマホ用アクティブタブ
  const [mobileTab, setMobileTab] = useState<'dashboard' | 'simulator' | 'recurring' | 'holdings'>('dashboard');

  // クライアント初期化 & データ読み込み
  useEffect(() => {
    setIsClient(true);
    const loadedAccounts = loadSavedAccounts();
    const loadedHoldings = loadSavedHoldings();
    const loadedPlans = loadSavedRecurringPlans();
    const loadedRates = loadSavedRates();

    setAccounts(loadedAccounts);
    setHoldings(loadedHoldings);
    setRecurringPlans(loadedPlans);
    setExchangeRates(loadedRates);
    setSimulatedUsdRate(loadedRates.USD);

    // 最新の為替レートを自動取得
    handleRefreshRates();
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
      // 紐づく積立設定も削除
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

  // バックアップ復元 / リセット
  const handleImportData = (data: ExportData) => {
    setAccounts(data.accounts);
    setHoldings(data.holdings);
    setRecurringPlans(data.recurringPlans || []);
    if (data.exchangeRates) {
      setExchangeRates(data.exchangeRates);
      setSimulatedUsdRate(data.exchangeRates.USD);
    }
  };

  const handleResetToSample = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setHoldings(INITIAL_HOLDINGS);
    setRecurringPlans(INITIAL_RECURRING_PLANS);
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
        onRefreshRates={handleRefreshRates}
        onOpenAddModal={() => {
          setEditingHolding(null);
          setIsHoldingModalOpen(true);
        }}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenCustomRateModal={() => setIsCustomRateModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Desktop View / Mobile Tabs */}
        <div className="space-y-6">
          {/* Section 1: Top Summary & FX Breakdown (Always on Desktop, Tabbed on Mobile) */}
          <div className={mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <SummaryCards summary={summary} />
          </div>

          {/* Section 2: FX Simulation Slider */}
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

          {/* Section 3: Portfolio Allocations (Currency, Category, Account) */}
          <div className={mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <AllocationsChart
              currencyExposures={currencyExposures}
              categoryAllocations={categoryAllocations}
              accountAllocations={accountAllocations}
            />
          </div>

          {/* Section 4: Monthly Recurring Investment Plan */}
          <div className={mobileTab === 'recurring' || mobileTab === 'dashboard' ? 'block' : 'hidden md:block'}>
            <RecurringPlanSection
              recurringPlans={recurringPlans}
              holdings={holdings}
              accounts={accounts}
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
              currentTotalValJpy={summary.totalCurrentValJpy}
            />
          </div>

          {/* Section 5: Holdings Table */}
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex justify-around items-center">
        <button
          onClick={() => setMobileTab('dashboard')}
          className={`flex flex-col items-center p-1 rounded-lg text-[10px] font-medium transition ${
            mobileTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>概要</span>
        </button>

        <button
          onClick={() => setMobileTab('simulator')}
          className={`flex flex-col items-center p-1 rounded-lg text-[10px] font-medium transition ${
            mobileTab === 'simulator' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-5 h-5 mb-0.5" />
          <span>為替試算</span>
        </button>

        <button
          onClick={() => setMobileTab('recurring')}
          className={`flex flex-col items-center p-1 rounded-lg text-[10px] font-medium transition ${
            mobileTab === 'recurring' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>積立設定</span>
        </button>

        <button
          onClick={() => setMobileTab('holdings')}
          className={`flex flex-col items-center p-1 rounded-lg text-[10px] font-medium transition ${
            mobileTab === 'holdings' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <ListChecks className="w-5 h-5 mb-0.5" />
          <span>銘柄一覧</span>
        </button>
      </nav>

      {/* Modals */}
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
