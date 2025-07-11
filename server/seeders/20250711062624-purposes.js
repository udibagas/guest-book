"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("purposes", [
      {
        name: "Business Meeting",
        description: "Meeting with business partners, clients, or stakeholders",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Job Interview",
        description: "Interview for employment opportunities",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Delivery/Pickup",
        description: "Package delivery or pickup services",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Maintenance/Repair",
        description: "Equipment maintenance or repair services",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Training/Workshop",
        description: "Attending training sessions or workshops",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Consultation",
        description: "Professional consultation or advisory services",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Other",
        description: "Other purposes not listed above",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("purposes", null, {});
  },
};
