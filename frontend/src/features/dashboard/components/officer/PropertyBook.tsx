import React from 'react';
import { PropertyItem } from '../../types/dashboard';

interface PropertyBookProps {
  personalProperty: {
    items: PropertyItem[];
    quickStats: {
      totalItems: number;
      totalValue: number;
    };
  };
}

const PropertyBook: React.FC<PropertyBookProps> = ({ personalProperty }) => {
  return (
    <section className="dashboard-section">
      <h2>My Property Book</h2>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Items</span>
          <span className="stat-value">{personalProperty.quickStats.totalItems}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Value</span>
          <span className="stat-value">
            ${personalProperty.quickStats.totalValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Property Grid */}
      <div className="property-grid">
        {personalProperty.items.map((item) => (
          <div key={item.id} className="property-card">
            <div className="property-header">
              <div className="property-title">
                <h4>{item.name}</h4>
                <span className="property-type">{item.type}</span>
              </div>
              <span className={`status-badge status-${item.maintenanceStatus.toLowerCase()}`}>
                {item.maintenanceStatus}
              </span>
            </div>
            
            <div className="property-details">
              <div className="detail-row">
                <span className="detail-label">Serial Number:</span>
                <span className="detail-value">{item.serialNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date Signed:</span>
                <span className="detail-value">
                  {new Date(item.dateSignedFor).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Signed From:</span>
                <span className="detail-value">{item.signedFrom}</span>
              </div>
            </div>

            <div className="property-actions">
              <button 
                className="action-button"
                onClick={() => window.open(item.handReceiptUrl)}
              >
                <i className="material-icons">description</i>
                Hand Receipt
              </button>
              <button className="action-button">
                <i className="material-icons">qr_code_2</i>
                QR Code
              </button>
              <button className="action-button">
                <i className="material-icons">build</i>
                Maintenance
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Key Actions */}
      <div className="key-actions-section">
        <h3>Key Actions</h3>
        <div className="key-actions-grid">
          <button className="key-action-button">
            <i className="material-icons">add_circle</i>
            <span className="action-label">Add New Item</span>
            <span className="action-description">
              Register new property items
            </span>
          </button>
          
          <button className="key-action-button">
            <i className="material-icons">swap_horiz</i>
            <span className="action-label">Transfer Items</span>
            <span className="action-description">
              Initiate bulk property transfer
            </span>
          </button>
          
          <button className="key-action-button">
            <i className="material-icons">print</i>
            <span className="action-label">Print Report</span>
            <span className="action-description">
              Generate property book report
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PropertyBook; 