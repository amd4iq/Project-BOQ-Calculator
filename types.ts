
export type CostType = 'per_m2' | 'fixed' | 'percentage';

export interface Option {
  id: string;
  label: string;
  cost: number;
  costType?: CostType; 
  // Added for profitability analysis to fix error in ProfitabilityPanel
  actualCost?: number;
}

export interface Category {
  id: string;
  title: string;
  iconName: 'brick' | 'droplet' | 'ruler' | 'settings' | 'layers' | 'paint' | 'zap' | 'package';
  options: Option[];
  allowMultiple?: boolean; 
}

export interface SelectionState {
  [categoryId: string]: string | string[]; 
}

export interface ProjectDetails {
  employeeName: string;
  customerName: string;
  projectName: string;
  date: string;
  customerNumber: string;
  areaSize: number; 
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

export type AreaShape = 'rectangle' | 'triangle' | 'circle' | 'trapezoid';

export interface AreaRow {
  id: string;
  label: string;
  shape: AreaShape;
  dim1: number; // Length / Base / Radius / Base 1
  dim2: number; // Width / Height / Base 2
  dim3: number; // Height (for trapezoid)
}

export interface SavedQuote {
  id: string;
  lastModified: number;
  categories: Category[];
  selections: SelectionState;
  projectDetails: ProjectDetails;
  standardSpecs: StandardSpec[];
  printSettings: PrintSettings;
  paymentSchedule?: PaymentStage[];
  areaBreakdown?: AreaRow[];
}

export interface GlobalState {
  quotes: SavedQuote[];
  currentQuoteId: string;
}
