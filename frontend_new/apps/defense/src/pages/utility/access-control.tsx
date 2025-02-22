import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

interface AccessRule {
  id: string;
  resource: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive';
}

const AccessControl: React.FC = () => {
  const [rules, setRules] = React.useState<AccessRule[]>([
    {
      id: '1',
      resource: 'Property Records',
      role: 'Property Manager',
      permissions: ['read', 'write', 'delete'],
      status: 'active'
    }
  ]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedRule, setSelectedRule] = React.useState<AccessRule | null>(null);

  const handleAddRule = () => {
    setSelectedRule(null);
    setOpenDialog(true);
  };

  const handleEditRule = (rule: AccessRule) => {
    setSelectedRule(rule);
    setOpenDialog(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const handleSaveRule = (rule: AccessRule) => {
    if (selectedRule) {
      setRules(rules.map(r => r.id === selectedRule.id ? rule : r));
    } else {
      setRules([...rules, { ...rule, id: Math.random().toString() }]);
    }
    setOpenDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Access Control
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddRule}
        >
          Add Rule
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Resource</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>{rule.resource}</TableCell>
                <TableCell>{rule.role}</TableCell>
                <TableCell>
                  {rule.permissions.map((permission) => (
                    <Chip
                      key={permission}
                      label={permission}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <Chip
                    label={rule.status}
                    color={rule.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEditRule(rule)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteRule(rule.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AccessRuleDialog
        open={openDialog}
        rule={selectedRule}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveRule}
      />
    </Box>
  );
};

interface AccessRuleDialogProps {
  open: boolean;
  rule: AccessRule | null;
  onClose: () => void;
  onSave: (rule: AccessRule) => void;
}

const AccessRuleDialog: React.FC<AccessRuleDialogProps> = ({
  open,
  rule,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = React.useState<Omit<AccessRule, 'id'>>({
    resource: '',
    role: '',
    permissions: [],
    status: 'active'
  });

  React.useEffect(() => {
    if (rule) {
      setFormData({
        resource: rule.resource,
        role: rule.role,
        permissions: rule.permissions,
        status: rule.status
      });
    } else {
      setFormData({
        resource: '',
        role: '',
        permissions: [],
        status: 'active'
      });
    }
  }, [rule]);

  const handleSubmit = () => {
    onSave(rule ? { ...formData, id: rule.id } : { ...formData, id: '' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {rule ? 'Edit Access Rule' : 'Add Access Rule'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Resource"
            value={formData.resource}
            onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
            fullWidth
          />
          <TextField
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Permissions</InputLabel>
            <Select
              multiple
              value={formData.permissions}
              onChange={(e) => setFormData({ 
                ...formData, 
                permissions: typeof e.target.value === 'string' 
                  ? [e.target.value] 
                  : e.target.value 
              })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="read">Read</MenuItem>
              <MenuItem value="write">Write</MenuItem>
              <MenuItem value="delete">Delete</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ 
                ...formData, 
                status: e.target.value as 'active' | 'inactive' 
              })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccessControl;
