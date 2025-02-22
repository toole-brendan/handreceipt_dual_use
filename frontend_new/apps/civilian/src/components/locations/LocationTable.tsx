import React from 'react';
import { DataTable, Column } from '@/shared/components/data-table';
import { Location } from '@/types/location'; // Assuming you have a Location type

interface LocationTableProps {
  locations: Location[];
  loading?: boolean;
  onRowClick?: (location: Location) => void;
  bulkActions?: any[]; // Define the correct type for bulk actions
  selectable?: boolean;
}

const LocationTable: React.FC<LocationTableProps> = ({
  locations,
  loading,
  onRowClick,
  bulkActions,
  selectable = true,
}) => {
  const columns: Column[] = [
    {
      id: 'locationName',
      label: 'Location Name',
      minWidth: 150,
    },
    {
      id: 'address',
      label: 'Address',
      minWidth: 200,
    },
    {
      id: 'type',
      label: 'Type',
      minWidth: 100,
    },
    {
      id: 'contactInformation',
      label: 'Contact',
      minWidth: 150,
    },
  ];

  const rows = locations.map((location) => ({
    ...location,
    locationName: location.name, // Assuming 'name' is the location name
  }));

  return (
    <DataTable
      columns={columns}
      rows={rows}
      loading={loading}
      onRowClick={onRowClick}
      getRowId={(row) => row.id}
      bulkActions={bulkActions}
      selectable={selectable}
    />
  );
};

export default LocationTable;
