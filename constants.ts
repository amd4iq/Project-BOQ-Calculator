
import { Category, StandardSpec, PaymentStage } from './types';

export const BASE_PRICE = 220000;

// Added to resolve import error in ProfitabilityPanel.tsx
export const BASE_ACTUAL_COST = 165000;

export const RESOURCE_ESTIMATES = {
  cement_bags: 3.5,
  iron_kg: 35,
  brick_count: 120,
  sand_m3: 0.35,
  gravel_m3: 0.45
};

export const CATEGORIES: Category[] = [
  {
    id: 'brick',
    title: 'نوع الطابوق',
    iconName: 'brick',
    options: [
      { id: 'brick-yellow', label: 'أصفر', cost: 0, costType: 'per_m2' },
      { id: 'brick-red', label: 'أحمر', cost: 25000, costType: 'per_m2' },
    ],
  },
  {
    id: 'cleaning',
    title: 'صبة النظافة',
    iconName: 'droplet',
    options: [
      { id: 'clean-none', label: 'بدون صبة النظافة', cost: 0, costType: 'per_m2' },
      { id: 'clean-with', label: 'مع صبة النظافة', cost: 15000, costType: 'per_m2' },
    ],
  },
  {
    id: 'height',
    title: 'ارتفاع السقف',
    iconName: 'ruler',
    options: [
      { id: 'h-32', label: '3.2 متر', cost: 0, costType: 'per_m2' },
      { id: 'h-35', label: '3.5 متر', cost: 10000, costType: 'per_m2' },
      { id: 'h-36', label: '3.6 متر', cost: 15000, costType: 'per_m2' },
    ],
  },
  {
    id: 'fixed_additions',
    title: 'إضافات بسعر ثابت',
    iconName: 'package',
    allowMultiple: true,
    options: [
      { id: 'gate-std', label: 'بوابة خارجية (حديد)', cost: 500000, costType: 'fixed' },
      { id: 'gate-cnc', label: 'بوابة خارجية (CNC)', cost: 1500000, costType: 'fixed' },
      { id: 'water-base', label: 'قاعدة خزان ماء', cost: 150000, costType: 'fixed' },
      { id: 'manhole', label: 'منهول خارجي', cost: 75000, costType: 'fixed' },
      { id: 'garden-fence', label: 'سياج حديقة', cost: 250000, costType: 'fixed' },
    ],
  }
];

export const DEFAULT_SELECTIONS = {
  brick: 'brick-yellow',
  cleaning: 'clean-none',
  height: 'h-32',
  fixed_additions: [] 
};

export const DEFAULT_STANDARD_SPECS: StandardSpec[] = [
  { id: 'std-1', text: 'حديد التسليح: نوعية أكراني المنشأ' },
  { id: 'std-2', text: 'الاسمنت: مقاوم للأملاح للأسس وعادي للهيكل' },
  { id: 'std-3', text: 'الرمل: مغسول مفحوص مختبرياً' },
  { id: 'std-4', text: 'الحصى: مكسر (تكسير) نظيف' },
];

export const DEFAULT_PAYMENT_SCHEDULE: PaymentStage[] = [
  { id: 'pay-1', name: 'الدفعة الأولى (مقدم العقد)', percentage: 30 },
  { id: 'pay-2', name: 'الدفعة الثانية (إكمال الهيكل)', percentage: 40 },
  { id: 'pay-3', name: 'الدفعة الثالثة (عند التسليم)', percentage: 30 },
];
