const express = require("express");
const { Role } = require("../models");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Get all roles (public access for guest form)
router.get("/", async (req, res) => {
  try {
    const { active } = req.query;

    const whereClause = {};
    if (active === "true") {
      whereClause.isActive = true;
    }

    const roles = await Role.findAll({
      where: whereClause,
      order: [["name", "ASC"]],
    });

    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get role by ID
router.get("/:id", async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create role (admin only)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    const role = await Role.create({
      name,
      description,
      isActive,
    });

    res.status(201).json(role);
  } catch (error) {
    console.error("Error creating role:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Role name already exists" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// Update role (admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    await role.update({
      name,
      description,
      isActive,
    });

    res.json(role);
  } catch (error) {
    console.error("Error updating role:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Role name already exists" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete role (admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    await role.destroy();
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
