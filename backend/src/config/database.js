const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'fluttrr',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000,
      evict: 1000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      paranoid: true,
    },
    dialectOptions: {
      statement_timeout: 30000,
      idle_in_transaction_session_timeout: 60000,
    },
    retry: {
      max: 3,
    },
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to database:', error.message);
    return false;
  }
};

const syncDatabase = async (options = {}) => {
  try {
    const defaultOptions = {
      alter: process.env.NODE_ENV === 'development',
      force: false,
      ...options,
    };
    await sequelize.sync(defaultOptions);
    logger.info('Database synced successfully.');
  } catch (error) {
    logger.error('Database sync failed:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
};
