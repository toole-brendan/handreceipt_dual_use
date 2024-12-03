import React from 'react';
import { MaintenanceRequest } from '../../types/dashboard';

interface MaintenanceSnapshotProps {
  maintenance: {
    recentItems: MaintenanceRequest[];
    totalInMaintenance: number;
    pastDueItems: number;
    priorityItems: number;
  };
}

const MaintenanceSnapshot: React.FC<MaintenanceSnapshotProps> = ({ maintenance }) => {
  return (
    <section className="dashboard-section">
      <h2>Maintenance Snapshot</h2>

      {/* Quick Stats */}
      <div className="maintenance-stats">
        <div className="stat-card">
          <span className="stat-label">Total in Maintenance</span>
          <span className="stat-value">{maintenance.totalInMaintenance}</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-label">Past Due</span>
          <span className="stat-value">{maintenance.pastDueItems}</span>
        </div>
        <div className="stat-card urgent">
          <span className="stat-label">Priority Items</span>
          <span className="stat-value">{maintenance.priorityItems}</span>
        </div>
      </div>

      {/* Recent Maintenance Items */}
      <div className="maintenance-list">
        <div className="list-header">
          <h3>Recent Maintenance Items</h3>
          <button className="action-button">
            <i className="material-icons">add</i>
            New Request
          </button>
        </div>

        <div className="maintenance-grid">
          {maintenance.recentItems.map((item) => (
            <div key={item.id} className="maintenance-card">
              <div className="maintenance-header">
                <h4>{item.itemName}</h4>
                <span className={`status-badge status-${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
              
              <div className="maintenance-details">
                <div className="detail-row">
                  <span className="detail-label">Submitted:</span>
                  <span className="detail-value">
                    {new Date(item.dateSubmitted).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Days in Repair:</span>
                  <span className="detail-value">{item.daysInRepair}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Expected Completion:</span>
                  <span className="detail-value">
                    {new Date(item.expectedCompletion).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="maintenance-progress">
                <div className="progress-bar">
                  <div 
                    className={`progress-fill status-${item.status.toLowerCase()}`}
                    style={{ 
                      width: `${Math.min((item.daysInRepair / 30) * 100, 100)}%`
                    }}
                  />
                </div>
                <span className="progress-label">
                  {item.status === 'Completed' ? 'Complete' : `${Math.min((item.daysInRepair / 30) * 100, 100)}% of Est. Time`}
                </span>
              </div>

              <div className="maintenance-actions">
                <button className="action-button">
                  <i className="material-icons">update</i>
                  Update Status
                </button>
                <button className="action-button">
                  <i className="material-icons">history</i>
                  View History
                </button>
                {item.status === 'Delayed' && (
                  <button className="action-button warning">
                    <i className="material-icons">priority_high</i>
                    Escalate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-actions">
        <button className="action-button">
          <i className="material-icons">assessment</i>
          View Full Report
        </button>
        <button className="action-button">
          <i className="material-icons">schedule</i>
          Schedule Maintenance
        </button>
      </div>
    </section>
  );
};

export default MaintenanceSnapshot; 