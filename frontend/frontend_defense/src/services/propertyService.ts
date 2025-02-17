import { Property } from '../types/property';

interface PropertyFilter {
  status?: string;
  category?: string;
  search?: string;
}

interface PropertyUpdateData {
  id: string;
  [key: string]: any;
}

export const propertyService = {
  async getAll(filters?: PropertyFilter): Promise<Property[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }

      const response = await fetch(`/api/property?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property items');
      }
      return response.json();
    } catch (error) {
      console.error('Property service error:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Property> {
    try {
      const response = await fetch(`/api/property/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property item');
      }
      return response.json();
    } catch (error) {
      console.error('Property service error:', error);
      throw error;
    }
  },

  async create(data: Omit<Property, 'id'>): Promise<Property> {
    try {
      const response = await fetch('/api/property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create property item');
      }
      return response.json();
    } catch (error) {
      console.error('Property service error:', error);
      throw error;
    }
  },

  async update(data: PropertyUpdateData): Promise<Property> {
    try {
      const response = await fetch(`/api/property/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update property item');
      }
      return response.json();
    } catch (error) {
      console.error('Property service error:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/property/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete property item');
      }
    } catch (error) {
      console.error('Property service error:', error);
      throw error;
    }
  },

  async transfer(propertyId: string, toPersonnelId: string): Promise<void> {
    try {
      const response = await fetch(`/api/property/${propertyId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toPersonnelId }),
      });
      if (!response.ok) {
        throw new Error('Failed to transfer property item');
      }
    } catch (error) {
      console.error('Property service error:', error);
      throw error;
    }
  },

  async verify(propertyId: string, verificationData: any): Promise<void> {
    try {
      const response = await fetch(`/api/property/${propertyId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      });
      if (!response.ok) {
        throw new Error('Failed to verify property item');
      }
    } catch (error) {
      console.error('Property service error:', error);
      throw error;
    }
  }
};
