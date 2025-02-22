import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Link,
  FileText,
} from 'lucide-react';
import type { MaintenanceTask } from '../../types';

interface MaintenanceTableProps {
  tasks: MaintenanceTask[];
  activeTab: number;
  onApprove: (task: MaintenanceTask) => void;
  onReject: (task: MaintenanceTask) => void;
  onComplete: (task: MaintenanceTask) => void;
  onCancel: (task: MaintenanceTask) => void;
  onViewDetails: (task: MaintenanceTask) => void;
  onViewBlockchain: (task: MaintenanceTask) => void;
  onGenerateDA2404: (task: MaintenanceTask) => void;
}

const getStatusColor = (status: MaintenanceTask['status']) => {
  const colors = {
    pending_approval: 'warning',
    scheduled: 'info',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'error',
    rejected: 'error',
  } as const;
  return colors[status];
};

const getPriorityColor = (priority: MaintenanceTask['priority']) => {
  const colors = {
    routine: 'info',
    urgent: 'warning',
    emergency: 'error',
  } as const;
  return colors[priority];
};

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
  tasks,
  activeTab,
  onApprove,
  onReject,
  onComplete,
  onCancel,
  onViewDetails,
  onViewBlockchain,
  onGenerateDA2404,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = React.useState<MaintenanceTask | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: MaintenanceTask) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleAction = (action: () => void) => {
    handleMenuClose();
    action();
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Equipment</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Requested By</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  No maintenance tasks found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {task.equipment.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SN: {task.equipment.serialNumber}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{task.title}</Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {task.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status.replace('_', ' ')}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {task.category.replace('_', ' ')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {task.requestedBy.rank} {task.requestedBy.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.requestedBy.unit}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {new Date(task.dates.requested).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.estimatedDuration}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onViewDetails(task)}
                      >
                        <Eye size={18} />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, task)}
                    >
                      <MoreVertical size={18} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedTask && (
          <>
            {activeTab === 0 && (
              <>
                <MenuItem
                  onClick={() => handleAction(() => onApprove(selectedTask))}
                >
                  <CheckCircle size={18} style={{ marginRight: 8 }} />
                  Approve
                </MenuItem>
                <MenuItem
                  onClick={() => handleAction(() => onReject(selectedTask))}
                >
                  <XCircle size={18} style={{ marginRight: 8 }} />
                  Reject
                </MenuItem>
              </>
            )}
            {activeTab === 1 && (
              <MenuItem
                onClick={() => handleAction(() => onCancel(selectedTask))}
              >
                <XCircle size={18} style={{ marginRight: 8 }} />
                Cancel
              </MenuItem>
            )}
            {activeTab === 2 && (
              <MenuItem
                onClick={() => handleAction(() => onComplete(selectedTask))}
              >
                <CheckCircle size={18} style={{ marginRight: 8 }} />
                Mark as Complete
              </MenuItem>
            )}
            <MenuItem
              onClick={() => handleAction(() => onViewBlockchain(selectedTask))}
            >
              <Link size={18} style={{ marginRight: 8 }} />
              View Blockchain Record
            </MenuItem>
            <MenuItem
              onClick={() => handleAction(() => onGenerateDA2404(selectedTask))}
            >
              <FileText size={18} style={{ marginRight: 8 }} />
              Generate DA 2404
            </MenuItem>
          </>
        )}
      </Menu>
    </TableContainer>
  );
}; 