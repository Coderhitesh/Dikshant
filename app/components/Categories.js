import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48 - 20) / 3;

const data = [
  { id: 1, title: "Live Courses", icon: "video", screen: "Courses", color: "#3b82f6", filter: "online" },
  { id: 2, title: "Recorded Courses", icon: "play-circle", screen: "Courses", color: "#8b5cf6", filter: "offline" },
  { id: 3, title: "Offline Courses", icon: "book-open", screen: "EBooks", color: "#10b981" },
  { id: 4, title: "Study Hub", icon: "film", screen: "RecordedCourses", color: "#f59e0b" },
  { id: 5, title: "Quiz", icon: "help-circle", screen: "Quiz", color: "#ec4899" },
  { id: 6, title: "Test Series", icon: "check-square", screen: "TestSeries", color: "#06b6d4" },
];


const CategoryCard = ({ item, navigation }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animate = (toValue) => {
    Animated.spring(scaleAnim, {
      toValue,
      useNativeDriver: true,
      friction: 4,
      tension: 80,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={() => animate(0.92)}
      onPressOut={() => animate(1)}
     onPress={() =>
  navigation.navigate(item.screen, {
    filter: item?.filter ?? null,
    from: "category-home",
  })
}

    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={[`${item.color}20`, `${item.color}05`]}
          style={styles.gradientBg}
        />

        <View style={[styles.iconCircle, { backgroundColor: `${item.color}15` }]}>
          <Feather name={item.icon} size={18} color={item.color} />
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function Categories() {
  const navigation = useNavigation()
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        numColumns={3}
        renderItem={({ item }) => (
          <CategoryCard item={item} navigation={navigation} />
        )}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal:5,
    marginBottom: 12,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 10,
  },

  card: {
    width: ITEM_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",

    // Subtle clean shadow
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },

  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  title: {
    fontSize: 9.8,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    lineHeight: 14,
  },
});
