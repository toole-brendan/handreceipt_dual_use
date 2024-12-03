import React, { useState } from 'react';
import MaintenanceSnapshot from './MaintenanceSnapshot';
import SpecialPropertyAssignments from './SpecialPropertyAssignments';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { mockTasks } from '@/mocks/mockData';
import '@/styles/components/dashboard/roles/nco.css';

interface NCODashboardProps {
  timeRange?: string;
}

const NCODashboard: React.FC<NCODashboardProps> = ({ timeRange = 'week' }) => {
  const [selectedView, setSelectedView] = useState('overview');
  const user = useSelector((state: RootState) => state.auth.user);

  // Mock data for maintenance - replace with real data later
  const maintenanceData = {
    recentItems: mockTasks,
    totalInMaintenance: 15,
    pastDueItems: 3,
    priorityItems: 5
  };

  return (
    <div className="nco-dashboard">
      <header className="dashboard-header">
        <h1>NCO Dashboard</h1>
        <div className="dashboard-controls">
          <select 
            value={selectedView} 
            onChange={(e) => setSelectedView(e.target.value)}
            className="view-selector"
          >
            <option value="overview">Overview</option>
            <option value="maintenance">Maintenance</option>
            <option value="property">Property</option>
            <option value="personnel">Personnel</option>
          </select>
          <select 
            value={timeRange} 
            className="time-range-selector"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <section className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <button className="action-card">
              <i className="material-icons">add_circle</i>
              <span>New Maintenance Request</span>
            </button>
            <button className="action-card">
              <i className="material-icons">assignment</i>
              <span>Daily Checks</span>
            </button>
            <button className="action-card">
              <i className="material-icons">people</i>
              <span>Squad Management</span>
            </button>
            <button className="action-card">
              <i className="material-icons">inventory</i>
              <span>Property Book</span>
            </button>
          </div>
        </section>

        {/* Alerts and Notifications */}
        <section className="alerts-section">
          <h2>Critical Alerts</h2>
          <div className="alerts-list">
            <div className="alert-card urgent">
              <i className="material-icons">warning</i>
              <div className="alert-content">
                <h3>Overdue Maintenance</h3>
                <p>3 items require immediate attention</p>
              </div>
              <button>View</button>
            </div>
            <div className="alert-card warning">
              <i className="material-icons">schedule</i>
              <div className="alert-content">
                <h3>Upcoming Inventory</h3>
                <p>Sensitive items check due in 2 days</p>
              </div>
              <button>Schedule</button>
            </div>
          </div>
        </section>

        {/* Maintenance Snapshot */}
        <MaintenanceSnapshot maintenance={maintenanceData} />

        {/* Special Property Assignments */}
        <SpecialPropertyAssignments assignments={[]} />

        {/* Personnel Status */}
        <section className="personnel-status-section">
          <h2>Squad Status</h2>
          <div className="status-grid">
            <div className="status-card">
              <span className="status-value">12/15</span>
              <span className="status-label">Present for Duty</span>
            </div>
            <div className="status-card">
              <span className="status-value">2</span>
              <span className="status-label">On Leave</span>
            </div>
            <div className="status-card">
              <span className="status-value">1</span>
              <span className="status-label">TDY/Training</span>
            </div>
          </div>
          <div className="status-actions">
            <button className="action-button">
              <i className="material-icons">event</i>
              View Schedule
            </button>
            <button className="action-button">
              <i className="material-icons">edit</i>
              Update Status
            </button>
          </div>
        </section>

        {/* Training and Readiness */}
        <section className="training-section">
          <h2>Training & Readiness</h2>
          <div className="training-grid">
            <div className="training-card">
              <h3>Upcoming Training</h3>
              <ul>
                <li>
                  <span className="training-date">May 15</span>
                  <span className="training-name">Weapons Qualification</span>
                </li>
                <li>
                  <span className="training-date">May 20</span>
                  <span className="training-name">Physical Fitness Test</span>
                </li>
              </ul>
            </div>
            <div className="training-card">
              <h3>Squad Readiness</h3>
              <div className="readiness-metrics">
                <div className="metric">
                  <span className="metric-label">Weapons Qual</span>
                  <span className="metric-value">92%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">PT Score</span>
                  <span className="metric-value">87%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Medical</span>
                  <span className="metric-value">95%</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NCODashboard; 