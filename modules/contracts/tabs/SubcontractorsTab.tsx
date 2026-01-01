
import React from 'react';
import { useContract } from '../../../contexts/ContractContext.tsx';
import { Icon } from '../../../components/Icons.tsx';

export const SubcontractorsTab: React.FC<{ contractId?: string }> = ({ contractId }) => {
    const { subcontractors } = useContract();
    // Logic to filter subcontractors based on contractId if provided
    return (
        <div className="p-8">
            <h1 className="text-2xl font-black text-slate-800">المقاولين الثانويين</h1>
            {/* Display list of subcontractors */}
        </div>
    );
};
