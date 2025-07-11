const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Guest = require("./guest")(sequelize, Sequelize);
db.Visit = require("./visit")(sequelize, Sequelize);
db.Purpose = require("./purpose")(sequelize, Sequelize);
db.Host = require("./host")(sequelize, Sequelize);
db.Department = require("./department")(sequelize, Sequelize);
db.Role = require("./role")(sequelize, Sequelize);
db.User = require("./user")(sequelize, Sequelize);

// Define associations
// Guest to Visit (One to Many)
db.Guest.hasMany(db.Visit, { as: "visits" });
db.Visit.belongsTo(db.Guest, { as: "Guest" });

// Host to Visit (One to Many)
db.Host.hasMany(db.Visit, { as: "visits" });
db.Visit.belongsTo(db.Host, { as: "Host" });

// Purpose to Visit (One to Many)
db.Purpose.hasMany(db.Visit, { as: "visits" });
db.Visit.belongsTo(db.Purpose, { as: "Purpose" });

// Department to Host (One to Many)
db.Department.hasMany(db.Host, { as: "hosts" });
db.Host.belongsTo(db.Department, { as: "Department" });

// Role to Host (One to Many)
db.Role.hasMany(db.Host, { as: "hosts" });
db.Host.belongsTo(db.Role, { as: "Role" });

module.exports = db;
