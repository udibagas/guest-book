const express = require("express");
const { body, validationResult } = require("express-validator");
const { Host } = require("../models");
const router = express.Router();

// Validation middleware
const validateHost = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Host name must be between 2 and 100 characters"),
  body("department")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Department must be between 2 and 100 characters"),
  body("role")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Role must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("phoneNumber")
    .optional()
    .trim()
    .isLength({ max: 15 })
    .withMessage("Phone number must not exceed 15 characters"),
];

// GET /api/hosts - Get all active hosts
router.get("/", async (req, res) => {
  try {
    const { department } = req.query;

    let hosts;
    if (department) {
      hosts = await Host.getHostsByDepartment(department);
    } else {
      hosts = await Host.getActiveHosts();
    }

    res.json({
      success: true,
      data: hosts,
    });
  } catch (error) {
    console.error("Error fetching hosts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hosts",
      error: error.message,
    });
  }
});

// GET /api/hosts/departments - Get unique departments
router.get("/departments", async (req, res) => {
  try {
    const departments = await Host.findAll({
      attributes: [
        [
          Host.sequelize.fn("DISTINCT", Host.sequelize.col("department")),
          "department",
        ],
      ],
      where: {
        isActive: true,
      },
      order: [["department", "ASC"]],
      raw: true,
    });

    res.json({
      success: true,
      data: departments.map((d) => d.department),
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching departments",
      error: error.message,
    });
  }
});

// GET /api/hosts/:id - Get specific host
router.get("/:id", async (req, res) => {
  try {
    const host = await Host.findByPk(req.params.id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host not found",
      });
    }

    res.json({
      success: true,
      data: host,
    });
  } catch (error) {
    console.error("Error fetching host:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching host",
      error: error.message,
    });
  }
});

// POST /api/hosts - Create new host
router.post("/", validateHost, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { name, department, role, email, phoneNumber } = req.body;

    const host = await Host.create({
      name,
      department,
      role,
      email,
      phoneNumber: phoneNumber || null,
    });

    res.status(201).json({
      success: true,
      message: "Host created successfully",
      data: host,
    });
  } catch (error) {
    console.error("Error creating host:", error);

    // Handle unique constraint errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "A host with this email already exists",
        error: "Duplicate entry",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating host",
      error: error.message,
    });
  }
});

// PUT /api/hosts/:id - Update host
router.put("/:id", validateHost, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const host = await Host.findByPk(req.params.id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host not found",
      });
    }

    const { name, department, role, email, phoneNumber, isActive } = req.body;

    await host.update({
      name,
      department,
      role,
      email,
      phoneNumber: phoneNumber || null,
      ...(typeof isActive !== "undefined" && { isActive }),
    });

    res.json({
      success: true,
      message: "Host updated successfully",
      data: host,
    });
  } catch (error) {
    console.error("Error updating host:", error);

    // Handle unique constraint errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "A host with this email already exists",
        error: "Duplicate entry",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating host",
      error: error.message,
    });
  }
});

// DELETE /api/hosts/:id - Soft delete host (set inactive)
router.delete("/:id", async (req, res) => {
  try {
    const host = await Host.findByPk(req.params.id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host not found",
      });
    }

    await host.update({ isActive: false });

    res.json({
      success: true,
      message: "Host deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating host:", error);
    res.status(500).json({
      success: false,
      message: "Error deactivating host",
      error: error.message,
    });
  }
});

module.exports = router;
