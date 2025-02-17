// Auth exports
export { 
  authReducer,
  login,
  logout,
  clearError as clearAuthError,
  updateUser,
  setMfaVerified
} from './auth';

// Property exports
export { propertyReducer } from './property';
export {
  fetchProperties,
  transferProperty,
  setSelectedItem,
  updatePropertyStatus,
  addVerification,
  clearPropertyError,
  selectAllProperties,
  selectPropertyById,
  selectSensitiveItems,
  selectPropertyLoading,
  selectPropertyError
} from './property/propertySlice';

// Personnel exports
export { personnelReducer } from './personnel';
export {
  fetchPersonnel,
  fetchUnits,
  updatePersonnel,
  setSelectedPerson,
  setSelectedUnit,
  updateFilters,
  clearPersonnelError,
  selectAllPersonnel,
  selectAllUnits,
  selectPersonnelById,
  selectUnitById,
  selectPersonnelLoading,
  selectPersonnelError,
  selectPersonnelFilters,
  selectFilteredPersonnel
} from './personnel/personnelSlice';

// Reports exports
export { default as reportsReducer } from './reports';
export {
  fetchReportsStart,
  fetchReportsSuccess,
  fetchReportsError,
  clearError as clearReportsError,
  addConfig,
  removeConfig,
  updateConfig as updateReportConfig,
  selectConfig
} from './reports/reportsSlice';

// System exports
export { systemReducer } from './system';
export {
  fetchSystemHealth,
  fetchSystemMetrics,
  fetchSystemConfig,
  addAlert,
  removeAlert,
  clearAlerts,
  updateConfig as updateSystemConfig,
  clearError as clearSystemError,
  selectSystemHealth,
  selectSystemMetrics,
  selectSystemConfig,
  selectAllAlerts,
  selectSystemLoading,
  selectSystemError,
  selectCriticalAlerts,
  selectServiceStatus
} from './system/systemSlice';
