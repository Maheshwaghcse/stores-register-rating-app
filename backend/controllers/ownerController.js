const Store = require('../models/Store');
const Rating = require('../models/Rating');
const User = require('../models/User');

// GET /api/owner/dashboard
const getOwnerDashboard = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { owner_id: req.user.id } });
    if (!store) return res.status(404).json({ message: 'No store found for this owner.' });

    const ratings = await Rating.findAll({ where: { store_id: store.id } });
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
      : null;

    // Get users who rated
    const raterIds = ratings.map(r => r.user_id);
    const raters = raterIds.length > 0
      ? await User.findAll({
          where: { id: raterIds },
          attributes: ['id', 'name', 'email'],
        })
      : [];

    const raterMap = {};
    raters.forEach(u => { raterMap[u.id] = u; });

    const ratingDetails = ratings.map(r => ({
      userId: r.user_id,
      name: raterMap[r.user_id]?.name || 'Unknown',
      email: raterMap[r.user_id]?.email || 'Unknown',
      rating: r.rating,
      submittedAt: r.createdAt,
    }));

    return res.json({ store: store.toJSON(), avgRating, ratingDetails });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getOwnerDashboard };
