module.exports = (sequelize, DataTypes) => {
  const Host = sequelize.define(
    "Host",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
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
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "phone_number",
        validate: {
          len: [0, 15],
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "is_active",
      },
    },
    {
      tableName: "hosts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["email"],
        },
        {
          fields: ["department"],
        },
        {
          fields: ["is_active"],
        },
      ],
    }
  );

  // Class methods
  Host.getActiveHosts = function () {
    return this.findAll({
      where: {
        isActive: true,
      },
      order: [["name", "ASC"]],
    });
  };

  Host.getHostsByDepartment = function (department) {
    return this.findAll({
      where: {
        department: department,
        isActive: true,
      },
      order: [["name", "ASC"]],
    });
  };

  return Host;
};
