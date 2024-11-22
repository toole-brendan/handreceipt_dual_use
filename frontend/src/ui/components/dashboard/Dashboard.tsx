/* frontend/src/ui/components/dashboard/Dashboard.tsx */

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import SecurityAlerts from './SecurityAlerts';
import SystemHealth from './SystemHealth';
import AssetOverview from './AssetOverview';
import ActivityFeed from './ActivityFeed';
import WeatherReport from './WeatherReport';
import PersonnelStatus from './PersonnelStatus';
import MaintenanceSchedule from './MaintenanceSchedule';
import CommanderDashboard from './CommanderDashboard';
import '@/ui/styles/pages/dashboard/dashboard.css';

// Update AuthState interface to match the actual state structure
interface AuthState {
  classificationLevel: string;
  role: string;
  // Add other auth state properties if needed
}

const Dashboard: React.FC = () => {
  // Use the correct type for auth state
  const { classificationLevel, role } = useSelector((state: RootState) => 
    state.auth as unknown as AuthState
  );

  const handleAlertClick = (alertId: string) => {
    console.log('Alert clicked:', alertId);
  };

  const handlePersonnelClick = (personnelId: string) => {
    console.log('Personnel clicked:', personnelId);
  };

  const handleScheduleClick = (scheduleId: string) => {
    console.log('Schedule clicked:', scheduleId);
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Command Overview</h1>
        <div className="dashboard__classification">
          Classification Level: {classificationLevel}
        </div>
      </header>

      {role === 'commander' && (
        <section className="dashboard__commander">
          <CommanderDashboard />
        </section>
      )}

      <div className="dashboard__grid">
        <section className="dashboard__grid-item dashboard__grid-item--full">
          <AssetOverview />
        </section>

        <section className="dashboard__grid-item dashboard__grid-item--large">
          <SystemHealth />
        </section>

        <section className="dashboard__grid-item">
          <SecurityAlerts 
            alertCount={5} 
            onAlertClick={handleAlertClick}
          />
        </section>

        <section className="dashboard__grid-item">
          <PersonnelStatus 
            activeCount={45} // Changed from count to activeCount
            onPersonnelClick={handlePersonnelClick} // Changed from onSelect to onPersonnelClick
          />
        </section>

        <section className="dashboard__grid-item">
          <MaintenanceSchedule 
            onScheduleClick={handleScheduleClick}
          />
        </section>

        <section className="dashboard__grid-item">
          <WeatherReport 
            onWeatherAlert={(alert) => console.log('Weather alert:', alert)}
          />
        </section>

        <section className="dashboard__grid-item dashboard__grid-item--full">
          <ActivityFeed />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
