import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MaintenanceTable from '@/features/common/Maintenance/components/MaintenanceTable';
import '@/styles/pages/maintenance/maintenance.css';

interface MaintenanceRequest {
  id: string;
  itemName: string;
  serialNumber: string;
  dateReported: string;
  description: string;
  status: 'Submitted' | 'In Progress' | 'Completed';
  estimatedCompletion: string;
}

const MaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock data - replace with actual API call
  const [requests] = useState<MaintenanceRequest[]>([
    {
      id: '1',
      itemName: 'M4A1 Carbine',
      serialNumber: 'M4-2023-001',
      dateReported: '2024-03-15',
      description: 'Trigger mechanism sticking during operation',
      status: 'In Progress',
      estimatedCompletion: '2024-03-20'
    },
    {
      id: '2',
      itemName: 'ACOG Scope',
      serialNumber: 'ACOG-2023-123',
      dateReported: '2024-03-14',
      description: 'Reticle illumination not functioning',
      status: 'Submitted',
      estimatedCompletion: '2024-03-22'
    },
    {
      id: '3',
      itemName: 'Plate Carrier',
      serialNumber: 'PC-2023-047',
      dateReported: '2024-03-10',
      description: 'Torn stitching on shoulder strap',
      status: 'Completed',
      estimatedCompletion: '2024-03-15'
    }
  ]);

  const handleNewRequest = () => {
    navigate('/maintenance/new');
  };

  const handleViewDetails = (id: string) => {
    // TODO: Implement view details functionality
    console.log('View details for request:', id);
  };

  return (
    <div className="maintenance-page">
      <div className="maintenance-header">
        <h1>Maintenance Requests</h1>
        <button 
          className="new-request-button"
          onClick={handleNewRequest}
        >
          <i className="material-icons">add</i>
          New Maintenance Request
        </button>
      </div>

      <MaintenanceTable 
        requests={requests}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default MaintenancePage; 