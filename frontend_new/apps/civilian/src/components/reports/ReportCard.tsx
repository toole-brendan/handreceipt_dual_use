import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Help as HelpIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';

interface ReportCardProps {
  title: string;
  helpText: string;
  customization?: React.ReactNode;
  children: React.ReactNode;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  helpText,
  customization,
  children,
  onExportCSV,
  onExportPDF,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (type: 'csv' | 'pdf') => {
    handleClose();
    if (type === 'csv' && onExportCSV) {
      onExportCSV();
    } else if (type === 'pdf' && onExportPDF) {
      onExportPDF();
    }
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{title}</Typography>
            <Tooltip title={helpText}>
              <IconButton size="small">
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {customization}
            {(onExportCSV || onExportPDF) && (
              <>
                <IconButton
                  aria-label="export options"
                  aria-controls={open ? 'export-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  onClick={handleClick}
                >
                  <FileDownloadIcon />
                </IconButton>
                <Menu
                  id="export-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'export-button',
                  }}
                >
                  {onExportCSV && (
                    <MenuItem onClick={() => handleExport('csv')}>
                      Export as CSV
                    </MenuItem>
                  )}
                  {onExportPDF && (
                    <MenuItem onClick={() => handleExport('pdf')}>
                      Export as PDF
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Box>
        }
      />
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}; 