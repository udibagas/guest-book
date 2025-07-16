const {
  default: makeWASocket,
  DisconnectReason,
  useSingleFileAuthState,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");

class WhatsAppService {
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
    const { state, saveState } = useSingleFileAuthState("./auth_info.json");

    // Create a new WhatsApp connection
    const sock = makeWASocket({
      version: [2, 2413, 1],
      printQRInTerminal: true,
      auth: state,
      getMessage: async (key) => {
        return {
          conversation: "hello",
        };
      },
    });

    // Handle connection updates
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect.error instanceof Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;
        if (shouldReconnect) {
          this.connectToWhatsApp();
        }
      } else if (connection === "open") {
        console.log("Connected to WhatsApp!");
      }
    });

    // Save session state periodically and when the connection closes
    sock.ev.on("creds.update", saveState);

    return sock;
  }

  // Function to send a text message
  async sendTextMessage(recipient, message) {
    const sock = await this.connectToWhatsApp();

    // Wait for the connection to be ready
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (sock.user) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });

    // Send the message
    await sock.sendMessage(recipient, { text: message });
    console.log(`Message sent to ${recipient}`);

    // Close the connection after sending
    await sock.end();
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
}

module.exports = new WhatsAppService();
