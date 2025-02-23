import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ReportCard } from './ReportCard';
import { InventoryDistribution, DistributionType } from '@shared/types/reports';

interface InventoryDistributionChartProps {
  data: InventoryDistribution[];
  distributionType: DistributionType;
  onDistributionTypeChange: (type: DistributionType) => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const InventoryDistributionChart: React.FC<InventoryDistributionChartProps> = ({
  data,
  distributionType,
  onDistributionTypeChange,
  onExportCSV,
  onExportPDF,
}) => {
  const handleDistributionTypeChange = (event: SelectChangeEvent) => {
    onDistributionTypeChange(event.target.value as DistributionType);
  };

  const formatTooltip = (value: number, name: string) => {
    return [`${value.toLocaleString()} units`, name];
  };

  const customization = (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="distribution-type-label">View By</InputLabel>
      <Select
        labelId="distribution-type-label"
        value={distributionType}
        label="View By"
        onChange={handleDistributionTypeChange}
      >
        <MenuItem value="category">By Category</MenuItem>
        <MenuItem value="location">By Location</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <ReportCard
      title="Inventory Distribution"
      helpText="View how your inventory is distributed across categories or locations"
      customization={customization}
      onExportCSV={onExportCSV}
      onExportPDF={onExportPDF}
    >
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="quantity"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry.name} (${entry.quantity})`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltip} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </ReportCard>
  );
}; 