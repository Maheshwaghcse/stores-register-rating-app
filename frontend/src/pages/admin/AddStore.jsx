import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AddStore = () => {
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/users', { params: { role: 'store_owner' } })
      .then(res => setOwners(res.data))
      .catch(() => {});
  }, []);

  const validate = () => {
    if (!form.name || form.name.length < 20 || form.name.length > 60)
      return 'Store name must be between 20 and 60 characters.';
    if (!emailRe.test(form.email)) return 'Invalid email address.';
    if (!form.address || form.address.length > 400) return 'Address is required (max 400 chars).';
    return null;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    try {
      await api.post('/admin/stores', form);
      toast.success('Store created successfully!');
      navigate('/admin/stores');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/stores')}>← Back to Stores</button>
      </div>
      <div className="form-card">
        <h2 className="form-title">Add New Store</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Store Name <span className="hint">(20–60 chars)</span></label>
            <input type="text" name="name" placeholder="Enter store name"
              value={form.name} onChange={handleChange} minLength={20} maxLength={60} required />
            <span className="char-count">{form.name.length}/60</span>
          </div>
          <div className="form-group">
            <label>Store Email</label>
            <input type="email" name="email" placeholder="store@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Address <span className="hint">(max 400 chars)</span></label>
            <textarea name="address" placeholder="Full store address"
              value={form.address} onChange={handleChange} maxLength={400} rows={3} required />
            <span className="char-count">{form.address.length}/400</span>
          </div>
          <div className="form-group">
            <label>Assign Owner <span className="hint">(optional)</span></label>
            <select name="owner_id" value={form.owner_id} onChange={handleChange}>
              <option value="">— No Owner —</option>
              {owners.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Store'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStore;
