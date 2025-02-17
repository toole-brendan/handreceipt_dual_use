import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Typography, 
  Box,
  CircularProgress,
  Pagination,
  styled
} from '@mui/material';
import { Stack } from '@/components/layout/mui/Stack';
import DashboardCard from '@/components/common/DashboardCard';
import PersonnelCard from './cards/PersonnelCard';
import { usePersonnelActions } from '../hooks/usePersonnelActions';
import type { Personnel, Unit, PersonnelStatus } from '@/types/personnel';
import { mockUnits as mockUnitsData, mockPersonnel as mockPersonnelData } from '@/mocks/mockPersonnelData';

// Convert mock personnel to feature-specific Personnel type
const convertMockPersonnel = (mockPerson: any): Personnel => {
  // Calculate property stats from assignedProperty
  const propertyCount = mockPerson.assignedProperty?.length || 0;
  const sensitiveItemCount = mockPerson.assignedProperty?.filter((item: any) => item.isSensitive).length || 0;
  const totalValue = mockPerson.assignedProperty?.reduce((sum: number, item: any) => sum + (item.value || 0), 0) || 0;

  return {
    id: mockPerson.id,
    firstName: mockPerson.firstName,
    lastName: mockPerson.lastName,
    rank: mockPerson.rank,
    dodId: mockPerson.dodId,
    unit: mockPerson.unit,
    unitId: mockPerson.unit.id,
    platoon: mockPerson.unit.shortName,
    position: mockPerson.position,
    email: mockPerson.email,
    phone: mockPerson.phone,
    status: mockPerson.status,
    dutyStatus: mockPerson.dutyStatus,
    assignedProperty: mockPerson.assignedProperty || [],
    clearance: mockPerson.clearance,
    isCommander: mockPerson.position?.toLowerCase().includes('commander') || false,
    isPrimaryHandReceipt: mockPerson.position?.toLowerCase().includes('commander') || mockPerson.position?.toLowerCase().includes('sergeant') || false,
    propertyAccess: {
      canSignFor: true,
      canTransfer: true,
      canInventory: true,
      sensitiveItems: true
    },
    propertyStats: {
      propertyCount,
      sensitiveItemCount,
      totalValue,
      pendingTransfers: 0
    },
    inventoryStatus: {
      lastInventory: new Date().toISOString(),
      nextInventoryDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      overdueCount: 0,
      cycleComplete: true
    },
    createdAt: mockPerson.createdAt || new Date().toISOString(),
    updatedAt: mockPerson.updatedAt || new Date().toISOString()
  };
};

// Convert all mock personnel
const mockPersonnel = mockPersonnelData.map(convertMockPersonnel);

// Styled components from PropertyView
const Section = styled(Box)(({ theme }) => ({
  background: '#121212',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.2s ease',
  minWidth: 200,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: 'relative',
  paddingBottom: theme.spacing(1),
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '30px',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.7)',
  }
})) as typeof Typography;

// Constants
const ITEMS_PER_PAGE = 15;
const STATUS_OPTIONS: PersonnelStatus[] = ['ACTIVE', 'INACTIVE', 'DEPLOYED', 'LEAVE', 'TRANSFERRED'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'rank', label: 'Rank' },
  { value: 'status', label: 'Status' },
  { value: 'position', label: 'Position' }
];

// Helper function to convert mock unit to feature-specific Unit type
const convertUnit = (mockUnit: any): Unit => ({
  id: mockUnit.id,
  name: mockUnit.name,
  shortName: mockUnit.shortName,
  type: mockUnit.type,
  echelon: mockUnit.echelon,
  parentUnitId: mockUnit.parentUnitId,
  commander: mockUnit.commander,
  personnel: [],
  property: [],
  stats: mockUnit.stats || {
    personnelCount: 0,
    equipmentCount: 0,
    sensitiveItemCount: 0,
    pendingTransfers: 0,
    overdueInventories: 0
  },
  createdAt: mockUnit.createdAt || new Date().toISOString(),
  updatedAt: mockUnit.updatedAt || new Date().toISOString()
});

// Convert mock units to feature-specific Unit type
const mockUnits = mockUnitsData.map(convertUnit);

// Helper function to convert commander to feature-specific Personnel type
// Get stats from the company unit
const companyUnit = mockUnits[0]; // Alpha Company
const mockStats = {
  activePersonnel: companyUnit.stats?.personnelCount || 0,
  onMission: 20, // Could be calculated from personnel status if needed
  onLeave: 5,
  inTraining: 15
};

