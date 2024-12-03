import React, { useState } from 'react';
import '@/styles/pages/property/property.css';

// Types
type Category = 'all' | 'weapons' | 'protection' | 'equipment';
type Status = 'all' | 'good' | 'needs_service' | 'in_service';

interface PropertyItem {
  id: string;
  name: string;
  serialNumber: string;
  category: Exclude<Category, 'all'>;
  dateAssigned: string;
  previousHolder: {
    name: string;
    rank: string;
  };
  status?: Status;
  turnedInDate?: string;
  turnedInTo?: {
    name: string;
    rank: string;
  };
}

// Mock data for testing
const mockCurrentItems: PropertyItem[] = [
  {
    id: '1',
    name: 'M4A1 Carbine',
    serialNumber: 'M4-2023-001',
    category: 'weapons',
    dateAssigned: '2024-01-15',
    previousHolder: {
      name: 'John Smith',
      rank: 'SGT'
    },
    status: 'good'
  },
  {
    id: '2',
    name: 'Plate Carrier',
    serialNumber: 'PC-2023-047',
    category: 'protection',
    dateAssigned: '2024-01-10',
    previousHolder: {
      name: 'Maria Rodriguez',
      rank: 'SSG'
    },
    status: 'needs_service'
  }
];

const mockHistoricalItems: PropertyItem[] = [
  {
    id: '3',
    name: 'ACOG Scope',
    serialNumber: 'ACOG-2023-123',
    category: 'equipment',
    dateAssigned: '2023-06-01',
    previousHolder: {
      name: 'Michael Chen',
      rank: 'SPC'
    },
    turnedInDate: '2023-12-15',
    turnedInTo: {
      name: 'David Wilson',
      rank: 'SSG'
    }
  }
];

const MyPropertyPage: React.FC = () => {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category>('all');
  const [statusFilter, setStatusFilter] = useState<Status>('all');

  // Handlers
  const handleRequestTransfer = (id: string) => {
    console.log('Request transfer for item:', id);
    // TODO: Implement transfer request logic
  };

  const handleReportIssue = (id: string) => {
    console.log('Report issue for item:', id);
    // TODO: Implement issue reporting logic
  };

  const handleViewDetails = (id: string) => {
    console.log('View details for item:', id);
    // TODO: Implement view details logic
  };

  // Filter current items based on search and filters
  const filteredCurrentItems = mockCurrentItems.filter(item => {
    const matchesSearch = searchQuery.toLowerCase() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="property-page">
      <h1>My Property</h1>

      {/* Current Property Section */}
      <section className="current-property-section">
        <h2>Current Property</h2>
        
        {/* Search and Filters */}
        <div className="search-filter-bar">
          <div className="search-bar">
            <i className="material-icons">search</i>
            <input
              type="text"
              placeholder="Search by item name or serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as Category)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="weapons">Weapons</option>
              <option value="protection">Protection</option>
              <option value="equipment">Equipment</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="good">Good</option>
              <option value="needs_service">Needs Service</option>
              <option value="in_service">In Service</option>
            </select>
          </div>
        </div>

        {/* Current Property Table */}
        <div className="property-table-container">
          <table className="property-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Serial Number</th>
                <th>Category</th>
                <th>Date Assigned</th>
                <th>Previous Holder</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCurrentItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="serial-number">{item.serialNumber}</td>
                  <td>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</td>
                  <td>{new Date(item.dateAssigned).toLocaleDateString()}</td>
                  <td>
                    <div className="holder-info">
                      <span className="rank">{item.previousHolder.rank}</span>
                      <span className="name">{item.previousHolder.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${item.status}`}>
                      {item.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-button details"
                        onClick={() => handleViewDetails(item.id)}
                      >
                        <i className="material-icons">info</i>
                        Details
                      </button>
                      <button
                        className="action-button transfer"
                        onClick={() => handleRequestTransfer(item.id)}
                      >
                        <i className="material-icons">swap_horiz</i>
                        Transfer
                      </button>
                      <button
                        className="action-button issue"
                        onClick={() => handleReportIssue(item.id)}
                      >
                        <i className="material-icons">report_problem</i>
                        Issue
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historical Property Section */}
      <section className="historical-property-section">
        <h2>Historical Property</h2>
        <div className="property-table-container">
          <table className="property-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Serial Number</th>
                <th>Category</th>
                <th>Date Assigned</th>
                <th>Previous Holder</th>
                <th>Date Turned In</th>
                <th>Turned In To</th>
              </tr>
            </thead>
            <tbody>
              {mockHistoricalItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="serial-number">{item.serialNumber}</td>
                  <td>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</td>
                  <td>{new Date(item.dateAssigned).toLocaleDateString()}</td>
                  <td>
                    <div className="holder-info">
                      <span className="rank">{item.previousHolder.rank}</span>
                      <span className="name">{item.previousHolder.name}</span>
                    </div>
                  </td>
                  <td>{item.turnedInDate && new Date(item.turnedInDate).toLocaleDateString()}</td>
                  <td>
                    {item.turnedInTo && (
                      <div className="holder-info">
                        <span className="rank">{item.turnedInTo.rank}</span>
                        <span className="name">{item.turnedInTo.name}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MyPropertyPage; 