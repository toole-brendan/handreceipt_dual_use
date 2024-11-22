import React from 'react';
import { FiSearch } from 'react-icons/fi';

interface AssetFiltersProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  filters: {
    status: string;
    type: string;
    location: string;
    classification: string;
  };
  onFilterChange: (filters: {
    status: string;
    type: string;
    location: string;
    classification: string;
  }) => void;
}

export const AssetFilters: React.FC<AssetFiltersProps> = ({
  searchQuery,
  onSearch,
  filters,
  onFilterChange,
}) => {
  return (
    <div className="asset-filters">
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      
      <div className="filter-group">
        <select
          value={filters.status}
          onChange={(e) =>
            onFilterChange({ ...filters, status: e.target.value })
          }
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) =>
            onFilterChange({ ...filters, type: e.target.value })
          }
        >
          <option value="">All Types</option>
          <option value="vehicle">Vehicle</option>
          <option value="weapon">Weapon</option>
          <option value="equipment">Equipment</option>
        </select>

        <select
          value={filters.classification}
          onChange={(e) =>
            onFilterChange({ ...filters, classification: e.target.value })
          }
        >
          <option value="">All Classifications</option>
          <option value="unclassified">Unclassified</option>
          <option value="confidential">Confidential</option>
          <option value="secret">Secret</option>
          <option value="top-secret">Top Secret</option>
        </select>
      </div>
    </div>
  );
}; 