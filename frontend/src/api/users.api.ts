import api from './axios';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  avatarUrl: string | null;
  phone: string | null;
  joinedAt: string;
  departmentId: string | null;
  department?: { id: string; name: string } | null;
}

export interface LeaveBalance {
  id: string;
  leaveType: string;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
}

export async function getUsers(params?: { role?: string; departmentId?: string; isActive?: boolean }) {
  const { data } = await api.get('/users', { params });
  return data.data as User[];
}

export async function getUser(id: string) {
  const { data } = await api.get(`/users/${id}`);
  return data.data as User;
}

export async function createUser(payload: { email: string; password: string; firstName: string; lastName: string; role?: string; departmentId?: string; phone?: string }) {
  const { data } = await api.post('/users', payload);
  return data.data as User;
}

export async function updateUser(id: string, payload: Partial<User> & { password?: string }) {
  const { data } = await api.put(`/users/${id}`, payload);
  return data.data as User;
}

export async function deleteUser(id: string) {
  const { data } = await api.delete(`/users/${id}`);
  return data.data;
}

export async function getUserLeaveBalances(userId: string, year?: number) {
  const { data } = await api.get(`/users/${userId}/leave-balances`, { params: { year } });
  return data.data as LeaveBalance[];
}

export async function adjustLeaveBalance(userId: string, payload: { leaveType: string; year: number; adjustment: number }) {
  const { data } = await api.put(`/users/${userId}/leave-balances`, payload);
  return data.data as LeaveBalance;
}
