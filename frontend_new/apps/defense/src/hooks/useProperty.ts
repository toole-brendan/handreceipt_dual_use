import { useCallback } from 'react';
import type { RootState } from '../store';
import { useDispatch, useSelector } from '../store';
import {
  setView,
  resetSelectedItem,
  resetAll,
} from '../store/slices/property/slice';
import {
  fetchSummary,
  fetchEquipmentList,
  fetchItemDetails,
  fetchComplianceStatus,
  createCustodyEvent,
  createMaintenanceLog,
  createInspectionChecklist,
  createAttachment,
} from '../store/slices/property/thunks';
import type {
  PropertyItem,
  CustodyEvent,
  MaintenanceLog,
  InspectionChecklist,
  Attachment,
} from '../types/property';

export const useProperty = () => {
  const dispatch = useDispatch();
  const {
    summary,
    equipmentList,
    selectedItemId,
    selectedItemDetails,
    complianceStatus,
    loading,
    error,
    view,
  } = useSelector((state: RootState) => state.property);

  // Data fetching
  const loadSummary = useCallback(async () => {
    await dispatch(fetchSummary());
  }, [dispatch]);

  const loadEquipmentList = useCallback(async () => {
    await dispatch(fetchEquipmentList());
  }, [dispatch]);

  const loadItemDetails = useCallback(async (itemId: string) => {
    await dispatch(fetchItemDetails(itemId));
  }, [dispatch]);

  const loadComplianceStatus = useCallback(async () => {
    await dispatch(fetchComplianceStatus());
  }, [dispatch]);

  // Item actions
  const addCustodyEvent = useCallback(async (event: Omit<CustodyEvent, 'id'>) => {
    await dispatch(createCustodyEvent(event));
  }, [dispatch]);

  const addMaintenanceLog = useCallback(async (log: Omit<MaintenanceLog, 'id'>) => {
    await dispatch(createMaintenanceLog(log));
  }, [dispatch]);

  const addInspectionChecklist = useCallback(async (checklist: Omit<InspectionChecklist, 'id'>) => {
    await dispatch(createInspectionChecklist(checklist));
  }, [dispatch]);

  const addAttachment = useCallback(async (attachment: Omit<Attachment, 'id'>) => {
    await dispatch(createAttachment(attachment));
  }, [dispatch]);

  // View actions
  const toggleView = useCallback((newView: 'card' | 'table') => {
    dispatch(setView(newView));
  }, [dispatch]);

  // Reset actions
  const clearSelectedItem = useCallback(() => {
    dispatch(resetSelectedItem());
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch(resetAll());
  }, [dispatch]);

  // Computed values
  const selectedItem = selectedItemId
    ? equipmentList.find(item => item.id === selectedItemId) ?? null
    : null;

  const upcomingInspections = equipmentList.filter((item: PropertyItem) => {
    const dueDate = new Date(item.nextInspectionDue);
    const now = new Date();
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);
    return dueDate > now && dueDate <= sevenDays;
  });

  const serviceableItems = equipmentList.filter((item: PropertyItem) => item.status === 'FMC');
  const partiallyServiceableItems = equipmentList.filter((item: PropertyItem) => item.status === 'PMC');
  const unserviceableItems = equipmentList.filter((item: PropertyItem) => item.status === 'NMC');

  return {
    // State
    summary,
    equipmentList,
    selectedItemId,
    selectedItem,
    selectedItemDetails,
    complianceStatus,
    loading,
    error,
    view,

    // Computed values
    upcomingInspections,
    serviceableItems,
    partiallyServiceableItems,
    unserviceableItems,

    // Actions
    loadSummary,
    loadEquipmentList,
    loadItemDetails,
    loadComplianceStatus,
    addCustodyEvent,
    addMaintenanceLog,
    addInspectionChecklist,
    addAttachment,
    toggleView,
    clearSelectedItem,
    clearAll,
  };
};
