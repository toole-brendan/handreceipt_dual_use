// frontend/src/pages/property/my-property/index.tsx
import React from 'react';
import { useCurrentUserProperty } from '@/shared/hooks/useCurrentUserProperty';
import { PropertyList } from '@/features/property/components';
import { Property } from '@/types/property';
import '@/styles/components/property/property-tables.css';

const mapPropertyToPropertyItem = (prop: Property) => ({
  id: prop.id,
  name: prop.name,
  serialNumber: prop.serialNumber,
  nsn: prop.nsn || 'N/A',
  status: prop.status.toLowerCase() as 'serviceable' | 'unserviceable' | 'damaged' | 'missing',
  category: prop.category,
  value: prop.value,
  assignedTo: prop.assignedTo,
  lastInventory: prop.lastInventoryCheck ? new Date(prop.lastInventoryCheck) : undefined,
  notes: prop.description
});

const MyProperty: React.FC = () => {
  const { property, loading, error } = useCurrentUserProperty();

  if (loading) return <div>Loading property...</div>;
  if (error) return <div>Error: {error instanceof Error ? error.message : String(error)}</div>;

  const mappedItems = property.map(mapPropertyToPropertyItem);

  return (
    <div className="my-property-page">
      <h1>My Property</h1>
      <PropertyList items={mappedItems} />
    </div>
  );
};

export default MyProperty;
