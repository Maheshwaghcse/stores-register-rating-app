import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'card-blue' },
    { label: 'Total Stores', value: stats.totalStores, icon: '🏪', color: 'card-green' },
    { label: 'Total Ratings', value: stats.totalRatings, icon: '⭐', color: 'card-yellow' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Admin Dashboard</h2>
        <p className="page-subtitle">Platform overview at a glance</p>
      </div>
      {loading ? (
        <div className="loading-state">Loading dashboard...</div>
      ) : (
        <div className="stats-grid">
          {cards.map(card => (
            <div key={card.label} className={`stat-card ${card.color}`}>
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-info">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="quick-links">
        <h3>Quick Actions</h3>
        <div className="quick-grid">
          <a href="/admin/users" className="quick-card">👤 Manage Users</a>
          <a href="/admin/stores" className="quick-card">🏪 Manage Stores</a>
          <a href="/admin/users/add" className="quick-card">➕ Add User</a>
          <a href="/admin/stores/add" className="quick-card">➕ Add Store</a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
