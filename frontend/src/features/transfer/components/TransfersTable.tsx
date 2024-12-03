import React from 'react';
import '@/styles/features/transfer/transfers-table.css';

interface Transfer {
  id: string;
  itemName: string;
  serialNumber: string;
  type: 'incoming' | 'outgoing';
  otherParty: {
    name: string;
    rank: string;
  };
  dateRequested: string;
  status: 'needs_approval' | 'pending_other' | 'completed';
}

interface TransfersTableProps {
  transfers: Transfer[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const TransfersTable: React.FC<TransfersTableProps> = ({
  transfers,
  onApprove,
  onDeny,
  onViewDetails,
}) => {
  const getStatusDisplay = (status: Transfer['status']) => {
    switch (status) {
      case 'needs_approval':
        return <span className="status-badge needs-approval">Needs Your Approval</span>;
      case 'pending_other':
        return <span className="status-badge pending">Pending Their Approval</span>;
      case 'completed':
        return <span className="status-badge completed">Completed</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="transfers-table">
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Serial Number</th>
            <th>Request Type</th>
            <th>Other Party</th>
            <th>Date Requested</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer) => (
            <tr key={transfer.id} className={`transfer-row ${transfer.type}`}>
              <td>{transfer.itemName}</td>
              <td>{transfer.serialNumber}</td>
              <td>
                <span className={`type-badge ${transfer.type}`}>
                  {transfer.type === 'incoming' ? 'Incoming' : 'Outgoing'}
                </span>
              </td>
              <td>
                <div className="other-party">
                  <span className="rank">{transfer.otherParty.rank}</span>
                  <span className="name">{transfer.otherParty.name}</span>
                </div>
              </td>
              <td>{formatDate(transfer.dateRequested)}</td>
              <td>{getStatusDisplay(transfer.status)}</td>
              <td>
                <div className="action-buttons">
                  {transfer.status === 'needs_approval' && (
                    <>
                      <button
                        className="action-button approve"
                        onClick={() => onApprove(transfer.id)}
                      >
                        <i className="material-icons">check</i>
                        Approve
                      </button>
                      <button
                        className="action-button deny"
                        onClick={() => onDeny(transfer.id)}
                      >
                        <i className="material-icons">close</i>
                        Deny
                      </button>
                    </>
                  )}
                  <button
                    className="action-button details"
                    onClick={() => onViewDetails(transfer.id)}
                  >
                    <i className="material-icons">info</i>
                    Details
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransfersTable; 