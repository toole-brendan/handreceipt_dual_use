import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import { Package, Truck, History, Shield } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface ReportTypeCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const reportTypes: ReportTypeCard[] = [
  {
    title: 'Inventory Reports',
    description: 'View detailed reports on inventory levels, stock movements, and product availability across locations.',
    icon: <Package size={24} />,
    path: ROUTES.REPORTS.INVENTORY,
  },
  {
    title: 'Shipment Reports',
    description: 'Track and analyze shipment data, delivery performance, and logistics metrics.',
    icon: <Truck size={24} />,
    path: ROUTES.REPORTS.SHIPMENTS,
  },
  {
    title: 'Provenance Reports',
    description: 'Monitor product origin, chain of custody, and blockchain-verified tracking data.',
    icon: <History size={24} />,
    path: ROUTES.REPORTS.PROVENANCE,
  },
  {
    title: 'Compliance Reports',
    description: 'Review regulatory compliance, audit trails, and certification status.',
    icon: <Shield size={24} />,
    path: ROUTES.REPORTS.COMPLIANCE,
  },
];

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1" paragraph>
          Select a report type below to view detailed information and generate custom reports.
          Each report type provides specific insights and can be customized with filters and fields
          to match your requirements.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {reportTypes.map((reportType) => (
          <Grid item xs={12} sm={6} key={reportType.path}>
            <Card>
              <CardActionArea onClick={() => navigate(reportType.path)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ mr: 2, color: 'primary.main' }}>
                      {reportType.icon}
                    </Box>
                    <Typography variant="h6" component="div">
                      {reportType.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {reportType.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportsPage;
