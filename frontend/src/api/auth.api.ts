import api from './axios';
import axios from 'axios';

export interface LoginPayload {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId: string | null;
  avatarUrl: string | null;
}

export async function loginApi(payload: LoginPayload) {
  const { data } = await api.post('/auth/login', payload);
  return data.data as { accessToken: string; user: AuthUser };
}

export async function logoutApi() {
  await api.post('/auth/logout');
}

export async function refreshApi() {
  const { data } = await axios.post(
    '/api/v1/auth/refresh',
    {},
    { withCredentials: true }
  );
  return data.data as { accessToken: string };
}
