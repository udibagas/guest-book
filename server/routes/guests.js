const express = require("express");
const { body, validationResult } = require("express-validator");
const { Guest, Visit } = require("../models");
const { Op } = require("sequelize");
const router = express.Router();

// Validation middleware
const validateGuest = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("phoneNumber")
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("role")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Role must be between 2 and 100 characters"),
  body("purpose")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Purpose must be between 5 and 500 characters"),
  body("company")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Company name must not exceed 100 characters"),
  body("idPhotoPath").notEmpty().withMessage("ID photo is required"),
];

// GET /api/guests - Get all guests with optional filtering
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const offset = (page - 1) * limit;

    const { sequelize } = require("../models");

    // Build search condition for raw query
    let searchCondition = "";
    const replacements = { limit: parseInt(limit), offset: parseInt(offset) };

    if (search) {
      searchCondition = `WHERE (g.name ILIKE :search OR g.email ILIKE :search OR g.company ILIKE :search OR g."idNumber" ILIKE :search)`;
      replacements.search = `%${search}%`;
    }

    // Get guests with visit counts using raw query
    const guestsQuery = `
      SELECT 
        g.*,
        COALESCE(COUNT(v.id), 0) as "totalVisits"
      FROM "guests" g
      LEFT JOIN "visits" v ON g.id = v."GuestId"
      ${searchCondition}
      GROUP BY g.id
      ORDER BY g."createdAt" DESC
      LIMIT :limit OFFSET :offset
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM "guests" g
      ${searchCondition}
    `;

    const [guests, countResult] = await Promise.all([
      sequelize.query(guestsQuery, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(countQuery, {
        replacements: search ? { search: `%${search}%` } : {},
        type: sequelize.QueryTypes.SELECT,
      }),
    ]);

    const totalCount = parseInt(countResult[0].total);

    // Convert totalVisits to integer for each guest
    const formattedGuests = guests.map((guest) => ({
      ...guest,
      totalVisits: parseInt(guest.totalVisits),
    }));

    res.json({
      success: true,
      data: {
        rows: formattedGuests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          hasNext: parseInt(offset) + formattedGuests.length < totalCount,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching guests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching guests",
      error: error.message,
    });
  }
});

// GET /api/guests/search - Search guests by name, email, or company
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required",
      });
    }

    const guest = await Guest.findOne({
      where: { phoneNumber: { [Op.iLike]: `%${query}%` } },
    });

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    res.json(guest);
  } catch (error) {
    console.error("Error searching guests:", error);
    res.status(500).json({
      success: false,
      message: "Error searching guests",
      error: error.message,
    });
  }
});

// GET /api/guests/today - Get today's visitors
router.get("/today", async (req, res) => {
  try {
    const guests = await Guest.getTodayVisitors();
    res.json({
      success: true,
      data: guests,
    });
  } catch (error) {
    console.error("Error fetching today's guests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching today's guests",
      error: error.message,
    });
  }
});

// GET /api/guests/stats - Get guest statistics
router.get("/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalGuests, todayGuests, checkedInGuests] = await Promise.all([
      Guest.count(),
      Guest.count({
        where: {
          visitDate: {
            [Op.gte]: today,
            [Op.lt]: tomorrow,
          },
        },
      }),
      Guest.count({
        where: {
          status: "checked_in",
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalGuests,
        todayGuests,
        checkedInGuests,
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

// GET /api/guests/:id - Get specific guest
router.get("/:id", async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    res.json({
      success: true,
      data: guest,
    });
  } catch (error) {
    console.error("Error fetching guest:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching guest",
      error: error.message,
    });
  }
});

// POST /api/guests - Register new guest
router.post("/", validateGuest, async (req, res) => {
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

    const { name, phoneNumber, email, company, role, purpose, idPhotoPath } =
      req.body;

    // Create new guest
    const guest = await Guest.create({
      name,
      phoneNumber,
      email,
      company: company || null,
      role,
      purpose,
      idPhotoPath,
      visitDate: new Date(),
      checkInTime: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Guest registered successfully",
      data: guest,
    });
  } catch (error) {
    console.error("Error registering guest:", error);

    // Handle unique constraint errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "A guest with this email already exists today",
        error: "Duplicate entry",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error registering guest",
      error: error.message,
    });
  }
});

// PUT /api/guests/:id/checkout - Check out guest
router.put("/:id/checkout", async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    if (guest.status === "checked_out") {
      return res.status(400).json({
        success: false,
        message: "Guest is already checked out",
      });
    }

    await guest.checkOut();

    res.json({
      success: true,
      message: "Guest checked out successfully",
      data: guest,
    });
  } catch (error) {
    console.error("Error checking out guest:", error);
    res.status(500).json({
      success: false,
      message: "Error checking out guest",
      error: error.message,
    });
  }
});

// DELETE /api/guests/:id - Delete guest (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    await guest.destroy();

    res.json({
      success: true,
      message: "Guest deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting guest:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting guest",
      error: error.message,
    });
  }
});

module.exports = router;
