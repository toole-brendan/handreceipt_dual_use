import { createAsyncThunk } from '@reduxjs/toolkit';
import { propertyService } from '../../../services/propertyService';
import {
  setLoading,
  setError,
  setSummary,
  setEquipmentList,
  setSelectedItemDetails,
  setComplianceStatus,
  addCustodyEvent,
  addMaintenanceLog,
  addInspectionChecklist,
  addAttachment,
} from './slice';
import type { 
  CustodyEvent,
  MaintenanceLog,
  InspectionChecklist,
  Attachment,
} from '../../../types/property';

// Fetch summary data
export const fetchSummary = createAsyncThunk(
  'property/fetchSummary',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading({ key: 'summary', value: true }));
      dispatch(setError({ key: 'summary', value: undefined }));
      
      const summary = await propertyService.fetchSummary();
      dispatch(setSummary(summary));
      
      return summary;
    } catch (error) {
      dispatch(setError({ key: 'summary', value: error instanceof Error ? error.message : 'Failed to fetch summary' }));
      throw error;
    } finally {
      dispatch(setLoading({ key: 'summary', value: false }));
    }
  }
);

// Fetch equipment list
export const fetchEquipmentList = createAsyncThunk(
  'property/fetchEquipmentList',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading({ key: 'equipmentList', value: true }));
      dispatch(setError({ key: 'equipmentList', value: undefined }));
      
      const equipmentList = await propertyService.fetchEquipmentList();
      dispatch(setEquipmentList(equipmentList));
      
      return equipmentList;
    } catch (error) {
      dispatch(setError({ key: 'equipmentList', value: error instanceof Error ? error.message : 'Failed to fetch equipment list' }));
      throw error;
    } finally {
      dispatch(setLoading({ key: 'equipmentList', value: false }));
    }
  }
);

// Fetch item details
export const fetchItemDetails = createAsyncThunk(
  'property/fetchItemDetails',
  async (itemId: string, { dispatch }) => {
    try {
      dispatch(setLoading({ key: 'itemDetails', value: true }));
      dispatch(setError({ key: 'itemDetails', value: undefined }));
      
      const details = await propertyService.fetchItemDetails(itemId);
      dispatch(setSelectedItemDetails(details));
      
      return details;
    } catch (error) {
      dispatch(setError({ key: 'itemDetails', value: error instanceof Error ? error.message : 'Failed to fetch item details' }));
      throw error;
    } finally {
      dispatch(setLoading({ key: 'itemDetails', value: false }));
    }
  }
);

// Fetch compliance status
export const fetchComplianceStatus = createAsyncThunk(
  'property/fetchComplianceStatus',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading({ key: 'compliance', value: true }));
      dispatch(setError({ key: 'compliance', value: undefined }));
      
      const status = await propertyService.fetchComplianceStatus();
      dispatch(setComplianceStatus(status));
      
      return status;
    } catch (error) {
      dispatch(setError({ key: 'compliance', value: error instanceof Error ? error.message : 'Failed to fetch compliance status' }));
      throw error;
    } finally {
      dispatch(setLoading({ key: 'compliance', value: false }));
    }
  }
);

// Add custody event
export const createCustodyEvent = createAsyncThunk(
  'property/createCustodyEvent',
  async (event: Omit<CustodyEvent, 'id'>, { dispatch }) => {
    try {
      const newEvent = await propertyService.addCustodyEvent(event);
      dispatch(addCustodyEvent(newEvent));
      return newEvent;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to create custody event');
    }
  }
);

// Add maintenance log
export const createMaintenanceLog = createAsyncThunk(
  'property/createMaintenanceLog',
  async (log: Omit<MaintenanceLog, 'id'>, { dispatch }) => {
    try {
      const newLog = await propertyService.addMaintenanceLog(log);
      dispatch(addMaintenanceLog(newLog));
      return newLog;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to create maintenance log');
    }
  }
);

// Add inspection checklist
export const createInspectionChecklist = createAsyncThunk(
  'property/createInspectionChecklist',
  async (checklist: Omit<InspectionChecklist, 'id'>, { dispatch }) => {
    try {
      const newChecklist = await propertyService.addInspectionChecklist(checklist);
      dispatch(addInspectionChecklist(newChecklist));
      return newChecklist;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to create inspection checklist');
    }
  }
);

// Add attachment
export const createAttachment = createAsyncThunk(
  'property/createAttachment',
  async (attachment: Omit<Attachment, 'id'>, { dispatch }) => {
    try {
      const newAttachment = await propertyService.addAttachment(attachment);
      dispatch(addAttachment(newAttachment));
      return newAttachment;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to create attachment');
    }
  }
);
