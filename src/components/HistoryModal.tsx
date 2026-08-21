'use client';

import React from 'react';
import { AssetHolding, HoldingHistoryPoint } from '@/types';
import { Language } from '@/lib/i18n';
import { HoldingPerformanceHistory } from './HoldingPerformanceHistory';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: AssetHolding[];
  historyPoints: HoldingHistoryPoint[];
  lang?: Language;
  isMasked?: boolean;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  holdings,
  historyPoints,
  lang = 'ja',
  isMasked = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl my-auto cursor-default"
      >
        <HoldingPerformanceHistory
          holdings={holdings}
          historyPoints={historyPoints}
          isModal={true}
          onCloseModal={onClose}
          lang={lang}
          isMasked={isMasked}
        />
      </div>
    </div>
  );
};
