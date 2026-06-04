import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import UserDetail from './pages/admin/UserDetail';
import AdminStores from './pages/admin/Stores';
import AddUser from './pages/admin/AddUser';
import AddStore from './pages/admin/AddStore';

import UserStores from './pages/user/Stores';
import UpdatePassword from './pages/user/UpdatePassword';

import OwnerDashboard from './pages/owner/Dashboard';

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/user/stores" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <div className={user ? 'main-content' : ''}>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/users/add" element={<ProtectedRoute roles={['admin']}><AddUser /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute roles={['admin']}><UserDetail /></ProtectedRoute>} />
          <Route path="/admin/stores" element={<ProtectedRoute roles={['admin']}><AdminStores /></ProtectedRoute>} />
          <Route path="/admin/stores/add" element={<ProtectedRoute roles={['admin']}><AddStore /></ProtectedRoute>} />

          {/* Normal User */}
          <Route path="/user/stores" element={<ProtectedRoute roles={['user']}><UserStores /></ProtectedRoute>} />

          {/* Shared */}
          <Route path="/update-password" element={<ProtectedRoute roles={['user', 'store_owner']}><UpdatePassword /></ProtectedRoute>} />

          {/* Store Owner */}
          <Route path="/owner/dashboard" element={<ProtectedRoute roles={['store_owner']}><OwnerDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
