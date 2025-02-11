import React from 'react';
import { PropertyList } from './PropertyList';
import { PropertyItem } from './PropertyCard';
import { styled } from '@mui/material/styles';
import { Typography, Paper, Box } from '@mui/material';

const Section = styled(Paper)(({ theme }) => ({
  background: '#121212',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.2s ease',
  minWidth: 200,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  elevation: 0,
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

const StatusBadge = styled('span')<{ color?: string }>(({ color = '#4CAF50' }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: color,
  border: `1px solid ${color}`,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}));

const MetricsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const MetricBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.02)',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid rgba(255, 255, 255, 0.05)',
}));

// Mock data (later move to a data fetching hook)
const mockItems: PropertyItem[] = [
  {
    id: '1',
    name: 'M4 Carbine',
    serialNumber: 'M4-123456',
    nsn: '1005-01-231-0973',
    status: 'serviceable',
    category: 'Weapons',
    value: 749.00,
    lastInventory: new Date('2024-01-25')
  },
  {
    id: '2',
    name: 'ACOG Scope',
    serialNumber: 'TA31-789012',
    nsn: '1240-01-412-6608',
    status: 'serviceable',
    category: 'Optics',
    value: 1298.00,
    lastInventory: new Date('2024-01-25')
  },
  {
    id: '3',
    name: 'PVS-14 Night Vision',
    serialNumber: 'PVS-345678',
    nsn: '5855-01-432-0524',
    status: 'damaged',
    category: 'Optics',
    value: 3600.00,
    notes: 'Battery housing damaged, needs repair',
    lastInventory: new Date('2024-01-25')
  }
];

export const PropertyView: React.FC = () => {
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [sortBy, setSortBy] = React.useState('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [isFiltering, setIsFiltering] = React.useState(false);

  const clearFilters = React.useCallback(() => {
    setSearchTerm('');
    setStatusFilter('');
    setCategoryFilter('');
    setSortBy('');
    setSortDirection('asc');
  }, []);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // "Escape" to clear filters
      else if (e.key === 'Escape' && (searchTerm || statusFilter || categoryFilter || sortBy)) {
        clearFilters();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm, statusFilter, categoryFilter, sortBy, clearFilters]);

  // Filter and sort items
  const filteredItems = React.useMemo(() => {
    let result = [...mockItems];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.serialNumber.toLowerCase().includes(searchLower) ||
          item.nsn.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(item => item.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter(item => item.category === categoryFilter);
    }

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'category':
            comparison = a.category.localeCompare(b.category);
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          case 'date':
            comparison = (a.lastInventory?.getTime() || 0) - (b.lastInventory?.getTime() || 0);
            break;
          default:
            return 0;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [searchTerm, statusFilter, categoryFilter, sortBy, sortDirection]);

  // Handle debounced filtering state
  React.useEffect(() => {
    setIsFiltering(true);
    const timeout = setTimeout(() => {
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, statusFilter, categoryFilter, sortBy]);

  const handleEdit = (id: string) => {
    console.log('Edit item:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete item:', id);
  };

  const handleViewHistory = (id: string) => {
    console.log('View history:', id);
  };

  const handleGenerateQR = (id: string) => {
    console.log('Generate QR:', id);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h4">
            My Property
          </Typography>
        </Box>
      </Box>

      <Section>
        <SectionTitle variant="h1" component="h2">
          Property Overview
        </SectionTitle>
        <MetricsGrid>
          <MetricBox>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Assigned Items
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                {mockItems.length}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Directly assigned to me
            </Typography>
          </MetricBox>
          
          <MetricBox>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending Transfers
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                2
              </Typography>
              <StatusBadge sx={{ backgroundColor: 'rgba(255, 215, 0, 0.1)', color: '#FFD700', borderColor: '#FFD700' }}>
                ACTION REQUIRED
              </StatusBadge>
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Awaiting your response
            </Typography>
          </MetricBox>
          
          <MetricBox>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Items in Maintenance
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                1
              </Typography>
              <StatusBadge sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                TRACKED
              </StatusBadge>
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Currently being serviced
            </Typography>
          </MetricBox>
          
          <MetricBox>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sensitive Items
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                2
              </Typography>
              <StatusBadge sx={{ backgroundColor: 'rgba(255, 59, 59, 0.1)', color: '#FF3B3B', borderColor: '#FF3B3B' }}>
                SENSITIVE
              </StatusBadge>
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Special handling required
            </Typography>
          </MetricBox>
        </MetricsGrid>
      </Section>
      
      <Section>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <SectionTitle variant="h1" component="h2" sx={{ mb: 0 }}>
            Assigned Property
          </SectionTitle>
          {filteredItems.length !== mockItems.length && (
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Showing {filteredItems.length} of {mockItems.length} items
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, position: 'relative' }}>
            <Box sx={{ flex: 1 }}>
              <Box
                component="input"
                type="text"
                placeholder="Search by property name, serial number, or QR code... (Press '/' to focus, Esc to clear)"
                value={searchTerm}
                ref={searchInputRef}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <option value="serviceable">Serviceable</option>
                <option value="unserviceable">Unserviceable</option>
                <option value="damaged">Damaged</option>
                <option value="missing">Missing</option>
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
                <option value="">Filter by Category</option>
                <option value="Weapons">Weapons</option>
                <option value="Optics">Optics</option>
                <option value="Communication">Communication</option>
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
                <option value="name">Name {sortBy === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}</option>
                <option value="category">Category {sortBy === 'category' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}</option>
                <option value="status">Status {sortBy === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}</option>
                <option value="date">Date Assigned {sortBy === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}</option>
              </Box>
            </Box>
            {(searchTerm || statusFilter || categoryFilter || sortBy) && (
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
          <PropertyList 
            items={filteredItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewHistory={handleViewHistory}
            onGenerateQR={handleGenerateQR}
          />
        </Box>
      </Section>
    </Box>
  );
};
