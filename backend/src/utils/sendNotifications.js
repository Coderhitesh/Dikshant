require("dotenv").config(); // ✅ Ensure .env variables are loaded early
const admin = require("firebase-admin");

class FirebaseInitializationError extends Error {
  constructor(message) {
    super(message);
    this.name = "FirebaseInitializationError";
  }
}

class NotificationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "NotificationError";
    this.code = code;
  }
}

// ──────────────────────────────
// Logger Utility
// ──────────────────────────────
const logger = {
  info: (msg) => console.log(`ℹ️ ${msg}`),
  warn: (msg) => console.warn(`⚠️ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  debug: (msg) => console.debug(`🐛 ${msg}`),
};

// ──────────────────────────────
// Firebase Initialization
// ──────────────────────────────
const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    logger.info("Firebase already initialized");
    return admin;
  }

  // ✅ Required Firebase keys
  const requiredEnvVars = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_PRIVATE_KEY_ID",
    "FIREBASE_PRIVATE_KEY",
    "FIREBASE_CLIENT_ID",
    "FIREBASE_AUTH_URI",
    "FIREBASE_TOKEN_URI",
    "FIREBASE_AUTH_PROVIDER_CERT_URL",
    "FIREBASE_CERT_URL",
  ];
  //  ❌ 🚫 Missing Firebase environment variables: FIREBASE_CLIENT_EMAIL, FIREBASE_CERT_URL


  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
  if (missingVars.length > 0) {
    const missingList = missingVars.join(", ");
    logger.error(`🚫 Missing Firebase environment variables: ${missingList}`);
    throw new FirebaseInitializationError(
      `Missing Firebase env vars: ${missingList}`
    );
  }

  const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCqJ8LT+6NKAxJd\nD69nweMoL4Et4gbOLLEm1iJgtcVBy5zwMXxy+hR7wNgsF1bqi/LXQTeKqIDcfqFB\nXw1XqS0i0XoIyH4REXmHzAFgYcqI10WOYWlnJYOtmdhRgGw41Be3FZydnUvVdCZ0\nDLKqaILsWZH9886pn97zWGSJy3N+3T5OHdCGP8xl8KSRTLjq7YWGcfApkylOgge5\n1AilMtL3wFBs5VibNZwYKiefBMSWvRAUDqqVc0QlEYoEqjCyQvGCkDve2S2rXHPz\nEXWDXjoGWKNrnrgCd8mD48BVIAkPI23mZyYzRSSKjHzH2dTGKB6TVuDETSOOhf41\nF0uu68kRAgMBAAECggEAJmv1B+X98LPx3RayHmU/FG9ppYEw1TRtSh43RAw3fwxp\noykhd1r17h3VEluw0iSI0MdWsdYrxt5HLlo2ypEWcpLHkh0nrlX6Ucokk21xjOXD\nPIvNf6+OZNBk8r5jcY+ezUYxh7uhiJECL9lALM+NpK3zE9uOUmoZr2xJw32v1jjj\nyE4KYDYqHaxHQVS4xgH1dBAj2xiNkWRIt3HyZNIVBICXHRZHr4bmALYvrF0BlAF6\nbdIiE68XiUt7cuivEiwJRFO7wI8Oaj1c8+2Q5ksMTIuWx2ETilv/ZfNeOfwl1htP\n4GkGc14wYVFSiRadkvoNX2neSLDu0KSR3Mf3rzwQCwKBgQDZO/jGW0eJp7HtB2jB\nZkU0li49URaZWSrxL+DD0zDw6E5G1rfWDci8oYLMf8wLTjLKNXB0P+x5sqWeGI0x\nZ/pN6AyEhJCOl9+UrkMz5OCBAAH6Y3PK3UzqmU26qOQxxrszBSN/OmdVs44BgpxT\nvc+y1jMsydlKEM/3bCnplpIJrwKBgQDIhQ6DYvdSJpg9o5R51izctuhnftycy5L+\nJuJp56YdSDyDHjgnHyRzLZ0myGc3ShiX5YK3mIOhQodhLVq2QY31Gg1APl/+LCsw\n/AUE+s7y5+B3shBs86GHdj7MGqWpjpqoMoupdNZxY+ZlJ7m3kPZjxfDFbppvXC3H\ncm0jI+/JPwKBgBgEp3bW9MvlfKimXxCzDAfKawZghs0hrLvJ/WHpYcnhBXaTmvPR\nxlYEzX9qydaeKMNusSZJQw4ZkHIwaLwDsQsYEvo75fe+FvxLYCbGsYPRymYyxMSz\nPyPZG1z9+2z9egkkEk6o2HADUDoehMZFgEdXo4TaNGoZ/cRvcxreiPsFAoGABonY\nLE6Y0/PwOOpRmBt0wQmx0FYhqXc15tWrwlpMX14QoxHkMNpiHONa4X3dZ78hyCoy\ntfviJur9cRzCfXjrwRdFYVfnV2lnSyScoUnwX5lSB3Ul9feHx9wCNjOUPVAqGNv1\nE+R8bZwdUiUWeDbg4eX9cOKnZIQz9fH0PxYX5o8CgYEApmDwJssXtgeq3eAIgE1A\nk0N+TIpcDew3VfkikIr8ScFHzfSO6Rj2xit71NUdKHvuRiAvGg1G3ZvH8YORbz+M\nWrOpxR3MCqXo1tE5nOkIEggSzaVCq/VzaV7H7+NiDVMKBCfmp3y22B0OCBTrW1st\ny4KmULoOJbmVH3LwTgeYoN8=\n-----END PRIVATE KEY-----\n"
  try {

    if (privateKey && privateKey.includes("\\n")) {
      console.log("🔧 Fixing escaped newlines (\\n) in private key...");
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    // 🔐 Validate private key format
    if (!privateKey.includes("BEGIN PRIVATE KEY") || !privateKey.includes("END PRIVATE KEY")) {
      console.error("❌ Invalid PEM key format in privateKey!");
      throw new FirebaseInitializationError("Invalid PEM formatted message in private_key");
    }
    const credentialConfig = {
      type: process.env.FIREBASE_TYPE || "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@olyox-6215a.iam.gserviceaccount.com",
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CERT_URL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(credentialConfig),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "",
    });

    logger.info("✅ Firebase Admin SDK initialized successfully");
    return admin;
  } catch (error) {
    if (error.message.includes("invalid_grant")) {
      console.error("⚠️ HINT: Check server time (NTP sync) and service account validity.");
      console.log("🕒 Current Server Time:", new Date().toISOString());
    }

    logger.error(`🔥 Firebase Initialization Failed: ${error.message}`);
    throw new FirebaseInitializationError(error.message);
  }
};

// ──────────────────────────────
// Send Notification
// ──────────────────────────────
const sendNotification = async (token, title, body, channel) => {
  console.log("✅ Notification Channel:", channel);
  initializeFirebase();

  try {
    if (!token) {
      logger.error("❌ No FCM token provided");
      throw new NotificationError("No FCM token provided", "INVALID_TOKEN");
    }

    const message = {
      token,
      notification: {
        title: title ,
        body: body ,
      },
      android: {
        priority: "high",
        notification: {
          channelId: channel ,
          clickAction: "",
          imageUrl:"https://www.dikshantias.com/_next/image?url=https%3A%2F%2Fdikshantiasnew-web.s3.ap-south-1.amazonaws.com%2Fweb%2F1757750048833-e5243743-d7ec-40f6-950d-849cd31d525f-dikshant-logo.png&w=384&q=75"
        },
      },
    };

    const response = await admin.messaging().send(message);
    logger.info(`✅ Notification sent successfully to token: ${token}`);
    return response;

  } catch (error) {
    logger.error(`❌ Notification Error: ${error.message}`);

    // ✅ Handle invalid or unregistered tokens
    if (error.errorInfo && error.errorInfo.code === "messaging/registration-token-not-registered") {
      logger.warn(`⚠️ Token invalid or app uninstalled — cleaning up: ${token}`);

    
    }

    if (error instanceof NotificationError) return null;
    return null;
  }
};

module.exports = {
  initializeFirebase,
  sendNotification,
};
