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
        allowNull: true, // Made nullable since we'll use departmentId
        validate: {
          len: [0, 100],
        },
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "department_id",
        references: {
          model: "departments",
          key: "id",
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true, // Made nullable since we'll use roleId
        validate: {
          len: [0, 100],
        },
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "role_id",
        references: {
          model: "roles",
          key: "id",
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
          fields: ["department_id"],
        },
        {
          fields: ["role_id"],
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
      include: [
        { model: sequelize.models.Department, as: "Department" },
        { model: sequelize.models.Role, as: "Role" },
      ],
      order: [["name", "ASC"]],
    });
  };

  Host.getHostsByDepartment = function (departmentId) {
    return this.findAll({
      where: {
        departmentId: departmentId,
        isActive: true,
      },
      include: [
        { model: sequelize.models.Department, as: "Department" },
        { model: sequelize.models.Role, as: "Role" },
      ],
      order: [["name", "ASC"]],
    });
  };

  return Host;
};
