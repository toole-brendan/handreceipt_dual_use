import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Clock,
  Calendar,
  User,
  Wrench,
  Tag,
  FileText,
  Package,
  Link,
  Download,
} from 'lucide-react';
import type { MaintenanceTask } from '../../types';

interface MaintenanceDetailsModalProps {
  open: boolean;
  task: MaintenanceTask | null;
  onClose: () => void;
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export const MaintenanceDetailsModal: React.FC<MaintenanceDetailsModalProps> = ({
  open,
  task,
  onClose,
}) => {
  if (!task) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {task.title}
          </Typography>
          <Chip
            label={task.status.replace('_', ' ')}
            color={getStatusColor(task.status)}
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Equipment Details */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Equipment Details
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {task.equipment.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Serial Number
                  </Typography>
                  <Typography variant="body1">
                    {task.equipment.serialNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Model
                  </Typography>
                  <Typography variant="body1">
                    {task.equipment.model}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    NSN
                  </Typography>
                  <Typography variant="body1">
                    {task.equipment.nsn}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Task Details */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Task Details
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant="body1" paragraph>
                {task.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tag size={16} />
                    <Typography variant="body2">
                      Category: {task.category.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={16} />
                    <Typography variant="body2">
                      Est. Duration: {task.estimatedDuration}
                    </Typography>
                  </Box>
                </Grid>
                {task.actualDuration && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={16} />
                      <Typography variant="body2">
                        Actual Duration: {task.actualDuration}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          {/* Personnel */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Personnel
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Requested By
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <User size={16} />
                    <Box>
                      <Typography variant="body2">
                        {task.requestedBy.rank} {task.requestedBy.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {task.requestedBy.unit}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                {task.assignedTo && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Assigned To
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Wrench size={16} />
                      <Box>
                        <Typography variant="body2">
                          {task.assignedTo.rank} {task.assignedTo.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {task.assignedTo.unit}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          {/* Dates */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Timeline
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={16} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Requested Date
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(task.dates.requested)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                {task.dates.scheduled && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={16} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Scheduled Date
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(task.dates.scheduled)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {task.dates.started && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={16} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Start Date
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(task.dates.started)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {task.dates.completed && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={16} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Completion Date
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(task.dates.completed)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          {/* Parts */}
          {task.parts && task.parts.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Parts Required
              </Typography>
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <List disablePadding>
                  {task.parts.map((part) => (
                    <ListItem
                      key={part.id}
                      disablePadding
                      sx={{ py: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Package size={16} />
                      </ListItemIcon>
                      <ListItemText
                        primary={part.name}
                        secondary={
                          <>
                            NSN: {part.nsn} • Qty: {part.quantity} •{' '}
                            <Chip
                              label={part.status.replace('_', ' ')}
                              size="small"
                              color={
                                part.status === 'available'
                                  ? 'success'
                                  : part.status === 'on_order'
                                  ? 'warning'
                                  : 'error'
                              }
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          )}

          {/* Blockchain Records */}
          {task.blockchainRecords && task.blockchainRecords.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Blockchain Records
              </Typography>
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <List disablePadding>
                  {task.blockchainRecords.map((record) => (
                    <ListItem
                      key={record.transactionId}
                      disablePadding
                      sx={{ py: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Link size={16} />
                      </ListItemIcon>
                      <ListItemText
                        primary={record.action}
                        secondary={
                          <>
                            {formatDate(record.timestamp)} • {record.performedBy.rank}{' '}
                            {record.performedBy.name}
                          </>
                        }
                      />
                      <Tooltip title="View Transaction">
                        <IconButton size="small">
                          <Link size={16} />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Attachments
              </Typography>
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <List disablePadding>
                  {task.attachments.map((attachment) => (
                    <ListItem
                      key={attachment.id}
                      disablePadding
                      sx={{ py: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <FileText size={16} />
                      </ListItemIcon>
                      <ListItemText
                        primary={attachment.name}
                        secondary={attachment.type}
                      />
                      <Tooltip title="Download">
                        <IconButton size="small">
                          <Download size={16} />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          )}

          {/* Notes */}
          {task.notes && task.notes.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Notes
              </Typography>
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <List disablePadding>
                  {task.notes.map((note, index) => (
                    <ListItem
                      key={index}
                      disablePadding
                      sx={{ py: 1 }}
                    >
                      <ListItemText primary={note} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 