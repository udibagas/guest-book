const express = require("express");
const whatsappService = require("../services/whatsappService");
const router = express.Router();

// GET /api/notifications/settings - Get current notification settings
router.get("/settings", async (req, res) => {
  try {
    const settings = {
      whatsappEnabled: process.env.WHATSAPP_NOTIFICATIONS_ENABLED === "true",
      whatsappConfigured: !!(
        process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_API_URL
      ),
    };

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notification settings",
      error: error.message,
    });
  }
});

// POST /api/notifications/test - Send test WhatsApp notification
router.post("/test", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const sent = await whatsappService.sendTestNotification(phoneNumber);

    if (sent) {
      res.json({
        success: true,
        message: "Test notification sent successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test notification",
      });
    }
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({
      success: false,
      message: "Error sending test notification",
      error: error.message,
    });
  }
});

// POST /api/notifications/guest-registered - Manual notification for guest registration
router.post("/guest-registered", async (req, res) => {
  try {
    const { visitId } = req.body;

    if (!visitId) {
      return res.status(400).json({
        success: false,
        message: "Visit ID is required",
      });
    }

    // Fetch complete visit data
    const { Visit, Guest, Host, Purpose, Department } = require("../models");

    const visit = await Visit.findByPk(visitId, {
      include: [
        {
          model: Guest,
          as: "Guest",
        },
        {
          model: Host,
          as: "Host",
          include: [
            {
              model: Department,
              as: "Department",
            },
          ],
        },
        {
          model: Purpose,
          as: "Purpose",
        },
      ],
    });

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    if (!visit.Host || !visit.Host.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Host phone number not available",
      });
    }

    const sent = await whatsappService.notifyHostOfGuestRegistration(
      visit.Guest,
      visit,
      visit.Host
    );

    if (sent) {
      res.json({
        success: true,
        message: "Notification sent successfully to host",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send notification to host",
      });
    }
  } catch (error) {
    console.error("Error sending guest registration notification:", error);
    res.status(500).json({
      success: false,
      message: "Error sending notification",
      error: error.message,
    });
  }
});

module.exports = router;
