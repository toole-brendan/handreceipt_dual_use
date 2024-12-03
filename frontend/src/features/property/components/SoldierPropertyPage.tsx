import React from 'react';
import '@/styles/components/property/property-page.css';

interface PropertyItem {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  dateSigned: string;
  signedFrom: string;
  status: 'GOOD' | 'FAIR' | 'POOR';
}

const SoldierPropertyPage: React.FC = () => {
  const [items] = React.useState<PropertyItem[]>([
    {
      id: '1',
      name: 'M4 Carbine',
      type: 'WEAPON',
      serialNumber: 'W123456',
      dateSigned: '1/14/2023',
      signedFrom: 'SSG Miller',
      status: 'GOOD'
    }
  ]);

  const totalValue = 15000; // This would come from your data

  return (
    <div className="property-page">
      <header className="property-header">
        <h1>My Property Book</h1>
        <div className="property-stats">
          <div className="stat-item">
            <label>TOTAL ITEMS</label>
            <span className="stat-value">{items.length}</span>
          </div>
          <div className="stat-item">
            <label>TOTAL VALUE</label>
            <span className="stat-value">${totalValue.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <div className="property-list">
        {items.map(item => (
          <div key={item.id} className="property-card">
            <div className="property-card-header">
              <h2>{item.name}</h2>
              <span className={`status-badge ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
            </div>
            <div className="property-card-type">
              {item.type}
            </div>
            <div className="property-details">
              <div className="detail-row">
                <label>Serial Number:</label>
                <span>{item.serialNumber}</span>
              </div>
              <div className="detail-row">
                <label>Date Signed:</label>
                <span>{item.dateSigned}</span>
              </div>
              <div className="detail-row">
                <label>Signed From:</label>
                <span>{item.signedFrom}</span>
              </div>
            </div>
            <div className="property-actions">
              <button className="action-button">
                <i className="material-icons">description</i>
                Hand Receipt
              </button>
              <button className="action-button">
                <i className="material-icons">qr_code</i>
                QR Code
              </button>
              <button className="action-button">
                <i className="material-icons">build</i>
                Maintenance
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="key-actions">
        <h2>Key Actions</h2>
        <div className="action-grid">
          <button className="action-card">
            <i className="material-icons">description</i>
            <span>View Hand Receipt</span>
            <small>View and print your hand receipt</small>
          </button>
          <button className="action-card">
            <i className="material-icons">build</i>
            <span>Request Maintenance</span>
            <small>Submit maintenance request</small>
          </button>
          <button className="action-card">
            <i className="material-icons">history</i>
            <span>View History</span>
            <small>See property history</small>
          </button>
          <button className="action-card">
            <i className="material-icons">help_outline</i>
            <span>Get Help</span>
            <small>Property book assistance</small>
          </button>
        </div>
      </section>
    </div>
  );
};

export default SoldierPropertyPage; 