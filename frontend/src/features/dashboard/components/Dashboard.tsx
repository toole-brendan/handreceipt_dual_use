import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../types/auth';
import PropertyBook from './officer/PropertyBook';
import PropertyTransfer from './officer/PropertyTransfer';
import InventoryCalendar from './officer/InventoryCalendar';
import MaintenanceSnapshot from './nco/MaintenanceSnapshot';
import SpecialPropertyAssignments from './nco/SpecialPropertyAssignments';
import { OfficerDashboardData, NCODashboardData, SoldierDashboardData } from '../types/dashboard';

// Mock data - replace with actual API calls
const mockOfficerData: OfficerDashboardData = {
  personalProperty: {
    items: [
      {
        id: '1',
        name: 'M4 Carbine',
        type: 'Weapon',
        serialNumber: 'W123456',
        dateSignedFor: '2023-01-15',
        maintenanceStatus: 'Good',
        handReceiptUrl: '#',
        signedFrom: 'CPT Johnson'
      },
      {
        id: '2',
        name: 'Night Vision Goggles',
        type: 'Optics',
        serialNumber: 'O789012',
        dateSignedFor: '2023-02-20',
        maintenanceStatus: 'Due',
        handReceiptUrl: '#',
        signedFrom: 'CPT Johnson'
      },
      {
        id: '3',
        name: 'Tactical Radio',
        type: 'Communications',
        serialNumber: 'C345678',
        dateSignedFor: '2023-03-10',
        maintenanceStatus: 'Good',
        handReceiptUrl: '#',
        signedFrom: 'CPT Anderson'
      },
      {
        id: '4',
        name: 'Javelin Missile System',
        type: 'Heavy Weapon',
        serialNumber: 'H901234',
        dateSignedFor: '2023-04-05',
        maintenanceStatus: 'Overdue',
        handReceiptUrl: '#',
        signedFrom: 'MAJ Smith'
      },
      {
        id: '5',
        name: 'Drone System',
        type: 'Surveillance',
        serialNumber: 'D567890',
        dateSignedFor: '2023-05-15',
        maintenanceStatus: 'Good',
        handReceiptUrl: '#',
        signedFrom: 'CPT Johnson'
      },
      {
        id: '6',
        name: 'Thermal Scope',
        type: 'Optics',
        serialNumber: 'O123789',
        dateSignedFor: '2023-06-20',
        maintenanceStatus: 'Due',
        handReceiptUrl: '#',
        signedFrom: 'CPT Wilson'
      }
    ],
    quickStats: {
      totalItems: 6,
      totalValue: 125000
    }
  },
  recentTransfers: [
    {
      id: '1',
      fromUnit: 'Alpha Company',
      toUnit: 'Bravo Company',
      items: ['M4 Carbine', 'Night Vision Goggles'],
      date: '2024-01-20',
      status: 'Completed',
      highValue: false
    },
    {
      id: '2',
      fromUnit: 'Delta Company',
      toUnit: 'Charlie Company',
      items: ['M240B Machine Gun', 'Thermal Sight'],
      date: '2024-01-18',
      status: 'Pending',
      highValue: true
    },
    {
      id: '3',
      fromUnit: 'HHC',
      toUnit: 'Alpha Company',
      items: ['Radio Set', 'Encryption Device'],
      date: '2024-01-15',
      status: 'Completed',
      highValue: false
    }
  ],
  inventoryCalendar: [
    {
      id: '1',
      date: '2024-02-01',
      assignedOfficer: 'LT Smith',
      type: 'Cyclic',
      location: 'Warehouse A',
      time: '0900',
      lastCheckStatus: 'Pending',
      reportUrl: '#'
    },
    {
      id: '2',
      date: '2024-02-15',
      assignedOfficer: 'CPT Johnson',
      type: 'Sensitive Items',
      location: 'Arms Room',
      time: '0800',
      lastCheckStatus: 'Completed',
      reportUrl: '#'
    },
    {
      id: '3',
      date: '2024-03-01',
      assignedOfficer: 'LT Rodriguez',
      type: 'Cyclic',
      location: 'Motor Pool',
      time: '0730',
      lastCheckStatus: 'Pending',
      reportUrl: '#'
    },
    {
      id: '4',
      date: '2024-03-15',
      assignedOfficer: 'CPT Anderson',
      type: 'Sensitive Items',
      location: 'Comms Room',
      time: '0900',
      lastCheckStatus: 'Incomplete',
      reportUrl: '#'
    },
    {
      id: '5',
      date: '2024-04-01',
      assignedOfficer: 'LT Wilson',
      type: 'Cyclic',
      location: 'Supply Room',
      time: '0800',
      lastCheckStatus: 'Pending',
      reportUrl: '#'
    },
    {
      id: '6',
      date: '2024-04-15',
      assignedOfficer: 'CPT Martinez',
      type: 'Sensitive Items',
      location: 'Weapons Vault',
      time: '0730',
      lastCheckStatus: 'Pending',
      reportUrl: '#'
    }
  ]
};

