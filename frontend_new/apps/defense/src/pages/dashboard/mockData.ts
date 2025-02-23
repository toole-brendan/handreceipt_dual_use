import { DashboardData } from './types';
import { categoryChartColors } from '../../styles/defense-specific-styles';

export const mockDashboardData: DashboardData = {
  propertyStats: {
    totalItems: 1250,
    serviceableItems: 980,
    maintenanceNeeded: 180,
    pendingTransfers: {
      count: 45,
      items: [
        {
          id: 'TRF-001',
          itemName: 'M4 Carbine',
          from: 'Alpha Company',
          to: 'Bravo Company',
        },
        {
          id: 'TRF-002',
          itemName: 'HMMWV',
          from: 'Charlie Company',
          to: 'HQ Company',
        },
        {
          id: 'TRF-003',
          itemName: 'Night Vision Goggles',
          from: 'Delta Company',
          to: 'Alpha Company',
        },
      ],
    },
    maintenanceRequests: {
      count: 65,
      items: [
        {
          id: 'MNT-001',
          itemName: 'HMMWV #234',
          type: 'Scheduled Maintenance',
          priority: 'medium',
        },
        {
          id: 'MNT-002',
          itemName: 'Radio Set #45',
          type: 'Repair',
          priority: 'high',
        },
        {
          id: 'MNT-003',
          itemName: 'M2 .50 Cal #12',
          type: 'Inspection',
          priority: 'low',
        },
      ],
    },
    overdueItems: 90,
    categories: [
      { name: 'Weapons', value: 450, count: 450 },
      { name: 'Vehicles', value: 200, count: 200 },
      { name: 'Communications', value: 350, count: 350 },
      { name: 'Other', value: 250, count: 250 },
    ],
    criticalItems: [
      {
        name: 'HMMWV #234',
        issue: 'Overdue maintenance',
        status: 'critical',
      },
      {
        name: 'Radio Set #45',
        issue: 'Malfunctioning',
        status: 'critical',
      },
      {
        name: 'M2 .50 Cal #12',
        issue: 'Inspection needed',
        status: 'warning',
      },
    ],
  },
  personnelStats: {
    totalPersonnel: 150,
    fullyEquipped: 120,
    partiallyEquipped: 25,
    overdueItems: 5,
  },
  activities: [
    {
      id: 'ACT-001',
      type: 'Transfer',
      description: 'M4 Carbine transferred to Bravo Company',
      user: {
        rank: 'SGT',
        name: 'John Smith',
      },
      timestamp: '2023-10-15T10:30:00Z',
      status: 'COMPLETED',
    },
    {
      id: 'ACT-002',
      type: 'Maintenance',
      description: 'HMMWV #234 scheduled maintenance',
      user: {
        rank: 'SPC',
        name: 'Jane Doe',
      },
      timestamp: '2023-10-15T09:15:00Z',
      status: 'IN PROGRESS',
    },
    {
      id: 'ACT-003',
      type: 'Inspection',
      description: 'Monthly weapons inspection',
      user: {
        rank: 'SSG',
        name: 'Mike Johnson',
      },
      timestamp: '2023-10-14T15:45:00Z',
      status: 'COMPLETED',
    },
  ],
  notifications: [
    {
      id: 'NOTIF-001',
      type: 'high',
      message: 'Critical maintenance required for HMMWV #234',
      timestamp: '2023-10-15T08:00:00Z',
    },
    {
      id: 'NOTIF-002',
      type: 'medium',
      message: 'Pending transfer requests require approval',
      timestamp: '2023-10-15T07:30:00Z',
    },
    {
      id: 'NOTIF-003',
      type: 'low',
      message: 'Monthly inventory report is ready for review',
      timestamp: '2023-10-14T16:00:00Z',
    },
  ],
}; 