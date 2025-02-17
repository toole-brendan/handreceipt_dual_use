import React from 'react';
import { Box, Typography, Grid, Button, TextField } from '@mui/material';
import { MessageCircle, Phone, Mail, FileQuestion } from 'lucide-react';
import DashboardCard from '@/components/common/DashboardCard';

const Support: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Contact Support
      </Typography>

      <Grid container spacing={3}>
        {/* Contact Options */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <DashboardCard title="Live Chat">
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <MessageCircle size={40} style={{ marginBottom: '16px' }} />
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Chat with our support team in real-time for immediate assistance.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'background.paper',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    Start Chat
                  </Button>
                </Box>
              </DashboardCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <DashboardCard title="Phone Support">
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Phone size={40} style={{ marginBottom: '16px' }} />
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Call us directly for urgent issues or complex inquiries.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'background.paper',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    +1 (800) 123-4567
                  </Button>
                </Box>
              </DashboardCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <DashboardCard title="Email Support">
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Mail size={40} style={{ marginBottom: '16px' }} />
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Send us a detailed message and we'll respond within 24 hours.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'background.paper',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    Send Email
                  </Button>
                </Box>
              </DashboardCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Support Ticket Form */}
        <Grid item xs={12} md={8}>
          <DashboardCard title="Create Support Ticket">
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    placeholder="Brief description of your issue"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Category"
                    defaultValue=""
                    variant="outlined"
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="technical">Technical Issue</option>
                    <option value="account">Account Management</option>
                    <option value="billing">Billing</option>
                    <option value="feature">Feature Request</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    placeholder="Please provide as much detail as possible"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'background.paper',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    Submit Ticket
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </DashboardCard>
        </Grid>

        {/* FAQ Section */}
        <Grid item xs={12} md={4}>
          <DashboardCard title="Frequently Asked Questions">
            <Box sx={{ p: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Popular Topics
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  <Typography variant="body2" component="li" color="text.secondary">
                    Getting Started Guide
                  </Typography>
                  <Typography variant="body2" component="li" color="text.secondary">
                    Account Setup
                  </Typography>
                  <Typography variant="body2" component="li" color="text.secondary">
                    Blockchain Integration
                  </Typography>
                  <Typography variant="body2" component="li" color="text.secondary">
                    API Documentation
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<FileQuestion />}
                sx={{ mb: 2 }}
              >
                View All FAQs
              </Button>

              <Typography variant="body2" color="text.secondary" align="center">
                Can't find what you're looking for?
                <br />
                Contact our support team.
              </Typography>
            </Box>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Support;
