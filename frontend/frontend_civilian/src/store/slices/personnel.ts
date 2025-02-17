import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Personnel {
  id: string;
  militaryId: string;
  rank: string;
  name: string;
  role: string;
  clearanceLevel: string;
  unit: string;
  status: 'active' | 'inactive' | 'deployed' | 'leave';
  contactInfo: {
    email: string;
    phone?: string;
  };
  assignments: {
    id: string;
    type: string;
    startDate: string;
    endDate?: string;
  }[];
}

interface PersonnelState {
  personnel: Personnel[];
  selectedPersonnel: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: PersonnelState = {
  personnel: [],
  selectedPersonnel: null,
  loading: false,
  error: null,
};

const personnelSlice = createSlice({
  name: 'personnel',
  initialState,
  reducers: {
    fetchPersonnelStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPersonnelSuccess: (state, action: PayloadAction<Personnel[]>) => {
      state.personnel = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchPersonnelFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectPersonnel: (state, action: PayloadAction<string>) => {
      state.selectedPersonnel = action.payload;
    },
    addPersonnel: (state, action: PayloadAction<Personnel>) => {
      state.personnel.push(action.payload);
    },
    updatePersonnel: (state, action: PayloadAction<Personnel>) => {
      const index = state.personnel.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.personnel[index] = action.payload;
      }
    },
    deletePersonnel: (state, action: PayloadAction<string>) => {
      state.personnel = state.personnel.filter(p => p.id !== action.payload);
      if (state.selectedPersonnel === action.payload) {
        state.selectedPersonnel = null;
      }
    },
    addAssignment: (state, action: PayloadAction<{ personnelId: string; assignment: Personnel['assignments'][0] }>) => {
      const personnel = state.personnel.find(p => p.id === action.payload.personnelId);
      if (personnel) {
        personnel.assignments.push(action.payload.assignment);
      }
    },
    updateAssignment: (state, action: PayloadAction<{
      personnelId: string;
      assignmentId: string;
      updates: Partial<Personnel['assignments'][0]>;
    }>) => {
      const personnel = state.personnel.find(p => p.id === action.payload.personnelId);
      if (personnel) {
        const assignment = personnel.assignments.find(a => a.id === action.payload.assignmentId);
        if (assignment) {
          Object.assign(assignment, action.payload.updates);
        }
      }
    },
    removeAssignment: (state, action: PayloadAction<{ personnelId: string; assignmentId: string }>) => {
      const personnel = state.personnel.find(p => p.id === action.payload.personnelId);
      if (personnel) {
        personnel.assignments = personnel.assignments.filter(a => a.id !== action.payload.assignmentId);
      }
    },
    updateStatus: (state, action: PayloadAction<{ personnelId: string; status: Personnel['status'] }>) => {
      const personnel = state.personnel.find(p => p.id === action.payload.personnelId);
      if (personnel) {
        personnel.status = action.payload.status;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => initialState,
  },
});

export const {
  fetchPersonnelStart,
  fetchPersonnelSuccess,
  fetchPersonnelFailure,
  selectPersonnel,
  addPersonnel,
  updatePersonnel,
  deletePersonnel,
  addAssignment,
  updateAssignment,
  removeAssignment,
  updateStatus,
  clearError,
  resetState,
} = personnelSlice.actions;

export const personnelReducer = personnelSlice.reducer;
