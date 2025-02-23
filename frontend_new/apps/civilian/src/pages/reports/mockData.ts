import {
  SalesData,
  TopSellingProduct,
  InventoryDistribution,
  LowStockItem,
} from '@shared/types/reports';

// Mock Sales Data
export const mockSalesData: SalesData[] = [
  { date: '2024-03-01', revenue: 5000, quantity: 100 },
  { date: '2024-03-02', revenue: 6000, quantity: 120 },
  { date: '2024-03-03', revenue: 4500, quantity: 90 },
  // Add more daily data as needed
];

// Mock Top Selling Products
export const mockTopSellingProducts: TopSellingProduct[] = [
  { id: '1', name: 'Ethiopian Yirgacheffe', revenue: 25000, quantity: 500 },
  { id: '2', name: 'Colombian Supremo', revenue: 20000, quantity: 400 },
  { id: '3', name: 'Costa Rican Tarrazu', revenue: 15000, quantity: 300 },
  { id: '4', name: 'Kenyan AA', revenue: 12000, quantity: 240 },
  { id: '5', name: 'Guatemalan Antigua', revenue: 10000, quantity: 200 },
];

// Mock Inventory Distribution
export const mockInventoryDistribution: InventoryDistribution[] = [
  { name: 'Light Roast', quantity: 1000 },
  { name: 'Medium Roast', quantity: 1500 },
  { name: 'Dark Roast', quantity: 800 },
  { name: 'Espresso Blend', quantity: 600 },
  { name: 'Single Origin', quantity: 400 },
];

// Mock Low Stock Items
export const mockLowStockItems: LowStockItem[] = [
  { id: '1', name: 'Ethiopian Yirgacheffe', currentStock: 50, minThreshold: 100 },
  { id: '2', name: 'Colombian Supremo', currentStock: 30, minThreshold: 80 },
  { id: '3', name: 'Kenyan AA', currentStock: 20, minThreshold: 60 },
]; 