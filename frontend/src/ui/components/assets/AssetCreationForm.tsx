// src/ui/components/assets/AssetCreationForm.tsx

import React, { useState } from 'react';
import '@/ui/styles/components/forms/asset-form.css';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface CreateAssetData {
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  location: string;
  classification: string;
}

interface AssetCreationFormProps {
  onClose: () => void;
  onSubmit: (data: CreateAssetData) => Promise<void>;
}

export const AssetCreationForm: React.FC<AssetCreationFormProps> = ({
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateAssetData>({
    name: '',
    type: '',
    status: 'active',
    location: '',
    classification: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Asset</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Asset Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Asset Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="vehicle">Vehicle</option>
              <option value="weapon">Weapon</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="classification">Classification</label>
            <select
              id="classification"
              name="classification"
              value={formData.classification}
              onChange={handleChange}
              required
            >
              <option value="">Select Classification</option>
              <option value="unclassified">Unclassified</option>
              <option value="confidential">Confidential</option>
              <option value="secret">Secret</option>
              <option value="top-secret">Top Secret</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Create Asset</button>
          </div>
        </form>
      </div>
    </div>
  );
};
