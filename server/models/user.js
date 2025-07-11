const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 50],
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 255],
        },
      },
      role: {
        type: DataTypes.ENUM("admin", "user"),
        defaultValue: "user",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "users",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
      indexes: [
        {
          fields: ["username"],
        },
        {
          fields: ["email"],
        },
        {
          fields: ["role"],
        },
        {
          fields: ["isActive"],
        },
      ],
    }
  );

  // Instance methods
  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  // Class methods
  User.findByUsername = function (username) {
    return this.findOne({
      where: { username, isActive: true },
    });
  };

  User.findByEmail = function (email) {
    return this.findOne({
      where: { email, isActive: true },
    });
  };

  return User;
};
