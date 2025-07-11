"use strict";

const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await queryInterface.bulkInsert("users", [
      {
        username: "admin",
        email: "admin@mitrateknik.com",
        password: hashedPassword,
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", { username: "admin" }, {});
  },
};
