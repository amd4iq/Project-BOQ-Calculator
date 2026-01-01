
import React from 'react';
import { useContract } from '../../../contexts/ContractContext.tsx';
import { Icon } from '../../../components/Icons.tsx';

export const SuppliersTab: React.FC<{ contractId?: string }> = ({ contractId }) => {
    const { suppliers } = useContract();
    // Logic to filter suppliers based on contractId if provided
    return (
        <div className="p-8">
            <h1 className="text-2xl font-black text-slate-800">الموردين</h1>
            {/* Display list of suppliers */}
        </div>
    );
};
