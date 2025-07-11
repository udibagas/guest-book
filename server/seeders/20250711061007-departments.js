"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("departments", [
      {
        name: "Human Resources",
        description: "Human Resources and People Management Department",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sales",
        description: "Sales and Business Development Department",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "IT",
        description: "Information Technology Department",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Finance",
        description: "Finance and Accounting Department",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Operations",
        description: "Operations and Project Management Department",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Marketing",
        description: "Marketing and Communications Department",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("departments", null, {});
  },
};
