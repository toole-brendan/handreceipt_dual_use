// src/ui/components/assets/AssetManagement.tsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { AssetFilters } from './AssetFilters';
import { AssetActions } from './AssetActions';
import { Asset } from '@/types/asset';
import { AssetCreationForm } from './AssetCreationForm';
import '@/ui/styles/pages/assets/asset-management.css';
import { AuthState } from '@/types/auth';

// Add mock data
const MOCK_ASSETS: Asset[] = [
  {
    id: '1',
    name: 'Vehicle Alpha',
    type: 'vehicle',
    status: 'active',
    location: 'Base 1',
    assignedTo: 'John Doe',
    lastVerified: '2024-03-21',
    classification: 'SECRET'
  },
  {
    id: '2',
    name: 'Equipment Beta',
    type: 'equipment',
    status: 'maintenance',
    location: 'Base 2',
    assignedTo: 'Jane Smith',
    lastVerified: '2024-03-20',
    classification: 'CONFIDENTIAL'
  }
];

const AssetManagement: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    location: '',
    classification: '',
  });

  const auth = useSelector<RootState, AuthState>((state) => {
    console.log('Auth state:', state.auth);
    return state.auth;
  });
  const { classificationLevel, role, unitId, userId } = auth;

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        
        if (import.meta.env.DEV) {
          // Use mock data in development
          console.log('Using mock data in development');
          setAssets(MOCK_ASSETS);
          setFilteredAssets(MOCK_ASSETS);
          return;
        }

        let queryParams = `?classificationLevel=${classificationLevel}`;

        if (role === 'Command') {
          queryParams += `&commandId=${unitId}`;
        } else if (role === 'Unit') {
          queryParams += `&unitId=${unitId}`;
        } else if (role === 'Individual') {
          queryParams += `&assignedTo=${userId}`;
        }

        const response = await fetch(`/api/assets${queryParams}`, {
          headers: {
            'Classification-Level': classificationLevel,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }

        const data = await response.json();
        setAssets(data);
        setFilteredAssets(data);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
        
        if (import.meta.env.DEV) {
          // Fallback to mock data if fetch fails in development
          console.log('Falling back to mock data');
          setAssets(MOCK_ASSETS);
          setFilteredAssets(MOCK_ASSETS);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [classificationLevel, role, unitId, userId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, filters);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    applyFilters(searchQuery, newFilters);
  };

  const applyFilters = (query: string, currentFilters: typeof filters) => {
    let result = [...assets];

    if (query) {
      result = result.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query.toLowerCase()) ||
          asset.id.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (result.length > 0) {
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && key in result[0]) {
          result = result.filter(
            (asset) => asset[key as keyof Asset] === value
          );
        }
      });
    }

    setFilteredAssets(result);
  };

  const handleCreateAsset = async (assetData: any) => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Classification-Level': classificationLevel,
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        throw new Error('Failed to create asset');
      }

      const newAsset = await response.json();
      setAssets((prev) => [...prev, newAsset]);
      setFilteredAssets((prev) => [...prev, newAsset]);
      setShowCreateForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create asset');
    }
  };

  if (loading) return <div className="loading">Loading assets...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="asset-management">
      <header className="asset-header">
        <h2>Asset Management</h2>
        {(role === 'Admin' || role === 'Command') && (
          <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
            Add New Asset
          </button>
        )}
      </header>

      <AssetFilters
        searchQuery={searchQuery}
        onSearch={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="asset-grid">
        {filteredAssets.length === 0 ? (
          <div className="no-assets">
            <p>No assets found</p>
          </div>
        ) : (
          <table className="data-table asset-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Location</th>
                <th>Assigned To</th>
                <th>Last Verified</th>
                <th>Classification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.name}</td>
                  <td>{asset.type}</td>
                  <td>
                    <span className={`status-badge status-${asset.status}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>{asset.location}</td>
                  <td>{asset.assignedTo}</td>
                  <td>{asset.lastVerified ? new Date(asset.lastVerified).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <span className="classification-badge">
                      {asset.classification}
                    </span>
                  </td>
                  <td>
                    <AssetActions asset={asset} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreateForm && (
        <AssetCreationForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateAsset}
        />
      )}
    </div>
  );
};

// Single export
export default AssetManagement;
