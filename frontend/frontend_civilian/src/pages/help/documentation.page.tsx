import React from 'react';
import { Box, Typography, Grid, TextField, InputAdornment, Divider } from '@mui/material';
import { Search, Lock } from 'lucide-react';
import DashboardCard from '@/components/common/DashboardCard';
import { BlockchainDiagramWithDescription } from '@/components/common/BlockchainDiagram';

const Documentation: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Documentation
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <DashboardCard title="Search Documentation">
          <TextField
            fullWidth
            placeholder="Search for guides, tutorials, and FAQs..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              }
            }}
          />
        </DashboardCard>
      </Box>

      {/* Blockchain Overview */}
      <Box sx={{ mb: 3 }}>
        <DashboardCard title="Understanding Blockchain Technology">
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" paragraph>
              Our platform uses blockchain technology to ensure the authenticity and traceability of every product
              in your supply chain. Each transaction, from product creation to delivery, is recorded on an immutable
              blockchain ledger.
            </Typography>
            
            <BlockchainDiagramWithDescription blocks={5} />

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Key Benefits
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Lock size={20} />
                      <Typography variant="subtitle2">Immutability</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Once recorded, data cannot be altered or tampered with.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Lock size={20} />
                      <Typography variant="subtitle2">Transparency</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Complete visibility into product history and chain of custody.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Lock size={20} />
                      <Typography variant="subtitle2">Verification</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Cryptographic proof of authenticity for every transaction.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DashboardCard>
      </Box>

      <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      <Grid container spacing={3}>
        {/* Getting Started */}
        <Grid item xs={12} md={6}>
          <DashboardCard title="Getting Started">
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Start Guide
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                <Typography variant="body2" component="li" color="text.secondary">
                  System Overview
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  First-time Setup
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Basic Navigation
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Key Features
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Basic Tutorials
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography variant="body2" component="li" color="text.secondary">
                  Creating Your First Product
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Managing Inventory
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Creating Shipments
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Generating Reports
                </Typography>
              </Box>
            </Box>
          </DashboardCard>
        </Grid>

        {/* Feature Guides */}
        <Grid item xs={12} md={6}>
          <DashboardCard title="Feature Guides">
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Inventory Management
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                <Typography variant="body2" component="li" color="text.secondary">
                  Stock Level Tracking
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Location Management
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Inventory Optimization
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Blockchain Features
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography variant="body2" component="li" color="text.secondary">
                  Understanding Provenance
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Transaction Verification
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Smart Contract Integration
                </Typography>
              </Box>
            </Box>
          </DashboardCard>
        </Grid>

        {/* Advanced Topics */}
        <Grid item xs={12} md={6}>
          <DashboardCard title="Advanced Topics">
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                System Administration
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                <Typography variant="body2" component="li" color="text.secondary">
                  User Management
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Permission Settings
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  System Configuration
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Integration Guides
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography variant="body2" component="li" color="text.secondary">
                  API Documentation
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Webhook Setup
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Third-party Integrations
                </Typography>
              </Box>
            </Box>
          </DashboardCard>
        </Grid>

        {/* Troubleshooting */}
        <Grid item xs={12} md={6}>
          <DashboardCard title="Troubleshooting">
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Common Issues
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                <Typography variant="body2" component="li" color="text.secondary">
                  Connection Problems
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Sync Issues
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Transaction Errors
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Best Practices
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography variant="body2" component="li" color="text.secondary">
                  Performance Optimization
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Security Guidelines
                </Typography>
                <Typography variant="body2" component="li" color="text.secondary">
                  Data Backup
                </Typography>
              </Box>
            </Box>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Documentation;
