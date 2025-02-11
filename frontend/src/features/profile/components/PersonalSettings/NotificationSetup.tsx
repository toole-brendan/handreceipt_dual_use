import React from 'react';
import { useSelector } from 'react-redux';
import { useSettings } from '@/contexts/SettingsContext';
import SecuritySettings from '@/features/profile/components/SecuritySettings/SecuritySettings';
import '@/styles/components/pages/settings.css';
import { RootState } from '@/store/store';
import { UserProfile } from '@/types/user';
import { UserRole } from '@/types/auth';

type TabType = 'general' | 'notifications' | 'security' | 'appearance';

const NotificationSettings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  // Create a default user profile if user is null
  const userProfile: UserProfile = user ? {
    id: user.id,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    rank: user.rank || '',
    unit: '',
    branch: '',
    mos: '',
    dodId: '',
    role: user.role as UserRole,  // Ensure proper type casting to UserRole
    classification: user.classification,
    permissions: user.permissions,
    lastLogin: new Date().toISOString(),
    profileImage: '',
    preferences: {
      theme: 'system',
      language: 'en-US',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: true,
        push: true,
        transferRequests: true,
        securityAlerts: true,
        systemUpdates: true,
        assetChanges: true
      }
    }
  } : {
    id: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    rank: '',
    unit: '',
    branch: '',
    mos: '',
    dodId: '',
    role: 'SOLDIER' as UserRole,  // Default to SOLDIER role
    classification: '',
    permissions: [],
    lastLogin: new Date().toISOString(),
    profileImage: '',
    preferences: {
      theme: 'system',
      language: 'en-US',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: true,
        push: true,
        transferRequests: true,
        securityAlerts: true,
        systemUpdates: true,
        assetChanges: true
      }
    }
  };

  const {
    emailNotifications,
    toggleEmailNotification,
  } = useSettings();

  const handleNotificationToggle = (key: keyof typeof emailNotifications) => {
    toggleEmailNotification(key);
  };

  const activeTab: TabType = 'general';

  const renderTabContent = () => {
    if (activeTab === 'general') {
      return (
        <div className="settings-section">
          <h3 className="settings-section-title">General Preferences</h3>
          <div className="settings-form">
            {/* Language, Time Zone, Date Format - These are not in the SettingsContext */}
          </div>
        </div>
      );
    }

    if (activeTab === 'notifications') {
      return (
        <div className="settings-section">
          <h3 className="settings-section-title">Notification Preferences</h3>
          <div className="settings-toggles">
            <div className="toggle-group">
              <label className="toggle-label">
                <span>Email Notifications</span>
                <input
                  type="checkbox"
                  checked={emailNotifications.transferRequests}
                  onChange={() => handleNotificationToggle('transferRequests')}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
              <p className="toggle-description">Receive important updates via email</p>
            </div>

            <div className="toggle-group">
              <label className="toggle-label">
                <span>Transfer Requests</span>
                <input
                  type="checkbox"
                  checked={emailNotifications.transferRequests}
                  onChange={() => handleNotificationToggle('transferRequests')}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
              <p className="toggle-description">Get notified about new transfer requests</p>
            </div>

            <div className="toggle-group">
              <label className="toggle-label">
                <span>Security Alerts</span>
                <input
                  type="checkbox"
                  checked={emailNotifications.sensitiveItems}
                  onChange={() => handleNotificationToggle('sensitiveItems')}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
              <p className="toggle-description">Receive alerts about security-related events</p>
            </div>

            <div className="toggle-group">
              <label className="toggle-label">
                <span>System Updates</span>
                <input
                  type="checkbox"
                  checked={emailNotifications.maintenance}
                  onChange={() => handleNotificationToggle('maintenance')}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
              <p className="toggle-description">Get notified about system maintenance and updates</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'security') {
      return <SecuritySettings profile={userProfile} />;
    }

    if (activeTab === 'appearance') {
      return (
        <div className="settings-section">
          <h3 className="settings-section-title">Appearance Settings</h3>
          <div className="settings-form">
            {/* Theme - This is not in the SettingsContext */}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="settings-description">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          {/* Sidebar - Not relevant to the errors */}
        </div>

        <div className="settings-main">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
