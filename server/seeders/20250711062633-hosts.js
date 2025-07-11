"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("hosts", [
      {
        name: "John Doe",
        department_id: 1,
        role_id: 1,
        email: "john.doe@mitrateknik.com",
        phoneNumber: "+62812345678",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Jane Smith",
        department_id: 2,
        role_id: 2,
        email: "jane.smith@mitrateknik.com",
        phoneNumber: "+62812345679",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Mike Johnson",
        department_id: 3,
        role_id: 3,
        email: "mike.johnson@mitrateknik.com",
        phoneNumber: "+62812345680",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sarah Wilson",
        department_id: 4,
        role_id: 4,
        email: "sarah.wilson@mitrateknik.com",
        phoneNumber: "+62812345681",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "David Brown",
        department_id: 5,
        role_id: 5,
        email: "david.brown@mitrateknik.com",
        phoneNumber: "+62812345682",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("hosts", null, {});
  },
};
