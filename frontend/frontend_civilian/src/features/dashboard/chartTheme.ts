import { colors } from '../../styles/theme/colors';
import { alpha } from '@mui/material/styles';

export const chartTheme = {
  // Common chart colors
  colors: {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    background: colors.background.paper,
    divider: alpha(colors.primary, 0.1),
  },

  // Common chart dimensions
  dimensions: {
    margin: {
      top: 20,
      right: 30,
      bottom: 20,
      left: 30,
    },
    height: {
      small: 200,
      medium: 300,
      large: 400,
    },
    padding: {
      small: 8,
      medium: 16,
      large: 24,
    },
  },

  // Common chart styles
  styles: {
    // Grid styles
    grid: {
      strokeDasharray: '3 3',
      stroke: alpha(colors.primary, 0.1),
    },

    // Axis styles
    axis: {
      stroke: colors.text.secondary,
      fontSize: 12,
      tickLine: false,
    },

    // Tooltip styles
    tooltip: {
      contentStyle: {
        backgroundColor: colors.background.paper,
        border: `1px solid ${alpha(colors.primary, 0.1)}`,
        borderRadius: 4,
        padding: '8px 12px',
        boxShadow: `0 2px 8px ${alpha(colors.primary, 0.1)}`,
      },
      labelStyle: {
        color: colors.text.primary,
        fontWeight: 600,
        marginBottom: 4,
      },
      itemStyle: {
        color: colors.text.secondary,
        padding: '4px 0',
      },
    },

    // Legend styles
    legend: {
      wrapperStyle: {
        padding: 16,
      },
      itemStyle: {
        color: colors.text.secondary,
      },
    },

    // Line chart specific styles
    line: {
      strokeWidth: 2,
      dot: {
        radius: 4,
        activeRadius: 6,
      },
    },

    // Bar chart specific styles
    bar: {
      radius: 4,
      maxBarSize: 50,
    },

    // Pie chart specific styles
    pie: {
      innerRadius: '50%',
      outerRadius: '80%',
      cornerRadius: 4,
      padAngle: 2,
      label: {
        fontSize: 12,
        fill: colors.text.secondary,
      },
    },
  },

  // Animation configuration
  animation: {
    duration: 300,
    easing: 'ease-in-out',
  },
};

export default chartTheme;
