
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { CompanyInfo, PrintSettings, BasePrices, Category } from '../core/types.ts';
import * as structureConstants from '../core/constants/structure.ts';
import * as finishesConstants from '../core/constants/finishes.ts';

const APP_SETTINGS_STORAGE_KEY = 'construction_app_settings_v1';

const defaultTerms = `1. مدة صلاحية هذا العرض هي 14 يوماً من تاريخ إصداره.
2. الأسعار المذكورة قابلة للتغيير بعد انتهاء مدة الصلاحية.
3. أي تغييرات أو إضافات على المواصفات بعد توقيع العرض تخضع لتكاليف إضافية.
4. الشركة غير مسؤولة عن أي أضرار ناتجة عن سوء استخدام أو ظروف قاهرة.
5. يتم تسديد الدفعات المالية حسب الجدول المرفق في العرض.
6. أي تأخير في الدفعات قد يؤدي إلى توقف العمل في المشروع.
7. مدة تنفيذ المشروع المتوقعة سيتم تحديدها في العقد النهائي.
8. الأسعار لا تشمل رسوم ربط الماء والكهرباء والمجاري بالشبكة العامة.`;

export interface AppSettings {
  structureCategories: Category[];
  finishesCategories: Category[];
  companyInfo: CompanyInfo;
  defaultPrintSettings: PrintSettings;
  basePrices: BasePrices;
}

const initialAppSettings: AppSettings = {
    structureCategories: structureConstants.CATEGORIES,
    finishesCategories: finishesConstants.CATEGORIES,
    companyInfo: {
        name: 'شركة معالم بغداد للمقاولات العامة',
        address: 'بغداد - المنصور - تقاطع الرواد',
        phone: '+964 770 123 4567',
        logoUrl: '',
        termsAndConditions: defaultTerms,
    },
    defaultPrintSettings: {
        showDetails: true,
        showFooter: true,
        notes: '',
        showLogo: true,
        logoUrl: '',
        showAreaBreakdown: true,
        showStandardSpecs: true,
        showPaymentSchedule: true,
        showTerms: true,
    },
    basePrices: {
        structure: structureConstants.BASE_PRICE,
        finishes: finishesConstants.BASE_PRICE,
    }
};

interface AppSettingsContextType {
  settings: AppSettings | null;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings | null>>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Deep merge to ensure new settings properties are not lost from initial config
                setSettings({
                   ...initialAppSettings,
                   ...parsed,
                   companyInfo: {...initialAppSettings.companyInfo, ...parsed.companyInfo},
                   defaultPrintSettings: {...initialAppSettings.defaultPrintSettings, ...parsed.defaultPrintSettings},
                   basePrices: {...initialAppSettings.basePrices, ...parsed.basePrices},
               });
            } catch (e) {
                console.error("Failed to parse saved app settings", e);
                setSettings(initialAppSettings);
            }
        } else {
            setSettings(initialAppSettings);
        }
    }, []);

    useEffect(() => {
        if (settings) {
            localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        }
    }, [settings]);

    return (
        <AppSettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};
