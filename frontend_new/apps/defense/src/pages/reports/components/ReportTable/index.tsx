import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Eye,
  Link as LinkIcon,
  FileText,
  Download,
  Printer,
  QrCode,
} from 'lucide-react';
import type { ReportType, ReportData } from '../../types';

interface ReportTableProps {
  type: ReportType;
  onViewDetails: (report: ReportData) => void;
  onViewBlockchain: (report: ReportData) => void;
}

// Mock data - replace with actual API data
const MOCK_DATA: ReportData[] = [
  {
    id: 'RPT-2024-001',
    type: 'inventory',
    title: 'Monthly Inventory Report',
    description: 'Comprehensive inventory status report for April 2024',
    createdAt: '2024-04-15T10:30:00Z',
    createdBy: {
      name: 'CPT John Doe',
      rank: 'CPT',
      unit: 'F CO - 2-506',
    },
    status: 'approved',
    blockchainRecords: [
      {
        transactionId: '0x123...abc',
        timestamp: '2024-04-15T10:30:00Z',
        action: 'REPORT_CREATED',
        personnel: {
          name: 'CPT John Doe',
          rank: 'CPT',
          unit: 'F CO - 2-506',
        },
        details: {},
      },
    ],
    data: {},
  },
  // Add more mock data as needed
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

export const ReportTable: React.FC<ReportTableProps> = ({
  type,
  onViewDetails,
  onViewBlockchain,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = MOCK_DATA.filter((report) => report.type === type);
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.id}</TableCell>
                <TableCell>{report.title}</TableCell>
                <TableCell>
                  {report.createdBy.rank} {report.createdBy.name}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {report.createdBy.unit}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(report.createdAt).toLocaleDateString()}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(report.createdAt).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    color={getStatusColor(report.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => onViewDetails(report)}>
                        <Eye size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Blockchain Records">
                      <IconButton size="small" onClick={() => onViewBlockchain(report)}>
                        <LinkIcon size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download PDF">
                      <IconButton size="small">
                        <Download size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Print Report">
                      <IconButton size="small">
                        <Printer size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Generate QR Code">
                      <IconButton size="small">
                        <QrCode size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  );
}; 