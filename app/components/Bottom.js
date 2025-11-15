import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function BottomBar() {
    const navigation = useNavigation();
    const route = useRoute();

    const tabs = [
        { label: "Home", icon: "home", screen: "Home" },
        { label: "Courses", icon: "book-open", screen: "Courses" },
        { label: "Quiz", icon: "file-text", screen: "Quiz" },
        { label: "Test Series", icon: "book", screen: "TestSeries" },
        { label: "Profile", icon: "user", screen: "Profile" },
    ];

    return (
        <View style={styles.container}>
            {tabs.map((tab, index) => {
                const isActive = route.name === tab.screen;

                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.tab}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate(tab.screen)}
                    >
                        <Feather
                            name={tab.icon}
                            size={24}
                            color={isActive ? "#ff0000" : "#666"}
                        />
                        <Text style={[styles.label, isActive && styles.activeLabel]}>
                            {tab.label}
                        </Text>

                        {isActive && <View style={styles.activeBar} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        height: 70,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#eee",
        position: "absolute",
        bottom: 0,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },

    tab: {
        alignItems: "center",
        justifyContent: "center",
        width: width / 5,
    },

    label: {
        fontSize: 12,
        marginTop: 3,
        fontFamily: "Geist",
        color: "#666",
    },

    activeLabel: {
        color: "#ff0000",
        fontWeight: "600",
    },

    activeBar: {
        width: 28,
        height: 3,
        backgroundColor: "#ff0000",
        borderRadius: 10,
        marginTop: 6,
    },
});
