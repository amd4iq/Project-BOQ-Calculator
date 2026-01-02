
export type QuoteType = 'structure' | 'finishes';

export type QuoteStatus = 
  | 'Draft'
  | 'Approved'
  | 'Printed - Pending Client Approval'
  | 'Approved by Client'
  | 'Rejected by Client'
  | 'Expired'
  | 'Contract Archived'
  | 'Under Revision'
  | 'Contract Signed';

export type CostType = 'per_m2' | 'fixed' | 'percentage';

export interface Option {
  id: string;
  label: string;
  cost: number;
  costType?: CostType; 
}

export interface Category {
  id: string;
  title: string;
  iconName: 'brick' | 'droplet' | 'ruler' | 'settings' | 'layers' | 'paint' | 'zap' | 'package' | 'blinds' | 'lightbulb' | 'bath' | 'sofa' | 'window';
  options: Option[];
  allowMultiple?: boolean; 
}

export interface CategorySelection {
  default: string;
  overrides: Record<string, string>;
  percentages?: Record<string, number>;
}

export interface SelectionState {
  [categoryId: string]: CategorySelection | string[];
}

export interface Space {
  id: string;
  name: string;
  weight: number;
}

export interface ProjectDetails {
  employeeName: string;
  customerName: string;
  projectName: string;
  date: string;
  customerNumber: string;
  areaSize: number; 
  numberOfFloors: number;
  location?: string;
  spaces?: Space[];
  basePricePerM2?: number;
  targetBudget?: number;
  enableBudgeting?: boolean;
  enableSpaceDistribution?: boolean;
  specAllocationMode?: 'spaces' | 'percentage';
  assignedEngineer?: string;
  showAreaBreakdownUi?: boolean;
}

export interface StandardSpec {
  id: string;
  text: string;
}

export interface PrintSettings {
  showDetails: boolean;
  showFooter: boolean;
  notes: string;
  showLogo: boolean;
  logoUrl?: string;
  showAreaBreakdown?: boolean;
  showStandardSpecs?: boolean;
  showPaymentSchedule?: boolean;
  showTerms?: boolean;
}

export interface PaymentStage {
  id: string;
  name: string;
  percentage: number;
}

export type AreaShape = 'full' | 'half' | 'third';

export interface AreaRow {
  id: string;
  label: string;
  shape: AreaShape;
  dim1: number;
  dim2: number;
  dim3: number;
}

export interface HistoryEntry {
  version: number;
  changedAt: number;
  changedBy: string;
  reason?: string;
  snapshot: Omit<SavedQuote, 'history'>;
}

export interface PrintLogEntry {
  printedBy: string;
  printedAt: number;
  version: number;
}

export interface SavedQuote {
  id:string;
  offerNumber: string;
  version: number;
  status: QuoteStatus;
  createdAt: number;
  createdBy: string;
  createdById: string;
  lastModified: number;
  approvedAt?: number;
  printedAt?: number;
  validUntil?: number;
  approvedByClientAt?: number;
  rejectedByClientAt?: number;
  isPinned?: boolean;
  quoteType: QuoteType;
  categories: Category[];
  selections: SelectionState;
  projectDetails: ProjectDetails;
  standardSpecs: StandardSpec[];
  printSettings: PrintSettings;
  paymentSchedule?: PaymentStage[];
  areaBreakdown?: AreaRow[];
  history?: HistoryEntry[];
  printLog?: PrintLogEntry[];
}

export interface QuoteTemplate {
  id: string;
  name: string;
  quoteType: QuoteType;
  selections: SelectionState;
}

export interface User {
  id: string;
  name: string;
  displayName?: string;
  role: 'engineer' | 'admin' | 'accountant';
  password?: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  logoUrl: string;
  termsAndConditions: string;
}

export interface BasePrices {
    structure: number;
    finishes: number;
}

export interface AppSettings {
  structureCategories: Category[];
  finishesCategories: Category[];
  structureStandardSpecs: StandardSpec[];
  finishesStandardSpecs: StandardSpec[];
  companyInfo: CompanyInfo;
  defaultPrintSettings: PrintSettings;
  basePrices: BasePrices;
}

// --- Contract Management Types ---

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  specialty: string; 
  notes?: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  address?: string;
  role: string; 
  dailyWage: number;
  notes?: string;
}

export interface Subcontractor {
  id: string;
  name: string;
  phone: string;
  address?: string;
  specialty: string; 
  companyName?: string;
  defaultContractValue?: number;
}

export interface SubcontractorAgreement {
    id: string;
    subcontractorId: string;
    contractId: string;
    totalAmount: number;
    durationDays: number;
    notes?: string;
}

export interface PaymentHistoryEntry {
    id: string;
    date: number;
    amount: number;
    attachmentUrl?: string;
    note?: string;
    receiptNumber?: string;
    receiptDate?: number;
}

export interface Expense {
  id: string;
  contractId: string;
  date: number;
  description: string;
  amount: number;
  paidAmount?: number;
  paymentHistory?: PaymentHistoryEntry[];
  category: 'Material' | 'Labor' | 'Transport' | 'Other' | 'DebtPayment';
  beneficiaryType?: 'Supplier' | 'Worker' | 'Subcontractor';
  supplierId?: string; 
  workerId?: string; 
  subcontractorId?: string;
  paymentMethod: 'Cash' | 'Credit';
  attachmentUrl?: string;
  notes?: string;
  receiptNumber?: string;
  receiptDate?: number;
}

export interface ReceivedPayment {
  id: string;
  contractId: string;
  scheduleStageId?: string;
  amount: number;
  date: number;
  note?: string;
  isExtra?: boolean;
  attachmentUrl?: string;
  recordedBy?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string; // data URL
  type: string; // file mime type
  addedAt: number;
  originalFilename: string;
}

export interface Contract {
  id: string;
  contractNumber: string; 
  quoteId: string;
  offerNumber: string; 
  quoteDate?: string; 
  projectDetails: ProjectDetails; 
  totalContractValue: number; 
  status: 'Active' | 'Completed' | 'OnHold' | 'Cancelled';
  startDate: number;
  duration?: number;
  paymentSchedule: PaymentStage[]; 
  attachments?: Attachment[];
}
