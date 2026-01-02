
import React, { useState } from 'react';
import { SubcontractorsList } from './subcontractors/SubcontractorsList';
import { SubcontractorProfile } from './subcontractors/SubcontractorProfile';

export const SubcontractorsTab: React.FC<{ contractId?: string }> = ({ contractId }) => {
    const [selectedSubcontractorId, setSelectedSubcontractorId] = useState<string | null>(null);

    if (selectedSubcontractorId) {
        return (
            <SubcontractorProfile
                subcontractorId={selectedSubcontractorId}
                onBack={() => setSelectedSubcontractorId(null)}
            />
        );
    }

    return (
        <SubcontractorsList
            onSelectSubcontractor={setSelectedSubcontractorId}
        />
    );
};