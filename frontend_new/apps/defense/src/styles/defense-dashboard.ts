import { Theme } from '@mui/material/styles';

// Chart colors for property categories
export const categoryChartColors = {
  weapons: '#4CAF50',    // Green
  vehicles: '#FF9800',   // Orange
  communications: '#2196F3', // Blue
  other: '#757575',      // Gray
};

export const defenseDashboardStyles = (theme: Theme) => ({
  // Dashboard container
  dashboardContainer: {
    padding: theme.spacing(3),
    maxWidth: '1280px',
    margin: '0 auto',
  },

  // Company info section
  companyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
    '& .unit-logo': {
      width: 50,
      height: 50,
      objectFit: 'contain',
    },
    '& .commander-info': {
      '& h4': {
        color: '#2196F3',
        marginBottom: theme.spacing(0.5),
      },
      '& p': {
        color: theme.palette.text.secondary,
      },
    },
  },

  // Metric cards
  metricCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    padding: theme.spacing(2),
    border: 'none',
    position: 'relative',
    boxShadow: 'none',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '3px',
    },
    '& .MuiCardContent-root': {
      padding: theme.spacing(2),
      paddingLeft: theme.spacing(3),
    },
    '& .metric-icon': {
      marginBottom: theme.spacing(1),
      opacity: 0.7,
      color: 'inherit',
    },
    '& .metric-value': {
      fontSize: '2.5rem',
      fontWeight: 500,
      marginBottom: theme.spacing(0.5),
      color: theme.palette.text.primary,
    },
    '& .metric-label': {
      color: theme.palette.text.secondary,
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
    // Variant styles
    '&.metric-total': {
      '&::before': {
        backgroundColor: theme.palette.grey[600],
      },
    },
    '&.metric-good': {
      '&::before': {
        backgroundColor: '#4CAF50',
      },
    },
    '&.metric-maintenance': {
      '&::before': {
        backgroundColor: '#FF9800',
      },
    },
    '&.metric-pending': {
      '&::before': {
        backgroundColor: '#2196F3',
      },
    },
    '&.metric-overdue': {
      '&::before': {
        backgroundColor: '#F44336',
      },
    },
  },

  // Property category chart
  categoryChart: {
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    padding: theme.spacing(3),
    height: '100%',
    '& .chart-title': {
      marginBottom: theme.spacing(3),
      fontSize: '1.1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
    '& .chart-container': {
      height: 300,
      marginBottom: theme.spacing(2),
    },
    '& .chart-legend': {
      marginTop: theme.spacing(3),
      '& .legend-item': {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1.5),
        marginBottom: theme.spacing(1),
        '& .legend-color': {
          width: 12,
          height: 12,
        },
      },
    },
  },

  // Critical items table
  criticalItems: {
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    '& .MuiTableHead-root': {
      backgroundColor: '#141414',
      '& .MuiTableCell-head': {
        color: theme.palette.text.secondary,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(1.5, 2),
      },
    },
    '& .MuiTableCell-root': {
      borderBottom: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1.5, 2),
    },
    '& .MuiTableRow-root': {
      '&:hover': {
        backgroundColor: '#202020',
      },
    },
    '& .status-chip': {
      borderRadius: 0,
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      fontWeight: 500,
    },
  },

  // Recent Activity table
  recentActivity: {
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    marginTop: theme.spacing(3),
    '& .activity-header': {
      padding: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.divider}`,
      '& h6': {
        fontSize: '1.1rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      },
    },
    '& .MuiTable-root': {
      tableLayout: 'fixed',
    },
    '& .MuiTableHead-root': {
      backgroundColor: '#141414',
      '& .MuiTableCell-head': {
        color: theme.palette.text.secondary,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        padding: theme.spacing(1.5, 2),
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },
    '& .MuiTableCell-root': {
      padding: theme.spacing(1.5, 2),
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      borderBottom: `1px solid ${theme.palette.divider}`,
      '&:last-child': {
        paddingRight: theme.spacing(3),
      },
    },
    '& .MuiTableRow-root': {
      '&:hover': {
        backgroundColor: '#202020',
      },
      '&:last-child .MuiTableCell-root': {
        borderBottom: 'none',
      },
    },
  },

  // Notifications panel
  notifications: {
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    marginBottom: theme.spacing(3),
    '& .notification-header': {
      padding: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.divider}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    '& .notification-item': {
      padding: theme.spacing(2),
      borderLeft: '3px solid transparent',
      borderBottom: `1px solid ${theme.palette.divider}`,
      '&:hover': {
        backgroundColor: '#202020',
      },
      '&:last-child': {
        borderBottom: 'none',
      },
      '&.priority-high': {
        borderLeftColor: theme.palette.error.main,
      },
      '&.priority-medium': {
        borderLeftColor: theme.palette.warning.main,
      },
      '&.priority-low': {
        borderLeftColor: theme.palette.info.main,
      },
    },
    '& .notification-title': {
      fontSize: '1.1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },

  // Personnel Overview section
  personnelOverview: {
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    padding: theme.spacing(2),
    '& .overview-header': {
      marginBottom: theme.spacing(3),
      '& h6': {
        fontSize: '1.1rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      },
    },
    '& .stat-item': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing(1.5, 0),
      borderBottom: `1px solid ${theme.palette.divider}`,
      '&:last-child': {
        borderBottom: 'none',
      },
      '& .stat-label': {
        color: theme.palette.text.secondary,
      },
      '& .stat-value': {
        fontSize: '1.1rem',
        fontWeight: 500,
        '&.success': { color: '#4CAF50' },
        '&.warning': { color: '#FF9800' },
        '&.error': { color: '#F44336' },
      },
    },
    '& .view-details': {
      marginTop: theme.spacing(2),
      textAlign: 'right',
      '& a': {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        fontSize: '0.875rem',
        '&:hover': {
          textDecoration: 'underline',
        },
      },
    },
  },
}); 