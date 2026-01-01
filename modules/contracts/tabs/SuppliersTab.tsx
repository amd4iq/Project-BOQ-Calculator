
import React, { useState } from 'react';
import { SuppliersList } from './suppliers/SuppliersList';
import { SupplierProfile } from './suppliers/SupplierProfile';

export const SuppliersTab: React.FC<{ contractId?: string }> = ({ contractId }) => {
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

    if (selectedSupplierId) {
        return (
            <SupplierProfile 
                supplierId={selectedSupplierId} 
                onBack={() => setSelectedSupplierId(null)}
            />
        );
    }

    return (
        <SuppliersList 
            onSelectSupplier={setSelectedSupplierId}
        />
    );
};