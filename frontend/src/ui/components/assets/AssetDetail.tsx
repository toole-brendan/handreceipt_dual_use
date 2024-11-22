// src/ui/components/assets/AssetDetail.tsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { FiFileText, FiDownload, FiTrash2 } from 'react-icons/fi';

interface AssetDetail {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  location: string;
  lastVerified: string;
  classification: string;
  serialNumber: string;
  manufacturer: string;
  purchaseDate: string;
  maintenanceHistory: MaintenanceRecord[];
  verificationHistory: VerificationRecord[];
  documents: Document[];
}

interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  technician: string;
  status: 'completed' | 'pending' | 'scheduled';
}

interface VerificationRecord {
  id: string;
  date: string;
  verifier: string;
  status: 'passed' | 'failed';
  notes: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  classification: string;
}

interface AssetDetailProps {
  assetId: string;
}

export const AssetDetail: React.FC<AssetDetailProps> = ({ assetId }) => {
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'details' | 'maintenance' | 'verification' | 'documents'
  >('details');
  const { classificationLevel } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchAssetDetail = async () => {
      try {
        const response = await fetch(`/api/assets/${assetId}`, {
          headers: {
            'Classification-Level': classificationLevel,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch asset details');
        }

        const data = await response.json();
        setAsset(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAssetDetail();
  }, [assetId, classificationLevel]);

  if (loading) return <div className="loading">Loading asset details...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!asset) return <div className="error-message">Asset not found</div>;

  return (
    <div className="asset-detail">
      <header className="asset-detail-header">
        <h2>{asset?.name}</h2>
        <span className={`status-badge status-${asset?.status}`}>
          {asset?.status}
        </span>
      </header>

      <div className="asset-detail-content">
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`tab-button ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            Maintenance
          </button>
          <button
            className={`tab-button ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('verification')}
          >
            Verification
          </button>
          <button
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
        </div>

        <div className="tab-content-container">
          <div className="tab-content">
            {activeTab === 'details' && (
              <div className="details-panel">
                <div className="detail-grid">
                  <div className="detail-group">
                    <label>Serial Number</label>
                    <span>{asset.serialNumber}</span>
                  </div>
                  <div className="detail-group">
                    <label>Manufacturer</label>
                    <span>{asset.manufacturer}</span>
                  </div>
                  <div className="detail-group">
                    <label>Purchase Date</label>
                    <span>{new Date(asset.purchaseDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-group">
                    <label>Location</label>
                    <span>{asset.location}</span>
                  </div>
                  <div className="detail-group">
                    <label>Classification</label>
                    <span className="classification-badge">
                      {asset.classification}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="maintenance-panel">
                <div className="panel-actions">
                  <button className="btn-primary">Schedule Maintenance</button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Technician</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asset.maintenanceHistory.map((record) => (
                      <tr key={record.id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.type}</td>
                        <td>{record.description}</td>
                        <td>{record.technician}</td>
                        <td>
                          <span className={`status-badge status-${record.status}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="verification-panel">
                <div className="panel-actions">
                  <button className="btn-primary">New Verification</button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Verifier</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asset.verificationHistory.map((record) => (
                      <tr key={record.id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.verifier}</td>
                        <td>
                          <span className={`status-badge status-${record.status}`}>
                            {record.status}
                          </span>
                        </td>
                        <td>{record.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="documents-panel">
                <div className="panel-actions">
                  <button className="btn-primary">Upload Document</button>
                </div>
                <div className="documents-grid">
                  {asset.documents.map((doc) => (
                    <div key={doc.id} className="document-card">
                      <div className="document-icon">
                        <FiFileText />
                      </div>
                      <div className="document-info">
                        <h4>{doc.name}</h4>
                        <span className="document-meta">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                        <span className="classification-badge small">
                          {doc.classification}
                        </span>
                      </div>
                      <div className="document-actions">
                        <button className="btn-icon" title="Download">
                          <FiDownload />
                        </button>
                        <button className="btn-icon" title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
