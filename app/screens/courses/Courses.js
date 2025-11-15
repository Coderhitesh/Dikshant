import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import useSWR from "swr";
import { fetcher } from "../../constant/fetcher";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 12;
const LATEST_CARD_WIDTH = width * 0.88;
const RECORDED_CARD_WIDTH = width * 0.42;
const QUIZ_CARD_WIDTH = RECORDED_CARD_WIDTH;

// === Horizontal Section Component ===
const HorizontalSection = ({ title, data, renderItem, keyExtractor, cardWidth, isLoading, error }) => {
  if (isLoading) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={24} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load courses</Text>
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No courses available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity>
          {/* <Text style={styles.seeAll}>See all</Text> */}
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.horizontalList}
        snapToInterval={cardWidth + CARD_MARGIN}
        snapToAlignment="start"
        decelerationRate="fast"
      />
    </View>
  );
};

// === Latest Course Card ===
const LatestCourseCard = ({ item: course, navigation }) => {
  const imageUrl = course.image?.url || course.image;
  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={[styles.latestCard, { width: LATEST_CARD_WIDTH }]}
      activeOpacity={0.95}
      onPress={() => navigation?.navigate?.("CourseDetail", { courseId: course._id || course.id })}
    >
      <View style={styles.latestImageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.latestImage}
          resizeMode="cover"
        />
        {course.badge && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{course.badge}</Text>
          </View>
        )}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.latestContent}>
        <Text style={styles.latestTitle} numberOfLines={2}>
          {course.title}
        </Text>
        {course.shortContent && (
          <Text style={styles.latestInstructor} numberOfLines={1}>
            {course.shortContent}
          </Text>
        )}

        <View style={styles.latestMetrics}>
          {course.lectures && (
            <View style={styles.metric}>
              <Feather name="book-open" size={11} color="#64748b" />
              <Text style={styles.metricText}>{course.lectures} lectures</Text>
            </View>
          )}
          {course.duration && (
            <>
              {course.lectures && <View style={styles.metricDivider} />}
              <View style={styles.metric}>
                <Feather name="clock" size={11} color="#64748b" />
                <Text style={styles.metricText}>{course.duration}</Text>
              </View>
            </>
          )}
          {course.languages && (
            <>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <Feather name="globe" size={11} color="#64748b" />
                <Text style={styles.metricText}>{course.languages}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.latestFeatures}>
          {course.courseMode && (
            <View style={styles.feature}>
              <Feather name="monitor" size={10} color="#64748b" />
              <Text style={styles.featureText}>{course.courseMode}</Text>
            </View>
          )}
          {course.active && (
            <View style={styles.feature}>
              <Feather name="check-circle" size={10} color="#10b981" />
              <Text style={styles.featureText}>Active</Text>
            </View>
          )}
        </View>

        <View style={styles.latestFooter}>
          <View>
            <Text style={styles.latestPrice}>₹{course.price?.toLocaleString()}</Text>
            {course.originalPrice && course.originalPrice > course.price && (
              <Text style={styles.latestOriginalPrice}>
                ₹{course.originalPrice.toLocaleString()}
              </Text>
            )}
          </View>
          <View style={styles.enrollButton}>
            <Text style={styles.enrollButtonText}>Enroll</Text>
            <Feather name="arrow-right" size={12} color="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// === Recorded Course Card ===
const RecordedCourseCard = ({ item: course, navigation }) => {
  const imageUrl = course.image?.url || course.image;

  return (
    <TouchableOpacity
      style={[styles.recordedCard, { width: RECORDED_CARD_WIDTH }]}
      activeOpacity={0.95}
      onPress={() => navigation?.navigate?.("CourseDetail", { courseId: course._id || course.id })}
    >
      <View style={styles.recordedImageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.recordedImage}
          resizeMode="cover"
        />
        <View style={styles.recordedOverlay}>
          <Feather name="play-circle" size={24} color="rgba(255,255,255,0.9)" />
        </View>
      </View>

      <View style={styles.recordedContent}>
        {course.badge && (
          <Text style={styles.recordedCategory}>{course.badge}</Text>
        )}
        <Text style={styles.recordedTitle} numberOfLines={2}>
          {course.title}
        </Text>

        <View style={styles.recordedMeta}>
          {course.lectures && (
            <View style={styles.recordedMetaItem}>
              <Feather name="film" size={9} color="#64748b" />
              <Text style={styles.recordedMetaText}>{course.lectures}</Text>
            </View>
          )}
          {course.duration && (
            <View style={styles.recordedMetaItem}>
              <Feather name="clock" size={9} color="#64748b" />
              <Text style={styles.recordedMetaText}>{course.duration}</Text>
            </View>
          )}
        </View>

        <View style={styles.recordedFooter}>
          {course.courseMode && (
            <View style={styles.recordedRating}>
              <Text style={styles.recordedRatingText}>{course.courseMode}</Text>
            </View>
          )}
          <Text style={styles.recordedPrice}>₹{course.price?.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// === Main Component ===
export default function Course() {
  const navigation = useNavigation();

  // Fetch courses from API
  const { data: coursesResponse, error, isLoading } = useSWR(
    "/courses",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const courses = coursesResponse || [];

  // Separate courses by type or category
  const featuredCourses = courses.slice(0, 4); // First 4 as featured
  const recordedCourses = courses.filter(c => c.courseMode === "offline").slice(0, 6);
  const onlineCourses = courses.filter(c => c.courseMode === "online").slice(0, 6);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Featured Courses Section */}
      <HorizontalSection
        title="Featured Courses"
        data={featuredCourses}
        renderItem={({ item }) => <LatestCourseCard item={item} navigation={navigation} />}
        keyExtractor={(item) => `featured-${item._id || item.id}`}
        cardWidth={LATEST_CARD_WIDTH}
        isLoading={isLoading}
        error={error}
      />


      {/* Online Courses Section */}
      <HorizontalSection
        title="Online Learning"
        data={onlineCourses}
        renderItem={({ item }) => <RecordedCourseCard item={item} navigation={navigation} />}
        keyExtractor={(item) => `online-${item._id || item.id}`}
        cardWidth={RECORDED_CARD_WIDTH}
        isLoading={isLoading}
        error={error}
      />

      {/* Offline Courses Section */}
      <HorizontalSection
        title="Offline Learning"
        data={recordedCourses}
        renderItem={({ item }) => <RecordedCourseCard item={item} navigation={navigation} />}
        keyExtractor={(item) => `offline-${item._id || item.id}`}
        cardWidth={RECORDED_CARD_WIDTH}
        isLoading={isLoading}
        error={error}
      />
    </ScrollView>
  );
}

// === Styles ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  sectionContainer: {
    paddingLeft: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingRight: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3b82f6",
  },
  horizontalList: {
    paddingRight: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#64748b",
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },

  // Latest Course Card
  latestCard: {
    marginRight: CARD_MARGIN,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    overflow: "hidden",
  },
  latestImageContainer: {
    position: "relative",
  },
  latestImage: {
    width: "100%",
    height: 140,
  },
  categoryTag: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#ffffff",
  },
  latestContent: {
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  latestTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 3,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  latestInstructor: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 10,
  },
  latestMetrics: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metricDivider: {
    width: 1,
    height: 10,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 8,
  },
  metricText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "600",
  },
  latestFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
  },
  featureText: {
    fontSize: 9,
    color: "#64748b",
    fontWeight: "500",
  },
  latestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  latestPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  latestOriginalPrice: {
    fontSize: 10,
    color: "#94a3b8",
    textDecorationLine: "line-through",
    marginTop: 1,
  },
  enrollButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
  },
  enrollButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Recorded Course Card
  recordedCard: {
    marginRight: CARD_MARGIN,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    overflow: "hidden",
  },
  recordedImageContainer: {
    position: "relative",
  },
  recordedImage: {
    width: "100%",
    height: 85,
  },
  recordedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordedContent: {
    padding: 10,
  },
  recordedCategory: {
    fontSize: 8,
    fontWeight: "700",
    color: "#3b82f6",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recordedTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 3,
    lineHeight: 16,
    letterSpacing: -0.2,
  },
  recordedInstructor: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 8,
  },
  recordedMeta: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  recordedMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  recordedMetaText: {
    fontSize: 9,
    color: "#64748b",
    fontWeight: "500",
  },
  recordedFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordedRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
  },
  recordedRatingText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#92400e",
  },
  recordedPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.2,
  },
});