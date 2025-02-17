export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SecurityClassification = 'unclassified' | 'confidential' | 'secret' | 'top_secret';

export interface Asset {
  id: string;
  name: string;
  description?: string;
  serialNumber: string;
  category: string;
  status: 'serviceable' | 'unserviceable' | 'damaged' | 'missing';
  location?: string;
  assignedTo?: string;
  lastVerified?: string;
  value: number;
  acquisitionDate: string;
  maintenanceSchedule?: {
    lastMaintenance: string;
    nextMaintenance: string;
    maintenanceType: string;
  };
  notes?: string;
  tags?: string[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AssetFilter {
  category?: string;
  status?: Asset['status'];
  location?: string;
  assignedTo?: string;
  searchTerm?: string;
  sortBy?: keyof Asset;
  sortOrder?: 'asc' | 'desc';
}

export interface AssetUpdate {
  name?: string;
  description?: string;
  status?: Asset['status'];
  location?: string;
  assignedTo?: string;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}
