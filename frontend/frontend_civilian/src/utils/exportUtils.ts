import { utils as xlsxUtils, writeFile as xlsxWriteFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportColumn } from '../components/reports/ReportTable';

interface ExportOptions {
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  data: Record<string, any>[];
}

// Export to CSV
export const exportToCsv = (options: ExportOptions): void => {
  const { title, data, columns } = options;
  
  // Prepare headers and data
  const headers = columns.map(col => col.label);
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.id];
      return col.format ? col.format(value) : value;
    })
  );

  // Generate CSV content
  const csvContent = [headers, ...rows]
    .map(row => 
      row.map(value => 
        // Handle values that need quotes (contain commas, quotes, or newlines)
        typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))
          ? `"${value.replace(/"/g, '""')}"` // Escape quotes by doubling them
          : value
      ).join(',')
    )
    .join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

// Export to Excel
export const exportToExcel = (options: ExportOptions): void => {
  const { title, data, columns } = options;

  // Prepare worksheet data
  const wsData = [
    columns.map(col => col.label), // Headers
    ...data.map(row =>
      columns.map(col => {
        const value = row[col.id];
        return col.format ? col.format(value) : value;
      })
    )
  ];

  // Create workbook and worksheet
  const wb = xlsxUtils.book_new();
  const ws = xlsxUtils.aoa_to_sheet(wsData);

  // Add worksheet to workbook
  xlsxUtils.book_append_sheet(wb, ws, 'Report');

  // Generate filename and save
  const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  xlsxWriteFile(wb, filename);
};

// Export to PDF
export const exportToPdf = (options: ExportOptions): void => {
  const { title, subtitle, data, columns } = options;
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(subtitle, 14, 25);
  }

  // Prepare table data
  const headers = columns.map(col => col.label);
  const rows = data.map(row =>
    columns.map(col => {
      const value = row[col.id];
      return col.format ? col.format(value) : value;
    })
  );

  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: subtitle ? 30 : 25,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Save the PDF
  const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

// Main export function
export const exportReport = (format: 'csv' | 'excel' | 'pdf', options: ExportOptions): void => {
  switch (format) {
    case 'csv':
      exportToCsv(options);
      break;
    case 'excel':
      exportToExcel(options);
      break;
    case 'pdf':
      exportToPdf(options);
      break;
    default:
      console.error('Unsupported export format:', format);
  }
};
