
export type QuoteType = 'structure' | 'finishes';

export type QuoteStatus = 
  | 'Draft'
  | 'Approved'
  | 'Printed - Pending Client Approval'
  | 'Approved by Client'
  | 'Rejected by Client'
  | 'Expired'
  | 'Contract Archived'
  | 'Under Revision';

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
  default: string; // default option id
  overrides: Record<string, string>; // { [spaceId]: optionId }
  percentages?: Record<string, number>; // { [optionId]: percentage (0-100) }
}

export interface SelectionState {
  [categoryId: string]: CategorySelection | string[]; // string[] for multi-select categories
}

export interface Space {
  id: string;
  name: string;
  weight: number; // Represents area in m² for 'finishes' quotes
}

export interface ProjectDetails {
  employeeName: string;
  customerName: string;
  projectName: string;
  date: string;
  customerNumber: string;
  areaSize: number; 
  numberOfFloors: number;
  spaces?: Space[];
  basePricePerM2?: number;
  targetBudget?: number;
  enableBudgeting?: boolean;
  enableSpaceDistribution?: boolean; // Kept for backward compatibility logic
  specAllocationMode?: 'spaces' | 'percentage'; // New field for allocation mode
  assignedEngineer?: string;
  showAreaBreakdownUi?: boolean; // New: Controls visibility of breakdown details in UI
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
  // New toggles for modular printing
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
  dim1: number; // For 'full' & 'half': Area (m²). For 'third': Length (m).
  dim2: number; // Unused
  dim3: number; // Unused
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
  
  // Timestamps & Metadata
  createdAt: number;
  createdBy: string; // User Name
  createdById: string; // User ID
  lastModified: number;
  approvedAt?: number;
  printedAt?: number;
  validUntil?: number; // printedAt + 14 days
  approvedByClientAt?: number;
  rejectedByClientAt?: number;

  isPinned?: boolean;
  
  // Core Data
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
  name: string; // This is the username for login
  displayName?: string; // This is the visible name in the UI
  role: 'engineer' | 'admin';
  password?: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  logoUrl: string; // Keep for now for backward compatibility, but UI is removed
  termsAndConditions: string;
}

export interface BasePrices {
    structure: number;
    finishes: number;
}
