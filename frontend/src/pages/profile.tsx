import React, { useState, useEffect } from 'react';
import '@/ui/styles/pages/profile.css';

const Profile: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>({
    name: '',
    email: '',
    phone: '',
  });
  const [password, setPassword] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [devices, setDevices] = useState<any[]>([]);
  const [accessHistory, setAccessHistory] = useState<any[]>([]);

  useEffect(() => {
    // Fetch user info, devices, and access history from API
    const fetchProfileData = async () => {
      try {
        // Replace with your API calls
        const userResponse = await fetch('/api/user/profile');
        const userData = await userResponse.json();
        setUserInfo(userData);

        const devicesResponse = await fetch('/api/user/devices');
        const devicesData = await devicesResponse.json();
        setDevices(devicesData);

        const accessResponse = await fetch('/api/user/access-history');
        const accessData = await accessResponse.json();
        setAccessHistory(accessData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    fetchProfileData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSaveProfile = () => {
    // Save profile information
    console.log('Profile saved', userInfo);
  };

  const handleChangePassword = () => {
    // Change password logic
    console.log('Password changed', password);
  };

  const handleDeviceLogout = (deviceId: string) => {
    // Logout from specific device
    console.log('Device logged out', deviceId);
  };

  return (
    <div className="palantir-panel profile-page">
      <h2>User Profile</h2>

      {/* Personal Settings */}
      <section className="profile-section">
        <h3>Personal Settings</h3>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            value={userInfo.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Military Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            value={userInfo.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Contact Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="form-input"
            value={userInfo.phone}
            onChange={handleInputChange}
          />
        </div>
        <button className="btn btn-primary" onClick={handleSaveProfile}>
          Save Personal Settings
        </button>
      </section>

      {/* Security Preferences */}
      <section className="profile-section">
        <h3>Security Preferences</h3>
        <div className="form-group">
          <label htmlFor="password">Change Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={handlePasswordChange}
          />
          <button className="btn btn-secondary" onClick={handleChangePassword}>
            Change Password
          </button>
        </div>
        {/* Additional security settings (MFA setup, security questions) */}
      </section>

      {/* Notification Setup */}
      <section className="profile-section">
        <h3>Notification Preferences</h3>
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="email"
              checked={notificationPreferences.email}
              onChange={handleNotificationChange}
            />
            Email Notifications
          </label>
          <label>
            <input
              type="checkbox"
              name="sms"
              checked={notificationPreferences.sms}
              onChange={handleNotificationChange}
            />
            SMS Notifications
          </label>
          <label>
            <input
              type="checkbox"
              name="push"
              checked={notificationPreferences.push}
              onChange={handleNotificationChange}
            />
            Push Notifications
          </label>
        </div>
        <button className="btn btn-primary">
          Save Notification Preferences
        </button>
      </section>

      {/* Device Management */}
      <section className="profile-section">
        <h3>Device Management</h3>
        <div className="devices-list">
          {devices.map((device) => (
            <div key={device.id} className="device-item">
              <p>
                <strong>{device.name}</strong> - {device.lastActive}
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => handleDeviceLogout(device.id)}
              >
                Logout Device
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Access History */}
      <section className="profile-section">
        <h3>Access History</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Device</th>
                <th>Location</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {accessHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.date}</td>
                  <td>{entry.device}</td>
                  <td>{entry.location}</td>
                  <td>{entry.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Certificate Management */}
      <section className="profile-section">
        <h3>Certificate Management</h3>
        {/* Implement certificate upload and management */}
        <p>Certificate management features will be implemented here.</p>
      </section>
    </div>
  );
};

export default Profile;