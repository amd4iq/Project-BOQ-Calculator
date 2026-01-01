
import React from 'react';
import { SavedQuote } from '../../../core/types.ts';
import { Icon } from '../../../components/Icons.tsx';

export const PrintLogModal: React.FC<{ quote: SavedQuote | null, isOpen: boolean, onClose: () => void }> = ({ quote, isOpen, onClose }) => {
    if (!isOpen || !quote) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">سجل الطباعة: {quote.offerNumber}</h3>
                    <button onClick={onClose}><Icon name="x" size={20}/></button>
                </div>
                <div className="space-y-2">
                    {quote.printLog?.map((log, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between">
                            <span className="font-bold">{log.printedBy}</span>
                            <span className="text-slate-400 font-mono">{new Date(log.printedAt).toLocaleString('ar-IQ')}</span>
                        </div>
                    )) || <p className="text-center text-slate-400">لا يوجد سجل طباعة</p>}
                </div>
            </div>
        </div>
    );
};
