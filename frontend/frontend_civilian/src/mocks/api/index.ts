import { mockDashboardData, getMetricTrends } from './pharmaceuticals-dashboard.mock';

export const pharmaceuticalApi = {
  getDashboardData: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      ...mockDashboardData,
      // Add any additional data transformations here
    };
  },
  getMetricTrends,
};
