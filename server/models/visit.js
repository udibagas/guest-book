module.exports = (sequelize, DataTypes) => {
  const Visit = sequelize.define(
    "Visit",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      GuestId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "guests",
          key: "id",
        },
      },
      HostId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "hosts",
          key: "id",
        },
      },
      PurposeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "purposes",
          key: "id",
        },
      },
      customPurpose: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 500],
        },
      },
      visitDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      checkInTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      checkOutTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("checked_in", "checked_out"),
        defaultValue: "checked_in",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 1000],
        },
      },
    },
    {
      tableName: "visits",
      indexes: [
        {
          fields: ["GuestId"],
        },
        {
          fields: ["HostId"],
        },
        {
          fields: ["PurposeId"],
        },
        {
          fields: ["visitDate"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["checkInTime"],
        },
      ],
    }
  );

  // Instance methods
  Visit.prototype.checkOut = function () {
    this.checkOutTime = new Date();
    this.status = "checked_out";
    return this.save();
  };

  // Class methods
  Visit.findByDateRange = function (startDate, endDate) {
    return this.findAll({
      where: {
        visitDate: {
          [sequelize.Sequelize.Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          association: "Guest",
          attributes: ["name", "email", "company", "role"],
        },
        {
          association: "Host",
          attributes: ["name"],
        },
        {
          association: "Purpose",
          attributes: ["name", "description"],
        },
      ],
      order: [
        ["visitDate", "DESC"],
        ["checkInTime", "DESC"],
      ],
    });
  };

  Visit.getTodayVisitors = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findAll({
      where: {
        visitDate: {
          [sequelize.Sequelize.Op.gte]: today,
          [sequelize.Sequelize.Op.lt]: tomorrow,
        },
      },
      include: [
        {
          association: "Guest",
          attributes: ["name", "email", "company", "role", "phoneNumber"],
        },
        {
          association: "Host",
          attributes: ["name"],
        },
        {
          association: "Purpose",
          attributes: ["name", "description"],
        },
      ],
      order: [["checkInTime", "DESC"]],
    });
  };

  Visit.getActiveVisits = function () {
    return this.findAll({
      where: {
        status: "checked_in",
      },
      include: [
        {
          association: "Guest",
          attributes: ["name", "email", "company", "role"],
        },
        {
          association: "Host",
          attributes: ["name"],
        },
        {
          association: "Purpose",
          attributes: ["name", "description"],
        },
      ],
      order: [["checkInTime", "DESC"]],
    });
  };

  return Visit;
};
