import React, { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const UpdatePassword = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pwRegex.test(form.newPassword)) {
      toast.error('New password: 8–16 chars, at least one uppercase and one special character.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Change Password</h2>
        <p className="page-subtitle">Update your account password</p>
      </div>
      <div className="form-card form-card-sm">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="cur-pw">Current Password</label>
            <input id="cur-pw" type="password" name="currentPassword" placeholder="Enter current password"
              value={form.currentPassword} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="new-pw">New Password</label>
            <input id="new-pw" type="password" name="newPassword" placeholder="8-16 chars"
              value={form.newPassword} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="conf-pw">Confirm New Password</label>
            <input id="conf-pw" type="password" name="confirmPassword" placeholder="Re-enter new password"
              value={form.confirmPassword} onChange={handleChange} required />
          </div>
          <p className="password-hint">Password must be 8–16 characters with at least one uppercase letter and one special character.</p>
          <button id="update-pw-btn" type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
