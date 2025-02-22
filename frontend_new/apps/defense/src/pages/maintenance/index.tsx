import React from 'react';
import './maintenance.css';
import { Box, Button, Grid, Paper, Card, Stack, Typography } from '@mui/material';
import { MetricsChart, StatusDistribution } from '@shared/components/common/charts';
import { Timeline } from '@shared/components/layout/timeline';
import { Form, FormField, FormActions } from '@shared/components/forms/form';
import { StatusChip } from '@shared/components/common/mui/StatusChip';

// Sample data for charts
const upcomingData = [
  { label: 'This Week', value: 12, category: 'Upcoming' },
  { label: 'Next Week', value: 8, category: 'Upcoming' },
];

const readinessData = [
  { label: 'Current', value: 78, category: 'FMC', trend: 'up' as const },
  { label: 'Previous', value: 72, category: 'FMC', trend: 'up' as const },
];

const costsData = [
  { label: 'Oct 2023', value: 24560, category: 'Costs' },
  { label: 'Sep 2023', value: 21300, category: 'Costs' },
];

const workOrdersData = [
  { status: 'Critical', count: 3, color: '#FF3B3B' },
  { status: 'Urgent', count: 5, color: '#FFD700' },
  { status: 'Routine', count: 8, color: '#4CAF50' },
];

const complianceData = [
  { status: 'Pass', count: 92, color: '#4CAF50' },
  { status: 'Review', count: 8, color: '#FFD700' },
];

const MaintenancePage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Stack spacing={3}>
        {/* Header Section */}
        <Box>
          <Typography variant="h4" gutterBottom>Maintenance & Inspections</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary">Schedule Inspection</Button>
            <Button variant="outlined">Report Issue</Button>
            <Button variant="outlined">Request Parts</Button>
            <Button variant="outlined">Export Logs (DA 2404)</Button>
            <Button variant="contained" color="primary">QR Scan</Button>
          </Stack>
        </Box>

        {/* Status Summary Cards */}
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Upcoming Deadlines</Typography>
                <Typography variant="h4" color="warning.main">12</Typography>
                <Typography variant="subtitle1">Due This Week</Typography>
                <MetricsChart 
                  data={upcomingData}
                  title="Upcoming Inspections"
                  height={200}
                />
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Equipment Readiness</Typography>
                <Typography variant="h4" color="success.main">78%</Typography>
                <Typography variant="subtitle1">FMC</Typography>
                <MetricsChart 
                  data={readinessData}
                  title="Equipment Readiness Trend"
                  height={200}
                />
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Maintenance Costs</Typography>
                <Typography variant="h4" color="info.main">$24,560</Typography>
                <Typography variant="subtitle1">Oct 2023</Typography>
                <MetricsChart 
                  data={costsData}
                  title="Monthly Maintenance Costs"
                  height={200}
                />
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Open Work Orders</Typography>
                <Typography variant="h4" color="error.main">3</Typography>
                <Typography variant="subtitle1">Critical</Typography>
                <StatusDistribution 
                  data={workOrdersData}
                  title="Work Order Distribution"
                  height={200}
                />
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Inspection Calendar */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Inspection Schedule</Typography>
          {/* TODO: Add Gantt chart component */}
        </Paper>

        {/* Equipment Inspection Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Equipment Status</Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>NSN/Nomenclature</th>
                  <th>Last Inspection</th>
                  <th>Next Due</th>
                  <th>Status</th>
                  <th>Custodian</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>M2HB MG</td>
                  <td>2023-09-15</td>
                  <td>2023-10-20</td>
                  <td><StatusChip status="pending" label="PMC" /></td>
                  <td>PV2 Diaz</td>
                  <td>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined">View History</Button>
                      <Button size="small" variant="contained" color="error">Flag</Button>
                    </Stack>
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
        </Paper>

        {/* Work Order Panel */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Maintenance Work Orders</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <StatusChip status="sensitive" label="Critical" />
                  <Typography variant="h6">M1151 HMMWV - Engine Knock</Typography>
                  <Typography variant="body2" color="text.secondary">Status: Awaiting Parts</Typography>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <StatusChip status="pending" label="Urgent" />
                  <Typography variant="h6">AN/PRC-163 Radio - Antenna Fault</Typography>
                  <Typography variant="body2" color="text.secondary">Status: In Progress</Typography>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Issue Reporting Widget */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Report New Issue</Typography>
          <Form onSubmit={() => {}}>
            <FormField name="equipment" label="Equipment">
              <select>
                <option value="">Select Equipment</option>
                {/* TODO: Add equipment options */}
              </select>
            </FormField>
            <FormField name="faultType" label="Fault Type">
              <select>
                <option value="">Select Fault Type</option>
                <option value="mechanical">Mechanical</option>
                <option value="electronic">Electronic</option>
                <option value="structural">Structural</option>
              </select>
            </FormField>
            <FormField name="description" label="Description">
              <textarea rows={4} />
            </FormField>
            <FormActions>
              <Button variant="contained" color="primary" type="submit">Submit Report</Button>
            </FormActions>
          </Form>
        </Paper>

        {/* Maintenance History Timeline */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Maintenance History</Typography>
          <Timeline>
            <Timeline.Item>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">2023-09-15</Typography>
                  <Typography variant="subtitle1">AN/PVS-14 Night Vision Service</Typography>
                  <Typography variant="body2">TM 11-5855-308-20-1 Service Completed</Typography>
                  <StatusChip status="verified" label="Complete" />
                </Stack>
              </Box>
            </Timeline.Item>
            {/* TODO: Add more timeline items */}
          </Timeline>
        </Paper>

        {/* Compliance Dashboard */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Regulatory Alerts</Typography>
                <Typography variant="body2">TM 9-1010-257-10 Update Effective 2024-01-01</Typography>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Inspection Pass Rate</Typography>
                <StatusDistribution 
                  data={complianceData}
                  title="Inspection Pass Rate"
                  height={200}
                />
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Audit Prep Checklist</Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  <li>Verify 100% of NVG logs updated</li>
                  <li>Complete monthly PMCS records</li>
                  <li>Update DA Form 5988-E</li>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default MaintenancePage;
