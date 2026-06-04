const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Validations
    if (!name || name.length < 20 || name.length > 60)
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters.' });
    if (!address || address.length > 400)
      return res.status(400).json({ message: 'Address must be at most 400 characters.' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email))
      return res.status(400).json({ message: 'Invalid email address.' });
    const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
    if (!password || !pwRegex.test(password))
      return res.status(400).json({ message: 'Password must be 8-16 chars with at least one uppercase letter and one special character.' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, address, role: 'user' });

    return res.status(201).json({ message: 'Registration successful.', userId: user.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, address: user.address },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PUT /api/auth/password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
    if (!newPassword || !pwRegex.test(newPassword))
      return res.status(400).json({ message: 'New password must be 8-16 chars with at least one uppercase letter and one special character.' });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { register, login, updatePassword };
