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
        phone_number: "+62812345678",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Jane Smith",
        department_id: 2,
        role_id: 2,
        email: "jane.smith@mitrateknik.com",
        phone_number: "+62812345679",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Mike Johnson",
        department_id: 3,
        role_id: 3,
        email: "mike.johnson@mitrateknik.com",
        phone_number: "+62812345680",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Sarah Wilson",
        department_id: 4,
        role_id: 4,
        email: "sarah.wilson@mitrateknik.com",
        phone_number: "+62812345681",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "David Brown",
        department_id: 5,
        role_id: 5,
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
