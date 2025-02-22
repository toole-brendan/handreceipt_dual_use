import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Stack,
  styled,
  Tooltip,
} from '@mui/material';
import {
  SwapHoriz as TransferIcon,
  VerifiedUser as VerifyIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

const FeedContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

const TransactionId = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontFamily: 'monospace',
  fontSize: '0.85rem',
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

interface CustodyChange {
  id: string;
  timestamp: string;
  item: {
    name: string;
    nsn?: string; // NATO Stock Number
  };
  from: {
    name: string;
    rank: string;
  };
  to: {
    name: string;
    rank: string;
  };
  transactionId: string;
  verified: boolean;
}

interface ChainOfCustodyFeedProps {
  changes: CustodyChange[];
  onVerify?: (transactionId: string) => void;
  onFilter?: () => void;
}

const ChainOfCustodyFeed: React.FC<ChainOfCustodyFeedProps> = ({
  changes,
  onVerify,
  onFilter,
}) => {
  return (
    <FeedContainer>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Typography variant="h6" sx={{ flex: 1 }}>Chain of Custody Feed</Typography>
        <Tooltip title="Filter feed">
          <IconButton onClick={onFilter} size="small">
            <FilterIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <List>
        {changes.map((change) => (
          <ListItem
            key={change.id}
            sx={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              py: 1,
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <TransferIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Box component="span" sx={{ fontSize: '0.875rem' }}>
                    {change.item.name}
                  </Box>
                  {change.item.nsn && (
                    <Box
                      component="span"
                      sx={{ ml: 1, color: 'text.secondary', fontSize: '0.75rem' }}
                    >
                      NSN: {change.item.nsn}
                    </Box>
                  )}
                </Box>
              </Box>
              <Box sx={{ mt: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    {`${change.from.rank} ${change.from.name} → ${change.to.rank} ${change.to.name}`}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      color: 'primary.main',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={() => onVerify?.(change.transactionId)}
                  >
                    {change.transactionId}
                  </Box>
                  {change.verified && (
                    <Box component="span">
                      <Chip
                        icon={<VerifyIcon sx={{ fontSize: '0.75rem !important' }} />}
                        label="Verified"
                        size="small"
                        color="success"
                        sx={{ height: 20 }}
                      />
                    </Box>
                  )}
                </Box>
                <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mt: 0.5 }}>
                  {change.timestamp}
                </Box>
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
    </FeedContainer>
  );
};

export default ChainOfCustodyFeed;
