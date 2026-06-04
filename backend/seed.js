require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
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

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database synced (all tables recreated).');

    const adminPw = await bcrypt.hash('Admin@123', 10);
    const admin = await User.create({
      name: 'System Administrator User',
      email: 'admin@storerate.com',
      password: adminPw,
      address: '123 Admin Street, Tech City, CA 90001',
      role: 'admin',
    });
    console.log('✅ Admin user created:', admin.email);

    // Sample store owner
    const ownerPw = await bcrypt.hash('Owner@123', 10);
    const owner = await User.create({
      name: 'Coffee House Store Owner',
      email: 'owner@storerate.com',
      password: ownerPw,
      address: '456 Brew Lane, Bean Town, NY 10001',
      role: 'store_owner',
    });
    console.log('✅ Store owner created:', owner.email);

    // Sample normal user
    const userPw = await bcrypt.hash('User@1234', 10);
    const normalUser = await User.create({
      name: 'John Regular User Smith',
      email: 'user@storerate.com',
      password: userPw,
      address: '789 Main Street, Springfield, IL 62701',
      role: 'user',
    });
    console.log('✅ Normal user created:', normalUser.email);

    // Sample store
    const store = await Store.create({
      name: 'The Coffee House Premium Cafe',
      email: 'coffee@storerate.com',
      address: '101 Espresso Ave, Coffee District, CA 94102',
      owner_id: owner.id,
    });
    console.log('✅ Store created:', store.name);

    // Sample rating
    await Rating.create({ user_id: normalUser.id, store_id: store.id, rating: 4 });
    console.log('✅ Sample rating added.');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('  Admin:       admin@storerate.com  / Admin@123');
    console.log('  Store Owner: owner@storerate.com  / Owner@123');
    console.log('  Normal User: user@storerate.com   / User@1234');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
