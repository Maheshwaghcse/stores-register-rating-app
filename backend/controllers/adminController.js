const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: { [Op.in]: ['user', 'store_owner'] } } });
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();
    return res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', order = 'ASC' } = req.query;
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };
    if (role) where.role = role;

    const allowedSort = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'address', 'role'],
      order: [[sortField, sortOrder]],
    });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'address', 'role'],
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    let avgRating = null;
    if (user.role === 'store_owner') {
      const store = await Store.findOne({ where: { owner_id: user.id } });
      if (store) {
        const ratings = await Rating.findAll({ where: { store_id: store.id } });
        if (ratings.length > 0) {
          avgRating = (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2);
        }
      }
    }
    return res.json({ ...user.toJSON(), avgRating });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// POST /api/admin/users
const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || name.length < 20 || name.length > 60)
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters.' });
    if (!address || address.length > 400)
      return res.status(400).json({ message: 'Address must be at most 400 characters.' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email))
      return res.status(400).json({ message: 'Invalid email address.' });
    const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
    if (!password || !pwRegex.test(password))
      return res.status(400).json({ message: 'Password must be 8-16 chars with at least one uppercase and one special character.' });
    if (!['admin', 'user', 'store_owner'].includes(role))
      return res.status(400).json({ message: 'Invalid role.' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, address, role });
    return res.status(201).json({ message: 'User created successfully.', userId: user.id });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/admin/stores
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', order = 'ASC' } = req.query;
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const allowedSort = ['name', 'email', 'address', 'createdAt'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({ where, order: [[sortField, sortOrder]] });

    const storesWithRating = await Promise.all(stores.map(async (store) => {
      const ratings = await Rating.findAll({ where: { store_id: store.id } });
      const avgRating = ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
        : null;
      return { ...store.toJSON(), avgRating };
    }));

    return res.json(storesWithRating);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// POST /api/admin/stores
const addStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    if (!name || name.length < 20 || name.length > 60)
      return res.status(400).json({ message: 'Store name must be between 20 and 60 characters.' });
    if (!address || address.length > 400)
      return res.status(400).json({ message: 'Address must be at most 400 characters.' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email))
      return res.status(400).json({ message: 'Invalid email address.' });

    const existing = await Store.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Store email already registered.' });

    if (owner_id) {
      const owner = await User.findOne({ where: { id: owner_id, role: 'store_owner' } });
      if (!owner) return res.status(400).json({ message: 'Owner not found or is not a store owner.' });
    }

    const store = await Store.create({ name, email, address, owner_id: owner_id || null });
    return res.status(201).json({ message: 'Store created successfully.', storeId: store.id });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getDashboard, getUsers, getUserById, addUser, getStores, addStore };
