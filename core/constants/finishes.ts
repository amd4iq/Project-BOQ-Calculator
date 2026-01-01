
import { Category, StandardSpec, PaymentStage, SelectionState } from '../types.ts';

export const BASE_PRICE = 300000;

export const CATEGORIES: Category[] = [
  {
    id: 'window_frames',
    title: 'اطار الشبابيك',
    iconName: 'blinds',
    options: [
      { id: 'wf-basic', label: 'حديد', cost: 0, costType: 'fixed' },
      { id: 'wf-advanced', label: 'مرمر', cost: 20000, costType: 'fixed' },
    ],
  },
  {
    id: 'electrical_switches',
    title: 'كهرباء - بلك سويج',
    iconName: 'zap',
    options: [
      { id: 'es-basic', label: 'صيني بلاستك', cost: 3000, costType: 'fixed' },
      { id: 'es-advanced', label: 'اسباني بلاستك', cost: 6000, costType: 'fixed' },
      { id: 'es-custom', label: 'اسباني ستيل', cost: 10000, costType: 'fixed' },
    ],
  },
  {
    id: 'lighting',
    title: 'كهرباء - انارة',
    iconName: 'lightbulb',
    options: [
      { id: 'l-basic', label: 'أساسية', cost: 5000, costType: 'fixed' },
      { id: 'l-advanced', label: 'اضاءة Anti-Glare', cost: 10000, costType: 'fixed' },
      { id: 'l-custom', label: 'إضافات خاصة', cost: 15000, costType: 'fixed' },
    ],
  },
  {
    id: 'sanitary',
    title: 'الصحيات',
    iconName: 'bath',
    allowMultiple: true,
    options: [
      { id: 'sn-sink-basic', label: 'مغسلة تعليك فرفوري', cost: 100000, costType: 'fixed' },
      { id: 'sn-sink-adv', label: 'مغسلة ديكور مرمر', cost: 150000, costType: 'fixed' },
      { id: 'sn-sink-custom', label: 'مغسلة تصنيع خاص', cost: 500000, costType: 'fixed' },
      { id: 'sn-partition-basic', label: 'قاطع زجاجي أساسي', cost: 150000, costType: 'fixed' },
      { id: 'sn-partition-adv', label: 'قاطع زجاجي متقدم', cost: 350000, costType: 'fixed' },
      { id: 'sn-partition-custom', label: 'قاطع زجاجي مخصص', cost: 1000000, costType: 'fixed' },
      { id: 'sn-jacuzzi', label: 'جاكوزي', cost: 1800000, costType: 'fixed' },
      { id: 'sn-toilet-basic', label: 'غربي أرضي', cost: 0, costType: 'fixed' },
      { id: 'sn-toilet-adv', label: 'غربي معلق', cost: 120000, costType: 'fixed' },
      { id: 'sn-toilet-custom', label: 'غربي معلق (طلب خاص)', cost: 300000, costType: 'fixed' },
    ]
  },
  {
      id: 'wall_finishes',
      title: 'جدران الحمام والمطابخ',
      iconName: 'layers',
      options: [
          { id: 'wall-basic', label: 'سيراميك 30x60 (مونة سمنت)', cost: 8000, costType: 'per_m2' },
          { id: 'wall-adv', label: 'بورسلان 60x120 (مادة لاصقة)', cost: 13000, costType: 'per_m2' },
          { id: 'wall-custom', label: 'بورسلان اسباني 60x120 (مادة لاصقة)', cost: 24000, costType: 'per_m2' },
          { id: 'wall-slabs', label: 'ألواح كبيرة', cost: 52000, costType: 'per_m2' }
      ]
  },
  {
      id: 'flooring',
      title: 'الأرضيات',
      iconName: 'ruler',
      options: [
          { id: 'floor-porcelain', label: 'أساسية - بورسلان', cost: 14500, costType: 'per_m2' },
          { id: 'floor-marble', label: 'أساسية - مرمر', cost: 25000, costType: 'per_m2' },
          { id: 'floor-custom', label: 'مخصصة: حسب طلب الزبون', cost: 50000, costType: 'fixed' },
      ]
  },
  {
      id: 'windows',
      title: 'الشبابيك',
      iconName: 'window',
      options: [
          { id: 'win-basic', label: 'سلايد زجاج مفرد', cost: 100000, costType: 'per_m2' },
          { id: 'win-adv', label: 'سلايد زجاج مزدوج', cost: 240000, costType: 'per_m2' },
          { id: 'win-custom', label: 'سلايد زجاج مزدوج مع عوازل', cost: 390000, costType: 'per_m2' },
      ]
  },
  {
    id: 'fixed_additions',
    title: 'إضافات خاصة بسعر مقطوع',
    iconName: 'package',
    allowMultiple: true,
    options: [],
  }
];

export const DEFAULT_SELECTIONS: SelectionState = {
  window_frames: { default: 'wf-basic', overrides: {}, percentages: {} },
  electrical_switches: { default: 'es-basic', overrides: {}, percentages: {} },
  lighting: { default: 'l-basic', overrides: {}, percentages: {} },
  sanitary: [],
  wall_finishes: { default: 'wall-basic', overrides: {}, percentages: {} },
  flooring: { default: 'floor-porcelain', overrides: {}, percentages: {} },
  windows: { default: 'win-basic', overrides: {}, percentages: {} },
  fixed_additions: [],
};

export const DEFAULT_STANDARD_SPECS: StandardSpec[] = [];

export const DEFAULT_PAYMENT_SCHEDULE: PaymentStage[] = [
  { id: 'pay-fin-1', name: 'عند توقيع العقد', percentage: 5 },
  { id: 'pay-fin-2', name: 'بعد تنفيذ أعمال التأسيسات الصحية والكهربائية', percentage: 9 },
  { id: 'pay-fin-3', name: 'بعد تنفيذ أعمال الكوبلانات', percentage: 5 },
  { id: 'pay-fin-4', name: 'بعد تنفيذ أعمال اللبخ', percentage: 8 },
  { id: 'pay-fin-5', name: 'بعد تنفيذ أعمال الواجهة', percentage: 18 },
  { id: 'pay-fin-6', name: 'بعد تنفيذ أعمال البياض الداخلي للجدران', percentage: 11 },
  { id: 'pay-fin-7', name: 'بعد تنفيذ أعمال التسطيح', percentage: 7 },
  { id: 'pay-fin-8', name: 'بعد تنفيذ أعمال سيراميك الجدران', percentage: 8 },
  { id: 'pay-fin-9', name: 'بعد تنفيذ أعمال الأرضيات', percentage: 13 },
  { id: 'pay-fin-10', name: 'بعد تثبيت الأبواب والشبابيك', percentage: 13 },
  { id: 'pay-fin-11', name: 'بعد تنفيذ أعمال الصبغ الداخلي للجدران', percentage: 3 },
];
