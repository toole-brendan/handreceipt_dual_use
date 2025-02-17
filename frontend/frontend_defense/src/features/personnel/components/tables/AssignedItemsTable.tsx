import React from 'react';
import { Table, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Property } from '@/types/property';

interface EquipmentTableProps {
  equipment: Property[];
  onTransfer: (equipmentId: string) => void;
  onViewDetails: (equipmentId: string) => void;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({
  equipment,
  onTransfer,
  onViewDetails,
}) => {
  const columns: ColumnsType<Property> = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Property) => (
        <Space>
          {record.isSensitive && (
            <i className="material-icons sensitive-item-icon">warning</i>
          )}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (text: string) => (
        <code className="serial-number">{text}</code>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ 
          color: status === 'SERVICEABLE' ? '#4CAF50' : 
                 status === 'UNSERVICEABLE' ? '#f44336' : 
                 status === 'IN_MAINTENANCE' ? '#ff9800' : '#757575'
        }}>
          {status.replace('_', ' ')}
        </span>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            onClick={() => onTransfer(record.id)}
          >
            <i className="material-icons">swap_horiz</i>
            Transfer
          </Button>
          <Button
            type="text"
            onClick={() => onViewDetails(record.id)}
          >
            <i className="material-icons">info</i>
            Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={equipment}
      rowKey="id"
      className="equipment-table"
      pagination={false}
      size="small"
    />
  );
};

export default EquipmentTable;
