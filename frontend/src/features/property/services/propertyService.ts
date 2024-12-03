import { PropertyItem } from '@/features/property/types';
import { api } from '@/services/api';
import { ApiResponse } from '@/types/api';

export const getPersonnelProperty = async (personnelId: string): Promise<PropertyItem[]> => {
  const response = await api.get<ApiResponse<PropertyItem[]>>(`/api/v1/property/personnel/${personnelId}`);
  return response.data;
};

export const getCurrentUserProperty = async (): Promise<PropertyItem[]> => {
  const response = await api.get<ApiResponse<PropertyItem[]>>('/api/v1/property/my-property');
  return response.data;
};

export const getPropertyHistory = async (propertyId: string): Promise<PropertyItem[]> => {
  const response = await api.get<ApiResponse<PropertyItem[]>>(`/api/v1/property/${propertyId}/history`);
  return response.data;
};

export const transferProperty = async (propertyId: string, toPersonnelId: string): Promise<PropertyItem> => {
  const response = await api.post<ApiResponse<PropertyItem>>(`/api/v1/property/${propertyId}/transfer`, {
    toPersonnelId,
  });
  return response.data;
};

export const updatePropertyStatus = async (
  propertyId: string,
  status: {
    condition: 'NEW' | 'SERVICEABLE' | 'UNSERVICEABLE' | 'DAMAGED';
    notes?: string;
  }
): Promise<PropertyItem> => {
  const response = await api.patch<ApiResponse<PropertyItem>>(`/api/v1/property/${propertyId}/status`, status);
  return response.data;
}; 