const PersonnelIndex: React.FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('');
    setCategoryFilter('');
    setSortBy('');
    setSortDirection('asc');
    setCurrentPage(1);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // "Escape" to clear filters
      else if (e.key === 'Escape' && (searchQuery || statusFilter || categoryFilter || sortBy)) {
        clearFilters();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, statusFilter, categoryFilter, sortBy, clearFilters]);

  // Handle debounced filtering state
  useEffect(() => {
    setIsFiltering(true);
    const timeout = setTimeout(() => {
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, statusFilter, categoryFilter, sortBy]);

  const [personnel] = useState<Personnel[]>(mockPersonnel);
  const [stats] = useState(mockStats);
  const [isLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { generateHandReceipt, initiateTransfer, viewProfile } = usePersonnelActions();

  const handleCardClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredPersonnel = React.useMemo(() => {
    if (!Array.isArray(personnel)) return [];
    
    let result = [...personnel];

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(person =>
        `${person.rank} ${person.firstName} ${person.lastName} ${person.position || ''}`
          .toLowerCase()
          .includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(person => person.status === statusFilter);
    }

    // Apply category (platoon) filter
    if (categoryFilter) {
      result = result.filter(person => person.platoon === categoryFilter);
    }

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'name':
            comparison = `${a.lastName}, ${a.firstName}`.localeCompare(`${b.lastName}, ${b.firstName}`);
            break;
          case 'rank':
            comparison = a.rank.localeCompare(b.rank);
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          case 'position':
            comparison = (a.position || '').localeCompare(b.position || '');
            break;
          default:
            return 0;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [personnel, searchQuery, statusFilter, categoryFilter, sortBy, sortDirection]);

  // Get current page items
  const currentItems = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPersonnel.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPersonnel, currentPage]);

  const pageCount = Math.ceil(filteredPersonnel.length / ITEMS_PER_PAGE);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h4">
            Personnel Management
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={2}>
        <DashboardCard title="Active Personnel">
          <Typography variant="h3" align="center">
            {stats.activePersonnel}
          </Typography>
        </DashboardCard>
        <DashboardCard title="On Mission">
          <Typography variant="h3" align="center">
            {stats.onMission}
          </Typography>
        </DashboardCard>
        <DashboardCard title="On Leave">
          <Typography variant="h3" align="center">
            {stats.onLeave}
          </Typography>
        </DashboardCard>
        <DashboardCard title="In Training">
          <Typography variant="h3" align="center">
            {stats.inTraining}
          </Typography>
        </DashboardCard>
      </Stack>

      <Section>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <SectionTitle variant="h1" component="h2" sx={{ mb: 0 }}>
            Personnel List
          </SectionTitle>
          {filteredPersonnel.length !== personnel.length && (
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Showing {filteredPersonnel.length} of {personnel.length} personnel
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, position: 'relative' }}>
            <Box sx={{ flex: 1 }}>
              <Box
                component="input"
                type="text"
                placeholder="Search by name, rank, or position... (Press '/' to focus, Esc to clear)"
                value={searchQuery}
                ref={searchInputRef}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    clearFilters();
                  }
                }}
                sx={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:focus': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                component="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:focus': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <option value="">Filter by Status</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Box>
              <Box
                component="select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                sx={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:focus': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <option value="">Filter by Platoon</option>
                <option value="HQ">HQ</option>
                <option value="1PLT">1st Platoon</option>
                <option value="2PLT">2nd Platoon</option>
                <option value="3PLT">3rd Platoon</option>
              </Box>
              <Box
                component="select"
                value={sortBy}
                onChange={(e) => {
                  const newSortBy = e.target.value;
                  if (newSortBy === sortBy) {
                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(newSortBy);
                    setSortDirection('asc');
                  }
                }}
                sx={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:focus': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <option value="">Sort by</option>
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} {sortBy === option.value ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                  </option>
                ))}
              </Box>
            </Box>
            {(searchQuery || statusFilter || categoryFilter || sortBy) && (
              <Box
                onClick={clearFilters}
                sx={{
                  position: 'absolute',
                  right: -8,
                  top: -8,
                  padding: '4px 8px',
                  backgroundColor: 'rgba(255, 59, 59, 0.1)',
                  color: '#FF3B3B',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 59, 59, 0.2)',
                  },
                }}
              >
                <span style={{ fontSize: '1rem' }}>×</span>
                Clear Filters (Esc)
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
          {isFiltering && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                backdropFilter: 'blur(2px)',
              }}
            >
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Updating results...
              </Typography>
            </Box>
          )}

          <Stack spacing={2}>
            {currentItems.length > 0 ? (
              currentItems.map((person: Personnel) => (
                <PersonnelCard
                  key={person.id}
                  personnel={person}
                  isExpanded={expandedId === person.id}
                  onToggleExpand={() => handleCardClick(person.id)}
                  onHandReceipt={generateHandReceipt}
                  onViewProfile={viewProfile}
                  onTransferEquipment={(equipmentId) => initiateTransfer(person.id, [equipmentId])}
                  onViewEquipmentDetails={viewProfile}
                />
              ))
            ) : (
              <Box 
                sx={{ 
                  py: 4, 
                  textAlign: 'center',
                  bgcolor: '#121212',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 1
                }}
              >
                <Typography color="textSecondary">
                  No personnel found matching your search criteria
                </Typography>
              </Box>
            )}
          </Stack>

          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pageCount}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Section>
    </Box>
  );
};

export default PersonnelIndex;
