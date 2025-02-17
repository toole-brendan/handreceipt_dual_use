import { useSensitiveItems } from '../../hooks/useSensitiveItems';
import { DataTable } from '@/shared/components/data-table';

export const SensitiveItems: React.FC = () => {
  const { items } = useSensitiveItems();

  return (
    <div className="space-y-4">
      <DataTable
        rows={items}
        columns={[
          { label: 'NSN', id: 'serialNumber' },
          { label: 'Name', id: 'name' },
          { label: 'Serial #', id: 'serialNumber' },
          { label: 'Location', id: 'location' },
          { label: 'Assigned To', id: 'assignedTo' },
          { label: 'Last Verification', id: 'verificationSchedule.lastVerification' },
        ]}
      />
    </div>
  );
};

export default SensitiveItems;
