import React from 'react';
import { SavedQuote } from '../types';
import { Icon } from './Icons';

interface QuoteSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: SavedQuote[];
  currentQuoteId: string;
  onSelectQuote: (id: string) => void;
  onNewQuote: () => void;
  onDeleteQuote: (id: string) => void;
  onDuplicateQuote: (id: string) => void;
}

export const QuoteSidebar: React.FC<QuoteSidebarProps> = ({
  isOpen,
  onClose,
  quotes,
  currentQuoteId,
  onSelectQuote,
  onNewQuote,
  onDeleteQuote,
  onDuplicateQuote
}) => {
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteQuote(id);
  };

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDuplicateQuote(id);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-[55] backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Icon name="layers" className="text-primary-600" />
              إدارة العروض
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
              <Icon name="x" size={20} />
            </button>
          </div>

          {/* New Quote Button */}
          <div className="p-4">
            <button
              onClick={() => {
                onNewQuote();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold shadow-md shadow-primary-500/20 transition-all active:scale-95"
            >
              <Icon name="plus" size={18} />
              انشاء عرض جديد
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
            {quotes.length === 0 ? (
              <div className="text-center text-slate-400 py-10 text-sm">
                لا توجد عروض محفوظة
              </div>
            ) : (
              quotes.map((quote) => {
                const isSelected = quote.id === currentQuoteId;
                const canDelete = quotes.length > 1;

                return (
                  <div 
                    key={quote.id}
                    className={`relative group p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-slate-100 bg-white hover:border-slate-300'
                    }`}
                    onClick={() => {
                      onSelectQuote(quote.id);
                      onClose();
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold truncate ${isSelected ? 'text-primary-700' : 'text-slate-700'}`}>
                        {quote.projectDetails.projectName || 'مشروع بدون اسم'}
                      </h3>
                      {isSelected && <Icon name="check" size={16} className="text-primary-600" />}
                    </div>
                    
                    <p className="text-xs text-slate-500 mb-2">
                      {quote.projectDetails.customerName || 'عميل غير محدد'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(quote.lastModified).toLocaleDateString('en-GB')}
                      </span>
                      
                      <div className="flex gap-2">
                         <button 
                          type="button"
                          onClick={(e) => handleDuplicate(e, quote.id)}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors z-10 relative"
                          title="نسخ العرض"
                        >
                          <Icon name="copy" size={16} />
                        </button>
                        
                        <button 
                          type="button"
                          onClick={(e) => handleDelete(e, quote.id)}
                          onMouseDown={(e) => e.stopPropagation()}
                          className={`p-1.5 rounded-lg transition-colors z-10 relative ${!canDelete ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                          title={canDelete ? "حذف العرض" : "لا يمكن حذف العرض الأخير"}
                          disabled={!canDelete}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
            {quotes.length} عروض محفوظة
          </div>
        </div>
      </div>
    </>
  );
};