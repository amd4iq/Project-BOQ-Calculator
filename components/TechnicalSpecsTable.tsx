
import React from 'react';
import { Category, SelectionState, ProjectDetails, QuoteType } from '../core/types.ts';
import { SpecCard } from './SpecCard.tsx';
import { Icon } from './Icons.tsx';

interface TechnicalSpecsTableProps {
  categories: Category[];
  selections: SelectionState;
  onSelect: (categoryId: string, newSelection: any) => void;
  onEditCategory: (category: Category) => void;
  onNewCategory: () => void;
  projectDetails: ProjectDetails;
  quoteType: QuoteType;
  isReadOnly: boolean;
}

export const TechnicalSpecsTable: React.FC<TechnicalSpecsTableProps> = ({
  categories,
  selections,
  onSelect,
  onEditCategory,
  onNewCategory,
  projectDetails,
  quoteType,
  isReadOnly,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => {
        if (category.allowMultiple) return null;
        
        return (
          <SpecCard
            key={category.id}
            category={category}
            selection={selections[category.id]}
            onSelect={onSelect}
            onEdit={onEditCategory}
            projectDetails={projectDetails}
            quoteType={quoteType}
            isReadOnly={isReadOnly}
          />
        );
      })}
      {!isReadOnly && (
        <button
          onClick={onNewCategory}
          className="flex flex-col items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all group"
        >
          <div className="bg-slate-100 group-hover:bg-primary-100 p-2 rounded-full transition-colors">
              <Icon name="plus" size={24} />
          </div>
          <span className="font-bold text-sm">إضافة مواصفة جديدة</span>
        </button>
      )}
    </div>
  );
};
