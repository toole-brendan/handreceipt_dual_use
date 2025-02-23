import { DashboardData } from './types';

export const mockDashboardData: DashboardData = {
  summary: {
    inventoryValue: 25000,
    totalSales: 15000,
    totalShipments: 25,
    totalPayments: 10000,
    walletBalance: 2500,
  },
  salesData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 1000) + 500,
  })),
  topSellingProducts: [
    {
      name: 'Ethiopian Yirgacheffe Beans',
      quantitySold: 100,
      unit: 'kg',
      totalRevenue: 5000,
    },
    {
      name: 'Colombian Supremo Beans',
      quantitySold: 80,
      unit: 'kg',
      totalRevenue: 4000,
    },
    {
      name: 'Brazilian Santos Beans',
      quantitySold: 60,
      unit: 'kg',
      totalRevenue: 3000,
    },
    {
      name: 'Kenyan AA Beans',
      quantitySold: 40,
      unit: 'kg',
      totalRevenue: 2000,
    },
    {
      name: 'Guatemala Antigua Beans',
      quantitySold: 20,
      unit: 'kg',
      totalRevenue: 1000,
    },
  ],
  recentShipments: [
    {
      id: 'SHIP-001',
      destination: 'Café Delight',
      status: 'delivered',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      details: 'Delivered on Oct 15',
    },
    {
      id: 'SHIP-002',
      destination: 'Morning Brew Co.',
      status: 'in_transit',
      coordinates: { lat: 34.0522, lng: -118.2437 },
      details: 'Expected delivery Oct 20',
    },
    {
      id: 'SHIP-003',
      destination: 'Bean Scene',
      status: 'delayed',
      coordinates: { lat: 51.5074, lng: -0.1278 },
      details: 'Delayed due to weather',
    },
  ],
  pendingPayments: [
    {
      id: 'PAY-67890',
      recipient: 'BeanFarm Co.',
      amount: 500,
      dueDate: '2023-10-20',
      isOverdue: false,
    },
    {
      id: 'PAY-67891',
      recipient: 'Coffee Estates Inc.',
      amount: 750,
      dueDate: '2023-10-15',
      isOverdue: true,
    },
    {
      id: 'PAY-67892',
      recipient: 'Global Coffee Traders',
      amount: 1000,
      dueDate: '2023-10-25',
      isOverdue: false,
    },
  ],
  lowStockItems: [
    {
      name: 'Colombian Supremo Beans',
      currentStock: 50,
      unit: 'kg',
      reorderLevel: 100,
    },
    {
      name: 'Ethiopian Yirgacheffe Beans',
      currentStock: 30,
      unit: 'kg',
      reorderLevel: 75,
    },
    {
      name: 'Brazilian Santos Beans',
      currentStock: 25,
      unit: 'kg',
      reorderLevel: 50,
    },
  ],
  recentTransactions: [
    {
      id: 'TXN-12345',
      date: '2023-10-15',
      type: 'payment',
      status: 'confirmed',
      details: 'Payment to BeanFarm Co.',
      explorerUrl: 'https://etherscan.io/tx/0x123...',
    },
    {
      id: 'TXN-12346',
      date: '2023-10-14',
      type: 'inventory_update',
      status: 'confirmed',
      details: 'Stock update: Colombian Supremo Beans',
      explorerUrl: 'https://etherscan.io/tx/0x456...',
    },
    {
      id: 'TXN-12347',
      date: '2023-10-13',
      type: 'shipment_update',
      status: 'pending',
      details: 'Shipment status update: SHIP-001',
      explorerUrl: 'https://etherscan.io/tx/0x789...',
    },
  ],
}; 