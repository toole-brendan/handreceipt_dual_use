/* frontend/src/mocks/mockData.ts */

export const mockTasks = [
  {
    id: '1',
    assetId: 'A001',
    assetName: 'Combat Vehicle Alpha',
    type: 'routine' as const,
    priority: 'high' as const,
    status: 'pending' as const,
    assignedTo: {
      id: 'U001',
      name: 'John Smith',
      rank: 'Sergeant'
    },
    dueDate: '2024-04-01',
    steps: [
      {
        id: 's1',
        name: 'Physical Inspection',
        status: 'pending' as const,
        requiredRole: 'inspector'
      },
      {
        id: 's2',
        name: 'Systems Check',
        status: 'pending' as const,
        requiredRole: 'technician'
      }
    ],
    currentStep: 1
  }
];

export const mockUser = {
  id: 'U001',
  militaryId: 'M12345',
  rank: 'Sergeant',
  name: 'John Smith',
  clearanceLevel: 'SECRET',
};

export const mockVerifications = [
  {
    id: 'v1',
    assetId: 'A001',
    assetName: 'Combat Vehicle Alpha',
    submittedBy: 'John Smith',
    submittedDate: '2024-03-25T10:00:00Z',
    status: 'pending',
    verificationData: {
      checklist: [
        { id: 'c1', label: 'Physical Check', required: true, checked: true },
        { id: 'c2', label: 'Systems Test', required: true, checked: true },
        { id: 'c3', label: 'Documentation Review', required: false, checked: false }
      ],
      condition: 'good',
      notes: 'Regular maintenance check completed',
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ]
    }
  }
];

export const mockAssets = [
  {
    id: 'A001',
    name: 'Combat Vehicle Alpha',
    type: 'Vehicle',
    status: 'active',
    location: 'Base Alpha',
    lastVerified: '2024-03-20T14:30:00Z',
    classification: 'SECRET'
  },
  {
    id: 'A002',
    name: 'Communication System Beta',
    type: 'Communication',
    status: 'maintenance',
    location: 'Base Beta',
    lastVerified: '2024-03-15T09:15:00Z',
    classification: 'TOP_SECRET'
  }
];

export const mockSystemHealth = {
  network: 'healthy',
  blockchain: 'synced',
  security: 'normal',
  performance: 95
};

export const mockAuthResponse = {
  user: {
    id: 'U001',
    militaryId: 'M12345',
    rank: 'Sergeant',
    name: 'John Smith',
    clearanceLevel: 'SECRET',
  },
  token: 'mock-jwt-token',
  requiresMFA: false,
};

export const mockActivities = [
  {
    id: 'A001',
    type: 'asset',
    message: 'Asset verification completed',
    timestamp: new Date().toISOString(),
    severity: 'info',
    classification: 'SECRET',
  },
  // Add more mock activities...
]; 