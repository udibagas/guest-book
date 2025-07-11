"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("hosts", [
      {
        name: "John Doe",
        DepartmentId: 1,
        RoleId: 1,
        email: "john.doe@mitrateknik.com",
        phoneNumber: "+62812345678",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Jane Smith",
        DepartmentId: 2,
        RoleId: 2,
        email: "jane.smith@mitrateknik.com",
        phoneNumber: "+62812345679",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Mike Johnson",
        DepartmentId: 3,
        RoleId: 3,
        email: "mike.johnson@mitrateknik.com",
        phoneNumber: "+62812345680",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sarah Wilson",
        DepartmentId: 4,
        RoleId: 4,
        email: "sarah.wilson@mitrateknik.com",
        phoneNumber: "+62812345681",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "David Brown",
        DepartmentId: 5,
        RoleId: 5,
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
