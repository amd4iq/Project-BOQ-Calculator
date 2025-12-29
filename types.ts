
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

export interface GlobalState {
  quotes: SavedQuote[];
  currentQuoteId: string;
}