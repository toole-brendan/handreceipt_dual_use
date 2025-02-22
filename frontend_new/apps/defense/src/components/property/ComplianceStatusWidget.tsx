import React from 'react';
import {
  Box,
  Card,
  Stack,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useProperty } from '../../hooks/useProperty';
import type { MissingDocument } from '../../types/property';

const ComplianceProgress: React.FC<{
  label: string;
  completed: number;
  total: number;
}> = ({ label, completed, total }) => {
  const percentage = Math.round((completed / total) * 100);
  const color = percentage >= 90 ? 'success' : percentage >= 70 ? 'warning' : 'error';

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" color={`${color}.main`}>
          {completed}/{total} ({percentage}%)
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Box>
  );
};

export const ComplianceStatusWidget: React.FC = () => {
  const { complianceStatus } = useProperty();

  const getStatusIcon = (dueDate: string) => {
    const daysUntilDue = Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) {
      return <WarningIcon color="error" />;
    } else if (daysUntilDue < 7) {
      return <ScheduleIcon color="warning" />;
    } else {
      return <CheckCircleIcon color="success" />;
    }
  };

  return (
    <Card>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Typography variant="h6">Compliance Status</Typography>

        {/* Progress Indicators */}
        <Stack spacing={2}>
          <ComplianceProgress
            label="Items Inspected"
            completed={complianceStatus.itemsInspected.completed}
            total={complianceStatus.itemsInspected.total}
          />
          <ComplianceProgress
            label="Training Certifications"
            completed={complianceStatus.trainingCertifications.completed}
            total={complianceStatus.trainingCertifications.total}
          />
        </Stack>

        {/* Missing Documents */}
        {complianceStatus.missingDocuments.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Missing Documents
            </Typography>
            <List>
              {complianceStatus.missingDocuments.map((doc: MissingDocument) => (
                <ListItem key={`${doc.itemId}-${doc.documentType}`} disablePadding>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getStatusIcon(doc.dueDate)}
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.documentType}
                    secondary={`Due: ${new Date(doc.dueDate).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Compliance Tips */}
        <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Compliance Tips
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Keep inspections up to date"
                secondary="Schedule inspections at least 1 week before due date"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Maintain accurate documentation"
                secondary="All transfers must have signed DA Form 2062"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Report discrepancies immediately"
                secondary="Use the Quick Transfer module for custody changes"
              />
            </ListItem>
          </List>
        </Box>
      </Stack>
    </Card>
  );
};
