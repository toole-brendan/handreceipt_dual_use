import { Order, OrderSummary } from './types';

export const mockOrderSummary: OrderSummary = {
  openPurchaseOrders: 5,
  openSalesOrders: 10,
  totalValueOfOpenOrders: 15000,
  ordersAwaitingShipment: 3,
};

export const mockOrders: Order[] = [
  {
    id: '1',
    type: 'purchase',
    orderNumber: 'PO12345',
    supplierOrCustomer: 'BeanFarm Co.',
    orderDate: '2023-10-01',
    deliveryDate: '2023-10-15',
    totalAmount: 5000,
    status: 'placed',
    paymentStatus: 'pending',
    blockchainStatus: 'confirmed',
    items: [
      {
        id: '1',
        name: 'Ethiopian Yirgacheffe Beans',
        quantity: 100,
        unit: 'kg',
        unitPrice: 50,
        totalPrice: 5000,
      },
    ],
    smartContract: {
      address: '0x1234...5678',
      status: 'active',
      transactionHash: '0xabcd...efgh',
    },
  },
  {
    id: '2',
    type: 'sales',
    orderNumber: 'SO67890',
    supplierOrCustomer: 'Café Delight',
    orderDate: '2023-10-05',
    deliveryDate: '2023-10-10',
    totalAmount: 2000,
    status: 'processing',
    paymentStatus: 'escrow',
    blockchainStatus: 'confirmed',
    items: [
      {
        id: '2',
        name: 'Colombian Supremo Beans',
        quantity: 40,
        unit: 'kg',
        unitPrice: 50,
        totalPrice: 2000,
      },
    ],
    smartContract: {
      address: '0x5678...9012',
      status: 'active',
      transactionHash: '0xefgh...ijkl',
    },
  },
  {
    id: '3',
    type: 'purchase',
    orderNumber: 'PO12346',
    supplierOrCustomer: 'Coffee Estates Inc.',
    orderDate: '2023-10-02',
    deliveryDate: '2023-10-16',
    totalAmount: 7500,
    status: 'shipped',
    paymentStatus: 'paid',
    blockchainStatus: 'confirmed',
    items: [
      {
        id: '3',
        name: 'Brazilian Santos Beans',
        quantity: 150,
        unit: 'kg',
        unitPrice: 50,
        totalPrice: 7500,
      },
    ],
  },
  {
    id: '4',
    type: 'sales',
    orderNumber: 'SO67891',
    supplierOrCustomer: 'Morning Brew Co.',
    orderDate: '2023-10-06',
    deliveryDate: '2023-10-11',
    totalAmount: 3000,
    status: 'delivered',
    paymentStatus: 'paid',
    blockchainStatus: 'confirmed',
    items: [
      {
        id: '4',
        name: 'Ethiopian Yirgacheffe Beans',
        quantity: 60,
        unit: 'kg',
        unitPrice: 50,
        totalPrice: 3000,
      },
    ],
  },
]; 