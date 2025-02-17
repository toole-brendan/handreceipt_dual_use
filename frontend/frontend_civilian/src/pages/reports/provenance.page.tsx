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
import { History, FileText } from 'lucide-react';
import ReportFilters from '@/components/reports/ReportFilters';
import ReportCustomization from '@/components/reports/ReportCustomization';
import ReportExportOptions, {
  ExportFormat,
  ScheduleFrequency
} from '@/components/reports/ReportExportOptions';
import ReportTable from '@/components/reports/ReportTable';
import TimelineView from '@/components/reports/TimelineView';
import { mockPharmaceuticalProducts } from '@/mocks/api/pharmaceuticals-products.mock';
import { 
  mockProvenanceEvents,
  ProvenanceEvent
} from '@/mocks/api/blockchain-data.mock';
import { 
  PROVENANCE_REPORT_FIELDS,
  provenanceFieldFormatters 
} from '@/components/reports/ProvenanceReportFields';
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

const ProvenanceReportPage: React.FC = () => {
  // Filters
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Field Selection
  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    return PROVENANCE_REPORT_FIELDS
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

  // Filter and sort provenance events
  const filteredEvents = useMemo(() => {
    const filters: ReportFiltersType = {
      startDate: dateRange.start,
      endDate: dateRange.end,
      productId: selectedProduct,
      location: selectedLocation
    };

    return mockProvenanceEvents
      .filter(event => {
        const matchesProduct = !filters.productId || event.productId === filters.productId;
        const matchesLocation = !filters.location || event.location.id === filters.location;
        const matchesDate = !filters.startDate || !filters.endDate || 
          (new Date(event.timestamp) >= filters.startDate && new Date(event.timestamp) <= filters.endDate);
        
        return matchesProduct && matchesLocation && matchesDate;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [dateRange, selectedProduct, selectedLocation]);

  // Generate report data
  const reportData = useMemo(() => {
    return formatReportData(filteredEvents, selectedFields);
  }, [filteredEvents, selectedFields]);

  // Get column definitions for the report table
  const columns = useMemo(() => {
    const fieldDefinitions: Record<string, FieldDefinition> = {};
    
    PROVENANCE_REPORT_FIELDS.forEach(field => {
      fieldDefinitions[field.id] = {
        label: field.label,
        format: 
          field.id === 'timestamp'
            ? fieldFormatters.date
          : field.id === 'eventType'
            ? provenanceFieldFormatters.eventType
          : field.id === 'complianceStatus'
            ? provenanceFieldFormatters.complianceStatus
          : field.id === 'blockchainRef.transactionHash'
            ? provenanceFieldFormatters['blockchainRef.transactionHash']
          : field.id === 'blockchainRef.blockNumber'
            ? provenanceFieldFormatters['blockchainRef.blockNumber']
          : field.id === 'data.documentRefs'
            ? provenanceFieldFormatters['data.documentRefs']
          : field.id === 'location.coordinates'
            ? provenanceFieldFormatters['location.coordinates']
          : field.id === 'data.temperature'
            ? provenanceFieldFormatters['data.temperature']
          : field.id === 'data.humidity'
            ? provenanceFieldFormatters['data.humidity']
          : undefined
      };
    });

    return getReportColumns(selectedFields, fieldDefinitions);
  }, [selectedFields]);

  const handleExport = async (format: ExportFormat) => {
    const title = 'Provenance Report';
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
        Provenance Report
      </Typography>

      {/* Report Type Indicator */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <History size={20} />
          <Typography variant="subtitle1">
            Provenance Report
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

      {/* Timeline View */}
      {selectedProduct && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Product Timeline
          </Typography>
          <TimelineView events={filteredEvents} />
        </Paper>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Field Customization */}
      <ReportCustomization
        availableFields={PROVENANCE_REPORT_FIELDS}
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
          title="Provenance Report"
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

export default ProvenanceReportPage;
