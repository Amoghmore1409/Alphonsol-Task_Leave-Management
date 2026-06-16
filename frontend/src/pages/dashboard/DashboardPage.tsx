import { useAuthStore } from '../../store/auth.store';
import { logoutApi } from '../../api/auth.api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutApi();
    } finally {
      clearAuth();
      navigate('/login');
      toast.success('Logged out');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm">
              Welcome back, {user?.firstName} {user?.lastName} · {user?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Sign out
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Role</p>
            <p className="text-lg font-semibold text-gray-800">{user?.role}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
            <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
            <p className="text-lg font-semibold text-green-600">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
