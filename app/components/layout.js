import { View, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";
import BottomBar from "./Bottom";

export default function Layout({
  isHeaderShow = true,
  isBottomBarShow = true,
  children,
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER FIXED */}
      {isHeaderShow && <Header />}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: isBottomBarShow ? 70 : 0 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {/* BOTTOM BAR FIXED */}
      {isBottomBarShow && (
        <View style={{ position: "absolute", bottom: 10, left: 0, right: 0 }}>
          <BottomBar />
        </View>
      )}
    </SafeAreaView>
  );
}
