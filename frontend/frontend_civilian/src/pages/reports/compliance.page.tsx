import React, { useState, useMemo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Button,
  Chip,
  Grid
} from '@mui/material';
import { Shield, FileText, AlertTriangle } from 'lucide-react';
import ReportFilters from '@/components/reports/ReportFilters';
import ReportCustomization from '@/components/reports/ReportCustomization';
import ReportExportOptions, {
  ExportFormat,
  ScheduleFrequency
} from '@/components/reports/ReportExportOptions';
import ReportTable from '@/components/reports/ReportTable';
import { mockPharmaceuticalProducts } from '@/mocks/api/pharmaceuticals-products.mock';
import { 
  mockComplianceRules,
  mockComplianceStatuses,
  mockProvenanceEvents,
  ComplianceStatus,
  ComplianceRule,
  ProvenanceEvent
} from '@/mocks/api/blockchain-data.mock';
import { 
  COMPLIANCE_REPORT_FIELDS,
  complianceFieldFormatters 
} from '@/components/reports/ComplianceReportFields';
import { 
  formatReportData, 
  getReportColumns,
  fieldFormatters,
  ReportFilters as ReportFiltersType
} from '@/utils/reportUtils';
import { exportReport } from '@/utils/exportUtils';

interface FieldDefinition {
  label: string;
  format?: (value: any) => ReactNode;
}

const ComplianceReportPage: React.FC = () => {
  // Filters
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [complianceFilter, setComplianceFilter] = useState<'all' | 'compliant' | 'non-compliant' | 'pending'>('all');

  // Field Selection
  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    return COMPLIANCE_REPORT_FIELDS
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
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    setScheduledReports(prev => [...prev, newReport]);
  };

  const handleDeleteScheduledReport = (id: string) => {
    setScheduledReports(prev => prev.filter(report => report.id !== id));
  };

  // Combine compliance data with product data
  const enrichedComplianceData = useMemo(() => {
    return mockComplianceStatuses.map(status => {
      const product = mockPharmaceuticalProducts.find(p => p.id === status.productId);
      const rule = mockComplianceRules.find(r => r.id === status.ruleId);
      const event = mockProvenanceEvents.find(e => 
        e.productId === status.productId && 
        new Date(e.timestamp).getTime() <= new Date(status.timestamp).getTime()
      );

      return {
        ...status,
        productName: product?.name || 'Unknown Product',
        batchNumber: product?.batchNumber,
        ruleName: rule?.name,
        ruleCategory: rule?.category,
        severity: rule?.severity,
        location: event?.location,
        handler: event?.handler,
        blockchainRef: event?.blockchainRef
      };
    });
  }, []);

  // Generate report data based on filters
  const reportData = useMemo(() => {
    const filters: ReportFiltersType = {
      startDate: dateRange.start,
      endDate: dateRange.end,
      productId: selectedProduct,
      location: selectedLocation
    };

    const filteredData = enrichedComplianceData.filter(item => {
      const matchesProduct = !filters.productId || item.productId === filters.productId;
      const matchesLocation = !filters.location || item.location?.id === filters.location;
      const matchesDate = !filters.startDate || !filters.endDate || 
        (new Date(item.timestamp) >= filters.startDate && new Date(item.timestamp) <= filters.endDate);
      const matchesCompliance = complianceFilter === 'all' || item.status === complianceFilter;
      
      return matchesProduct && matchesLocation && matchesDate && matchesCompliance;
    });

    return formatReportData(filteredData, selectedFields);
  }, [enrichedComplianceData, dateRange, selectedProduct, selectedLocation, selectedFields, complianceFilter]);

  // Calculate compliance statistics
  const complianceStats = useMemo(() => {
    const total = reportData.length;
    const compliant = reportData.filter(item => item.status === 'compliant').length;
    const nonCompliant = reportData.filter(item => item.status === 'non-compliant').length;
    const pending = reportData.filter(item => item.status === 'pending').length;

    return {
      total,
      compliant,
      nonCompliant,
      pending,
      complianceRate: total > 0 ? (compliant / total) * 100 : 0
    };
  }, [reportData]);

  // Get column definitions for the report table
  const columns = useMemo(() => {
    const fieldDefinitions: Record<string, FieldDefinition> = {};
    
    COMPLIANCE_REPORT_FIELDS.forEach(field => {
      fieldDefinitions[field.id] = {
        label: field.label,
        format: 
          field.id === 'timestamp'
            ? fieldFormatters.date
          : field.id === 'status'
            ? complianceFieldFormatters.status
          : field.id === 'severity'
            ? complianceFieldFormatters.severity
          : field.id === 'documentUrls'
            ? complianceFieldFormatters.documentUrls
          : field.id === 'signatures'
            ? complianceFieldFormatters.signatures
          : field.id === 'sensorData'
            ? complianceFieldFormatters.sensorData
          : field.id === 'location.coordinates'
            ? complianceFieldFormatters.coordinates
          : undefined
      };
    });

    return getReportColumns(selectedFields, fieldDefinitions);
  }, [selectedFields]);

  const handleExport = async (format: ExportFormat) => {
    const title = 'Compliance Report';
    const subtitle = [
      `Generated on ${new Date().toLocaleString()}`,
      dateRange.start && `From: ${dateRange.start.toLocaleDateString()}`,
      dateRange.end && `To: ${dateRange.end.toLocaleDateString()}`,
      selectedProduct && `Product: ${mockPharmaceuticalProducts.find(p => p.id === selectedProduct)?.name}`,
      selectedLocation && `Location: ${locations.find(l => l.id === selectedLocation)?.name}`,
      `Compliance Rate: ${complianceStats.complianceRate.toFixed(1)}%`
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
        Compliance Report
      </Typography>

      {/* Report Type Indicator */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Shield size={20} />
          <Typography variant="subtitle1">
            Compliance Report
          </Typography>
        </Stack>
      </Paper>

      {/* Compliance Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Compliance Rate
            </Typography>
            <Typography variant="h4" color={
              complianceStats.complianceRate >= 90 ? 'success.main' :
              complianceStats.complianceRate >= 70 ? 'warning.main' :
              'error.main'
            }>
              {complianceStats.complianceRate.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={2}>
              <Chip
                label={`Compliant: ${complianceStats.compliant}`}
                color="success"
                variant="outlined"
              />
              <Chip
                label={`Non-Compliant: ${complianceStats.nonCompliant}`}
                color="error"
                variant="outlined"
              />
              <Chip
                label={`Pending: ${complianceStats.pending}`}
                color="warning"
                variant="outlined"
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

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

      {/* Compliance Status Filter */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Compliance Status
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            label="All"
            color={complianceFilter === 'all' ? 'primary' : 'default'}
            onClick={() => setComplianceFilter('all')}
            variant={complianceFilter === 'all' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Compliant"
            color="success"
            onClick={() => setComplianceFilter('compliant')}
            variant={complianceFilter === 'compliant' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Non-Compliant"
            color="error"
            onClick={() => setComplianceFilter('non-compliant')}
            variant={complianceFilter === 'non-compliant' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Pending"
            color="warning"
            onClick={() => setComplianceFilter('pending')}
            variant={complianceFilter === 'pending' ? 'filled' : 'outlined'}
          />
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Field Customization */}
      <ReportCustomization
        availableFields={COMPLIANCE_REPORT_FIELDS}
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
          title="Compliance Report"
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

export default ComplianceReportPage;
