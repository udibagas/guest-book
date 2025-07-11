"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add department_id column
    await queryInterface.addColumn("hosts", "department_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Add role_id column
    await queryInterface.addColumn("hosts", "role_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Add indexes
    await queryInterface.addIndex("hosts", ["department_id"]);
    await queryInterface.addIndex("hosts", ["role_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("hosts", ["department_id"]);
    await queryInterface.removeIndex("hosts", ["role_id"]);
    await queryInterface.removeColumn("hosts", "department_id");
    await queryInterface.removeColumn("hosts", "role_id");
  },
};
