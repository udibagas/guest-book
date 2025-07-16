const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const qrCodeTerminal = require("qrcode-terminal");
const { Boom } = require("@hapi/boom");

class WhatsAppService {
  constructor() {
    this.enabled = true;
    this.sock = null;
    this.isConnected = false;
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
    try {
      const { state, saveCreds } = await useMultiFileAuthState(
        "./wa_auth_info"
      );

      // Create a new WhatsApp connection
      const sock = makeWASocket({
        printQRInTerminal: false,
        auth: state,
        qrTimeoutMs: 60_000, // Set QR code timeout to 60 seconds
        logger: require("pino")({ level: "silent" }), // Silent logging to reduce noise
      });

      console.log("WhatsApp socket created, waiting for connection...");

      // if (!sock.authState.creds.registered) {
      //   const number = "+6285848909262";
      //   const code = await sock.requestPairingCode(number);
      //   console.log(code);
      // }

      // Handle connection updates
      sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log("QR Code received, scan it to authenticate");
          qrCodeTerminal.generate(qr, { small: true });
        }

        if (connection === "close") {
          this.isConnected = false;
          const shouldReconnect =
            (lastDisconnect?.error instanceof Boom)?.output?.statusCode !==
            DisconnectReason.loggedOut;

          console.log("Connection closed due to:", lastDisconnect?.error);

          if (shouldReconnect) {
            console.log("Attempting to reconnect...");
            setTimeout(() => this.connectToWhatsApp(), 3000);
          }
        } else if (connection === "open") {
          console.log("Connected to WhatsApp!");
          this.isConnected = true;
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

      // Ensure phone number is in the correct format
      const formattedNumber = recipient.startsWith("+")
        ? recipient.substring(1)
        : recipient;
      const jid = formattedNumber.includes("@")
        ? formattedNumber
        : `${formattedNumber}@s.whatsapp.net`;

      await this.sock.sendMessage(jid, { text: message });
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
}

module.exports = new WhatsAppService();
