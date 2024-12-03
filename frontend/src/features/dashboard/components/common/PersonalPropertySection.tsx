import React from 'react';
import { PropertyItem, QuickStats } from '../../types/dashboard';

interface PersonalPropertySectionProps {
  items: PropertyItem[];
  quickStats: QuickStats;
}

const PersonalPropertySection: React.FC<PersonalPropertySectionProps> = ({
  items,
  quickStats,
}) => {
  return (
    <section className="dashboard-section">
      <h2>Personal Property</h2>
      
      {/* Quick Stats */}
      <div className="quick-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Items</span>
          <span className="stat-value">{quickStats.totalItems}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Needs Attention</span>
          <span className="stat-value">{quickStats.itemsNeedingAttention}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Next Maintenance</span>
          <span className="stat-value">{new Date(quickStats.nextMaintenance).toLocaleDateString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Next Inventory</span>
          <span className="stat-value">{new Date(quickStats.nextInventoryCheck).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Current Items List */}
      <div className="items-list">
        <h3>Current Items</h3>
        <div className="items-grid">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-header">
                <h4>{item.name}</h4>
                <span className={`status-badge status-${item.maintenanceStatus.toLowerCase()}`}>
                  {item.maintenanceStatus}
                </span>
              </div>
              <div className="item-details">
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{item.type}</span>
                </div>
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
              </div>
              <div className="item-actions">
                <button className="action-button" onClick={() => window.open(item.handReceiptUrl)}>
                  <i className="material-icons">description</i>
                  View Hand Receipt
                </button>
                <button className="action-button">
                  <i className="material-icons">qr_code_2</i>
                  Generate QR
                </button>
                <button className="action-button">
                  <i className="material-icons">build</i>
                  Maintenance
                </button>
                <button className="action-button">
                  <i className="material-icons">report_problem</i>
                  Report Issue
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonalPropertySection; 