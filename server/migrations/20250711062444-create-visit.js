"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("visits", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      GuestId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "guests",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      HostId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "hosts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      purpose_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "purposes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      customPurpose: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      visitDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      checkInTime: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      checkOutTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("checked_in", "checked_out"),
        defaultValue: "checked_in",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("visits", ["GuestId"]);
    await queryInterface.addIndex("visits", ["HostId"]);
    await queryInterface.addIndex("visits", ["purpose_id"]);
    await queryInterface.addIndex("visits", ["visitDate"]);
    await queryInterface.addIndex("visits", ["status"]);
    await queryInterface.addIndex("visits", ["checkInTime"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("visits");
  },
};
