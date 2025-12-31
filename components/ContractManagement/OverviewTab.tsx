
import React from 'react';
import { Contract, CategorySelection } from '../../types';
import { useContract } from '../../contexts/ContractContext';
import { useQuote } from '../../contexts/QuoteContext';
import { formatCurrency } from '../../utils/format';
import { Icon } from '../Icons';

const StatCard: React.FC<{ title: string; value: string; subValue?: string; icon: string; color: string }> = ({ title, value, subValue, icon, color }) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        rose: 'bg-rose-50 text-rose-600 border-rose-200',
        amber: 'bg-amber-50 text-amber-600 border-amber-200',
    };
    const activeColor = colors[color] || colors.blue;

    return (
        <div className={`p-6 rounded-2xl border ${activeColor} relative overflow-hidden`}>
            <div className="relative z-10">
                <p className="text-sm font-bold opacity-80 mb-1">{title}</p>
                <h3 className="text-2xl font-black">{value}</h3>
                {subValue && <p className="text-xs font-bold mt-1 opacity-70">{subValue}</p>}
            </div>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-10 scale-150">
                <Icon name={icon} size={64} />
            </div>
        </div>
    );
};

export const OverviewTab: React.FC<{ contract: Contract }> = ({ contract }) => {
    const { getContractFinancials, updateContractDetails } = useContract();
    const { quotes } = useQuote();
    const { totalReceived, totalSpent, profit, progress } = getContractFinancials(contract.id);

    // Fetch the original quote to display specs
    const originalQuote = quotes.find(q => q.id === contract.quoteId);

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const days = parseInt(e.target.value) || 0;
        updateContractDetails(contract.id, { duration: days });
    };

    return (
        <div className="p-8 space-y-8">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-black text-slate-800">{contract.projectDetails.projectName}</h1>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono font-bold border border-slate-200">
                        {contract.contractNumber || 'بدون رقم'}
                    </span>
                </div>
                <p className="text-slate-500">ملخص الأداء المالي والمواصفات الفنية</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="قيمة العقد الإجمالية" 
                    value={formatCurrency(contract.totalContractValue)} 
                    subValue="IQD"
                    icon="contract" 
                    color="blue" 
                />
                 <StatCard 
                    title="إجمالي المقبوضات" 
                    value={formatCurrency(totalReceived)} 
                    subValue={`${progress.toFixed(1)}% من العقد`}
                    icon="wallet" 
                    color="emerald" 
                />
                 <StatCard 
                    title="إجمالي المصاريف" 
                    value={formatCurrency(totalSpent)} 
                    subValue="مواد + عمل + ديون"
                    icon="trending-down" 
                    color="rose" 
                />
                 <StatCard 
                    title="صافي الربح الحالي" 
                    value={formatCurrency(profit)} 
                    subValue={profit >= 0 ? 'ربح' : 'عجز مؤقت'}
                    icon="trending-up" 
                    color={profit >= 0 ? 'amber' : 'rose'} 
                />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Icon name="file-text" size={20} className="text-slate-400" />
                    تفاصيل المشروع والتعاقد
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">العميل</span>
                        <span className="font-bold text-slate-800">{contract.projectDetails.customerName}</span>
                    </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">رقم الهاتف</span>
                        <span className="font-bold text-slate-800 font-mono">{contract.projectDetails.customerNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">رقم عرض السعر المرتبط</span>
                        <span className="font-bold text-indigo-600 font-mono">{contract.offerNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">تاريخ العرض</span>
                        <span className="font-bold text-slate-800 font-mono">
                            {contract.quoteDate ? new Date(contract.quoteDate).toLocaleDateString('ar-IQ') : '-'}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">المساحة</span>
                        <span className="font-bold text-slate-800">{contract.projectDetails.areaSize} م²</span>
                    </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">تاريخ بدء العقد</span>
                        <span className="font-bold text-slate-800">{new Date(contract.startDate).toLocaleDateString('ar-IQ')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-slate-500">مدة العقد (أيام)</span>
                        <div className="relative w-32">
                            <input 
                                type="number" 
                                value={contract.duration || ''} 
                                onChange={handleDurationChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-center font-bold outline-none focus:border-indigo-400"
                                placeholder="حدد المدة"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Specifications Section */}
            {originalQuote && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Icon name="layers" size={20} className="text-slate-500" />
                            المواصفات الفنية المتفق عليها
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-sm text-slate-600 mb-3 border-b border-slate-100 pb-2">المواصفات الأساسية</h4>
                            <ul className="space-y-2 text-sm">
                                {originalQuote.categories.filter(c => !c.allowMultiple && c.id !== 'fixed_additions').map(cat => {
                                    const selection = originalQuote.selections[cat.id] as CategorySelection;
                                    const option = cat.options.find(o => o.id === selection.default);
                                    return (
                                        <li key={cat.id} className="flex justify-between">
                                            <span className="text-slate-500">{cat.title}:</span>
                                            <span className="font-bold text-slate-800">{option?.label || 'غير محدد'}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-sm text-slate-600 mb-3 border-b border-slate-100 pb-2">الإضافات والبنود المقطوعة</h4>
                            {originalQuote.selections.fixed_additions && (originalQuote.selections.fixed_additions as string[]).length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                    {(originalQuote.selections.fixed_additions as string[]).map(optId => {
                                        const cat = originalQuote.categories.find(c => c.id === 'fixed_additions');
                                        const opt = cat?.options.find(o => o.id === optId);
                                        return opt ? (
                                            <li key={opt.id} className="flex justify-between">
                                                <span className="text-slate-800">{opt.label}</span>
                                                <span className="font-mono font-bold text-emerald-600">{formatCurrency(opt.cost)}</span>
                                            </li>
                                        ) : null;
                                    })}
                                </ul>
                            ) : (
                                <p className="text-xs text-slate-400">لا توجد إضافات خاصة</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Standard Specs Expander */}
                    <div className="bg-slate-50 p-4 border-t border-slate-100">
                        <details className="group">
                            <summary className="flex cursor-pointer items-center justify-between font-bold text-slate-600 text-sm list-none">
                                <span>عرض المواصفات القياسية (Standard Specs)</span>
                                <span className="transition group-open:rotate-180">
                                    <Icon name="chevron" size={16} />
                                </span>
                            </summary>
                            <div className="text-xs text-slate-500 mt-4 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                {originalQuote.standardSpecs.map(spec => (
                                    <div key={spec.id} className="flex gap-2 items-start">
                                        <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-slate-300"></div>
                                        <p>{spec.text}</p>
                                    </div>
                                ))}
                            </div>
                        </details>
                    </div>
                </div>
            )}
        </div>
    );
};
