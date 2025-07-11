const express = require("express");
const { body, validationResult } = require("express-validator");
const { Host, Department, Role } = require("../models");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Validation middleware
const validateHost = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Host name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("phoneNumber")
    .optional()
    .trim()
    .isLength({ max: 15 })
    .withMessage("Phone number must not exceed 15 characters"),
  body("departmentId")
    .optional()
    .isInt()
    .withMessage("Department ID must be a valid integer"),
  body("roleId")
    .optional()
    .isInt()
    .withMessage("Role ID must be a valid integer"),
];

// GET /api/hosts - Get all active hosts (public access for guest form)
router.get("/", async (req, res) => {
  try {
    const { department, departmentId, active } = req.query;

    const whereClause = {};
    if (active === "true") {
      whereClause.isActive = true;
    }

    const includeModels = [
      { model: Department, as: "Department" },
      { model: Role, as: "Role" },
    ];

    let hosts;
    if (departmentId) {
      whereClause.departmentId = departmentId;
    } else if (department) {
      whereClause.department = department;
    }

    hosts = await Host.findAll({
      where: whereClause,
      include: includeModels,
      order: [["name", "ASC"]],
    });

    res.json(hosts);
  } catch (error) {
    console.error("Error fetching hosts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch hosts",
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

// GET /api/hosts/:id - Get a specific host
router.get("/:id", async (req, res) => {
  try {
    const host = await Host.findOne({
      where: { id: req.params.id },
      include: [
        { model: Department, as: "Department" },
        { model: Role, as: "Role" },
      ],
    });

    if (!host) {
      return res.status(404).json({
        success: false,
        error: "Host not found",
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
      error: "Failed to fetch host",
    });
  }
});

// POST /api/hosts - Create a new host (admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validateHost,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const {
        name,
        department,
        role,
        email,
        phoneNumber,
        departmentId,
        roleId,
        isActive = true,
      } = req.body;

      // Check if email already exists
      const existingHost = await Host.findOne({
        where: { email },
      });

      if (existingHost) {
        return res.status(409).json({
          success: false,
          error: "Host with this email already exists",
        });
      }

      const host = await Host.create({
        name,
        department,
        role,
        email,
        phoneNumber,
        departmentId,
        roleId,
        isActive,
      });

      // Fetch the created host with associations
      const createdHost = await Host.findOne({
        where: { id: host.id },
        include: [
          { model: Department, as: "Department" },
          { model: Role, as: "Role" },
        ],
      });

      res.status(201).json({
        success: true,
        message: "Host created successfully",
        data: createdHost,
      });
    } catch (error) {
      console.error("Error creating host:", error);

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          error: "Host with this email already exists",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to create host",
      });
    }
  }
);

// PUT /api/hosts/:id - Update a host (admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateHost,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const host = await Host.findByPk(req.params.id);
      if (!host) {
        return res.status(404).json({
          success: false,
          error: "Host not found",
        });
      }

      const {
        name,
        department,
        role,
        email,
        phoneNumber,
        departmentId,
        roleId,
        isActive,
      } = req.body;

      // Check if email already exists (excluding current host)
      const existingHost = await Host.findOne({
        where: {
          email,
          id: { [require("sequelize").Op.ne]: req.params.id },
        },
      });

      if (existingHost) {
        return res.status(409).json({
          success: false,
          error: "Host with this email already exists",
        });
      }

      await host.update({
        name,
        department,
        role,
        email,
        phoneNumber,
        departmentId,
        roleId,
        isActive,
      });

      // Fetch the updated host with associations
      const updatedHost = await Host.findOne({
        where: { id: host.id },
        include: [
          { model: Department, as: "Department" },
          { model: Role, as: "Role" },
        ],
      });

      res.json({
        success: true,
        message: "Host updated successfully",
        data: updatedHost,
      });
    } catch (error) {
      console.error("Error updating host:", error);

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          error: "Host with this email already exists",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to update host",
      });
    }
  }
);

// DELETE /api/hosts/:id - Delete a host (admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const host = await Host.findByPk(req.params.id);
    if (!host) {
      return res.status(404).json({
        success: false,
        error: "Host not found",
      });
    }

    await host.destroy();

    res.json({
      success: true,
      message: "Host deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting host:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete host",
    });
  }
});

module.exports = router;
