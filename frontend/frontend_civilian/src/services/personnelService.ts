import { Personnel } from '../types/personnel';

interface PersonnelFilter {
  unit?: string;
  rank?: string;
  status?: string;
  search?: string;
}

interface PersonnelUpdateData {
  id: string;
  [key: string]: any;
}

export const personnelService = {
  async getAll(filters?: PersonnelFilter): Promise<Personnel[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }

      const response = await fetch(`/api/personnel?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch personnel');
      }
      return response.json();
    } catch (error) {
      console.error('Personnel service error:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Personnel> {
    try {
      const response = await fetch(`/api/personnel/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch personnel');
      }
      return response.json();
    } catch (error) {
      console.error('Personnel service error:', error);
      throw error;
    }
  },

  async create(data: Omit<Personnel, 'id'>): Promise<Personnel> {
    try {
      const response = await fetch('/api/personnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create personnel');
      }
      return response.json();
    } catch (error) {
      console.error('Personnel service error:', error);
      throw error;
    }
  },

  async update(data: PersonnelUpdateData): Promise<Personnel> {
    try {
      const response = await fetch(`/api/personnel/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update personnel');
      }
      return response.json();
    } catch (error) {
      console.error('Personnel service error:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/personnel/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete personnel');
      }
    } catch (error) {
      console.error('Personnel service error:', error);
      throw error;
    }
  },

  async getAssignedProperty(personnelId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/personnel/${personnelId}/property`);
      if (!response.ok) {
        throw new Error('Failed to fetch assigned property');
      }
      return response.json();
    } catch (error) {
      console.error('Personnel service error:', error);
      throw error;
    }
  },

  async getHandReceipts(personnelId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/personnel/${personnelId}/handreceipts`);
      if (!response.ok) {
        throw new Error('Failed to fetch hand receipts');
      }
      return response.json();
    } catch (error) {
      console.error('Personnel service error:', error);
      throw error;
    }
  },

  async generateHandReceipt(personnelId: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/personnel/${personnelId}/handreceipt/generate`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to generate hand receipt');
      }
      return response.blob();
    } catch (error) {
      console.error('Personnel service error:', error);
      throw error;
    }
  },

  async updateAssignment(personnelId: string, unitId: string): Promise<void> {
    try {
      const response = await fetch(`/api/personnel/${personnelId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unitId }),
      });
      if (!response.ok) {
        throw new Error('Failed to update personnel assignment');
      }
    } catch (error) {
      console.error('Personnel service error:', error);
      throw error;
    }
  }
};
