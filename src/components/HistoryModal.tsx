'use client';

import React from 'react';
import { AssetHolding, HoldingHistoryPoint } from '@/types';
import { HoldingPerformanceHistory } from './HoldingPerformanceHistory';
import { X } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: AssetHolding[];
  historyPoints: HoldingHistoryPoint[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  holdings,
  historyPoints,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl my-auto">
        <HoldingPerformanceHistory
          holdings={holdings}
          historyPoints={historyPoints}
          isModal={true}
          onCloseModal={onClose}
        />
      </div>
    </div>
  );
};
