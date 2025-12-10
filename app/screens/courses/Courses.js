import React from "react";
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
const RECORDED_CARD_WIDTH = width * 0.72;

// === Horizontal Section Component ===
const HorizontalSection = ({ 
  title, 
  data, 
  renderItem, 
  keyExtractor, 
  cardWidth, 
  isLoading, 
  error,
  onSeeAll 
}) => {
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
          <Feather name="inbox" size={32} color="#cbd5e1" />
          <Text style={styles.emptyText}>No courses available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={onSeeAll}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Feather name="chevron-right" size={16} color="#3b82f6" />
          </TouchableOpacity>
        )}
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

// === Course Card Component ===
const CourseCard = ({ item: course, navigation }) => {
  const imageUrl = course.image?.url || course.image;

  const handlePress = () => {
    navigation?.navigate?.("CourseDetail", { 
      courseId: course._id || course.id 
    });
  };

  return (
    <TouchableOpacity
      style={[styles.courseCard, { width: RECORDED_CARD_WIDTH }]}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.courseImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <View style={styles.playButton}>
            <Feather name="play" size={20} color="#ffffff" />
          </View>
        </View>
        
        {/* Badge */}
        {course.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{course.badge}</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.cardContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {course.title}
        </Text>

        {/* Meta Information */}
        <View style={styles.metaContainer}>
          {course.lectures && (
            <View style={styles.metaItem}>
              <Feather name="video" size={12} color="#64748b" />
              <Text style={styles.metaText}>{course.lectures} lectures</Text>
            </View>
          )}
          {course.duration && (
            <View style={styles.metaItem}>
              <Feather name="clock" size={12} color="#64748b" />
              <Text style={styles.metaText}>{course.duration}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          {course.courseMode && (
            <View style={[
              styles.modeTag,
              course.courseMode === "online" && styles.modeTagOnline,
              course.courseMode === "offline" && styles.modeTagOffline,
            ]}>
              <Text style={[
                styles.modeTagText,
                course.courseMode === "online" && styles.modeTagTextOnline,
                course.courseMode === "offline" && styles.modeTagTextOffline,
              ]}>
                {course.courseMode.toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.price}>₹{course.price?.toLocaleString()}</Text>
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

  // Separate courses by type
  const liveCourses = courses.filter(c => c.courseMode === "online").slice(0, 6);
  const offlineCourses = courses.filter(c => c.courseMode === "offline").slice(0, 6);
  const recordedCourses = courses.filter(c => c.courseMode === "recorded").slice(0, 6);

  // Handle See All navigation
  const handleSeeAll = (courseType) => {
    navigation?.navigate?.("Courses", { type: courseType });
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Live Courses Section */}
      <HorizontalSection
        title="Live Courses"
        data={liveCourses}
        renderItem={({ item }) => <CourseCard item={item} navigation={navigation} />}
        keyExtractor={(item) => `live-${item._id || item.id}`}
        cardWidth={RECORDED_CARD_WIDTH}
        isLoading={isLoading}
        error={error}
        onSeeAll={() => handleSeeAll("Courses")}
      />

      {/* Offline Courses Section */}
      <HorizontalSection
        title="Offline Courses"
        data={offlineCourses}
        renderItem={({ item }) => <CourseCard item={item} navigation={navigation} />}
        keyExtractor={(item) => `offline-${item._id || item.id}`}
        cardWidth={RECORDED_CARD_WIDTH}
        isLoading={isLoading}
        error={error}
        onSeeAll={() => handleSeeAll("Courses")}
      />

      {/* Recorded Courses Section */}
      <HorizontalSection
        title="Recorded Courses"
        data={offlineCourses}
        renderItem={({ item }) => <CourseCard item={item} navigation={navigation} />}
        keyExtractor={(item) => `recorded-${item._id || item.id}`}
        cardWidth={RECORDED_CARD_WIDTH}
        isLoading={isLoading}
        error={error}
        onSeeAll={() => handleSeeAll("Courses")}
      />
    </ScrollView>
  );
}

// === Styles ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: 14,
  },
  
  // Section Styles
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  
  // List Styles
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  
  // Loading/Error States
  loadingContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  errorContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  emptyContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#94a3b8",
  },

  // Course Card Styles
  courseCard: {
    marginRight: CARD_MARGIN,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 1,
  },
  
  // Image Section
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
  },
  courseImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3b82f6",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  
  // Content Section
  cardContent: {
    padding: 5,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 20,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  
  // Meta Information
  metaContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  
  // Footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeTagOnline: {
    backgroundColor: "#dbeafe",
  },
  modeTagOffline: {
    backgroundColor: "#fef3c7",
  },
  modeTagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  modeTagTextOnline: {
    color: "#1e40af",
  },
  modeTagTextOffline: {
    color: "#92400e",
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
});