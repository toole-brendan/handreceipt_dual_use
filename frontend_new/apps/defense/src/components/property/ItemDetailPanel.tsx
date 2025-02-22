import React from 'react';
import {
  Box,
  Card,
  Tabs,
  Tab,
  Stack,
  Typography,
  Link,
  Divider,
} from '@mui/material';
import { Timeline } from '@shared/components/layout/timeline';
import { StatusChip } from '@shared/components/common/mui/StatusChip';
import { mapPropertyStatusToChipStatus, getStatusLabel } from '../../utils/statusMapping';
import { useProperty } from '../../hooks/useProperty';
import type { CustodyEvent, MaintenanceLog, InspectionChecklist, Attachment } from '../../types/property';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`item-detail-tabpanel-${index}`}
      aria-labelledby={`item-detail-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const ItemDetailPanel: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const {
    selectedItem,
    selectedItemDetails,
  } = useProperty();

  if (!selectedItem || !selectedItemDetails) {
    return null;
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderCustodyHistory = () => (
    <Timeline>
      {selectedItemDetails.custodyHistory.map((event: CustodyEvent) => (
        <Timeline.Item key={event.id}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                {new Date(event.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="body1">
                Transfer from {event.fromUser.rank} {event.fromUser.name} to{' '}
                {event.toUser.rank} {event.toUser.name}
              </Typography>
              {event.location && (
                <Typography variant="body2" color="text.secondary">
                  Location: {event.location}
                </Typography>
              )}
              <Link
                href={`https://explorer.blockchain.mil/tx/${event.blockchainTxId}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: '0.875rem' }}
              >
                View on Blockchain
              </Link>
            </Stack>
          </Box>
        </Timeline.Item>
      ))}
    </Timeline>
  );

  const renderMaintenanceLogs = () => (
    <Stack spacing={2}>
      {selectedItemDetails.maintenanceLogs.map((log: MaintenanceLog) => (
        <Card key={log.id} sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1">{log.type}</Typography>
            <Typography variant="body2" color="text.secondary">
              Date: {new Date(log.date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2">
              Technician: {log.technician.name}
              {log.technician.certificationNumber && ` (Cert #${log.technician.certificationNumber})`}
            </Typography>
            <Typography variant="body2">{log.description}</Typography>
            {log.partsReplaced && log.partsReplaced.length > 0 && (
              <>
                <Typography variant="body2">Parts Replaced:</Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {log.partsReplaced.map((part: string, index: number) => (
                    <li key={index}>{part}</li>
                  ))}
                </ul>
              </>
            )}
            <Link
              href={`https://explorer.blockchain.mil/tx/${log.blockchainTxId}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '0.875rem' }}
            >
              View on Blockchain
            </Link>
          </Stack>
        </Card>
      ))}
    </Stack>
  );

  const renderInspectionChecklists = () => (
    <Stack spacing={2}>
      {selectedItemDetails.inspectionChecklists.map((checklist: InspectionChecklist) => (
        <Card key={checklist.id} sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1">{checklist.type}</Typography>
            <Typography variant="body2" color="text.secondary">
              Date: {new Date(checklist.date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2">
              Inspector: {checklist.inspector.rank} {checklist.inspector.name}
            </Typography>
            <StatusChip
              status={checklist.status === 'PASS' ? 'verified' : checklist.status === 'CONDITIONAL' ? 'pending' : 'sensitive'}
              label={checklist.status}
            />
            <Typography variant="body2">Findings:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {checklist.findings.map((finding: string, index: number) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
            <Link
              href={`https://explorer.blockchain.mil/tx/${checklist.blockchainTxId}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '0.875rem' }}
            >
              View on Blockchain
            </Link>
          </Stack>
        </Card>
      ))}
    </Stack>
  );

  const renderAttachments = () => (
    <Stack spacing={2}>
      {selectedItemDetails.attachments.map((attachment: Attachment) => (
        <Card key={attachment.id} sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1">{attachment.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Type: {attachment.type.replace('_', ' ')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Uploaded: {new Date(attachment.uploadDate).toLocaleDateString()} by{' '}
              {attachment.uploadedBy.rank} {attachment.uploadedBy.name}
            </Typography>
            <Link href={attachment.url} target="_blank" rel="noopener noreferrer">
              View Document
            </Link>
          </Stack>
        </Card>
      ))}
    </Stack>
  );

  return (
    <Card>
      {/* Item Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={3}>
            {/* Item Image/Placeholder */}
            <Box
              sx={{
                width: 200,
                height: 200,
                borderRadius: 1,
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                typography: 'body2',
                flexShrink: 0,
              }}
            >
              {selectedItem.nomenclature}
            </Box>

            {/* Item Details */}
            <Stack spacing={2} flex={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack spacing={1}>
                  <Typography variant="h5">{selectedItem.nomenclature}</Typography>
                  <Typography variant="body1">NSN: {selectedItem.nsn}</Typography>
                  <Typography variant="body1">Serial Number: {selectedItem.serialNumber}</Typography>
                  <Typography variant="body1">LIN: {selectedItem.lin}</Typography>
                </Stack>
                <StatusChip
                  status={mapPropertyStatusToChipStatus(selectedItem.status)}
                  label={getStatusLabel(selectedItem.status)}
                />
              </Stack>
              <Link
                href={`https://explorer.blockchain.mil/tx/${selectedItem.blockchainTxId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Current Assignment on Blockchain
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Custody History" />
          <Tab label="Maintenance Logs" />
          <Tab label="Inspection Checklists" />
          <Tab label="Attachments" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {renderCustodyHistory()}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderMaintenanceLogs()}
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        {renderInspectionChecklists()}
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        {renderAttachments()}
      </TabPanel>
    </Card>
  );
};
