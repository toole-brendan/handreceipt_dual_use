import { utils as xlsxUtils, writeFile as xlsxWriteFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportColumn } from '../../types/reports/table';
import { AutoTableHookData } from '../../types/pdf/autotable';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportOptions {
  /** Title of the export */
  title: string;
  
  /** Optional subtitle */
  subtitle?: string;
  
  /** Column definitions */
  columns: ReportColumn[];
  
  /** Data to export */
  data: Record<string, any>[];
  
  /** Optional callback for export progress */
  onProgress?: (progress: number) => void;
  
  /** Optional callback for export completion */
  onComplete?: () => void;
  
  /** Optional callback for export errors */
  onError?: (error: Error) => void;
}

/**
 * Sanitizes a filename by removing invalid characters and spaces
 */
function sanitizeFilename(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Gets a timestamped filename
 */
function getTimestampedFilename(base: string, extension: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedBase = sanitizeFilename(base);
  return `${sanitizedBase}_${timestamp}.${extension}`;
}

/**
 * Exports data to CSV format
 */
export async function exportToCsv(options: ExportOptions): Promise<void> {
  const { title, data, columns, onProgress, onComplete, onError } = options;
  
  try {
    // Prepare headers and data
    const headers = columns.map(col => col.label);
    const totalRows = data.length;
    
    const rows = data.map((row, index) => {
      // Report progress
      if (onProgress) {
        onProgress((index / totalRows) * 100);
      }
      
      return columns.map(col => {
        const value = row[col.id];
        return col.format ? col.format(value) : value;
      });
    });

    // Generate CSV content
    const csvContent = [headers, ...rows]
      .map(row => 
        row.map(value => 
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
    link.download = getTimestampedFilename(title, 'csv');
    link.click();
    
    if (onComplete) onComplete();
  } catch (error) {
    if (onError) onError(error as Error);
    throw error;
  }
}

/**
 * Exports data to Excel format
 */
export async function exportToExcel(options: ExportOptions): Promise<void> {
  const { title, data, columns, onProgress, onComplete, onError } = options;

  try {
    const totalRows = data.length;
    
    // Prepare worksheet data
    const wsData = [
      columns.map(col => col.label), // Headers
      ...data.map((row, index) => {
        // Report progress
        if (onProgress) {
          onProgress((index / totalRows) * 100);
        }
        
        return columns.map(col => {
          const value = row[col.id];
          return col.format ? col.format(value) : value;
        });
      })
    ];

    // Create workbook and worksheet
    const wb = xlsxUtils.book_new();
    const ws = xlsxUtils.aoa_to_sheet(wsData);

    // Add worksheet to workbook
    xlsxUtils.book_append_sheet(wb, ws, 'Report');

    // Generate filename and save
    const filename = getTimestampedFilename(title, 'xlsx');
    xlsxWriteFile(wb, filename);
    
    if (onComplete) onComplete();
  } catch (error) {
    if (onError) onError(error as Error);
    throw error;
  }
}

/**
 * Exports data to PDF format
 */
export async function exportToPdf(options: ExportOptions): Promise<void> {
  const { title, subtitle, data, columns, onProgress, onComplete, onError } = options;

  try {
    const doc = new jsPDF();
    const totalRows = data.length;

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
    const rows = data.map((row, index) => {
      // Report progress
      if (onProgress) {
        onProgress((index / totalRows) * 100);
      }
      
      return columns.map(col => {
        const value = row[col.id];
        return col.format ? col.format(value) : value;
      });
    });

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
      didDrawPage: function(data) {
        // Add page number at the bottom
        const str = `Page ${data.pageNumber}`;
        const pageSize = doc.internal.pageSize;
        doc.setFontSize(10);
        doc.text(str, pageSize.width - 20, pageSize.height - 10);
      }
    });

    // Save the PDF
    const filename = getTimestampedFilename(title, 'pdf');
    doc.save(filename);
    
    if (onComplete) onComplete();
  } catch (error) {
    if (onError) onError(error as Error);
    throw error;
  }
}

/**
 * Main export function that handles all export formats
 */
export async function exportReport(format: ExportFormat, options: ExportOptions): Promise<void> {
  try {
    switch (format) {
      case 'csv':
        await exportToCsv(options);
        break;
      case 'excel':
        await exportToExcel(options);
        break;
      case 'pdf':
        await exportToPdf(options);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    if (options.onError) {
      options.onError(error as Error);
    }
    throw error;
  }
}
