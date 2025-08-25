const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database/db.sqlite",
});

const connectionDB = async () => {
  await sequelize.authenticate();
  console.log("Database authenticated");

  await sequelize.sync({ force: false });
  console.log("Database Synced");
};

module.exports = { sequelize, connectionDB };
