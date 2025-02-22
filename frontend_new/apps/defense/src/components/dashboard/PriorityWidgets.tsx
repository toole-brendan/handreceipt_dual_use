import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Stack,
  styled,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  VerifiedUser as VerifyIcon,
  ArrowUpward as EscalateIcon,
} from '@mui/icons-material';

const WidgetContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

interface OverdueInspection {
  id: string;
  item: string;
  daysOverdue: number;
  unit: string;
  priority: 'high' | 'medium' | 'low';
}

interface Transfer {
  id: string;
  timestamp: string;
  item: string;
  fromUser: string;
  toUser: string;
  transactionId: string;
}

interface PriorityWidgetsProps {
  overdueInspections: OverdueInspection[];
  recentTransfers: Transfer[];
  onEscalate?: (inspectionId: string) => void;
  onVerify?: (transactionId: string) => void;
}

const PriorityWidgets: React.FC<PriorityWidgetsProps> = ({
  overdueInspections,
  recentTransfers,
  onEscalate,
  onVerify,
}) => {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      {/* Overdue Inspections */}
      <WidgetContainer sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <WarningIcon color="warning" />
          <Typography variant="h6">Overdue Inspections</Typography>
        </Stack>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Days Overdue</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {overdueInspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell>{inspection.item}</TableCell>
                  <TableCell>
                    <Typography
                      color={
                        inspection.daysOverdue > 7
                          ? 'error'
                          : inspection.daysOverdue > 3
                          ? 'warning'
                          : 'text.secondary'
                      }
                    >
                      {inspection.daysOverdue} days
                    </Typography>
                  </TableCell>
                  <TableCell>{inspection.unit}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<EscalateIcon />}
                      onClick={() => onEscalate?.(inspection.id)}
                    >
                      Escalate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </WidgetContainer>

      {/* Recent Transfers */}
      <WidgetContainer sx={{ flex: 1 }}>
        <Typography variant="h6" mb={2}>Recent Transfers</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>From → To</TableCell>
                <TableCell align="right">Verify</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTransfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>{transfer.timestamp}</TableCell>
                  <TableCell>{transfer.item}</TableCell>
                  <TableCell>
                    {transfer.fromUser} → {transfer.toUser}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Verify on blockchain">
                      <IconButton
                        size="small"
                        onClick={() => onVerify?.(transfer.transactionId)}
                        sx={{ color: 'success.main' }}
                      >
                        <VerifyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </WidgetContainer>
    </Stack>
  );
};

export default PriorityWidgets;
