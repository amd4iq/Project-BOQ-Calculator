import React, { useState } from 'react';
import { SavedQuote } from '../../types';
import { Icon } from '../Icons';
import { VersionViewerModal } from './VersionViewerModal';

interface PrintLogModalProps {
  quote: SavedQuote | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintLogModal: React.FC<PrintLogModalProps> = ({ quote, isOpen, onClose }) => {
  const [viewingSnapshot, setViewingSnapshot] = useState<Omit<SavedQuote, 'history'> | null>(null);

  if (!isOpen || !quote) return null;

  const printLog = quote.printLog || [];

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Icon name="printer" className="text-primary-600" />
                سجل الطباعة
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                عرض السجل الزمني لعمليات طباعة العرض: <span className="font-bold font-mono text-primary-700">{quote.offerNumber}</span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          {/* Log Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {printLog.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                          <tr>
                              <th className="text-right p-3 font-bold">المستخدم</th>
                              <th className="text-right p-3 font-bold">التاريخ والوقت</th>
                              <th className="text-center p-3 font-bold">النسخة</th>
                              <th className="text-center p-3 font-bold">الإجراءات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {printLog.slice().reverse().map((entry, index) => (
                              <tr key={index} className="hover:bg-slate-50/50">
                                  <td className="p-3 font-medium text-slate-700">{entry.printedBy}</td>
                                  <td className="p-3 text-slate-500 font-mono">
                                      {new Date(entry.printedAt).toLocaleString('ar-IQ', {
                                          year: 'numeric', month: 'long', day: 'numeric',
                                          hour: '2-digit', minute: '2-digit'
                                      })}
                                  </td>
                                  <td className="p-3 text-center font-bold font-mono text-slate-600">
                                      V{entry.version}
                                  </td>
                                  <td className="p-3 text-center">
                                    {quote.history?.some(h => h.version === entry.version) ? (
                                        <button
                                            onClick={() => {
                                                const snapshotEntry = quote.history?.find(h => h.version === entry.version);
                                                if (snapshotEntry) {
                                                    setViewingSnapshot(snapshotEntry.snapshot);
                                                }
                                            }}
                                            className="text-xs font-bold bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 transition-colors"
                                        >
                                            عرض النسخة
                                        </button>
                                    ) : (
                                        <span className="text-xs text-slate-400">--</span>
                                    )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            ) : (
              <div className="text-center py-12 px-6">
                  <Icon name="search" size={28} className="mx-auto text-slate-300 mb-2"/>
                  <h3 className="font-bold text-slate-600">لا يوجد سجل طباعة</h3>
                  <p className="text-sm text-slate-400 mt-1">
                      لم يتم طباعة هذا العرض بعد.
                  </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
      
      <VersionViewerModal 
        isOpen={!!viewingSnapshot}
        onClose={() => setViewingSnapshot(null)}
        quoteSnapshot={viewingSnapshot}
      />
    </>
  );
};