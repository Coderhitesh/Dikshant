import React from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import ScholarshipImage from "../assets/images/scholarship-heros.jpeg";
import { colors } from "../constant/color";
import { useNavigation } from "@react-navigation/native";

const Scholarship = () => {
  const navigation = useNavigation()
  return (
    <View style={styles.container}>
      <ImageBackground source={ScholarshipImage} style={styles.bannerImage} imageStyle={{ borderRadius: 16 }}>
        
        {/* Gradient / Dark Overlay */}
        <View style={styles.overlay} />

        {/* Text & Button Section */}
        <View style={styles.contentBox}>
          <Text style={styles.title}>Dikshant IAS Scholarship Program</Text>

          <TouchableOpacity onPress={()=>navigation.navigate("apply-sch")} style={styles.button}>
            <Text style={styles.buttonText}>Apply for Scholarship</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

    </View>
  );
};

export default Scholarship;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 12,
  },

  bannerImage: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)", 
  },

  contentBox: {
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 12,
  },

  button: {
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
