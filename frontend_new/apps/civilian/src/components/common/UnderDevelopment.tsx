import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Construction } from 'lucide-react';
import { colors } from '../../styles/theme/colors';

interface UnderDevelopmentProps {
  pageName: string;
}

const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({ pageName }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Construction 
          size={48} 
          style={{ 
            color: colors.warning,
            marginBottom: '16px'
          }} 
        />
        <Typography variant="h5" gutterBottom>
          {pageName}
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}
        >
          This page is currently under development. Our team is working hard to bring you a comprehensive pharmaceutical supply chain tracking solution.
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: colors.text.disabled,
            maxWidth: 500,
            mx: 'auto'
          }}
        >
          Check back soon for updates, or contact support if you need immediate assistance with this feature.
        </Typography>
      </Paper>
    </Box>
  );
};

export default UnderDevelopment;
