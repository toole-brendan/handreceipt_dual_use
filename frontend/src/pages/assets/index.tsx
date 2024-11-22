// frontend/src/pages/assets/index.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '@/ui/styles/assets/asset-list.css';

interface Asset {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'maintenance' | 'decommissioned' | 'transfer';
  location: string;
  classification: string;
  lastUpdated: string;
  nextMaintenance?: string;
  custodian: string;
}

interface AssetFilters {
  status: string;
  type: string;
  classification: string;
}

const AssetList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AssetFilters>({
    status: 'all',
    type: 'all',
    classification: 'all'
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Asset;
    direction: 'asc' | 'desc';
  }>({ key: 'lastUpdated', direction: 'desc' });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assets');
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      const data = await response.json();
      setAssets(data);
      setError(null);
    } catch (err) {
      setError('Error loading assets. Please try again later.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name: keyof AssetFilters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSort = (key: keyof Asset) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedAssets = React.useMemo(() => {
    return assets
      .filter(asset => {
        const matchesFilters = (
          (filters.status === 'all' || asset.status === filters.status) &&
          (filters.type === 'all' || asset.type === filters.type) &&
          (filters.classification === 'all' || asset.classification === filters.classification)
        );

        const matchesSearch = searchQuery.toLowerCase().split(' ').every(term =>
          Object.values(asset).some(value => 
            value?.toString().toLowerCase().includes(term)
          )
        );

        return matchesFilters && matchesSearch;
      })
      .sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [assets, filters, searchQuery, sortConfig]);

  if (loading) {
    return <div className="loading">Loading assets...</div>;
  }

  return (
    <div className="asset-list">
      <div className="list-header">
        <h2>Asset Management</h2>
        <Link to="/assets/new" className="btn btn-primary">
          Add New Asset
        </Link>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            className="form-input"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="form-input"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="decommissioned">Decommissioned</option>
            <option value="transfer">In Transfer</option>
          </select>

          <select
            value={filters.classification}
            onChange={(e) => handleFilterChange('classification', e.target.value)}
            className="form-input"
          >
            <option value="all">All Classifications</option>
            <option value="unclassified">Unclassified</option>
            <option value="confidential">Confidential</option>
            <option value="secret">Secret</option>
            <option value="top-secret">Top Secret</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                Asset ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('name')}>
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('type')}>
                Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')}>
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('location')}>
                Location {sortConfig.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('custodian')}>
                Custodian {sortConfig.key === 'custodian' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('lastUpdated')}>
                Last Updated {sortConfig.key === 'lastUpdated' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedAssets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.id}</td>
                <td>{asset.name}</td>
                <td>{asset.type}</td>
                <td>
                  <span className={`status-badge ${asset.status}`}>
                    {asset.status}
                  </span>
                </td>
                <td>{asset.location}</td>
                <td>{asset.custodian}</td>
                <td>{new Date(asset.lastUpdated).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <Link to={`/assets/${asset.id}`} className="btn btn-secondary btn-sm">
                    View
                  </Link>
                  <Link to={`/assets/${asset.id}/edit`} className="btn btn-primary btn-sm">
                    Edit
                  </Link>
                  <Link to={`/assets/${asset.id}/transfer`} className="btn btn-warning btn-sm">
                    Transfer
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedAssets.length === 0 && (
        <div className="no-results">
          No assets found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default AssetList;