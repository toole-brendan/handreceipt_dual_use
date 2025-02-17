import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ReportConfig } from '../../../constants/reports'

interface ReportsState {
  configs: ReportConfig[]
  loading: boolean
  error: string | null
  selectedConfig: ReportConfig | null
}

const initialState: ReportsState = {
  configs: [],
  loading: false,
  error: null,
  selectedConfig: null,
}

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    fetchReportsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchReportsSuccess: (state, action: PayloadAction<ReportConfig[]>) => {
      state.loading = false
      state.configs = action.payload
    },
    fetchReportsError: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    addConfig: (state, action: PayloadAction<ReportConfig>) => {
      state.configs.push(action.payload)
    },
    removeConfig: (state, action: PayloadAction<ReportConfig>) => {
      state.configs = state.configs.filter(
        (config) => 
          config.type !== action.payload.type || 
          config.period !== action.payload.period
      )
    },
    updateConfig: (state, action: PayloadAction<ReportConfig>) => {
      const index = state.configs.findIndex(
        (config) => 
          config.type === action.payload.type && 
          config.period === action.payload.period
      )
      if (index !== -1) {
        state.configs[index] = action.payload
      }
    },
    selectConfig: (state, action: PayloadAction<ReportConfig | null>) => {
      state.selectedConfig = action.payload
    },
  },
})

export const {
  fetchReportsStart,
  fetchReportsSuccess,
  fetchReportsError,
  clearError,
  addConfig,
  removeConfig,
  updateConfig,
  selectConfig,
} = reportsSlice.actions

export default reportsSlice.reducer
