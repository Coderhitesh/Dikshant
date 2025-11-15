import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STATIC_PHONE = "7217619794";
const STATIC_OTP = "123456";

// Store registered users temporarily (in production, this would be on backend)
let registeredUsers = {};

export const useAuthStore = create((set, get) => ({
  phone: "",
  token: null,
  loggedIn: false,
  otpSent: false,
  signupData: null, // Store signup data temporarily

  // 🔹 Set phone number
  setPhone: (phone) => set({ phone }),

  // 🔹 Step 1: Send OTP for Login (THROW errors)
  sendOtp: async (phone) => {
    try {
      if (phone !== STATIC_PHONE) {
        throw new Error("Phone number not registered!");
      }

      set({ otpSent: true, phone });

      return {
        success: true,
        message: `OTP Sent Successfully to ${phone}`,
        otp: STATIC_OTP,
      };
    } catch (error) {
      console.error("sendOtp Error:", error);
      throw error;
    }
  },

  // 🔹 Step 2: Verify OTP for Login (THROW errors)
  login: async (otp) => {
    try {
      const { otpSent } = get();

      if (!otpSent) {
        throw new Error("Please request OTP first");
      }

      if (otp !== STATIC_OTP) {
        throw new Error("Invalid OTP");
      }

      const tempToken = "TEMP_TOKEN_" + Date.now();
      await AsyncStorage.setItem("authToken", tempToken);

      set({
        loggedIn: true,
        token: tempToken,
        otpSent: false,
      });

      return { success: true, message: "Login Successful" };
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  },

  // 🔹 NEW: Signup - Register new user and send OTP
  signup: async (formData) => {
    try {
      const { name, email, phone, mission } = formData;

      // Validation
      if (!name || !email || !phone || !mission) {
        throw new Error("All fields are required");
      }

      // Check if phone already registered
      if (registeredUsers[phone]) {
        throw new Error("Phone number already registered. Please login.");
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      // Check phone format
      if (!/^[0-9]{10}$/.test(phone)) {
        throw new Error("Invalid phone number");
      }

      // Store signup data temporarily
      set({
        signupData: { name, email, phone, mission },
        otpSent: true,
        phone
      });

      // In production, call API to send OTP
      console.log("Signup OTP sent to:", phone);

      return {
        success: true,
        message: `OTP sent successfully to ${phone}`,
        otp: STATIC_OTP, // Remove in production
      };
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  },

  // 🔹 NEW: Verify Signup OTP and complete registration
  verifySignupOtp: async (otp) => {
    try {
      const { signupData, otpSent } = get();

      if (!otpSent || !signupData) {
        throw new Error("Please complete signup form first");
      }

      // Verify OTP
      if (otp !== STATIC_OTP) {
        throw new Error("Invalid OTP. Please try again.");
      }

      // Register the user
      registeredUsers[signupData.phone] = {
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        mission: signupData.mission,
        registeredAt: new Date().toISOString(),
      };

      // Store registered users in AsyncStorage
      await AsyncStorage.setItem(
        "registeredUsers",
        JSON.stringify(registeredUsers)
      );

      // 🔥 Generate and save auth token
      const authToken = "TEMP_TOKEN_" + Date.now() + "_" + signupData.phone;
      await AsyncStorage.setItem("authToken", authToken);

      // 🔥 Update state with logged in user
      set({
        loggedIn: true,
        token: authToken,
        phone: signupData.phone,
        signupData: null,
        otpSent: false,
      });

      console.log("User registered and logged in:", signupData.phone);

      return {
        success: true,
        message: "Account created successfully!",
        token: authToken,
      };
    } catch (error) {
      console.error("verifySignupOtp Error:", error);
      throw error;
    }
  },

  // 🔹 Check login state (THROW errors)
  checkLogin: async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log("token", token);

      if (token) {
        // Load registered users
        const usersJson = await AsyncStorage.getItem("registeredUsers");
        if (usersJson) {
          registeredUsers = JSON.parse(usersJson);
        }

        set({
          loggedIn: true,
          token,
          phone: STATIC_PHONE,
        });
      }
    } catch (error) {
      console.error("checkLogin Error:", error);
      throw error;
    }
  },

  // 🔹 Logout (THROW errors)
  logout: async (navigation) => {
    try {
      await AsyncStorage.removeItem("authToken");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
      set({
        loggedIn: false,
        token: null,
        phone: "",
        otpSent: false,
        signupData: null,
      });
    } catch (error) {
      console.error("Logout Error:", error);
      throw error;
    }
  },

  // 🔹 Get Profile (enhanced to support multiple users)
  getProfile: () => {
    const { phone } = get();

    // If user is registered, return their data
    if (registeredUsers[phone]) {
      return {
        name: registeredUsers[phone].name,
        email: registeredUsers[phone].email,
        phone: registeredUsers[phone].phone,
        mission: registeredUsers[phone].mission,
        age: "22", // Can be added to signup form
        dob: "12-04-2003", // Can be added to signup form
      };
    }

    // Default static profile
    return {
      name: "Anish",
      age: "22",
      dob: "12-04-2003",
      mission: "Crack IAS with dedication",
      phone: STATIC_PHONE,
    };
  },

  // 🔹 BONUS: Check if phone is already registered
  isPhoneRegistered: (phone) => {
    return !!registeredUsers[phone];
  },

  // 🔹 BONUS: Resend OTP for signup
  resendSignupOtp: async () => {
    try {
      const { signupData } = get();

      if (!signupData) {
        throw new Error("No signup session found");
      }

      console.log("Resending OTP to:", signupData.phone);

      return {
        success: true,
        message: `OTP resent to ${signupData.phone}`,
        otp: STATIC_OTP,
      };
    } catch (error) {
      console.error("Resend OTP Error:", error);
      throw error;
    }
  },
}));