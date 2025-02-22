import { jsPDF } from 'jspdf';
import { UserOptions } from 'jspdf-autotable';

/**
 * Type definitions for jspdf-autotable hook data
 */
export interface AutoTableHookData {
  /** The jsPDF document instance */
  doc: jsPDF;
  
  /** The current cursor position */
  cursor: {
    x: number;
    y: number;
  };
  
  /** The current table dimensions */
  table: {
    width: number;
    height: number;
  };
  
  /** The current page number (1-based) */
  pageNumber: number;
  
  /** The total number of pages */
  pageCount: number;
  
  /** The current page settings */
  settings: {
    margin: { top: number; right: number; bottom: number; left: number };
    pageBreak: 'auto' | 'avoid' | 'always';
    rowPageBreak: 'auto' | 'avoid';
    showHead: 'everyPage' | 'firstPage' | 'never';
    showFoot: 'everyPage' | 'lastPage' | 'never';
    startY: number | false;
    [key: string]: any;
  };
  
  /** The current styles */
  styles: {
    font: string;
    fontStyle: string;
    fontSize: number;
    lineColor: number[];
    lineWidth: number;
    cellPadding: number;
    fillColor: number[];
    textColor: number[];
    halign: 'left' | 'center' | 'right';
    valign: 'top' | 'middle' | 'bottom';
    [key: string]: any;
  };
  
  /** The final Y position after drawing */
  finalY?: number;
}
