import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { loginApi } from '../../api/auth.api';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginApi({ email, password });
      setAuth(result.accessToken, result.user);
      toast.success(`Welcome, ${result.user.firstName}!`);
      navigate('/dashboard');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Alphonsol</h1>
        <p className="text-gray-500 mb-8 text-sm">Task &amp; Leave Management</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
