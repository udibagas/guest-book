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
      DepartmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "departments",
          key: "id",
        },
      },
      RoleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
        validate: {
          len: [0, 15],
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "hosts",
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
          fields: ["isActive"],
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

  Host.getHostsByDepartment = function (DepartmentId) {
    return this.findAll({
      where: {
        DepartmentId: DepartmentId,
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
