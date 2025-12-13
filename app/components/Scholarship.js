import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScholarshipImage from "../assets/images/scholarship-heros.jpeg";
import { colors } from "../constant/color";

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
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

export default Scholarship;

const styles = StyleSheet.create({

  imageWrapper: {
    width: "100%",
    height: 220,
    overflow: "hidden",
    marginBottom:12,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
});
