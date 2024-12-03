export interface MaintenanceRequest {
  id: string;
  itemName: string;
  serialNumber: string;
  dateReported: string;
  description: string;
  status: 'Submitted' | 'In Progress' | 'Completed';
  estimatedCompletion: string;
}

export interface MaintenanceFormData {
  itemId: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  images: File[];
  notes?: string;
}

export interface MaintenanceItem {
  id: string;
  name: string;
  serialNumber: string;
} 