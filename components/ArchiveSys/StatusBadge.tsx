import React, { useState, useEffect } from 'react';
import { QuoteStatus } from '../../types';
import { Icon } from '../Icons';

interface StatusBadgeProps {
  status: QuoteStatus;
  validUntil?: number;
}

const getStatusInfo = (status: QuoteStatus) => {
  switch (status) {
    case 'Printed - Pending Client Approval':
      return { text: 'بانتظار قرار العميل', color: 'amber', icon: 'zap' };
    case 'Approved by Client':
      return { text: 'مقبول من العميل', color: 'emerald', icon: 'check' };
    case 'Rejected by Client':
       return { text: 'مرفوض من العميل', color: 'rose', icon: 'x' };
    case 'Expired':
      return { text: 'منتهي الصلاحية', color: 'rose', icon: 'x' };
    case 'Contract Archived':
      return { text: 'عقد مؤرشف', color: 'indigo', icon: 'archive' };
    default:
      return { text: status, color: 'slate', icon: 'settings' };
  }
};

const Countdown: React.FC<{ expiry: number }> = ({ expiry }) => {
    const [remaining, setRemaining] = useState(expiry - Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setRemaining(expiry - Date.now());
        }, 1000 * 60 * 60); // update every hour
        return () => clearInterval(timer);
    }, [expiry]);

    if (remaining <= 0) {
        return <span className="text-rose-600">(منتهي)</span>;
    }
    const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    return <span className="text-amber-700">(متبقي {days} يوم)</span>;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, validUntil }) => {
  const { text, color, icon } = getStatusInfo(status);

  const colors = {
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rose: 'bg-rose-100 text-rose-800 border-rose-200',
    slate: 'bg-slate-100 text-slate-800 border-slate-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  return (
    <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border shadow-sm ${colors[color]}`}>
      <Icon name={icon} size={14} />
      <span>{text}</span>
      {status === 'Printed - Pending Client Approval' && validUntil && (
          <Countdown expiry={validUntil} />
      )}
    </div>
  );
};