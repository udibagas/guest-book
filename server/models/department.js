module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define(
    "Department",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 500],
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "departments",
      indexes: [
        {
          fields: ["name"],
        },
        {
          fields: ["isActive"],
        },
      ],
    }
  );

  // Class methods
  Department.getActiveDepartments = function () {
    return this.findAll({
      where: {
        isActive: true,
      },
      order: [["name", "ASC"]],
    });
  };

  return Department;
};
