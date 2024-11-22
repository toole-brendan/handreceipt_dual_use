// frontend/src/pages/assets/[id].tsx


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '@/ui/styles/asset-detail.css';

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch asset details from API
    const fetchAsset = async () => {
      setLoading(true);
      try {
        // Replace with your API call
        const response = await fetch(`/api/assets/${id}`);
        const data = await response.json();
        setAsset(data);
      } catch (error) {
        console.error('Error fetching asset:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="palantir-panel asset-detail">
        <div className="loading">Loading asset details...</div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="palantir-panel asset-detail">
        <div className="error">Asset not found.</div>
      </div>
    );
  }

  return (
    <div className="palantir-panel asset-detail">
      <div className="asset-detail-header">
        <h2>Asset Details - {asset.name}</h2>
        <div className="action-buttons">
          <button className="btn btn-secondary">Edit Asset</button>
          <button className="btn btn-primary">Transfer Asset</button>
          <button className="btn btn-secondary">Schedule Maintenance</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => handleTabClick('details')}
        >
          Details
        </button>
        <button
          className={`tab-button ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => handleTabClick('maintenance')}
        >
          Maintenance History
        </button>
        <button
          className={`tab-button ${activeTab === 'transfer' ? 'active' : ''}`}
          onClick={() => handleTabClick('transfer')}
        >
          Transfer Records
        </button>
        <button
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => handleTabClick('documents')}
        >
          Documentation
        </button>
        <button
          className={`tab-button ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => handleTabClick('audit')}
        >
          Audit Trail
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content-container">
        {activeTab === 'details' && (
          <div className="tab-content">
            {/* Asset Information */}
            <div className="details-panel">
              <div className="detail-group">
                <h3>General Information</h3>
                <p><strong>Name:</strong> {asset.name}</p>
                <p><strong>Type:</strong> {asset.type}</p>
                <p><strong>Status:</strong> {asset.status}</p>
                <p><strong>Classification Level:</strong> {asset.classification}</p>
              </div>
              <div className="detail-group">
                <h3>Location</h3>
                <p><strong>Current Location:</strong> {asset.location}</p>
                <p><strong>Coordinates:</strong> {asset.coordinates}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="tab-content">
            {/* Maintenance History Table */}
            <h3>Maintenance History</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Performed By</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Map through maintenance records */}
                  {asset.maintenanceHistory.map((record: any, index: number) => (
                    <tr key={index}>
                      <td>{record.date}</td>
                      <td>{record.performedBy}</td>
                      <td>{record.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'transfer' && (
          <div className="tab-content">
            {/* Transfer Records Table */}
            <h3>Transfer Records</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Authorized By</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Map through transfer records */}
                  {asset.transferRecords.map((record: any, index: number) => (
                    <tr key={index}>
                      <td>{record.date}</td>
                      <td>{record.from}</td>
                      <td>{record.to}</td>
                      <td>{record.authorizedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="tab-content">
            {/* Documents Grid */}
            <h3>Documentation</h3>
            <div className="documents-grid">
              {/* Map through documents */}
              {asset.documents.map((doc: any, index: number) => (
                <div key={index} className="document-card">
                  <h4>{doc.title}</h4>
                  <p>{doc.description}</p>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    View Document
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="tab-content">
            {/* Audit Trail */}
            <h3>Audit Trail</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Map through audit logs */}
                  {asset.auditTrail.map((log: any, index: number) => (
                    <tr key={index}>
                      <td>{log.date}</td>
                      <td>{log.user}</td>
                      <td>{log.action}</td>
                      <td>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetDetail;