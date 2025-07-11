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
      guest_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "guests",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      host_id: {
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
      custom_purpose: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      visit_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      check_in_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      check_out_time: {
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
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("visits", ["guest_id"]);
    await queryInterface.addIndex("visits", ["host_id"]);
    await queryInterface.addIndex("visits", ["purpose_id"]);
    await queryInterface.addIndex("visits", ["visit_date"]);
    await queryInterface.addIndex("visits", ["status"]);
    await queryInterface.addIndex("visits", ["check_in_time"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("visits");
  },
};
