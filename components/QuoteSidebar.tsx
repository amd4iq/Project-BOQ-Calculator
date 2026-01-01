import React, { useState, useEffect, useRef } from 'react';
// FIX: Corrected import path for types
import { SavedQuote, QuoteTemplate } from '../core/types';
import { Icon } from './Icons';
import { useAuth } from './Auth/AuthContext';

interface QuoteSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: SavedQuote[];
  currentQuoteId: string;
  onSelectQuote: (id: string) => void;
  onNewQuote: () => void;
  onDeleteQuote: (id: string) => void;
  onDuplicateQuote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRenameQuote: (id: string, newName: string) => void;
  templates: QuoteTemplate[];
  onSaveTemplate: () => void;
  onApplyTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  isReadOnly: boolean;
}

const TemplateList: React.FC<{
    templates: QuoteTemplate[],
    onApplyTemplate: (id: string) => void,
    onDeleteTemplate: (id: string) => void,
    isReadOnly: boolean,
    onClose: () => void,
    emptyMessage: string,
}> = ({ templates, onApplyTemplate, onDeleteTemplate, isReadOnly, onClose, emptyMessage }) => {
    if (templates.length === 0) {
        return (
            <p className="text-center text-xs text-slate-400 py-4">
               {emptyMessage}
            </p>
        );
    }

    return (
        <div className="space-y-1.5">
            {templates.map(template => (
                <div key={template.id} className="group flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="font-bold text-sm text-slate-700 truncate">{template.name}</span>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onDeleteTemplate(template.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                            <Icon name="trash" size={14} />
                        </button>
                        <button 
                            onClick={() => { onApplyTemplate(template.id); onClose(); }} 
                            disabled={isReadOnly}
                            className="px-3 py-1 text-xs font-bold text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-md disabled:bg-slate-200 disabled:text-slate-500"
                        >
                            تطبيق
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};


export const QuoteSidebar: React.FC<QuoteSidebarProps> = ({
  isOpen,
  onClose,
  quotes,
  currentQuoteId,
  onSelectQuote,
  onNewQuote,
  onDeleteQuote,
  onDuplicateQuote,
  onTogglePin,
  onRenameQuote,
  templates,
  onSaveTemplate,
  onApplyTemplate,
  onDeleteTemplate,
  isReadOnly
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);
  
  const startEditing = (e: React.MouseEvent, quote: SavedQuote) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(quote.id);
    setEditingName(quote.projectDetails.projectName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editingId && editingName.trim()) {
      onRenameQuote(editingId, editingName.trim());
    }
    cancelEditing();
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastModified - a.lastModified;
  });
  
  const filteredQuotes = sortedQuotes.filter(q =>
    (q.projectDetails.projectName || 'مشروع بدون اسم').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.projectDetails.customerName || 'عميل غير محدد').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const structureTemplates = templates.filter(t => t.quoteType === 'structure');
  const finishesTemplates = templates.filter(t => t.quoteType === 'finishes');

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/30 z-[55] backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Icon name="layers" className="text-primary-600" />
              إدارة المشاريع
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className="p-4 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { onNewQuote(); onClose(); }}
                  className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold shadow-md shadow-primary-500/20 transition-all active:scale-95"
                >
                  <Icon name="plus" size={18} />
                  عرض جديد
                </button>
                <button
                  onClick={onSaveTemplate}
                  disabled={isReadOnly}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Icon name="plus" size={18} />
                  إضافة قالب
                </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-gutter-stable">
            {/* --- Templates Section --- */}
            <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200/80 mb-6">
                <div className="mb-4">
                    <h3 className="px-2 pb-2 text-sm font-black text-slate-600 tracking-tight flex items-center gap-2">
                       <Icon name="brick" size={16} className="text-slate-400" />
                       قوالب بناء هيكل
                    </h3>
                    <TemplateList 
                        templates={structureTemplates}
                        onApplyTemplate={onApplyTemplate}
                        onDeleteTemplate={onDeleteTemplate}
                        isReadOnly={isReadOnly}
                        onClose={onClose}
                        emptyMessage="لا توجد قوالب هيكل محفوظة."
                    />
                </div>
                <div className="border-t border-slate-200 pt-4">
                    <h3 className="px-2 pb-2 text-sm font-black text-slate-600 tracking-tight flex items-center gap-2">
                       <Icon name="paint" size={16} className="text-slate-400" />
                       قوالب إنهاءات
                    </h3>
                     <TemplateList 
                        templates={finishesTemplates}
                        onApplyTemplate={onApplyTemplate}
                        onDeleteTemplate={onDeleteTemplate}
                        isReadOnly={isReadOnly}
                        onClose={onClose}
                        emptyMessage="لا توجد قوالب إنهاءات محفوظة."
                    />
                </div>
            </div>
            

            {/* --- Quotes Section --- */}
            <h3 className="px-2 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                العروض الحالية
            </h3>
             <div className="relative mb-3">
                 <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن عرض..."
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all placeholder:text-slate-400 font-medium"
                 />
                 <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="space-y-1.5">
              {filteredQuotes.length === 0 ? (
                <div className="text-center text-slate-400 py-10 flex flex-col items-center gap-2">
                   <Icon name="search" size={24} className="opacity-20" />
                   <p className="font-medium text-slate-500 text-sm">لا توجد نتائج</p>
                </div>
              ) : (
                filteredQuotes.map((quote) => {
                  const isSelected = quote.id === currentQuoteId;
                  const canDelete = quotes.length > 1;
                  const isPinned = !!quote.isPinned;
                  
                  return (
                    <div 
                      key={quote.id}
                      className={`relative group p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected ? 'border-primary-500 bg-primary-50' : 
                        isPinned ? 'border-amber-200 bg-amber-50/70 hover:border-amber-300' : 
                        'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                      onClick={() => { if (!editingId) { onSelectQuote(quote.id); onClose(); } }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 truncate">
                          {editingId === quote.id ? (
                             <form onSubmit={handleRename} className="flex-1">
                                 <input
                                     ref={editInputRef}
                                     type="text"
                                     value={editingName}
                                     onChange={(e) => setEditingName(e.target.value)}
                                     onBlur={cancelEditing}
                                     className="w-full text-sm font-bold text-primary-700 bg-white border border-primary-300 rounded-md px-2 py-0.5 -my-0.5 focus:outline-none focus:ring-2 ring-primary-200"
                                     onClick={(e) => e.stopPropagation()}
                                 />
                             </form>
                          ) : (
                            <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-primary-800' : isPinned ? 'text-amber-900' : 'text-slate-800'}`}>
                                {quote.projectDetails.projectName || 'مشروع بدون اسم'}
                            </h3>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {quote.projectDetails.customerName || 'عميل غير محدد'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => startEditing(e, quote)} className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                             <Icon name="pencil" size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onTogglePin(quote.id); }} className={`p-1 rounded-md transition-colors ${isPinned ? 'text-amber-500 fill-amber-400 bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`} title="تثبيت"><Icon name="pin" size={14} /></button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(quote.lastModified).toLocaleDateString('en-GB')}
                        </span>
                        <div className="flex gap-1">
                           <button onClick={(e) => { e.stopPropagation(); onDuplicateQuote(quote.id); }} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="نسخ"><Icon name="copy" size={14} /></button>
                           {currentUser?.role === 'admin' && (
                               <button onClick={(e) => { e.stopPropagation(); if (canDelete) onDeleteQuote(quote.id); }} disabled={!canDelete} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:text-slate-200 disabled:hover:bg-transparent" title="حذف"><Icon name="trash" size={14} /></button>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
            {quotes.length} عروض / {templates.length} قوالب
          </div>
        </div>
      </div>
    </>
  );
};