const express = require("express");
const { body, validationResult } = require("express-validator");
const { Visit, Guest, Host, Purpose } = require("../models");
const { Op } = require("sequelize");
const router = express.Router();

// Validation middleware
const validateVisit = [
  body("guestData.name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Guest name must be between 2 and 100 characters"),
  body("guestData.phoneNumber")
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 characters"),
  body("guestData.email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("guestData.role")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Role must be between 2 and 100 characters"),
  body("guestData.company")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Company name must not exceed 100 characters"),
  body("guestData.idPhotoPath").notEmpty().withMessage("ID photo is required"),
  body("PurposeId").isInt().withMessage("Purpose ID must be a valid integer"),
  body("HostId")
    .optional()
    .isInt()
    .withMessage("Host ID must be a valid integer"),
  body("customPurpose")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Custom purpose must not exceed 500 characters"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

// GET /api/visits - Get all visits with optional filtering
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      search,
      HostId,
      PurposeId,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};
    const guestWhere = {};

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by host
    if (HostId) {
      where.HostId = HostId;
    }

    // Filter by purpose
    if (PurposeId) {
      where.PurposeId = PurposeId;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.visitDate = {};
      if (startDate) {
        where.visitDate[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.visitDate[Op.lte] = new Date(endDate);
      }
    }

    // Search functionality
    if (search) {
      guestWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Visit.findAndCountAll({
      where,
      include: [
        {
          model: Guest,
          as: "Guest",
          where: Object.keys(guestWhere).length > 0 ? guestWhere : undefined,
          attributes: [
            "id",
            "name",
            "email",
            "company",
            "role",
            "phoneNumber",
            "idPhotoPath",
          ],
        },
        {
          model: Host,
          as: "Host",
          attributes: ["id", "name"],
        },
        {
          model: Purpose,
          as: "Purpose",
          attributes: ["id", "name", "description"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    res.json({
      success: true,
      data: {
        visits: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalCount: count,
          hasNext: offset + rows.length < count,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching visits",
      error: error.message,
    });
  }
});

// GET /api/visits/today - Get today's visitors
router.get("/today", async (req, res) => {
  try {
    const visits = await Visit.getTodayVisitors();
    res.json({
      success: true,
      data: visits,
    });
  } catch (error) {
    console.error("Error fetching today's visits:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching today's visits",
      error: error.message,
    });
  }
});

// GET /api/visits/active - Get currently checked-in visits
router.get("/active", async (req, res) => {
  try {
    const visits = await Visit.getActiveVisits();
    res.json({
      success: true,
      data: visits,
    });
  } catch (error) {
    console.error("Error fetching active visits:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching active visits",
      error: error.message,
    });
  }
});

// GET /api/visits/stats - Get visit statistics
router.get("/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalVisits, todayVisits, checkedInVisits] = await Promise.all([
      Visit.count(),
      Visit.count({
        where: {
          visitDate: {
            [Op.gte]: today,
            [Op.lt]: tomorrow,
          },
        },
      }),
      Visit.count({
        where: {
          status: "checked_in",
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalVisits,
        todayVisits,
        checkedInVisits,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
});

// GET /api/visits/:id - Get specific visit
router.get("/:id", async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id, {
      include: [
        {
          model: Guest,
          as: "Guest",
          attributes: [
            "id",
            "name",
            "email",
            "company",
            "role",
            "phoneNumber",
            "idPhotoPath",
          ],
        },
        {
          model: Host,
          as: "Host",
          attributes: [
            "id",
            "name",
            "department",
            "role",
            "email",
            "phoneNumber",
          ],
        },
        {
          model: Purpose,
          as: "Purpose",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    res.json({
      success: true,
      data: visit,
    });
  } catch (error) {
    console.error("Error fetching visit:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching visit",
      error: error.message,
    });
  }
});

// POST /api/visits - Create new visit (register guest)
router.post("/", validateVisit, async (req, res) => {
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

    const { guestData, PurposeId, HostId, customPurpose, notes } = req.body;

    // Verify purpose exists
    const purpose = await Purpose.findByPk(PurposeId);
    if (!purpose) {
      return res.status(400).json({
        success: false,
        message: "Invalid purpose selected",
      });
    }

    // Verify host exists if provided
    if (HostId) {
      const host = await Host.findByPk(HostId);
      if (!host) {
        return res.status(400).json({
          success: false,
          message: "Invalid host selected",
        });
      }
    }

    // Create or update guest
    const guest = await Guest.findOrCreateGuest(guestData);

    // Create visit
    const visit = await Visit.create({
      guestId: guest.id,
      PurposeId,
      HostId: HostId || null,
      customPurpose: customPurpose || null,
      notes: notes || null,
      visitDate: new Date(),
      checkInTime: new Date(),
    });

    // Fetch the complete visit data with associations
    const completeVisit = await Visit.findByPk(visit.id, {
      include: [
        {
          model: Guest,
          as: "Guest",
          attributes: ["id", "name", "email", "company", "role", "phoneNumber"],
        },
        {
          model: Host,
          as: "Host",
          attributes: ["id", "name", "department", "role"],
        },
        {
          model: Purpose,
          as: "Purpose",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Guest registered successfully",
      data: completeVisit,
    });
  } catch (error) {
    console.error("Error registering visit:", error);

    res.status(500).json({
      success: false,
      message: "Error registering visit",
      error: error.message,
    });
  }
});

// PUT /api/visits/:id/checkout - Check out visit
router.put("/:id/checkout", async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id, {
      include: [
        {
          model: Guest,
          as: "Guest",
          attributes: ["name", "email"],
        },
      ],
    });

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    if (visit.status === "checked_out") {
      return res.status(400).json({
        success: false,
        message: "Visit is already checked out",
      });
    }

    await visit.checkOut();

    res.json({
      success: true,
      message: "Guest checked out successfully",
      data: visit,
    });
  } catch (error) {
    console.error("Error checking out visit:", error);
    res.status(500).json({
      success: false,
      message: "Error checking out visit",
      error: error.message,
    });
  }
});

// PUT /api/visits/:id - Update visit
router.put("/:id", async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    const { HostId, customPurpose, notes } = req.body;

    await visit.update({
      ...(HostId && { HostId }),
      ...(customPurpose !== undefined && { customPurpose }),
      ...(notes !== undefined && { notes }),
    });

    const updatedVisit = await Visit.findByPk(visit.id, {
      include: [
        {
          model: Guest,
          as: "Guest",
          attributes: ["id", "name", "email", "company", "role"],
        },
        {
          model: Host,
          as: "Host",
          attributes: ["id", "name", "department", "role"],
        },
        {
          model: Purpose,
          as: "Purpose",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Visit updated successfully",
      data: updatedVisit,
    });
  } catch (error) {
    console.error("Error updating visit:", error);
    res.status(500).json({
      success: false,
      message: "Error updating visit",
      error: error.message,
    });
  }
});

// DELETE /api/visits/:id - Delete visit (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    await visit.destroy();

    res.json({
      success: true,
      message: "Visit deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting visit:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting visit",
      error: error.message,
    });
  }
});

module.exports = router;
