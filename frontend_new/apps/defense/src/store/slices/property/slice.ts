import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  PropertyState,
  PropertyItem,
  CustodyEvent,
  MaintenanceLog,
  InspectionChecklist,
  Attachment,
  PropertySummary,
  ComplianceStatus,
} from '../../../types/property';

const initialState: PropertyState = {
  summary: {
    totalItems: 0,
    serviceableItems: 0,
    upcomingInspections: {
      next7Days: 0,
      next30Days: 0,
    },
    disputedItems: 0,
  },
  equipmentList: [],
  selectedItemId: null,
  selectedItemDetails: {
    item: null,
    custodyHistory: [],
    maintenanceLogs: [],
    inspectionChecklists: [],
    attachments: [],
  },
  complianceStatus: {
    itemsInspected: {
      total: 0,
      completed: 0,
    },
    trainingCertifications: {
      total: 0,
      completed: 0,
    },
    missingDocuments: [],
  },
  loading: {
    summary: false,
    equipmentList: false,
    itemDetails: false,
    compliance: false,
  },
  error: {},
  view: 'card',
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<{ key: keyof PropertyState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    
    // Error states
    setError: (state, action: PayloadAction<{ key: keyof PropertyState['error']; value: string | undefined }>) => {
      state.error[action.payload.key] = action.payload.value;
    },

    // Summary data
    setSummary: (state, action: PayloadAction<PropertySummary>) => {
      state.summary = action.payload;
    },

    // Equipment list
    setEquipmentList: (state, action: PayloadAction<PropertyItem[]>) => {
      state.equipmentList = action.payload;
    },
    updateEquipmentItem: (state, action: PayloadAction<PropertyItem>) => {
      const index = state.equipmentList.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.equipmentList[index] = action.payload;
      }
    },

    // Selected item and details
    setSelectedItemId: (state, action: PayloadAction<string | null>) => {
      state.selectedItemId = action.payload;
    },
    setSelectedItemDetails: (state, action: PayloadAction<{
      item: PropertyItem;
      custodyHistory: CustodyEvent[];
      maintenanceLogs: MaintenanceLog[];
      inspectionChecklists: InspectionChecklist[];
      attachments: Attachment[];
    }>) => {
      state.selectedItemDetails = action.payload;
    },
    addCustodyEvent: (state, action: PayloadAction<CustodyEvent>) => {
      state.selectedItemDetails.custodyHistory.unshift(action.payload);
    },
    addMaintenanceLog: (state, action: PayloadAction<MaintenanceLog>) => {
      state.selectedItemDetails.maintenanceLogs.unshift(action.payload);
    },
    addInspectionChecklist: (state, action: PayloadAction<InspectionChecklist>) => {
      state.selectedItemDetails.inspectionChecklists.unshift(action.payload);
    },
    addAttachment: (state, action: PayloadAction<Attachment>) => {
      state.selectedItemDetails.attachments.unshift(action.payload);
    },

    // Compliance status
    setComplianceStatus: (state, action: PayloadAction<ComplianceStatus>) => {
      state.complianceStatus = action.payload;
    },

    // View mode
    setView: (state, action: PayloadAction<'card' | 'table'>) => {
      state.view = action.payload;
    },

    // Reset states
    resetSelectedItem: (state) => {
      state.selectedItemId = null;
      state.selectedItemDetails = {
        item: null,
        custodyHistory: [],
        maintenanceLogs: [],
        inspectionChecklists: [],
        attachments: [],
      };
    },
    resetAll: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setSummary,
  setEquipmentList,
  updateEquipmentItem,
  setSelectedItemId,
  setSelectedItemDetails,
  addCustodyEvent,
  addMaintenanceLog,
  addInspectionChecklist,
  addAttachment,
  setComplianceStatus,
  setView,
  resetSelectedItem,
  resetAll,
} = propertySlice.actions;

export default propertySlice.reducer;
