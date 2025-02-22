import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import { Plus, Minus, FileText, Download } from 'lucide-react';
import type { MaintenanceTask, DA2404FormData } from '../../types';

interface GenerateDA2404ModalProps {
  open: boolean;
  task: MaintenanceTask | null;
  onClose: () => void;
  onGenerate: (data: DA2404FormData) => void;
}

export const GenerateDA2404Modal: React.FC<GenerateDA2404ModalProps> = ({
  open,
  task,
  onClose,
  onGenerate,
}) => {
  const [formData, setFormData] = useState<DA2404FormData>({
    organizationName: task?.requestedBy.unit || '',
    nomenclature: task?.equipment.name || '',
    registrationNumber: task?.equipment.serialNumber || '',
    miles: 0,
    hours: 0,
    date: new Date().toISOString().split('T')[0],
    inspectedBy: {
      name: '',
      rank: '',
    },
    approvedBy: {
      name: '',
      rank: '',
    },
    deficiencies: [],
    shortcomings: [],
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePersonnelChange = (
    type: 'inspectedBy' | 'approvedBy',
    field: 'name' | 'rank',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleAddDeficiency = () => {
    setFormData((prev) => ({
      ...prev,
      deficiencies: [
        ...prev.deficiencies,
        {
          item: '',
          deficiency: '',
          correctedBy: '',
          supervisorInitials: '',
        },
      ],
    }));
  };

  const handleRemoveDeficiency = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deficiencies: prev.deficiencies.filter((_, i) => i !== index),
    }));
  };

  const handleDeficiencyChange = (
    index: number,
    field: keyof typeof formData.deficiencies[0],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      deficiencies: prev.deficiencies.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddShortcoming = () => {
    setFormData((prev) => ({
      ...prev,
      shortcomings: [
        ...prev.shortcomings,
        {
          item: '',
          shortcoming: '',
          correctedBy: '',
          supervisorInitials: '',
        },
      ],
    }));
  };

  const handleRemoveShortcoming = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      shortcomings: prev.shortcomings.filter((_, i) => i !== index),
    }));
  };

  const handleShortcomingChange = (
    index: number,
    field: keyof typeof formData.shortcomings[0],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      shortcomings: prev.shortcomings.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  if (!task) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FileText size={24} />
          <Typography variant="h6" component="div">
            Generate DA Form 2404
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" paragraph>
          Equipment Inspection and Maintenance Worksheet (DA Form 2404)
        </Typography>

        <Grid container spacing={3}>
          {/* Header Information */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Organization"
              required
              fullWidth
              value={formData.organizationName}
              onChange={(e) => handleChange('organizationName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date"
              type="date"
              required
              fullWidth
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nomenclature"
              required
              fullWidth
              value={formData.nomenclature}
              onChange={(e) => handleChange('nomenclature', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Registration Number"
              required
              fullWidth
              value={formData.registrationNumber}
              onChange={(e) => handleChange('registrationNumber', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Miles"
              type="number"
              required
              fullWidth
              value={formData.miles}
              onChange={(e) => handleChange('miles', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Hours"
              type="number"
              required
              fullWidth
              value={formData.hours}
              onChange={(e) => handleChange('hours', parseInt(e.target.value))}
            />
          </Grid>

          {/* Personnel Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Personnel
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Inspected By
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Name"
                    required
                    fullWidth
                    value={formData.inspectedBy.name}
                    onChange={(e) =>
                      handlePersonnelChange('inspectedBy', 'name', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Rank"
                    required
                    fullWidth
                    value={formData.inspectedBy.rank}
                    onChange={(e) =>
                      handlePersonnelChange('inspectedBy', 'rank', e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Approved By
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Name"
                    required
                    fullWidth
                    value={formData.approvedBy.name}
                    onChange={(e) =>
                      handlePersonnelChange('approvedBy', 'name', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Rank"
                    required
                    fullWidth
                    value={formData.approvedBy.rank}
                    onChange={(e) =>
                      handlePersonnelChange('approvedBy', 'rank', e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Deficiencies */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography variant="subtitle2">Deficiencies</Typography>
              <Button
                startIcon={<Plus size={16} />}
                onClick={handleAddDeficiency}
                size="small"
              >
                Add Deficiency
              </Button>
            </Box>
            <List>
              {formData.deficiencies.map((deficiency, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      mb: 2,
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle2">
                        Deficiency #{index + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveDeficiency(index)}
                      >
                        <Minus size={16} />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Item Number"
                          required
                          fullWidth
                          value={deficiency.item}
                          onChange={(e) =>
                            handleDeficiencyChange(index, 'item', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Deficiency"
                          required
                          fullWidth
                          multiline
                          rows={2}
                          value={deficiency.deficiency}
                          onChange={(e) =>
                            handleDeficiencyChange(
                              index,
                              'deficiency',
                              e.target.value
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Corrected By"
                          fullWidth
                          value={deficiency.correctedBy}
                          onChange={(e) =>
                            handleDeficiencyChange(
                              index,
                              'correctedBy',
                              e.target.value
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Supervisor Initials"
                          fullWidth
                          value={deficiency.supervisorInitials}
                          onChange={(e) =>
                            handleDeficiencyChange(
                              index,
                              'supervisorInitials',
                              e.target.value
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Grid>

          {/* Shortcomings */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography variant="subtitle2">Shortcomings</Typography>
              <Button
                startIcon={<Plus size={16} />}
                onClick={handleAddShortcoming}
                size="small"
              >
                Add Shortcoming
              </Button>
            </Box>
            <List>
              {formData.shortcomings.map((shortcoming, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      mb: 2,
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle2">
                        Shortcoming #{index + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveShortcoming(index)}
                      >
                        <Minus size={16} />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Item Number"
                          required
                          fullWidth
                          value={shortcoming.item}
                          onChange={(e) =>
                            handleShortcomingChange(index, 'item', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Shortcoming"
                          required
                          fullWidth
                          multiline
                          rows={2}
                          value={shortcoming.shortcoming}
                          onChange={(e) =>
                            handleShortcomingChange(
                              index,
                              'shortcoming',
                              e.target.value
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Corrected By"
                          fullWidth
                          value={shortcoming.correctedBy}
                          onChange={(e) =>
                            handleShortcomingChange(
                              index,
                              'correctedBy',
                              e.target.value
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Supervisor Initials"
                          fullWidth
                          value={shortcoming.supervisorInitials}
                          onChange={(e) =>
                            handleShortcomingChange(
                              index,
                              'supervisorInitials',
                              e.target.value
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<Download size={16} />}
        >
          Generate DA 2404
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 