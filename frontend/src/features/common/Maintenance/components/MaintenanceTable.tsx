import React from 'react';
import { MaintenanceRequest } from '@/types/maintenance';

interface MaintenanceTableProps {
  requests: MaintenanceRequest[];
  onViewDetails: (id: string) => void;
}

const MaintenanceTable: React.FC<MaintenanceTableProps> = ({ requests, onViewDetails }) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'status-in-progress';
      case 'Completed':
        return 'status-completed';
      case 'Submitted':
        return 'status-submitted';
      default:
        return '';
    }
  };

  return (
    <div className="maintenance-table-container">
      <table className="maintenance-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Serial Number</th>
            <th>Date Reported</th>
            <th>Issue Description</th>
            <th>Status</th>
            <th>Est. Completion</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.itemName}</td>
              <td>{request.serialNumber}</td>
              <td>{new Date(request.dateReported).toLocaleDateString()}</td>
              <td>{request.description}</td>
              <td>
                <span className={`status-badge ${getStatusClass(request.status)}`}>
                  {request.status}
                </span>
              </td>
              <td>{new Date(request.estimatedCompletion).toLocaleDateString()}</td>
              <td>
                <button
                  className="view-details-button"
                  onClick={() => onViewDetails(request.id)}
                >
                  <i className="material-icons">visibility</i>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceTable; 