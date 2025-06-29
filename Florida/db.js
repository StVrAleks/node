const {Sequelize} = require("sequelize");

module.exports = new Sequelize(
    process.env.DB_NAME || 'flowerida_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '1234',
    {
        dialect: 'mysql',
        host:process.env.DB_HOST || "localhost",
    pool: {
    max: 20, // Максимальное количество соединений в пуле
    min: 0 // Минимальное количество соединений в пуле
  }}
);