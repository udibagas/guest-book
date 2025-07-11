"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("roles", [
      {
        name: "Manager",
        description: "Department Manager",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Senior Staff",
        description: "Senior Staff Member",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Staff",
        description: "Regular Staff Member",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Director",
        description: "Department Director",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Supervisor",
        description: "Team Supervisor",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Assistant",
        description: "Assistant Staff",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
