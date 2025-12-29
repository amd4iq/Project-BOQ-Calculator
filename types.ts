
export type QuoteType = 'structure' | 'finishes';

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
}

export interface SelectionState {
  [categoryId: string]: CategorySelection | string[]; // string[] for multi-select categories
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
  spaces?: Space[];
  basePricePerM2?: number;
  targetBudget?: number;
  enableBudgeting?: boolean;
  activeLevels?: string[];
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

export interface SavedQuote {
  id:string;
  lastModified: number;
  quoteType: QuoteType;
  isPinned?: boolean;
  categories: Category[];
  selections: SelectionState;
  projectDetails: ProjectDetails;
  standardSpecs: StandardSpec[];
  printSettings: PrintSettings;
  paymentSchedule?: PaymentStage[];
  areaBreakdown?: AreaRow[];
}

export interface QuoteTemplate {
  id: string;
  name: string;
  selections: SelectionState;
}

export interface GlobalState {
  quotes: SavedQuote[];
  currentQuoteId: string;
  templates?: QuoteTemplate[];
}