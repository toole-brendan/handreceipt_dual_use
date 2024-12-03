import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/shared/components/common/DashboardCard';
import TransfersTable from '@/features/transfer/components/TransfersTable';
import '@/styles/pages/transfer/transfer.css';

type TabType = 'pending' | 'requests' | 'completed';

// Mock data for testing
const mockTransfers = [
  {
    id: '1',
    itemName: 'M4A1 Carbine',
    serialNumber: 'M4-2023-001',
    type: 'incoming' as const,
    otherParty: {
      name: 'John Smith',
      rank: 'SGT',
    },
    dateRequested: '2024-01-15T08:00:00Z',
    status: 'needs_approval' as const,
  },
  {
    id: '2',
    itemName: 'PVS-14 Night Vision',
    serialNumber: 'PVS-2023-047',
    type: 'outgoing' as const,
    otherParty: {
      name: 'Maria Rodriguez',
      rank: 'SSG',
    },
    dateRequested: '2024-01-14T09:15:00Z',
    status: 'pending_other' as const,
  },
  {
    id: '3',
    itemName: 'ACOG Scope',
    serialNumber: 'ACOG-2023-123',
    type: 'incoming' as const,
    otherParty: {
      name: 'Michael Chen',
      rank: 'PFC',
    },
    dateRequested: '2024-01-13T11:30:00Z',
    status: 'completed' as const,
  },
];

const TransferRequestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleScanClick = () => {
    // TODO: Implement QR scanner modal/navigation
    console.log('Opening QR scanner');
  };

  const handleApprove = (id: string) => {
    console.log('Approving transfer:', id);
    // TODO: Implement approval logic
  };

  const handleDeny = (id: string) => {
    console.log('Denying transfer:', id);
    // TODO: Implement denial logic
  };

  const handleViewDetails = (id: string) => {
    console.log('Viewing details for transfer:', id);
    // TODO: Navigate to transfer details page
  };

  const stats = {
    needsApproval: mockTransfers.filter(t => t.status === 'needs_approval').length,
    awaitingOthers: mockTransfers.filter(t => t.status === 'pending_other').length,
    completedLast30Days: mockTransfers.filter(t => t.status === 'completed').length,
  };

  // Filter transfers based on active tab and search query
  const filteredTransfers = mockTransfers.filter(transfer => {
    const matchesSearch = searchQuery.toLowerCase() === '' ||
      transfer.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.otherParty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.otherParty.rank.toLowerCase().includes(searchQuery.toLowerCase());

    switch (activeTab) {
      case 'pending':
        return transfer.status === 'needs_approval' && matchesSearch;
      case 'requests':
        return transfer.status === 'pending_other' && matchesSearch;
      case 'completed':
        return transfer.status === 'completed' && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="transfer-request-page">
      {/* Header Section */}
      <div className="transfer-header">
        <h1>Transfer Requests</h1>
        <button 
          className="scan-button"
          onClick={handleScanClick}
        >
          <i className="material-icons">qr_code_scanner</i>
          Scan to Request Transfer
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="transfer-tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <i className="material-icons">assignment_late</i>
          Pending Your Approval
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <i className="material-icons">swap_horiz</i>
          My Requests
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <i className="material-icons">check_circle</i>
          Completed
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <i className="material-icons">search</i>
          <input
            type="text"
            placeholder="Search by item name, serial number, or personnel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Transfers Table */}
      <div className="transfers-table-container">
        <TransfersTable
          transfers={filteredTransfers}
          onApprove={handleApprove}
          onDeny={handleDeny}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <DashboardCard
          title="Needs Your Approval"
          className="stat-card needs-approval"
          icon={<i className="material-icons">assignment_late</i>}
        >
          <div className="stat-content">
            <span className="stat-number">{stats.needsApproval}</span>
            <span className="stat-label">PENDING ACTIONS</span>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Awaiting Others"
          className="stat-card awaiting-others"
          icon={<i className="material-icons">hourglass_empty</i>}
        >
          <div className="stat-content">
            <span className="stat-number">{stats.awaitingOthers}</span>
            <span className="stat-label">IN PROGRESS</span>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Completed Last 30 Days"
          className="stat-card completed"
          icon={<i className="material-icons">check_circle</i>}
        >
          <div className="stat-content">
            <span className="stat-number">{stats.completedLast30Days}</span>
            <span className="stat-label">SUCCESSFULLY COMPLETED</span>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default TransferRequestPage; 