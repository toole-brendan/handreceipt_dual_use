import React from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ChevronDown,
  Trash2,
  Edit,
  Download,
  Share2,
  Archive,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedIds: string[]) => void;
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  divider?: boolean;
  tooltip?: string;
  requiresConfirmation?: boolean;
}

interface BulkActionsProps {
  selectedIds: string[];
  actions: BulkAction[];
  totalCount: number;
}

const defaultActions: BulkAction[] = [
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 size={18} />,
    onClick: () => {},
    color: 'error',
    requiresConfirmation: true,
    tooltip: 'Delete selected items',
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: <Edit size={18} />,
    onClick: () => {},
    tooltip: 'Edit selected items',
  },
  {
    id: 'export',
    label: 'Export',
    icon: <Download size={18} />,
    onClick: () => {},
    tooltip: 'Export selected items',
  },
  {
    id: 'share',
    label: 'Share',
    icon: <Share2 size={18} />,
    onClick: () => {},
    tooltip: 'Share selected items',
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <Archive size={18} />,
    onClick: () => {},
    divider: true,
    tooltip: 'Archive selected items',
  },
  {
    id: 'tag',
    label: 'Add Tags',
    icon: <Tag size={18} />,
    onClick: () => {},
    tooltip: 'Add tags to selected items',
  },
  {
    id: 'flag',
    label: 'Flag',
    icon: <AlertTriangle size={18} />,
    onClick: () => {},
    color: 'warning',
    tooltip: 'Flag selected items',
  },
  {
    id: 'approve',
    label: 'Approve',
    icon: <CheckCircle size={18} />,
    onClick: () => {},
    color: 'success',
    tooltip: 'Approve selected items',
  },
  {
    id: 'reject',
    label: 'Reject',
    icon: <XCircle size={18} />,
    onClick: () => {},
    color: 'error',
    tooltip: 'Reject selected items',
  },
];

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedIds,
  actions = defaultActions,
  totalCount,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: BulkAction) => {
    if (action.requiresConfirmation) {
      // In a real app, you'd show a confirmation dialog here
      const confirmed = window.confirm(`Are you sure you want to ${action.label.toLowerCase()} ${selectedIds.length} items?`);
      if (!confirmed) return;
    }
    action.onClick(selectedIds);
    handleClose();
  };

  if (selectedIds.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'inline-flex',
        bgcolor: 'background.paper',
        boxShadow: 3,
        borderRadius: 2,
        p: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {selectedIds.length} of {totalCount} selected
        </Typography>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      {actions.slice(0, 3).map((action) => {
        const button = (
          <IconButton
            key={action.id}
            size="small"
            onClick={() => handleAction(action)}
            color={action.color || 'inherit'}
          >
            {action.icon}
          </IconButton>
        );

        return (
          <Tooltip key={action.id} title={action.tooltip || action.label}>
            <span>{button}</span>
          </Tooltip>
        );
      })}

      {actions.length > 3 && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Button
            size="small"
            onClick={handleClick}
            endIcon={<ChevronDown size={16} />}
          >
            More
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            {actions.slice(3).map((action) => (
              <React.Fragment key={action.id}>
                {action.divider && <Divider />}
                <MenuItem
                  onClick={() => handleAction(action)}
                  sx={{
                    color: action.color ? `${action.color}.main` : 'inherit',
                    gap: 1,
                  }}
                >
                  {action.icon}
                  {action.label}
                </MenuItem>
              </React.Fragment>
            ))}
          </Menu>
        </>
      )}
    </Box>
  );
};

export default BulkActions;
