import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AddUser = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!form.name || form.name.length < 20 || form.name.length > 60)
      return 'Name must be between 20 and 60 characters.';
    if (!emailRe.test(form.email)) return 'Invalid email address.';
    if (!form.address || form.address.length > 400) return 'Address is required (max 400 chars).';
    if (!pwRegex.test(form.password))
      return 'Password: 8–16 chars, at least one uppercase and one special character.';
    return null;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    try {
      await api.post('/admin/users', form);
      toast.success('User created successfully!');
      navigate('/admin/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/users')}>← Back to Users</button>
      </div>
      <div className="form-card">
        <h2 className="form-title">Add New User</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name <span className="hint">(20–60 chars)</span></label>
            <input type="text" name="name" placeholder="Enter full name"
              value={form.name} onChange={handleChange} minLength={20} maxLength={60} required />
            <span className="char-count">{form.name.length}/60</span>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="user@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Address <span className="hint">(max 400 chars)</span></label>
            <textarea name="address" placeholder="Full address"
              value={form.address} onChange={handleChange} maxLength={400} rows={3} required />
            <span className="char-count">{form.address.length}/400</span>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="8-16 chars"
                value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="user">Normal User</option>
                <option value="admin">Admin</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
          </div>
          <p className="password-hint">Password must be 8–16 characters with at least one uppercase and one special character.</p>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