const mockNCOData: NCODashboardData = {
  personalProperty: {
    items: [
      {
        id: '1',
        name: 'M4 Carbine',
        type: 'Weapon',
        serialNumber: 'W123456',
        dateSignedFor: '2023-01-15',
        maintenanceStatus: 'Good',
        handReceiptUrl: '#',
        signedFrom: 'SSG Miller'
      }
    ],
    quickStats: {
      totalItems: 5,
      totalValue: 15000
    }
  },
  maintenance: {
    recentItems: [
      {
        id: '1',
        itemName: 'M4 Carbine',
        dateSubmitted: '2024-01-15',
        daysInRepair: 5,
        status: 'In Progress',
        expectedCompletion: '2024-01-20'
      }
    ],
    totalInMaintenance: 3,
    pastDueItems: 1,
    priorityItems: 1
  },
  specialAssignments: [
    {
      id: '1',
      soldier: {
        name: 'John Doe',
        rank: 'SPC'
      },
      items: [
        {
          id: '1',
          name: 'Night Vision Goggles',
          type: 'Optics',
          serialNumber: 'O123456',
          dateSignedFor: '2023-12-01',
          maintenanceStatus: 'Good',
          handReceiptUrl: '#',
          signedFrom: 'SSG Miller'
        }
      ],
      dateAssigned: '2023-12-01',
      qualificationStatus: 'Qualified',
      nextTrainingDate: '2024-06-01',
      handReceiptUrl: '#'
    }
  ]
};

const mockSoldierData: SoldierDashboardData = {
  personalProperty: {
    items: [
      {
        id: '1',
        name: 'M4 Carbine',
        type: 'Weapon',
        serialNumber: 'W123456',
        dateSignedFor: '2023-01-15',
        maintenanceStatus: 'Good',
        handReceiptUrl: '#',
        signedFrom: 'SGT Wilson'
      }
    ],
    quickStats: {
      totalItems: 5,
      totalValue: 10000
    }
  }
};

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <div>Loading...</div>;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'officer':
        return (
          <>
            <PropertyBook personalProperty={mockOfficerData.personalProperty} />
            <PropertyTransfer 
              recentTransfers={mockOfficerData.recentTransfers}
            />
            <InventoryCalendar inventoryChecks={mockOfficerData.inventoryCalendar} />
          </>
        );
      case 'nco':
        return (
          <>
            <PropertyBook personalProperty={mockNCOData.personalProperty} />
            <MaintenanceSnapshot maintenance={mockNCOData.maintenance} />
            <SpecialPropertyAssignments assignments={mockNCOData.specialAssignments} />
          </>
        );
      case 'soldier':
        return (
          <PropertyBook personalProperty={mockSoldierData.personalProperty} />
        );
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <div className="dashboard-container">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;