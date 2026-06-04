const { Op } = require('sequelize');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const User = require('../models/User');

// GET /api/stores  — list all stores with user's rating
const getStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', order = 'ASC' } = req.query;
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const allowedSort = ['name', 'address', 'createdAt'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({ where, order: [[sortField, sortOrder]] });

    const result = await Promise.all(stores.map(async (store) => {
      const allRatings = await Rating.findAll({ where: { store_id: store.id } });
      const avgRating = allRatings.length > 0
        ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(2)
        : null;

      const userRating = req.user
        ? await Rating.findOne({ where: { store_id: store.id, user_id: req.user.id } })
        : null;

      return {
        ...store.toJSON(),
        avgRating,
        userRating: userRating ? userRating.rating : null,
        userRatingId: userRating ? userRating.id : null,
      };
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// POST /api/ratings  — submit rating
const submitRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body;
    if (!store_id || !rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Store ID and rating (1–5) are required.' });

    const store = await Store.findByPk(store_id);
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const existing = await Rating.findOne({ where: { store_id, user_id: req.user.id } });
    if (existing) return res.status(409).json({ message: 'You have already rated this store. Use PUT to update.' });

    const newRating = await Rating.create({ store_id, user_id: req.user.id, rating });
    return res.status(201).json({ message: 'Rating submitted.', ratingId: newRating.id });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PUT /api/ratings/:id  — update rating
const updateRating = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });

    const existing = await Rating.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Rating not found or not yours.' });

    existing.rating = rating;
    await existing.save();
    return res.json({ message: 'Rating updated.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getStores, submitRating, updateRating };
