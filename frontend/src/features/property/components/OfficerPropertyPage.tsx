import React from 'react';
import '@/styles/components/property/property-page.css';

const OfficerPropertyPage: React.FC = () => {
  return (
    <div className="property-page">
      <header className="property-header">
        <h1>Officer Property Management</h1>
        <div className="property-stats">
          <div className="stat-item">
            <label>TOTAL UNITS</label>
            <span className="stat-value">3</span>
          </div>
          <div className="stat-item">
            <label>TOTAL PERSONNEL</label>
            <span className="stat-value">157</span>
          </div>
        </div>
      </header>

      <div className="property-content">
        <section className="overview-section">
          <h2>Unit Overview</h2>
          <div className="unit-grid">
            {/* Unit cards will go here */}
          </div>
        </section>

        <section className="actions-section">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <button className="action-card">
              <i className="material-icons">assignment</i>
              <span>Property Book</span>
              <small>View complete property book</small>
            </button>
            <button className="action-card">
              <i className="material-icons">swap_horiz</i>
              <span>Transfers</span>
              <small>Manage property transfers</small>
            </button>
            <button className="action-card">
              <i className="material-icons">assessment</i>
              <span>Reports</span>
              <small>Generate property reports</small>
            </button>
            <button className="action-card">
              <i className="material-icons">inventory</i>
              <span>Inventory</span>
              <small>Schedule inventory checks</small>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OfficerPropertyPage; 