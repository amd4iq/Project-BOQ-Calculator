
import React from 'react';
import { QuoteStatus } from '../../../core/types.ts';
import { Icon } from '../../../components/Icons.tsx';

interface StatusBadgeProps {
  status: QuoteStatus;
  validUntil?: number;
}

const getStatusConfig = (status: QuoteStatus) => {
  switch (status) {
    case 'Draft':
      return { text: 'مسودة', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: 'pencil' };
    case 'Printed - Pending Client Approval':
      return { text: 'بانتظار قرار العميل', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: 'zap' };
    case 'Approved by Client':
      return { text: 'موافق عليه', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: 'check-circle' };
    case 'Rejected by Client':
       return { text: 'مرفوض', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: 'x' };
    case 'Expired':
      return { text: 'منتهي الصلاحية', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: 'clock' };
    case 'Contract Signed':
      return { text: 'تم التعاقد', color: 'bg-indigo-600 text-white border-indigo-700', icon: 'contract' };
    case 'Under Revision':
      return { text: 'قيد المراجعة', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'pencil' };
    default:
      return { text: status, color: 'bg-slate-50 text-slate-500 border-slate-200', icon: 'settings' };
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, validUntil }) => {
  const config = getStatusConfig(status);

  return (
    <div className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2 py-1 rounded-lg border shadow-sm whitespace-nowrap uppercase tracking-tighter ${config.color}`}>
      <Icon name={config.icon} size={12} />
      <span>{config.text}</span>
    </div>
  );
};