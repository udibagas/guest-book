module.exports = (sequelize, DataTypes) => {
  const Purpose = sequelize.define(
    "Purpose",
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
        field: "is_active",
      },
    },
    {
      tableName: "purposes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["name"],
        },
        {
          fields: ["is_active"],
        },
      ],
    }
  );

  // Class methods
  Purpose.getActivePurposes = function () {
    return this.findAll({
      where: {
        isActive: true,
      },
      order: [["name", "ASC"]],
    });
  };

  return Purpose;
};
