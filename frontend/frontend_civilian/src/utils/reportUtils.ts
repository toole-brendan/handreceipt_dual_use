import { PharmaceuticalProduct } from '../mocks/api/pharmaceuticals-products.mock';
import { PharmaceuticalShipment } from '../mocks/api/pharmaceuticals-shipments.mock';

export interface ReportFilters {
  startDate: Date | null;
  endDate: Date | null;
  productId: string;
  location: string;
}

// Helper function to check if a date is within a range
const isDateInRange = (date: string, startDate: Date | null, endDate: Date | null): boolean => {
  if (!startDate && !endDate) return true;
  const checkDate = new Date(date);
  if (startDate && checkDate < startDate) return false;
  if (endDate && checkDate > endDate) return false;
  return true;
};

// Filter inventory data and calculate values
export const filterInventoryData = (
  products: PharmaceuticalProduct[],
  filters: ReportFilters
): Record<string, any>[] => {
  return products
    .filter(product => {
      const matchesProduct = !filters.productId || product.id === filters.productId;
      const matchesLocation = !filters.location || product.location === filters.location;
      const matchesDate = isDateInRange(
        product.blockchainData.timestamp,
        filters.startDate,
        filters.endDate
      );
      return matchesProduct && matchesLocation && matchesDate;
    })
    .map(product => {
      // Create a flattened object with all fields
      const flattenedProduct: Record<string, any> = {
        ...product,
        totalValue: product.quantity * product.unitCost,
        'blockchainData.timestamp': product.blockchainData.timestamp,
        'blockchainData.transactionHash': product.blockchainData.transactionHash,
        'blockchainData.verified': product.blockchainData.verified
      };
      return flattenedProduct;
    });
};

// Filter shipment data
export const filterShipmentData = (
  shipments: PharmaceuticalShipment[],
  filters: ReportFilters
): PharmaceuticalShipment[] => {
  return shipments.filter(shipment => {
    const matchesProduct = !filters.productId || 
      shipment.items.some(item => item.productId === filters.productId);
    const matchesLocation = !filters.location || 
      shipment.fromLocationId === filters.location || 
      shipment.toLocationId === filters.location;
    const matchesDate = isDateInRange(
      shipment.blockchainData.timestamp,
      filters.startDate,
      filters.endDate
    );
    return matchesProduct && matchesLocation && matchesDate;
  });
};

// Format data for report based on selected fields
export const formatReportData = (
  data: any[],
  selectedFields: string[]
): Record<string, any>[] => {
  return data.map(item => {
    const formattedItem: Record<string, any> = {};
    selectedFields.forEach(field => {
      let value = getNestedProperty(item, field);
      
      // Format currency fields
      if (field === 'unitCost' || field === 'totalValue') {
        value = fieldFormatters.currency(value);
      }
      // Format quantity with unit of measure
      else if (field === 'quantity' && item.unitOfMeasure) {
        value = `${fieldFormatters.number(value)} ${item.unitOfMeasure}`;
      }
      
      formattedItem[field] = value;
    });
    return formattedItem;
  });
};

// Helper function to safely access nested properties
export const getNestedProperty = (obj: any, path: string): any => {
  return path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : undefined, obj);
};

// Get column definitions for report table
export const getReportColumns = (
  selectedFields: string[],
  fieldDefinitions: Record<string, { label: string; format?: (value: any) => React.ReactNode }>
) => {
  return selectedFields.map(field => ({
    id: field,
    label: fieldDefinitions[field]?.label || field,
    format: fieldDefinitions[field]?.format
  }));
};

// Common field formatters
export const fieldFormatters = {
  date: (value: string) => new Date(value).toLocaleString(),
  currency: (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value),
  number: (value: number) => new Intl.NumberFormat('en-US').format(value),
  percentage: (value: number) => `${value.toFixed(1)}%`,
  boolean: (value: boolean) => value ? 'Yes' : 'No'
};
