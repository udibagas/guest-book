const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const qrCodeTerminal = require("qrcode-terminal");
const { Boom } = require("@hapi/boom");

class WhatsAppService {
  constructor() {
    // Prevent multiple instances (singleton pattern)
    if (WhatsAppService.instance) {
      return WhatsAppService.instance;
    }

    this.enabled = true;
    this.sock = null;
    this.isConnected = false;
    this.isConnecting = false; // Add flag to prevent multiple connection attempts

    // Store the instance
    WhatsAppService.instance = this;
  }

  /**
   * Format phone number to international format
   * @param {string} phoneNumber
   * @returns {string}
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, "");

    // If starts with 0, replace with 62 (Indonesia country code)
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    }

    // If doesn't start with 62, add it
    if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned;
    }

    return cleaned + "@s.whatsapp.net"; // WhatsApp requires phone number to end with @s.whatsapp.net
  }

  /**
   * Create notification message for guest registration
   * @param {Object} guestData
   * @param {Object} visitData
   * @param {Object} hostData
   * @returns {string}
   */
  createGuestNotificationMessage(guestData, visitData, hostData) {
    const message = `🔔 *NOTIFIKASI TAMU BARU*

📝 *Detail Tamu:*
• Nama: ${guestData.name}
• Telepon: ${guestData.phoneNumber}
• Email: ${guestData.email || "Tidak ada"}
• Perusahaan: ${guestData.company || "Tidak ada"}
• Jabatan: ${guestData.role || "Tidak ada"}
${guestData.idNumber ? `• Nomor Identitas: ${guestData.idNumber}` : ""}

🎯 *Tujuan Kunjungan:*
${visitData.Purpose?.name || visitData.customPurpose || "Tidak disebutkan"}

📅 *Waktu Kunjungan:*
${new Date(visitData.visitDate).toLocaleString("id-ID", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})}

${visitData.notes ? `📋 *Catatan:*\n${visitData.notes}` : ""}

---
Silakan sambut tamu Anda. Terima kasih! 🙏`;

    return message;
  }

