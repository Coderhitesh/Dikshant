const { ChatMessage } = require("../models");

class ChatController {
  // ============================
  // SAVE MESSAGE
  // ============================
  static async saveMessage(data) {
    try {
      const message = await ChatMessage.create({
        videoId: data.videoId,
        userId: data.userId,
        userName: data.userName,
        message: data.message,
        messageType: "message",
        isFromTeacher: data.isFromTeacher || false,
        meta: data.meta || null,
      });

      const plainMessage = message.get({ plain: true });

      return {
        success: true,
        data: plainMessage,
      };
    } catch (error) {
      console.error("saveMessage error:", error.message);

      return {
        success: false,
        fallback: {
          id: `fallback-${Date.now()}`,
          videoId: data.videoId,
          userId: data.userId,
          userName: data.userName,
          message: data.message,
          messageType: "message",
          isFromTeacher: data.isFromTeacher || false,
          meta: data.meta || null,
          createdAt: new Date(),
        },
      };
    }
  }

  // ============================
  // SAVE JOIN
  // ============================
  static async saveJoin({ videoId, userId, userName }) {
    try {
      const existingJoin = await ChatMessage.findOne({
        where: {
          videoId,
          userId,
          messageType: "join",
        },
        order: [["createdAt", "ASC"]],
      });

      if (existingJoin) {
        return {
          success: true,
          data: existingJoin.get({ plain: true }),
          rejoined: true,
        };
      }

      const joinEvent = await ChatMessage.create({
        videoId,
        userId,
        userName,
        message: `${userName} joined the chat`,
        messageType: "join",
      });

      return {
        success: true,
        data: joinEvent.get({ plain: true }),
        rejoined: false,
      };
    } catch (error) {
      console.error("saveJoin error:", error.message);
      return { success: false };
    }
  }

  // ============================
  // SAVE LEAVE
  // ============================
  static async saveLeave({ videoId, userId, userName }) {
    try {
      const leaveEvent = await ChatMessage.create({
        videoId,
        userId,
        userName,
        message: `${userName} left the chat`,
        messageType: "leave",
      });

      return {
        success: true,
        data: leaveEvent.get({ plain: true }),
      };
    } catch (error) {
      console.error("saveLeave error:", error.message);
      return { success: false };
    }
  }

  // ============================
  // GET CHAT HISTORY
  // ============================
  static async getChatHistory(videoId, limit = 500) {
    try {
      const messages = await ChatMessage.findAll({
        where: { videoId },
        order: [["createdAt", "ASC"]],
        limit,
      });

      return {
        success: true,
        data: messages.map((m) => m.get({ plain: true })),
      };
    } catch (error) {
      console.error("getChatHistory error:", error.message);
      return {
        success: false,
        data: [],
      };
    }
  }

  // ============================
  // ADMIN MESSAGE (FIXED - NO CIRCULAR IMPORT)
  // ============================
  static async adminMessage(req, res) {
    try {
      const { videoId = "15", message } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, message: "Message is required" });
      }

      const adminMsgResult = await ChatController.saveMessage({
        videoId,
        userId: "admin",
        userName: "Admin",
        message,
        isFromTeacher: true,
        messageType: "message", // ya "admin" rakh sakte ho agar alag handle karna ho
      });

      const adminMsg = adminMsgResult.success
        ? adminMsgResult.data
        : adminMsgResult.fallback;

      // Dynamic require to avoid circular dependency
      const { getIO } = require("../socket");
      const io = getIO();

      io.to(videoId).emit("admin-message", {
        ...adminMsg,
        userName: "Admin",
        isFromTeacher: true,
      });

      return res.json({ success: true, data: adminMsg });
    } catch (error) {
      console.error("sendAdminMessage error:", error.message);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

module.exports = ChatController;