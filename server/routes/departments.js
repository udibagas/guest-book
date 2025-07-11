const express = require("express");
const { Department } = require("../models");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Get all departments (public access for guest form)
router.get("/", async (req, res) => {
  try {
    const { active } = req.query;

    const whereClause = {};
    if (active === "true") {
      whereClause.isActive = true;
    }

    const departments = await Department.findAll({
      where: whereClause,
      order: [["name", "ASC"]],
    });

    res.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get department by ID
router.get("/:id", async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create department (admin only)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    const department = await Department.create({
      name,
      description,
      isActive,
    });

    res.status(201).json(department);
  } catch (error) {
    console.error("Error creating department:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Department name already exists" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// Update department (admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    await department.update({
      name,
      description,
      isActive,
    });

    res.json(department);
  } catch (error) {
    console.error("Error updating department:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Department name already exists" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete department (admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    await department.destroy();
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
