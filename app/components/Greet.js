import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuthStore } from "../stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient

export default function Greet() {
  const { getProfile } = useAuthStore();
  const profile = getProfile();

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Short, powerful tips (≤ 70 chars)
  const tips = [
    "One focused hour beats three distracted ones.",
    "Revise weekly to lock in knowledge.",
    "Mock tests build real confidence.",
    "Break goals into daily wins.",
    "Take 5-min breaks every 30 mins.",
    "Solve past papers to master patterns.",
    "Consistency > perfection.",
    "Stay calm — progress is building.",
  ];

  const randomTip = useMemo(() => {
    return tips[Math.floor(Math.random() * tips.length)];
  }, []);

  const greetingMessage = `${getGreeting()}, ${profile?.name || "there"}!`;

  const showTipAlert = () => {
    Alert.alert(
      "Tip of the Day",
      randomTip,
      [{ text: "Got it!", style: "default" }],
      { cancelable: true }
    );
  };

  return (
    // Apply LinearGradient to the container view
    <LinearGradient
      colors={["#DC3545", "#d62828"]} // Define gradient colors
      style={styles.container}
    >
      {/* Greeting + Bulb Row */}
      <View style={styles.headerRow}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{greetingMessage}</Text>
          {profile?.mission && (
            <Text style={styles.goal}>Goal: {profile.mission}</Text>
          )}
        </View>

        {/* Bulb Button → Opens Alert */}
        <TouchableOpacity
          style={styles.bulbButton}
          onPress={showTipAlert}
          activeOpacity={0.7}
        >
          <Ionicons name="bulb-outline" size={26} color="#d62828" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom:2,
    flex: 1,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  greetingContainer: {
    flex: 1,
    marginRight: 12,
  },

  greeting: {
    fontSize: 21,
    fontWeight: "700",
    color: "#fff", // White text for better contrast
    fontFamily: "Geist",
    lineHeight: 26,
  },

  goal: {
    fontSize: 15,
    color: "#f8f8f8", // Lighter color for better readability
    marginTop: 4,
    fontFamily: "Geist",
  },

  bulbButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fdecec",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#d62828",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
});
