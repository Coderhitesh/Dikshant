import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image"; // ✅ use expo-image
import ScholarshipImage from "../assets/images/scholarship-heros.jpeg";

const Scholarship = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("apply-sch")}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={ScholarshipImage}
          style={styles.bannerImage}
          contentFit="cover" // fills the space
          cachePolicy="memory-disk" // ✅ enables caching
          transition={1000} // fade in effect
        />
      </View>
    </TouchableOpacity>
  );
};

export default Scholarship;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  imageWrapper: {
    width: "100%",
    height: 220,
    overflow: "hidden",
    borderRadius: 12, // optional: rounded corners
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
});
