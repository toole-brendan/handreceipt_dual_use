import React from 'react';
import { usePersonnelProperty } from '@/features/property/hooks/usePersonnelProperty';

interface PersonnelPropertyListProps {
  personnelId: string;
  showSensitiveItems: boolean;
  timeframe: string;
}

export const PersonnelPropertyList: React.FC<PersonnelPropertyListProps> = ({
  personnelId,
  showSensitiveItems,
  timeframe
}) => {
  const { property, loading, error } = usePersonnelProperty(personnelId);

  if (loading) return <div>Loading property list...</div>;
  if (error) return <div>Error loading property</div>;

  // Filter property based on showSensitiveItems and timeframe
  const filteredProperty = property.filter(item => {
    if (showSensitiveItems && !item.isSensitive) return false;
    if (timeframe === 'current') return !item.transferPending;
    if (timeframe === 'pending') return item.transferPending;
    return true; // historical shows all
  });

  return (
    <div className="personnel-property-list">
      <h3>Assigned Property</h3>
      <div className="property-grid">
        {filteredProperty.map(item => (
          <div key={item.id} className="property-card">
            <div className="property-header">
              <h4>{item.name}</h4>
              {item.isSensitive && (
                <span className="sensitive-badge">Sensitive</span>
              )}
            </div>
            <div className="property-details">
              <div className="detail-row">
                <span className="label">Serial Number:</span>
                <span>{item.serialNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Category:</span>
                <span>{item.category}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
              {item.transferPending && (
                <div className="transfer-info">
                  <span className="label">Transfer To:</span>
                  <span>{item.transferTo}</span>
                </div>
              )}
            </div>
            <div className="property-actions">
              <button className="btn-secondary">
                View Details
              </button>
              <button className="btn-primary">
                {item.transferPending ? 'View Transfer' : 'Transfer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonnelPropertyList; 