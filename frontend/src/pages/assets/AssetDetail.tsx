// frontend/src/pages/assets/AssetDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardCard from '@/ui/components/common/DashboardCard';
import '@/ui/styles/assets/asset-detail.css';

interface Asset {
  id: string;
  name: string;
  status: string;
  location: string;
  classification: string;
  lastUpdated: string;
  maintenanceHistory: MaintenanceRecord[];
  documents: Document[];
  transferHistory: TransferRecord[];
}

interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  technician: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

interface TransferRecord {
  id: string;
  date: string;
  from: string;
  to: string;
  reason: string;
}

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        // Replace with your API call
        const response = await fetch(`/api/assets/${id}`);
        const data = await response.json();
        setAsset(data);
      } catch (error) {
        console.error('Error fetching asset details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [id]);

  const handleTransfer = () => {
    navigate(`/assets/transfer/${id}`);
  };

  const handleMaintenance = () => {
    navigate(`/assets/maintenance/${id}`);
  };

  if (loading) {
    return <div>Loading asset details...</div>;
  }

  if (!asset) {
    return <div>Asset not found</div>;
  }

  return (
    <div className="asset-detail">
      <div className="asset-detail-header">
        <h2>Asset Details - {asset.name}</h2>
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleTransfer}>
            Transfer Asset
          </button>
          <button className="btn btn-secondary" onClick={handleMaintenance}>
            Schedule Maintenance
          </button>
        </div>
      </div>

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
          Maintenance History
        </button>
        <button
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
        <button
          className={`tab-button ${activeTab === 'transfers' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfers')}
        >
          Transfer History
        </button>
      </div>

      <div className="tab-content-container">
        {activeTab === 'details' && (
          <div className="details-panel">
            <div className="detail-group">
              <h3>Basic Information</h3>
              <p><strong>Asset ID:</strong> {asset.id}</p>
              <p><strong>Status:</strong> {asset.status}</p>
              <p><strong>Location:</strong> {asset.location}</p>
              <p><strong>Classification:</strong> {asset.classification}</p>
              <p><strong>Last Updated:</strong> {asset.lastUpdated}</p>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Technician</th>
                </tr>
              </thead>
              <tbody>
                {asset.maintenanceHistory.map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.type}</td>
                    <td>{record.description}</td>
                    <td>{record.technician}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-grid">
            {asset.documents.map((doc) => (
              <div key={doc.id} className="document-card">
                <h4>{doc.name}</h4>
                <p>{doc.type}</p>
                <p>Uploaded: {doc.uploadDate}</p>
                <p>Size: {doc.size}</p>
                <button className="btn btn-secondary">Download</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'transfers' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {asset.transferHistory.map((transfer) => (
                  <tr key={transfer.id}>
                    <td>{transfer.date}</td>
                    <td>{transfer.from}</td>
                    <td>{transfer.to}</td>
                    <td>{transfer.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetDetail; 