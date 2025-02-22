import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import { Download, Mail, Clock, Plus } from 'lucide-react';

export type ExportFormat = 'csv' | 'excel' | 'pdf';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';

interface ScheduledReport {
  id: string;
  frequency: ScheduleFrequency;
  recipients: string[];
  nextRun: string;
}

interface ReportExportOptionsProps {
  onExport: (format: ExportFormat) => void;
  onSchedule: (frequency: ScheduleFrequency, recipients: string[]) => void;
  scheduledReports: ScheduledReport[];
  onDeleteScheduledReport: (id: string) => void;
}

const ReportExportOptions: React.FC<ReportExportOptionsProps> = ({
  onExport,
  onSchedule,
  scheduledReports,
  onDeleteScheduledReport
}) => {
  const [frequency, setFrequency] = useState<ScheduleFrequency>('weekly');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState('');

  const handleAddRecipient = () => {
    if (newRecipient && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSchedule = () => {
    if (recipients.length > 0) {
      onSchedule(frequency, recipients);
      setRecipients([]);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Export Options */}
      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Export Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Download the report in your preferred format
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Download size={18} />}
              onClick={() => onExport('csv')}
            >
              CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download size={18} />}
              onClick={() => onExport('excel')}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download size={18} />}
              onClick={() => onExport('pdf')}
            >
              PDF
            </Button>
          </Stack>
        </Paper>
      </Grid>

      {/* Schedule Report */}
      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Schedule Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set up automated report delivery
          </Typography>

          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Frequency</InputLabel>
              <Select
                value={frequency}
                label="Frequency"
                onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Recipients
              </Typography>
              <Box sx={{ mb: 1 }}>
                {recipients.map((email) => (
                  <Chip
                    key={email}
                    label={email}
                    onDelete={() => handleRemoveRecipient(email)}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Enter email address"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                  fullWidth
                />
                <span>
                  <Button
                    variant="outlined"
                    onClick={handleAddRecipient}
                    disabled={!newRecipient}
                  >
                    <Plus size={18} />
                  </Button>
                </span>
              </Box>
            </Box>

            <span>
              <Button
                variant="contained"
                startIcon={<Clock size={18} />}
                onClick={handleSchedule}
                disabled={recipients.length === 0}
                fullWidth
              >
                Schedule Report
              </Button>
            </span>
          </Stack>
        </Paper>
      </Grid>

      {/* Scheduled Reports */}
      {scheduledReports.length > 0 && (
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Scheduled Reports
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {scheduledReports.map((report) => (
                <Grid item xs={12} md={6} key={report.id}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, bgcolor: 'background.default' }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">
                        {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)} Report
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => onDeleteScheduledReport(report.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Next run: {new Date(report.nextRun).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {report.recipients.map((email) => (
                        <Chip
                          key={email}
                          label={email}
                          size="small"
                          icon={<Mail size={14} />}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};

export default ReportExportOptions;
