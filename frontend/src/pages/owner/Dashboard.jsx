import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');

  useEffect(() => {
    api.get('/owner/dashboard')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field, newOrder) => { setSortBy(field); setOrder(newOrder); };

  const sortedRatings = data?.ratingDetails ? [...data.ratingDetails].sort((a, b) => {
    const va = a[sortBy] ?? '';
    const vb = b[sortBy] ?? '';
    return order === 'ASC' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  }) : [];

  const columns = [
    { field: 'name', label: 'Customer Name', sortable: true },
    { field: 'email', label: 'Email', sortable: true },
    { field: 'rating', label: 'Rating', sortable: true, render: (row) => (
      <div className="rating-cell">
        <StarRating value={row.rating} readonly />
        <span>{row.rating}/5</span>
      </div>
    )},
    { field: 'submittedAt', label: 'Date', sortable: true, render: (row) => (
      new Date(row.submittedAt).toLocaleDateString()
    )},
  ];

  if (loading) return <div className="page-container"><div className="loading-state">Loading...</div></div>;
  if (!data) return <div className="page-container"><div className="empty-state">No store data found.</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">My Store Dashboard</h2>
          <p className="page-subtitle">{data.store.name}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card card-yellow">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <div className="stat-value">{data.avgRating ?? '—'}</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
        <div className="stat-card card-blue">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{data.ratingDetails.length}</div>
            <div className="stat-label">Total Ratings</div>
          </div>
        </div>
        <div className="stat-card card-green">
          <div className="stat-icon">🏪</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: '1rem' }}>{data.store.address.substring(0, 30)}…</div>
            <div className="stat-label">Store Address</div>
          </div>
        </div>
      </div>

      {data.avgRating && (
        <div className="avg-rating-display">
          <StarRating value={Math.round(data.avgRating)} readonly />
          <span className="avg-rating-text">{data.avgRating} out of 5</span>
        </div>
      )}

      <div className="section-title">Customer Ratings</div>
      <SortableTable columns={columns} data={sortedRatings} onSort={handleSort} sortBy={sortBy} sortOrder={order} />
    </div>
  );
};

export default OwnerDashboard;
