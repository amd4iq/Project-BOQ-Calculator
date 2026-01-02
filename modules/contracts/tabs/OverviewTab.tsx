import React, { useMemo, useState } from 'react';
import { Contract, CategorySelection, ProjectDetails, Attachment } from '../../../core/types.ts';
import { useContract } from '../../../contexts/ContractContext.tsx';
import { useQuote } from '../../../contexts/QuoteContext.tsx';
import { formatCurrency } from '../../../core/utils/format.ts';
import { Icon } from '../../../components/Icons.tsx';

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

const DetailItem: React.FC<{ icon: string; label: string; value: React.ReactNode; className?: string }> = ({ icon, label, value, className = '' }) => (
    <div className={`bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 ${className}`}>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold mb-0.5">
            <Icon name={icon} size={12} />
            <span>{label}</span>
        </div>
        <p className="font-bold text-slate-800 text-sm truncate">{value}</p>
    </div>
);

const AttachmentModal: React.FC<{
    onClose: () => void;
    onSave: (name: string, file: File) => void;
}> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        if (selectedFile) {
            setFile(selectedFile);
            if (name.trim() === '') {
                const fileNameParts = selectedFile.name.split('.');
                if (fileNameParts.length > 1) {
                    fileNameParts.pop(); // remove extension
                }
                setName(fileNameParts.join('.'));
            }
        }
    };

    const handleSubmit = () => {
        if (!name.trim() || !file) {
            setError('يرجى إدخال اسم للمرفق واختيار ملف.');
            return;
        }
        onSave(name, file);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">إضافة مرفق جديد</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon name="x" size={24} /></button>
                </div>
                <div className="p-6 space-y-4">
                    {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1 block">اسم المرفق</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: مخططات الطابق الأرضي" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1 block">اختر الملف</label>
                        <label className="cursor-pointer flex items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-indigo-400 text-slate-500 p-4 rounded-xl group">
                            <Icon name={file ? "check" : "paperclip"} size={20} className={`${file ? "text-indigo-500" : "group-hover:text-indigo-500"}`} />
                            <span className={`text-sm font-bold ${file ? "text-indigo-600" : "group-hover:text-indigo-600"}`}>{file ? file.name : "انقر لاختيار ملف"}</span>
                            <input type="file" onChange={handleFileSelect} className="hidden" />
                        </label>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl">إلغاء</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">حفظ المرفق</button>
                </div>
            </div>
        </div>
    );
};


