const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(60), allowNull: false, validate: { len: [20, 60] } },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
  address: { type: DataTypes.STRING(400), allowNull: false },
  owner_id: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'stores', timestamps: true });

module.exports = Store;
