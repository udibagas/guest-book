"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("hosts", [
      {
        name: "John Doe",
        department: "Human Resources",
        role: "HR Manager",
        email: "john.doe@mitrateknik.com",
        phone_number: "+62812345678",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Jane Smith",
        department: "Sales",
        role: "Sales Manager",
        email: "jane.smith@mitrateknik.com",
        phone_number: "+62812345679",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Mike Johnson",
        department: "IT",
        role: "IT Manager",
        email: "mike.johnson@mitrateknik.com",
        phone_number: "+62812345680",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Sarah Wilson",
        department: "Finance",
        role: "Finance Manager",
        email: "sarah.wilson@mitrateknik.com",
        phone_number: "+62812345681",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "David Brown",
        department: "Operations",
        role: "Operations Manager",
        email: "david.brown@mitrateknik.com",
        phone_number: "+62812345682",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("hosts", null, {});
  },
};
