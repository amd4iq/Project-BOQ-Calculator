
import { Category, StandardSpec, PaymentStage, SelectionState } from '../types.ts';

export const BASE_PRICE = 220000;

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
      { id: 'clean-with', label: 'مع صبة النظافة', cost: 5000, costType: 'per_m2' },
    ],
  },
  {
    id: 'height',
    title: 'ارتفاع السقف',
    iconName: 'ruler',
    options: [
      { id: 'h-32', label: '3.2 متر', cost: 0, costType: 'per_m2' },
      { id: 'h-33-35', label: '3.3 متر الى 3.5 متر', cost: 5000, costType: 'per_m2' },
      { id: 'h-36-40', label: '3.6 متر الى 4 متر', cost: 10000, costType: 'per_m2' },
    ],
  },
  {
    id: 'facade_beams',
    title: 'الجسور (الواجهة)',
    iconName: 'layers',
    options: [
        { id: 'beam-60', label: '60 سم', cost: 0, costType: 'per_m2' },
        { id: 'beam-80', label: '80 سم', cost: 15000, costType: 'per_m2' }
    ]
  },
  {
    id: 'foundation_drains',
    title: 'مجاري الأساس',
    iconName: 'zap',
    options: [
        { id: 'drain-bends', label: 'بندات', cost: 0, costType: 'per_m2' },
        { id: 'drain-mechanical', label: 'ميكانيكي', cost: 10000, costType: 'per_m2' }
    ]
  },
  {
    id: 'raft_foundation',
    title: 'الأساس – رفت',
    iconName: 'layers',
    options: [
        { id: 'raft-40', label: '40 سم', cost: 0, costType: 'per_m2' },
        { id: 'raft-60', label: '60 سم', cost: 10000, costType: 'per_m2' }
    ]
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
      { id: 'pool-6x10', label: 'مسبح (6 متر × 10 متر)', cost: 10000000, costType: 'fixed' },
      { id: 'elevator-internal', label: 'مصعد داخلي للمنزل', cost: 10000000, costType: 'fixed' },
    ],
  }
];

export const DEFAULT_SELECTIONS: SelectionState = {
  brick: { default: 'brick-yellow', overrides: {} },
  cleaning: { default: 'clean-none', overrides: {} },
  height: { default: 'h-32', overrides: {} },
  facade_beams: { default: 'beam-60', overrides: {} },
  foundation_drains: { default: 'drain-bends', overrides: {} },
  raft_foundation: { default: 'raft-40', overrides: {} },
  fixed_additions: [] 
};

export const DEFAULT_STANDARD_SPECS: StandardSpec[] = [
  { id: 'std-1', text: 'تجهيز المواد والآليات، تنظيف الأرض، ثم الدفن بمادة السبيس والجلمود حتى المنسوب المطلوب، مع حدل الأرض بحادلة 15 طن للوصول إلى نسبة حدل لا تقل عن 95%.' },
  { id: 'std-2', text: 'معالجة الأرض ضد حشرة الأرضة باستخدام مادة كلوردين منشأ أمريكي، مع رش النفط الأسود بارتفاع 3 م على جانب الجيران، وتنفيذ منظومة مكافحة الحشرات مع فرش نايلون زراعي سميك.' },
  { id: 'std-3', text: 'فحص المجاري بعد التأسيس وقبل صب الأسس.' },
  { id: 'std-4', text: 'تنفيذ القالب الخشبي لأساس الرفت وأعمال الحدادة (جسور 16 ملم تحت الجدران، حصيرة علوية وسفلية 12 ملم، وأترية 10 ملم مع فتحات 25 سم) باستخدام حديد تسليح عراقي نوع Van Steel.' },
  { id: 'std-5', text: 'صب الأسس صباً مركزياً باستخدام مواد مفحوصة مختبرياً (سمنت مقاوم للأملاح، رمل مغسول، حصى 5–19) مع معالجة الكونكريت الجاهز صنف C35.' },
  { id: 'std-6', text: 'تحديد مواقع الجدران وتنفيذ قالب ساف مانع للرطوبة (بادلو) بسماكة لا تقل عن 15 سم، مع الصب بكونكريت مضاف له مادة سيكا غير نفاذة للماء.' },
  { id: 'std-7', text: 'تجهيز المواد اللازمة لأعمال البناء بالطابوق المختار وبمونة سمنت (ماس أو طاسلوجة) بنسبة خلط 1:3.' },
  { id: 'std-8', text: 'تنفيذ بناء الستارة بارتفاع 1.50 م، سماكة 12 سم، ودنك 24 سم حسب المخططات.' },
  { id: 'std-9', text: 'بناء السياج الخارجي بارتفاع 2 م وسماكة 24 سم.' },
  { id: 'std-10', text: 'رش البناء بالماء مع تجهيز وتثبيت سليفات أنابيب السبالت لجميع الغرف.' },
  { id: 'std-11', text: 'تنفيذ القالب الخشبي للسقوف باستخدام خشب سليم وخالٍ من التلف، مع تثبيت القوالب بواسطة مساند حديدية (Jacks) كافية، ورفعها بعد 14 يوماً من الصب.' },
  { id: 'std-12', text: 'تنفيذ الجسور (رباط) حسب المتفق عليه، باستثناء البينونة بدون رباط، وبسماكة سقوف 20 سم مع مرد ماء للسطح بارتفاع 30 سم.' },
  { id: 'std-13', text: 'تنفيذ أعمال الحدادة باستخدام حديد Van Steel مع تسليح كل 15 سم بشكل هندسي منظم لمعالجة مناطق العزوم الموجبة والسالبة دون تداخل.' },
  { id: 'std-14', text: 'صب السقوف والدرج باستخدام حصى مدرج (5–19)، رمل مفحوص، وسمنت C35، مع رش ومعالجة الكونكريت، ويكون ظهر الدرج مكسر، مع توقف العمل 3 أيام بعد صب كل سقف.' },
  { id: 'std-15', text: 'تجهيز وتنفيذ مواد الأعمال الكهربائية فقط (أنابيب، جكشنات، سبوت لايت للإنارة السقفية) حسب المخطط الكهربائي، مع تثبيت سليفات الصحيات لجميع الطوابق.' },
];

export const DEFAULT_PAYMENT_SCHEDULE: PaymentStage[] = [
  { id: 'pay-1', name: 'بعد توقيع العقد', percentage: 5 },
  { id: 'pay-2', name: 'بعد تنفيذ الأساس الحصيري (الرفت)', percentage: 22 },
  { id: 'pay-3', name: 'بعد تنفيذ بناء الطابق الأرضي بدون سقف', percentage: 15 },
  { id: 'pay-4', name: 'بعد تنفيذ صبة سقف الطابق الأرضي', percentage: 15 },
  { id: 'pay-5', name: 'بعد تنفيذ بناء الطابق الأول بدون سقف', percentage: 15 },
  { id: 'pay-6', name: 'بعد تنفيذ صبة سقف الطابق الأول', percentage: 15 },
  { id: 'pay-7', name: 'بعد تنفيذ بناء الستائر والبيتونة', percentage: 8 },
  { id: 'pay-8', name: 'بعد تنفيذ صبة سقف البيتونة', percentage: 5 },
];
