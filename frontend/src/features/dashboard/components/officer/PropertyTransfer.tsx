import React from 'react';
import { PropertyTransfer as PropertyTransferType } from '../../types/dashboard';

interface PropertyTransferProps {
  recentTransfers: PropertyTransferType[];
}

const PropertyTransfer: React.FC<PropertyTransferProps> = ({
  recentTransfers
}) => {
  return (
    <section className="dashboard-section">
      <h2>Unit Property Transfer Snapshot</h2>

      {/* Recent Transfers */}
      <div className="transfer-section">
        <h3>Recent Transfers</h3>
        <div className="transfer-list">
          {recentTransfers.map((transfer) => (
            <div key={transfer.id} className={`transfer-card ${transfer.highValue ? 'high-value' : ''}`}>
              <div className="transfer-header">
                <div className="transfer-parties">
                  <span className="transfer-from">{transfer.fromUnit}</span>
                  <i className="material-icons">arrow_forward</i>
                  <span className="transfer-to">{transfer.toUnit}</span>
                </div>
                <div className="badge-group">
                  {transfer.highValue && (
                    <span className="high-value-badge">
                      <i className="material-icons">stars</i>
                      High Value
                    </span>
                  )}
                  <span className={`status-badge status-${transfer.status.toLowerCase()}`}>
                    {transfer.status}
                  </span>
                </div>
              </div>
              
              <div className="transfer-items">
                {transfer.items.map((item, index) => (
                  <span key={index} className="transfer-item">
                    {item}
                  </span>
                ))}
              </div>

              <div className="transfer-meta">
                <span className="transfer-date">
                  <i className="material-icons">event</i>
                  {new Date(transfer.date).toLocaleDateString()}
                </span>
                <div className="transfer-actions">
                  <button className="action-button">
                    <i className="material-icons">visibility</i>
                    View Details
                  </button>
                  {transfer.status === 'Pending' && (
                    <>
                      <button className="action-button">
                        <i className="material-icons">check_circle</i>
                        Approve
                      </button>
                      <button className="action-button">
                        <i className="material-icons">cancel</i>
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyTransfer; 