export const OverviewTab: React.FC<{ contract: Contract }> = ({ contract }) => {
    const { getContractFinancials, updateContractDetails } = useContract();
    const { quotes } = useQuote();
    const { totalReceived, totalSpent, profit, progress } = getContractFinancials(contract.id);

    const originalQuote = quotes.find(q => q.id === contract.quoteId);
    
    type EditableDetails = ProjectDetails & { duration: number };
    const [isEditing, setIsEditing] = useState(false);
    const [editableDetails, setEditableDetails] = useState<EditableDetails>({
        ...contract.projectDetails,
        duration: contract.duration || 0,
    });
    
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');

    const allMultiSelectOptions = useMemo(() => {
        if (!originalQuote) return [];
        return originalQuote.categories
            .filter(cat => cat.allowMultiple)
            .flatMap(cat => {
                const selectedIds = (originalQuote.selections[cat.id] as string[]) || [];
                if (selectedIds.length === 0) return [];
                
                const selectedOptions = selectedIds.map(id => {
                    const option = cat.options.find(o => o.id === id);
                    return option ? { ...option, categoryTitle: cat.title } : null;
                }).filter((opt): opt is NonNullable<typeof opt> => opt !== null);
                
                return selectedOptions;
            });
    }, [originalQuote]);
    
    const handleStartEdit = () => {
        setEditableDetails({
            ...contract.projectDetails,
            duration: contract.duration || 0
        });
        setIsEditing(true);
    };

    const handleDetailsChange = (field: keyof EditableDetails, value: string | number) => {
        setEditableDetails(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSaveChanges = () => {
        const { duration, ...projectDetailsUpdates } = editableDetails;
        updateContractDetails(contract.id, {
            projectDetails: projectDetailsUpdates as ProjectDetails,
            duration: duration
        });
        setIsEditing(false);
    };
    
    const handleAddAttachment = (name: string, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const newAttachment: Attachment = {
                id: `att-${Date.now()}`,
                name,
                url: reader.result as string,
                type: file.type,
                addedAt: Date.now(),
                originalFilename: file.name,
            };
            const updatedAttachments = [...(contract.attachments || []), newAttachment];
            updateContractDetails(contract.id, { attachments: updatedAttachments });
            setIsAttachmentModalOpen(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteAttachment = (attachmentId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المرفق؟')) {
            const updatedAttachments = (contract.attachments || []).filter(att => att.id !== attachmentId);
            updateContractDetails(contract.id, { attachments: updatedAttachments });
        }
    };

    const handleDownloadAttachment = (attachment: Attachment) => {
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.originalFilename || attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return 'image-plus';
        if (type === 'application/pdf') return 'file-text';
        return 'file-text';
    };

    const sortedAttachments = useMemo(() => {
        if (!contract.attachments) return [];
        return [...contract.attachments].sort((a, b) => {
            switch (sortOrder) {
                case 'date-asc': return a.addedAt - b.addedAt;
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'date-desc':
                default:
                    return b.addedAt - a.addedAt;
            }
        });
    }, [contract.attachments, sortOrder]);


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
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Icon name="file-text" size={20} className="text-slate-400" />
                        تفاصيل المشروع والتعاقد
                    </h3>
                    {!isEditing ? (
                        <button onClick={handleStartEdit} className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 transition-colors">
                            <Icon name="pencil" size={14} /> تعديل
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsEditing(false)} className="text-xs font-bold bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400">إلغاء</button>
                            <button onClick={handleSaveChanges} className="flex items-center gap-1.5 text-xs font-bold bg-primary-600 text-white px-3 py-1.5 rounded-lg border border-primary-700 hover:bg-primary-700">
                                <Icon name="check-simple" size={14} /> حفظ التغييرات
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm animate-in fade-in duration-200">
                        <div>
                            <label className="text-xs text-slate-500">اسم المشروع</label>
                            <input type="text" value={editableDetails.projectName} onChange={e => handleDetailsChange('projectName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold outline-none focus:border-indigo-400"/>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">عنوان المشروع (Location)</label>
                            <input type="text" value={editableDetails.location || ''} onChange={e => handleDetailsChange('location', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold outline-none focus:border-indigo-400"/>
                        </div>
                         <div>
                            <label className="text-xs text-slate-500">العميل</label>
                            <input type="text" value={editableDetails.customerName} onChange={e => handleDetailsChange('customerName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold outline-none focus:border-indigo-400"/>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">رقم الهاتف</label>
                            <input type="text" value={editableDetails.customerNumber} onChange={e => handleDetailsChange('customerNumber', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold outline-none focus:border-indigo-400 font-mono"/>
                        </div>
                         <div className="border-b border-slate-100 col-span-2"></div>
                         <div>
                            <label className="text-xs text-slate-500">المساحة (م²)</label>
                            <input type="number" value={editableDetails.areaSize} onChange={e => handleDetailsChange('areaSize', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold outline-none focus:border-indigo-400"/>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">مدة العقد (أيام)</label>
                            <input type="number" value={editableDetails.duration} onChange={e => handleDetailsChange('duration', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold outline-none focus:border-indigo-400"/>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold"><Icon name="briefcase" size={14}/> <span>معلومات المشروع</span></div>
                            <p className="font-bold text-slate-800 text-lg truncate" title={contract.projectDetails.projectName}>{contract.projectDetails.projectName}</p>
                            <p className="font-semibold text-slate-600 text-sm flex items-center gap-2"><Icon name="pin" size={14}/> {contract.projectDetails.location || 'غير محدد'}</p>
                        </div>
                        <div className="lg:col-span-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold"><Icon name="user" size={14}/> <span>معلومات العميل</span></div>
                            <p className="font-bold text-slate-800 text-base truncate" title={contract.projectDetails.customerName}>{contract.projectDetails.customerName}</p>
                            <p className="font-bold text-slate-600 text-sm font-mono flex items-center gap-2"><Icon name="phone" size={14}/> {contract.projectDetails.customerNumber}</p>
                        </div>
                        <DetailItem icon="ruler" label="المساحة" value={<>{contract.projectDetails.areaSize} م²</>} className="lg:col-span-1" />
                        <DetailItem icon="calendar" label="مدة العقد" value={contract.duration ? `${contract.duration} يوم` : 'غير محدد'} className="lg:col-span-1" />
                        <div className="lg:col-span-3 bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex justify-between items-center">
                            <span className="text-sm font-bold text-indigo-800 flex items-center gap-2"><Icon name="file-text" size={16}/> رقم عرض السعر المرتبط</span>
                            <div className="flex items-center gap-2">
                                {contract.quoteDate && (<span className="text-xs font-bold text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-md border border-slate-200">{new Date(contract.quoteDate).toLocaleDateString('ar-IQ')}</span>)}
                                <span className="font-bold text-indigo-600 font-mono bg-white px-3 py-1 rounded-md border border-indigo-200 shadow-sm">{contract.offerNumber}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Icon name="paperclip" size={20} className="text-slate-400" />المرفقات</h3>
                    <div className="flex items-center gap-2">
                        {contract.attachments && contract.attachments.length > 1 && (
                            <div className="relative">
                                <Icon name="filter" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={sortOrder}
                                    onChange={e => setSortOrder(e.target.value as any)}
                                    className="appearance-none text-xs font-bold bg-slate-100 text-slate-600 pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer"
                                >
                                    <option value="date-desc">الأحدث أولاً</option>
                                    <option value="date-asc">الأقدم أولاً</option>
                                    <option value="name-asc">الاسم (أ-ي)</option>
                                    <option value="name-desc">الاسم (ي-أ)</option>
                                </select>
                            </div>
                        )}
                        <button onClick={() => setIsAttachmentModalOpen(true)} className="flex items-center gap-1.5 text-xs font-bold bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-200 transition-colors"><Icon name="plus" size={14} /> إضافة مرفق</button>
                    </div>
                </div>
                <p className="text-xs text-slate-500 mb-4 -mt-2">مخططات، عقود موقعة، وأي مستندات أخرى خاصة بالمشروع.</p>
                {(sortedAttachments && sortedAttachments.length > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedAttachments.map(att => (
                            <div key={att.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 group">
                                <div className="bg-white p-2 rounded-lg border border-slate-200 text-indigo-600"><Icon name={getFileIcon(att.type)} size={20} /></div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-bold text-sm text-slate-800 truncate">{att.name}</p>
                                    <p className="text-xs text-slate-500 font-mono">{new Date(att.addedAt).toLocaleDateString('ar-IQ')}</p>
                                </div>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDownloadAttachment(att)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="تحميل"><Icon name="download" size={16}/></button>
                                    <button onClick={() => handleDeleteAttachment(att.id)} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="حذف"><Icon name="trash" size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                        <Icon name="paperclip" size={32} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-500">لا توجد مرفقات حالياً</p>
                        <p className="text-xs text-slate-400 mt-1">انقر على "إضافة مرفق" لرفع أول ملف.</p>
                    </div>
                )}
            </div>

            {originalQuote && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Icon name="layers" size={20} className="text-slate-500" />المواصفات الفنية المتفق عليها</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-sm text-slate-600 mb-3 border-b border-slate-100 pb-2">المواصفات الأساسية</h4>
                                <ul className="space-y-2 text-sm">
                                    {originalQuote.categories.filter(c => !c.allowMultiple && c.id !== 'fixed_additions').map(cat => {
                                        const selection = originalQuote.selections[cat.id] as CategorySelection;
                                        const option = cat.options.find(o => o.id === selection.default);
                                        return (<li key={cat.id} className="flex justify-between"><span className="text-slate-500">{cat.title}:</span><span className="font-bold text-slate-800">{option?.label || 'غير محدد'}</span></li>);
                                    })}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-600 mb-3 border-b border-slate-100 pb-2">الإضافات والبنود الاختيارية</h4>
                                {allMultiSelectOptions.length > 0 ? (
                                    <ul className="space-y-2 text-sm">
                                        {allMultiSelectOptions.map(opt => (<li key={opt.id} className="flex justify-between"><span className="text-slate-800">{opt.label}</span><span className="font-mono font-bold text-emerald-600">{formatCurrency(opt.cost)}</span></li>))}
                                    </ul>
                                ) : (<p className="text-xs text-slate-400">لا توجد إضافات خاصة</p>)}
                            </div>
                        </div>
                        {originalQuote.standardSpecs && originalQuote.standardSpecs.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h4 className="font-bold text-sm text-slate-600 mb-3">المواصفات القياسية (المشمولة ضمن العقد)</h4>
                                <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside columns-1 md:columns-2 gap-x-8">{originalQuote.standardSpecs.map(spec => (<li key={spec.id}>{spec.text}</li>))}</ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {isAttachmentModalOpen && <AttachmentModal onSave={handleAddAttachment} onClose={() => setIsAttachmentModalOpen(false)} />}
        </div>
    );
};