const express = require("express");
const { body, validationResult } = require("express-validator");
const { Visit, Guest, Host, Purpose, Department } = require("../models");
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
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("guestData.role")
    .optional()
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

  try {
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
          where: guestWhere,
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
          include: {
            model: Department,
            as: "Department",
            attributes: ["id", "name"],
          },
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
        rows: rows,
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

// GET /api/visits/reports - Get visit reports
router.get("/reports", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const { sequelize } = require("../models");

    // Build date filter condition
    let dateCondition = "";
    const replacements = {};

    if (startDate && endDate) {
      dateCondition = 'WHERE v."visitDate" BETWEEN :startDate AND :endDate';
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    } else if (startDate) {
      dateCondition = 'WHERE v."visitDate" >= :startDate';
      replacements.startDate = startDate;
    } else if (endDate) {
      dateCondition = 'WHERE v."visitDate" <= :endDate';
      replacements.endDate = endDate;
    }

    // Get total visits count
    const totalVisitsQuery = `
      SELECT COUNT(*) as total
      FROM "visits" v
      ${dateCondition}
    `;

    const [totalVisitsResult] = await sequelize.query(totalVisitsQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const totalVisits = parseInt(totalVisitsResult.total);

    // Get visits by department
    const departmentQuery = `
      SELECT 
        COALESCE(d.name, 'Tidak Diketahui') as name,
        COUNT(*) as count
      FROM "visits" v
      LEFT JOIN "hosts" h ON v."HostId" = h.id
      LEFT JOIN "departments" d ON h."DepartmentId" = d.id
      ${dateCondition}
      GROUP BY d.name
      ORDER BY count DESC
    `;

    const visitsByDepartment = await sequelize.query(departmentQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    // Convert count to integer
    const visitsByDepartmentData = visitsByDepartment.map((item) => ({
      name: item.name,
      count: parseInt(item.count),
    }));

    // Get visits by purpose
    const purposeQuery = `
      SELECT 
        p.name,
        COUNT(*) as count
      FROM "visits" v
      LEFT JOIN "purposes" p ON v."PurposeId" = p.id
      ${dateCondition}
      GROUP BY p.name
      ORDER BY count DESC
    `;

    const visitsByPurpose = await sequelize.query(purposeQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    // Convert count to integer
    const visitsByPurposeData = visitsByPurpose.map((item) => ({
      name: item.name,
      count: parseInt(item.count),
    }));

    // Get visits by day
    const dailyQuery = `
      SELECT 
        DATE(v."visitDate") as date,
        COUNT(*) as count
      FROM "visits" v
      ${dateCondition}
      GROUP BY DATE(v."visitDate")
      ORDER BY DATE(v."visitDate") ASC
    `;

    const visitsByDay = await sequelize.query(dailyQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    // Convert count to integer and format date
    const visitsByDayData = visitsByDay.map((item) => ({
      date: item.date,
      count: parseInt(item.count),
    }));

    res.json({
      totalVisits,
      visitsByDepartment: visitsByDepartmentData,
      visitsByPurpose: visitsByPurposeData,
      visitsByDay: visitsByDayData,
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching report data",
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

    const [
      totalVisits,
      todayVisits,
      checkedInVisits,
      totalGuests,
      totalHosts,
      totalDepartments,
    ] = await Promise.all([
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
      Guest.count(),
      Host.count(),
      Department.count(),
    ]);

    res.json({
      totalVisits,
      todayVisits,
      checkedInVisits,
      totalGuests,
      totalHosts,
      totalDepartments,
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
          attributes: ["id", "name", "email", "phoneNumber"],
          include: {
            model: Department,
            as: "Department",
            attributes: ["id", "name"],
          },
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
    console.log("Guest found or created:", guest);

    // Create visit
    const visit = await Visit.create({
      GuestId: guest.id,
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
          attributes: ["id", "name"],
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
          attributes: ["id", "name"],
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
