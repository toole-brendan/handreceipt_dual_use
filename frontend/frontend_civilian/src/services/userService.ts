import { CivilianUser, UserFilters, UserCreateData, UserUpdateData, UserStats } from '../types/users';
import { mockUsers } from '../mocks/api/users-data.mock';

// Helper function to filter users based on provided filters
const filterUsers = (users: CivilianUser[], filters?: UserFilters): CivilianUser[] => {
  if (!filters) return users;

  return users.filter(user => {
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;
    const matchesCompany = !filters.company || user.company.toLowerCase().includes(filters.company.toLowerCase());
    const matchesDepartment = !filters.department || user.department.toLowerCase().includes(filters.department.toLowerCase());
    const matchesSearch = !filters.search || 
      user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.fullName.toLowerCase().includes(filters.search.toLowerCase());

    return matchesRole && matchesStatus && matchesCompany && matchesDepartment && matchesSearch;
  });
};

// Helper function to calculate user statistics
const calculateStats = (users: CivilianUser[]): UserStats => {
  const stats: UserStats = {
    total: users.length,
    active: 0,
    inactive: 0,
    pending: 0,
    byRole: {} as Record<string, number>,
    byDepartment: {}
  };

  users.forEach(user => {
    // Count by status
    if (user.status === 'ACTIVE') stats.active++;
    else if (user.status === 'INACTIVE') stats.inactive++;
    else if (user.status === 'PENDING') stats.pending++;

    // Count by role
    stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;

    // Count by department
    stats.byDepartment[user.department] = (stats.byDepartment[user.department] || 0) + 1;
  });

  return stats;
};

export const userService = {
  async getAll(filters?: UserFilters): Promise<CivilianUser[]> {
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch('/api/users?' + new URLSearchParams(filters));
      const filteredUsers = filterUsers(mockUsers, filters);
      return Promise.resolve(filteredUsers);
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<CivilianUser> {
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch(`/api/users/${id}`);
      const user = mockUsers.find(u => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }
      return Promise.resolve(user);
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  },

  async create(data: UserCreateData): Promise<CivilianUser> {
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch('/api/users', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });

      // Mock implementation
      const newUser: CivilianUser = {
        ...data,
        id: (mockUsers.length + 1).toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: undefined
      };

      mockUsers.push(newUser);
      return Promise.resolve(newUser);
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  },

  async update(data: UserUpdateData): Promise<CivilianUser> {
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch(`/api/users/${data.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });

      // Mock implementation
      const index = mockUsers.findIndex(u => u.id === data.id);
      if (index === -1) {
        throw new Error('User not found');
      }

      const updatedUser = {
        ...mockUsers[index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      mockUsers[index] = updatedUser;
      return Promise.resolve(updatedUser);
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch(`/api/users/${id}`, {
      //   method: 'DELETE'
      // });

      // Mock implementation
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error('User not found');
      }

      mockUsers.splice(index, 1);
      return Promise.resolve();
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  },

  async getStats(): Promise<UserStats> {
    try {
      // In a real implementation, this might be a separate API endpoint
      // const response = await fetch('/api/users/stats');
      
      // Mock implementation
      return Promise.resolve(calculateStats(mockUsers));
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'PENDING'): Promise<CivilianUser> {
    try {
      // In a real implementation, this might be a separate endpoint
      // const response = await fetch(`/api/users/${id}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status })
      // });

      return this.update({ id, status });
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  }
};
