import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form) => {
  if (!form.name || form.name.length < 20 || form.name.length > 60)
    return 'Name must be between 20 and 60 characters.';
  if (!form.email || !emailRe.test(form.email))
    return 'Invalid email address.';
  if (!form.address || form.address.length > 400)
    return 'Address is required and must be at most 400 characters.';
  if (!pwRegex.test(form.password))
    return 'Password: 8–16 chars, at least one uppercase and one special character.';
  if (form.password !== form.confirmPassword)
    return 'Passwords do not match.';
  return null;
};

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(form);
    if (err) { toast.error(err); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo">⭐</div>
          <h1>Create Account</h1>
          <p>Join StoreRate today</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name <span className="hint">(20–60 chars)</span></label>
            <input id="reg-name" type="text" name="name" placeholder="Enter your full name"
              value={form.name} onChange={handleChange} minLength={20} maxLength={60} required />
            <span className="char-count">{form.name.length}/60</span>
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input id="reg-email" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="reg-address">Address <span className="hint">(max 400 chars)</span></label>
            <textarea id="reg-address" name="address" placeholder="Your full address"
              value={form.address} onChange={handleChange} maxLength={400} rows={3} required />
            <span className="char-count">{form.address.length}/400</span>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" name="password" placeholder="8-16 chars"
                value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" type="password" name="confirmPassword" placeholder="Re-enter password"
                value={form.confirmPassword} onChange={handleChange} required />
            </div>
          </div>
          <p className="password-hint">Password must be 8–16 characters with at least one uppercase letter and one special character.</p>
          <button id="register-btn" type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
