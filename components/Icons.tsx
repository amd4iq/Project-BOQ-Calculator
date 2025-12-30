
import React from 'react';
import { 
  BrickWall, 
  Droplets, 
  Ruler, 
  Calculator, 
  ChevronDown, 
  CheckCircle2, 
  Settings, 
  Layers, 
  Plus, 
  Pencil, 
  Trash2, 
  X,
  Printer,
  FileText,
  RotateCcw,
  Menu,
  Save,
  Download,
  FileSpreadsheet,
  FileJson,
  Copy,
  PieChart,
  BarChart3,
  PaintBucket,
  Zap,
  LayoutTemplate,
  PackageCheck,
  ImagePlus,
  User,
  Phone,
  Building,
  Building2,
  Briefcase,
  Circle,
  Square,
  CheckSquare,
  Triangle,
  Minus,
  Pin,
  Blinds,
  Lightbulb,
  Bath,
  Sofa,
  DoorOpen,
  Check,
  Search,
  Home,
  Archive,
  LogOut,
  Users,
  DollarSign
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className = "", size = 20 }) => {
  switch (name) {
    case 'brick': return <BrickWall className={className} size={size} />;
    case 'droplet': return <Droplets className={className} size={size} />;
    case 'ruler': return <Ruler className={className} size={size} />;
    case 'calculator': return <Calculator className={className} size={size} />;
    case 'chevron': return <ChevronDown className={className} size={size} />;
    case 'check': return <CheckCircle2 className={className} size={size} />;
    case 'check-simple': return <Check className={className} size={size} />;
    case 'settings': return <Settings className={className} size={size} />;
    case 'layers': return <Layers className={className} size={size} />;
    case 'plus': return <Plus className={className} size={size} />;
    case 'minus': return <Minus className={className} size={size} />;
    case 'pencil': return <Pencil className={className} size={size} />;
    case 'trash': return <Trash2 className={className} size={size} />;
    case 'x': return <X className={className} size={size} />;
    case 'printer': return <Printer className={className} size={size} />;
    case 'file-text': return <FileText className={className} size={size} />;
    case 'rotate-ccw': return <RotateCcw className={className} size={size} />;
    case 'menu': return <Menu className={className} size={size} />;
    case 'save': return <Save className={className} size={size} />;
    case 'download': return <Download className={className} size={size} />;
    case 'spreadsheet': return <FileSpreadsheet className={className} size={size} />;
    case 'json': return <FileJson className={className} size={size} />;
    case 'copy': return <Copy className={className} size={size} />;
    case 'pie-chart': return <PieChart className={className} size={size} />;
    case 'bar-chart': return <BarChart3 className={className} size={size} />;
    case 'paint': return <PaintBucket className={className} size={size} />;
    case 'zap': return <Zap className={className} size={size} />;
    case 'template': return <LayoutTemplate className={className} size={size} />;
    case 'package': return <PackageCheck className={className} size={size} />;
    case 'image-plus': return <ImagePlus className={className} size={size} />;
    case 'user': return <User className={className} size={size} />;
    case 'users': return <Users className={className} size={size} />;
    case 'phone': return <Phone className={className} size={size} />;
    case 'building': return <Building2 className={className} size={size} />;
    case 'building-floors': return <Building className={className} size={size} />;
    case 'briefcase': return <Briefcase className={className} size={size} />;
    case 'triangle': return <Triangle className={className} size={size} />;
    case 'pin': return <Pin className={className} size={size} />;
    case 'search': return <Search className={className} size={size} />;
    case 'dollar-sign': return <DollarSign className={className} size={size} />;
    
    // Finishes Icons
    case 'blinds': return <Blinds className={className} size={size} />;
    case 'lightbulb': return <Lightbulb className={className} size={size} />;
    case 'bath': return <Bath className={className} size={size} />;
    case 'sofa': return <Sofa className={className} size={size} />;
    case 'window': return <DoorOpen className={className} size={size} />; // Using DoorOpen for window as a placeholder

    // New Icons
    case 'home': return <Home className={className} size={size} />;
    case 'archive': return <Archive className={className} size={size} />;
    case 'log-out': return <LogOut className={className} size={size} />;

    // Selection Icons
    case 'circle': return <Circle className={className} size={size} />;
    case 'square': return <Square className={className} size={size} />;
    case 'check-square': return <CheckSquare className={className} size={size} />;
    
    default: return <Layers className={className} size={size} />;
  }
};
