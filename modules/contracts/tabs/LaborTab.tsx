
import React, { useState } from 'react';
import { LaborList } from './labor/LaborList';
import { WorkerProfile } from './labor/WorkerProfile';

export const LaborTab: React.FC<{ contractId?: string }> = ({ contractId }) => {
    const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

    if (selectedWorkerId) {
        return (
            <WorkerProfile 
                workerId={selectedWorkerId} 
                onBack={() => setSelectedWorkerId(null)}
            />
        );
    }

    return (
        <LaborList 
            onSelectWorker={setSelectedWorkerId}
        />
    );
};