  async connectToWhatsApp() {
    // If already connected, return existing socket
    if (this.isConnected && this.sock) {
      return this.sock;
    }

    // If currently connecting, wait for it to complete
    if (this.isConnecting) {
      console.log("Connection already in progress, waiting...");
      return new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (!this.isConnecting) {
            clearInterval(checkConnection);
            resolve(this.sock);
          }
        }, 500);
      });
    }

    this.isConnecting = true;

    try {
      const { state, saveCreds } = await useMultiFileAuthState(
        "./wa_auth_info"
      );

      // Create a new WhatsApp connection
      const sock = makeWASocket({
        printQRInTerminal: false,
        auth: state,
        logger: require("pino")({ level: "silent" }), // Silent logging to reduce noise
        browser: ["Guest Book System", "Chrome", "1.0.0"],
        generateHighQualityLinkPreview: true,
      });

      console.log("WhatsApp socket created, waiting for connection...");

      // Handle connection updates
      sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log("\n=== QR CODE UNTUK WHATSAPP ===");
          console.log("Scan QR code ini dengan WhatsApp di ponsel Anda:");
          console.log("1. Buka WhatsApp di ponsel");
          console.log("2. Tap Menu (⋮) > Linked Devices");
          console.log("3. Tap 'Link a Device'");
          console.log("4. Scan QR code di bawah ini:\n");

          qrCodeTerminal.generate(qr, { small: true });

          console.log("\n=== QR CODE UNTUK WHATSAPP ===\n");
        }

        if (connection === "close") {
          this.isConnected = false;
          this.isConnecting = false;
          console.log("WhatsApp connection closed");

          if (lastDisconnect?.error) {
            const statusCode =
              lastDisconnect.error instanceof Boom
                ? lastDisconnect.error.output?.statusCode
                : null;

            console.log(
              "Disconnect reason:",
              lastDisconnect.error.message || lastDisconnect.error
            );

            if (statusCode === DisconnectReason.loggedOut) {
              console.log("Device logged out. Please scan QR code again.");
              return;
            }

            if (statusCode === DisconnectReason.restartRequired) {
              console.log("Restart required. Reconnecting...");
              setTimeout(() => this.connectToWhatsApp(), 5000);
              return;
            }
          }

          console.log("Attempting to reconnect in 5 seconds...");
          setTimeout(() => this.connectToWhatsApp(), 5000);
        } else if (connection === "open") {
          console.log("Connected to WhatsApp!");
          this.isConnected = true;
          this.isConnecting = false;
        } else if (connection === "connecting") {
          console.log("Connecting to WhatsApp...");
        }
      });

      // Save session state periodically and when the connection closes
      sock.ev.on("creds.update", saveCreds);

      // Store the socket instance
      this.sock = sock;

      return sock;
    } catch (error) {
      this.isConnecting = false;
      console.error("Error creating WhatsApp connection:", error);
      throw error;
    }
  }

  // Function to send a text message
  async sendTextMessage(recipient, message) {
    if (!this.enabled) {
      console.log("WhatsApp notifications are disabled");
      return { success: false, message: "WhatsApp notifications are disabled" };
    }

    try {
      if (!this.isConnected) {
        await this.connectToWhatsApp();
      }

      if (!this.isConnected || !this.sock) {
        throw new Error("Unable to connect to WhatsApp");
      }

      await this.sock.sendMessage(recipient, { text: message });
      console.log(`WhatsApp message sent to ${recipient}`);

      return { success: true, message: "Message sent successfully" };
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      throw error;
    }
  }

  /**
   * Send WhatsApp notification
   * @param {string} phoneNumber
   * @param {string} message
   * @returns {Promise<boolean>}
   */
  async sendNotification(phoneNumber, message) {
    if (!this.enabled) {
      console.log("WhatsApp notifications are disabled");
      return false;
    }

    if (!phoneNumber) {
      console.error("Phone number is required for WhatsApp notification");
      return false;
    }

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      await this.sendTextMessage(formattedNumber, message);
    } catch (error) {
      console.error("Error sending WhatsApp notification:", error);
      return false;
    }
  }

  /**
   * Send guest registration notification to host
   * @param {Object} guestData
   * @param {Object} visitData
   * @param {Object} hostData
   * @returns {Promise<boolean>}
   */
  async notifyHostOfGuestRegistration(guestData, visitData, hostData) {
    if (!hostData || !hostData.phoneNumber) {
      console.log(
        "Host phone number not available, skipping WhatsApp notification"
      );
      return false;
    }

    const message = this.createGuestNotificationMessage(
      guestData,
      visitData,
      hostData
    );
    return await this.sendNotification(hostData.phoneNumber, message);
  }

  /**
   * Test notification function
   * @param {string} phoneNumber
   * @returns {Promise<boolean>}
   */
  async sendTestNotification(phoneNumber) {
    const testMessage = `🧪 *TEST NOTIFIKASI*

Ini adalah pesan test dari sistem Buku Tamu.
Jika Anda menerima pesan ini, berarti sistem notifikasi WhatsApp berfungsi dengan baik.

Waktu: ${new Date().toLocaleString("id-ID")}

---
Sistem Buku Tamu 📋`;

    return await this.sendNotification(phoneNumber, testMessage);
  }

  /**
   * Get connection status
   * @returns {Object}
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      enabled: this.enabled,
      hasSocket: !!this.sock,
    };
  }

  /**
   * Manually disconnect WhatsApp
   */
  async disconnect() {
    if (this.sock) {
      try {
        await this.sock.logout();
        await this.sock.end();
      } catch (error) {
        console.error("Error during disconnect:", error);
      }
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.sock = null;
  }

  // Static method to get the singleton instance
  static getInstance() {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }
}

// Initialize and export the singleton instance
WhatsAppService.instance = null;
module.exports = WhatsAppService.getInstance();
