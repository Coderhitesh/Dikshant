import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
const { width } = Dimensions.get("window");

const CARD_WIDTH = (width - 48) / 3;

const categories = [
  {
    id: 1,
    title: "Live Classes",
    subtitle: "Interactive learning",
    icon: "video",
    screen: "Courses",
    filter: "online",
    gradient: ["#8b5cf6", "#6d28d9"],
    students: "50K+",
    comingSoon: false,
  },
  {
    id: 2,
    title: "Recorded Courses",
    subtitle: "Learn at your pace",
    icon: "play",
    screen: "Courses",
    filter: "recorded",
    gradient: ["#ec4899", "#be185d"],
    students: "1M+",
    comingSoon: false,
  },
  {
    id: 3,
    title: "Offline Classes",
    subtitle: "Classroom experience",
    icon: "map-pin",
    screen: "Courses",
    filter: "offline",
    gradient: ["#06b6d4", "#0891b2"],
    students: "25K+",
    comingSoon: false,
  },
  {
    id: 4,
    title: "Study Materials",
    subtitle: "Notes & PDFs",
    icon: "book-open",
    screen: "ComingSoon",
    gradient: ["#f59e0b", "#d97706"],
    students: "Coming Soon",
    comingSoon: true,
  },
  {
    id: 5,
    title: "Mock Tests",
    subtitle: "Practice & improve",
    icon: "edit-3",
    screen: "ComingSoon",
    gradient: ["#f97316", "#ea580c"],
    students: "Coming Soon",
    comingSoon: true,
  },
  {
    id: 6,
    title: "Doubt Solving",
    subtitle: "Get instant help",
    icon: "help-circle",
    screen: "ComingSoon",
    gradient: ["#a855f7", "#7c3aed"],
    students: "Coming Soon",
    comingSoon: true,
  },
];

const CategoryCard = ({ item }) => {
  const navigation = useNavigation();
  const handlePress = () => {
    if (item.comingSoon) return;

    if (item.screen === "Courses" && item.filter) {
      navigation.navigate(item.screen, { filter: item.filter });
    } else {
      navigation.navigate(item.screen);
    }
  };
  return (
    <TouchableOpacity
      style={[styles.categoryCard, { width: CARD_WIDTH }]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={item.comingSoon}
    >
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        {item.comingSoon && (
          <View style={styles.soonBadge}>
            <Text style={styles.soonText}>SOON</Text>
          </View>
        )}

        <View style={styles.iconContainer}>
          <Feather name={item.icon} size={18} color="#ffffff" />
        </View>

        <Text style={styles.categoryTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function Categories() {
  const firstRow = categories.slice(0, 3);
  const secondRow = categories.slice(3, 6);

  return (
    <View style={styles.container}>
      <View style={styles.categoriesSection}>
        {/* First Row */}
        <View style={styles.row}>
          {firstRow.map((item) => (
            <CategoryCard key={item.id} item={item} />
          ))}
        </View>

        {/* Second Row */}
        <View style={styles.row}>
          {secondRow.map((item) => (
            <CategoryCard key={item.id} item={item} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  categoriesSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  categoryCard: {
    height: 90,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientContainer: {
    flex: 1,
    padding: 7,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  soonBadge: {
    position: "absolute",
    top: 3,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    zIndex: 1,
  },
  soonText: {
    fontSize: 6,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 16,
  },
});
