import api from './axios';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  managerId: string | null;
  manager?: { id: string; firstName: string; lastName: string; email: string } | null;
  employees?: Array<{ id: string; firstName: string; lastName: string; email: string; role: string; isActive: boolean }>;
  _count?: { employees: number };
  createdAt: string;
  updatedAt: string;
}

export async function getDepartments() {
  const { data } = await api.get('/departments');
  return data.data as Department[];
}

export async function getDepartment(id: string) {
  const { data } = await api.get(`/departments/${id}`);
  return data.data as Department;
}

export async function createDepartment(payload: { name: string; description?: string; managerId?: string }) {
  const { data } = await api.post('/departments', payload);
  return data.data as Department;
}

export async function updateDepartment(id: string, payload: { name?: string; description?: string; managerId?: string }) {
  const { data } = await api.put(`/departments/${id}`, payload);
  return data.data as Department;
}

export async function deleteDepartment(id: string) {
  const { data } = await api.delete(`/departments/${id}`);
  return data.data;
}

export async function getDepartmentMembers(id: string) {
  const { data } = await api.get(`/departments/${id}/members`);
  return data.data;
}
