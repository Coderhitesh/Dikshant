require("dotenv").config();
const app = require("./app");
const http = require("http");
const { initSocket } = require("./socket");
const { initializeFirebase } = require("./utils/sendNotifications");

const PORT = process.env.PORT || 5001;

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io on SAME server
initSocket(server);
initializeFirebase()
// ✅ LISTEN ON SERVER (NOT app)
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 HTTP + Socket server running on IPv4 :${PORT}`);
});
