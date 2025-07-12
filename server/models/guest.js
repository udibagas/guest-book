module.exports = (sequelize, DataTypes) => {
  const Guest = sequelize.define(
    "Guest",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 15],
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      company: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      idPhotoPath: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "guests",
      indexes: [
        {
          fields: ["email"],
        },
        {
          fields: ["phoneNumber"],
        },
      ],
    }
  );

  // Class methods
  Guest.findOrCreateGuest = async function (guestData) {
    const [guest, created] = await this.findOrCreate({
      where: { phoneNumber: guestData.phoneNumber },
      defaults: guestData,
    });

    // If guest exists but has different info, update it
    if (!created) {
      await guest.update(guestData);
    }

    return guest;
  };

  return Guest;
};
