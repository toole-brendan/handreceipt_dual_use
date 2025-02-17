import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Button
} from '@mui/material';
import { Package, FileText } from 'lucide-react';
import ReportFilters from '../../components/reports/ReportFilters';
import ReportCustomization, {
  INVENTORY_REPORT_FIELDS,
} from '../../components/reports/ReportCustomization';
import ReportExportOptions, {
  ExportFormat,
  ScheduleFrequency
} from '../../components/reports/ReportExportOptions';
import ReportTable from '../../components/reports/ReportTable';
import { mockPharmaceuticalProducts } from '../../mocks/api/pharmaceuticals-products.mock';
import { 
  filterInventoryData, 
  formatReportData, 
  getReportColumns,
  fieldFormatters,
  ReportFilters as ReportFiltersType
} from '../../utils/reportUtils';
import { exportReport } from '../../utils/exportUtils';

const InventoryReportPage: React.FC = () => {
  // Filters
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Field Selection
  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    return INVENTORY_REPORT_FIELDS
      .filter(field => field.defaultSelected)
      .map(field => field.id);
  });

  // Scheduled Reports
  const [scheduledReports, setScheduledReports] = useState<Array<{
    id: string;
    frequency: ScheduleFrequency;
    recipients: string[];
    nextRun: string;
  }>>([]);

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSchedule = (frequency: ScheduleFrequency, recipients: string[]) => {
    const newReport = {
      id: Math.random().toString(36).substring(7),
      frequency,
      recipients,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    };
    setScheduledReports(prev => [...prev, newReport]);
  };

  const handleDeleteScheduledReport = (id: string) => {
    setScheduledReports(prev => prev.filter(report => report.id !== id));
  };

  // Generate report data based on filters
  const reportData = useMemo(() => {
    const filters: ReportFiltersType = {
      startDate: dateRange.start,
      endDate: dateRange.end,
      productId: selectedProduct,
      location: selectedLocation
    };

    const filteredData = filterInventoryData(mockPharmaceuticalProducts, filters);
    return formatReportData(filteredData, selectedFields);
  }, [dateRange, selectedProduct, selectedLocation, selectedFields]);

  // Get column definitions for the report table
  const columns = useMemo(() => {
    const fieldDefinitions = INVENTORY_REPORT_FIELDS.reduce((acc, field) => ({
      ...acc,
      [field.id]: {
        label: field.label,
        format: 
          field.id === 'expiryDate' || field.id === 'blockchainData.timestamp'
            ? fieldFormatters.date
          : field.id === 'unitCost' || field.id === 'totalValue'
            ? fieldFormatters.currency
          : field.id === 'quantity'
            ? (value: any) => `${fieldFormatters.number(value)}`
          : field.id === 'blockchainData.verified'
            ? fieldFormatters.boolean
          : undefined
      }
    }), {} as Record<string, { label: string; format?: (value: any) => React.ReactNode }>);

    return getReportColumns(selectedFields, fieldDefinitions);
  }, [selectedFields]);

  const handleExport = async (format: ExportFormat) => {
    const title = 'Inventory Report';
    const subtitle = [
      `Generated on ${new Date().toLocaleString()}`,
      dateRange.start && `From: ${dateRange.start.toLocaleDateString()}`,
      dateRange.end && `To: ${dateRange.end.toLocaleDateString()}`,
      selectedProduct && `Product: ${mockPharmaceuticalProducts.find(p => p.id === selectedProduct)?.name}`,
      selectedLocation && `Location: ${locations.find(l => l.id === selectedLocation)?.name}`
    ].filter(Boolean).join(' • ');

    try {
      exportReport(format, {
        title,
        subtitle,
        columns,
        data: reportData
      });
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  // Location options for filters
  const locations = [
    { id: 'WH001', name: 'Warehouse A' },
    { id: 'MFG001', name: 'Manufacturing Plant' },
    { id: 'DC001', name: 'Distribution Center' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Inventory Report
      </Typography>

      {/* Report Type Indicator */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Package size={20} />
          <Typography variant="subtitle1">
            Inventory Report
          </Typography>
        </Stack>
      </Paper>

      {/* Filters */}
      <ReportFilters
        dateRange={{
          start: dateRange.start,
          end: dateRange.end
        }}
        productId={selectedProduct}
        location={selectedLocation}
        onDateRangeChange={(field, value) => 
          setDateRange(prev => ({ ...prev, [field]: value }))
        }
        onProductChange={setSelectedProduct}
        onLocationChange={setSelectedLocation}
        products={mockPharmaceuticalProducts.map(product => ({ 
          id: product.id, 
          name: product.name 
        }))}
        locations={locations}
      />

      <Divider sx={{ my: 3 }} />

      {/* Field Customization */}
      <ReportCustomization
        availableFields={INVENTORY_REPORT_FIELDS}
        selectedFields={selectedFields}
        onFieldToggle={handleFieldToggle}
      />

      <Divider sx={{ my: 3 }} />

      {/* Report Table */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Report Preview
          </Typography>
          <Button
            variant="contained"
            startIcon={<FileText size={18} />}
            onClick={() => handleExport('pdf')}
          >
            Generate Report
          </Button>
        </Box>
        <ReportTable
          columns={columns}
          data={reportData}
          title="Inventory Report"
          subtitle={`Generated on ${new Date().toLocaleString()}`}
        />
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Export & Schedule */}
      <ReportExportOptions
        onExport={handleExport}
        onSchedule={handleSchedule}
        scheduledReports={scheduledReports}
        onDeleteScheduledReport={handleDeleteScheduledReport}
      />
    </Box>
  );
};

export default InventoryReportPage;
