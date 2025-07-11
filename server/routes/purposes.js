const express = require("express");
const { body, validationResult } = require("express-validator");
const { Purpose } = require("../models");
const router = express.Router();

// Validation middleware
const validatePurpose = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Purpose name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

// GET /api/purposes - Get all active purposes
router.get("/", async (req, res) => {
  try {
    const purposes = await Purpose.getActivePurposes();
    res.json({
      success: true,
      data: purposes,
    });
  } catch (error) {
    console.error("Error fetching purposes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching purposes",
      error: error.message,
    });
  }
});

// GET /api/purposes/:id - Get specific purpose
router.get("/:id", async (req, res) => {
  try {
    const purpose = await Purpose.findByPk(req.params.id);

    if (!purpose) {
      return res.status(404).json({
        success: false,
        message: "Purpose not found",
      });
    }

    res.json({
      success: true,
      data: purpose,
    });
  } catch (error) {
    console.error("Error fetching purpose:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching purpose",
      error: error.message,
    });
  }
});

// POST /api/purposes - Create new purpose
router.post("/", validatePurpose, async (req, res) => {
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

    const { name, description } = req.body;

    const purpose = await Purpose.create({
      name,
      description: description || null,
    });

    res.status(201).json({
      success: true,
      message: "Purpose created successfully",
      data: purpose,
    });
  } catch (error) {
    console.error("Error creating purpose:", error);

    // Handle unique constraint errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "A purpose with this name already exists",
        error: "Duplicate entry",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating purpose",
      error: error.message,
    });
  }
});

// PUT /api/purposes/:id - Update purpose
router.put("/:id", validatePurpose, async (req, res) => {
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

    const purpose = await Purpose.findByPk(req.params.id);

    if (!purpose) {
      return res.status(404).json({
        success: false,
        message: "Purpose not found",
      });
    }

    const { name, description, isActive } = req.body;

    await purpose.update({
      name,
      description: description || null,
      ...(typeof isActive !== "undefined" && { isActive }),
    });

    res.json({
      success: true,
      message: "Purpose updated successfully",
      data: purpose,
    });
  } catch (error) {
    console.error("Error updating purpose:", error);

    // Handle unique constraint errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "A purpose with this name already exists",
        error: "Duplicate entry",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating purpose",
      error: error.message,
    });
  }
});

// DELETE /api/purposes/:id - Soft delete purpose (set inactive)
router.delete("/:id", async (req, res) => {
  try {
    const purpose = await Purpose.findByPk(req.params.id);

    if (!purpose) {
      return res.status(404).json({
        success: false,
        message: "Purpose not found",
      });
    }

    await purpose.update({ isActive: false });

    res.json({
      success: true,
      message: "Purpose deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating purpose:", error);
    res.status(500).json({
      success: false,
      message: "Error deactivating purpose",
      error: error.message,
    });
  }
});

module.exports = router;
