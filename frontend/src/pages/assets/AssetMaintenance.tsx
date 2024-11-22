// frontend/src/pages/assets/AssetMaintenance.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '@/ui/styles/pages/assets/asset-maintenance.css';

interface MaintenanceTask {
  id: string;
  date: string;
  type: string;
  description: string;
  technician: string;
}

const AssetMaintenance: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [formData, setFormData] = useState({
    date: '',
    type: '',
    description: '',
    technician: '',
  });

  useEffect(() => {
    // Fetch existing maintenance tasks for the asset
    const fetchMaintenanceTasks = async () => {
      try {
        const response = await fetch(`/api/assets/${id}/maintenance`);
        const data = await response.json();
        setMaintenanceTasks(data);
      } catch (error) {
        console.error('Error fetching maintenance tasks:', error);
      }
    };
    fetchMaintenanceTasks();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const scheduleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your scheduling logic here
    try {
      const response = await fetch(`/api/assets/${id}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        // Refresh the maintenance tasks list
        const updatedTasks = await response.json();
        setMaintenanceTasks(updatedTasks);
        // Reset form
        setFormData({
          date: '',
          type: '',
          description: '',
          technician: '',
        });
      } else {
        console.error('Failed to schedule maintenance');
      }
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
    }
  };

  return (
    <div className="asset-maintenance">
      <h2>Asset Maintenance - Asset ID: {id}</h2>

      {/* Schedule Maintenance Form */}
      <form onSubmit={scheduleMaintenance} className="maintenance-form">
        <h3>Schedule New Maintenance</h3>
        <div className="form-group">
          <label htmlFor="date">Maintenance Date</label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-input"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">Type of Maintenance</label>
          <input
            type="text"
            id="type"
            name="type"
            className="form-input"
            value={formData.type}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="technician">Assigned Technician</label>
          <input
            type="text"
            id="technician"
            name="technician"
            className="form-input"
            value={formData.technician}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Maintenance Description</label>
          <textarea
            id="description"
            name="description"
            className="form-input"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">
          Schedule Maintenance
        </button>
      </form>

      {/* Existing Maintenance Tasks */}
      <div className="existing-tasks">
        <h3>Upcoming Maintenance Tasks</h3>
        {maintenanceTasks.length === 0 ? (
          <p>No upcoming maintenance tasks.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Technician</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.date}</td>
                  <td>{task.type}</td>
                  <td>{task.technician}</td>
                  <td>{task.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssetMaintenance;