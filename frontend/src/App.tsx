import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/403"
          element={
            <div className="p-8 text-red-600 font-semibold">
              403 — Access Denied
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
