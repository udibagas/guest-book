"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("roles", [
      {
        name: "Manager",
        description: "Department Manager",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Senior Staff",
        description: "Senior Staff Member",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Staff",
        description: "Regular Staff Member",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Director",
        description: "Department Director",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Supervisor",
        description: "Team Supervisor",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Assistant",
        description: "Assistant Staff",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
