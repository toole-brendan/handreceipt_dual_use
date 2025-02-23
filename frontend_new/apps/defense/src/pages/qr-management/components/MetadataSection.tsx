import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Grid,
} from '@mui/material';
import type { MetadataField } from '../types';

interface Props {
  metadata: MetadataField;
  onChange: (metadata: MetadataField) => void;
}

export const MetadataSection: React.FC<Props> = ({ metadata, onChange }) => {
  const handleCheckboxChange = (field: keyof Omit<MetadataField, 'conditionNotes' | 'customField'>) => {
    onChange({
      ...metadata,
      [field]: !metadata[field],
    });
  };

  const handleConditionNotesChange = (value: string) => {
    onChange({
      ...metadata,
      conditionNotes: value,
    });
  };

  const handleCustomFieldChange = (type: 'label' | 'value', value: string) => {
    onChange({
      ...metadata,
      customField: {
        ...metadata.customField,
        [type]: value,
      },
    });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Metadata to Include (Uploaded to Blockchain on Scan)
      </Typography>
      <FormGroup>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={metadata.serialNumber}
                  onChange={() => handleCheckboxChange('serialNumber')}
                />
              }
              label="Serial Number"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={metadata.currentStatus}
                  onChange={() => handleCheckboxChange('currentStatus')}
                />
              }
              label="Current Status"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={metadata.location}
                  onChange={() => handleCheckboxChange('location')}
                />
              }
              label="Location"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={metadata.assignedUser}
                  onChange={() => handleCheckboxChange('assignedUser')}
                />
              }
              label="Assigned User"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={metadata.timestamp}
                  onChange={() => handleCheckboxChange('timestamp')}
                />
              }
              label="Timestamp of Scan"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Condition Notes"
              multiline
              rows={2}
              value={metadata.conditionNotes || ''}
              onChange={(e) => handleConditionNotesChange(e.target.value)}
              placeholder="Enter condition notes (optional)"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Custom Field (Optional)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Label"
                  value={metadata.customField?.label || ''}
                  onChange={(e) => handleCustomFieldChange('label', e.target.value)}
                  placeholder="Enter field label"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Value"
                  value={metadata.customField?.value || ''}
                  onChange={(e) => handleCustomFieldChange('value', e.target.value)}
                  placeholder="Enter field value"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </FormGroup>
    </Box>
  );
}; 