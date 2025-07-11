"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("purposes", [
      {
        name: "Business Meeting",
        description: "Meeting with business partners, clients, or stakeholders",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Job Interview",
        description: "Interview for employment opportunities",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Delivery/Pickup",
        description: "Package delivery or pickup services",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Maintenance/Repair",
        description: "Equipment maintenance or repair services",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Training/Workshop",
        description: "Attending training sessions or workshops",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Consultation",
        description: "Professional consultation or advisory services",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Other",
        description: "Other purposes not listed above",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("purposes", null, {});
  },
};
