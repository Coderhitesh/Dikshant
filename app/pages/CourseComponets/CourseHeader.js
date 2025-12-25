import React from "react"
import { View, Text, Image, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import { colors } from "../../constant/color"

export default function CourseHeader({ batchData, videosCount }) {
  if (!batchData) return null

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: batchData.imageUrl || "https://via.placeholder.com/300"
        }}
        style={styles.courseImage}
      />
      <View style={styles.courseDetails}>
        <Text style={styles.courseName}>{batchData.name || "Course"}</Text>
        <Text style={styles.courseDesc}>
          {batchData.shortDescription || "Loading..."}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <Feather name="video" size={14} color={colors.primary} />
            <Text style={styles.metaText}>{videosCount} Videos</Text>
          </View>
          <View style={styles.metaBadge}>
            <Feather name="users" size={14} color={colors.success} />
            <Text style={[styles.metaText, { color: colors.success }]}>
              {batchData.studentsCount || 0} Students
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 16,
    margin: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  courseImage: {
    width: 110,
    height: 110,
    borderRadius: 12
  },
  courseDetails: {
    flex: 1,
    justifyContent: "center"
  },
  courseName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6
  },
  courseDesc: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 10,
    lineHeight: 18
  },
  metaRow: {
    flexDirection: "row",
    gap: 8
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  metaText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700"
  }
})
