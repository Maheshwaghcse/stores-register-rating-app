import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/admin/users/${id}`)
      .then(res => setUser(res.data))
      .catch(() => toast.error('Failed to load user.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-container"><div className="loading-state">Loading...</div></div>;
  if (!user) return <div className="page-container"><div className="empty-state">User not found.</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/users')}>← Back</button>
      </div>
      <div className="detail-card">
        <div className="detail-avatar">{user.name?.charAt(0).toUpperCase()}</div>
        <h2 className="detail-name">{user.name}</h2>
        <span className={`badge badge-${user.role} badge-lg`}>{user.role.replace('_', ' ')}</span>

        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Address</span>
            <span className="detail-value">{user.address}</span>
          </div>
          {user.role === 'store_owner' && (
            <div className="detail-item">
              <span className="detail-label">Store Rating</span>
              <span className="detail-value">
                {user.avgRating ? (
                  <div className="rating-display">
                    <StarRating value={Math.round(user.avgRating)} readonly />
                    <span className="rating-num">{user.avgRating} / 5</span>
                  </div>
                ) : 'No ratings yet'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
