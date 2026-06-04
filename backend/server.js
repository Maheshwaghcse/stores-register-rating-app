require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// Models (import to register associations)
const User = require('./models/User');
const Store = require('./models/Store');
const Rating = require('./models/Rating');

// Associations
User.hasMany(Rating, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'user_id' });

Store.hasMany(Rating, { foreignKey: 'store_id', onDelete: 'CASCADE' });
Rating.belongsTo(Store, { foreignKey: 'store_id' });

User.hasOne(Store, { foreignKey: 'owner_id', onDelete: 'SET NULL' });
Store.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/stores');
const ownerRoutes = require('./routes/owner');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/owner', ownerRoutes);

app.get('/', (req, res) => res.json({ message: 'Store Rating API running.' }));

// Sync DB and start server
const PORT = process.env.PORT || 5000;
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully.');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Failed to sync database:', err.message);
    process.exit(1);
  });
