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

const CARD_WIDTH = width * 0.72;
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
          <Text style={styles.loadingText}>Loading courses...</Text>
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
          <Feather name="alert-circle" size={32} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load courses</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
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
          <Feather name="inbox" size={40} color="#cbd5e1" />
          <Text style={styles.emptyText}>No courses available</Text>
          <Text style={styles.emptySubtext}>Check back soon for updates</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && data.length > 0 && (
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
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    </View>
  );
};

const CourseCard = ({ item: batch, navigation }) => {
  const imageUrl = batch.imageUrl;
  const startDate = batch.startDate ? new Date(batch.startDate) : null;
  const endDate = batch.endDate ? new Date(batch.endDate) : null;
  
  // Calculate discount percentage
  const discountPercent = batch.batchPrice && batch.batchDiscountPrice
    ? Math.round(((batch.batchPrice - batch.batchDiscountPrice) / batch.batchPrice) * 100)
    : 0;

  // Format dates
  const formatDate = (date) => {
    if (!date) return null;
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

 const handlePress = () => {
  navigation.navigate("CourseDetail", {
    courseId: batch.id,
    batchData: batch,
  });
};


  return (
    <TouchableOpacity
      style={[styles.courseCard, { width: CARD_WIDTH }]}
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
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}

      </View>

      {/* Content Section */}
      <View style={styles.cardContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {batch.name}
        </Text>

        {/* Program Name */}
        {batch.program?.name && (
          <Text style={styles.programName} numberOfLines={1}>
            {batch.program.name}
          </Text>
        )}

        {/* Meta Information */}
        <View style={styles.metaContainer}>
          {startDate && (
            <View style={styles.metaItem}>
              <Feather name="calendar" size={12} color="#64748b" />
              <Text style={styles.metaText}>{formatDate(startDate)}</Text>
            </View>
          )}
          {batch.subjects && batch.subjects.length > 0 && (
            <View style={styles.metaItem}>
              <Feather name="book-open" size={12} color="#64748b" />
              <Text style={styles.metaText}>{batch.subjects.length} subjects</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            {batch.batchDiscountPrice && batch.batchDiscountPrice < batch.batchPrice ? (
              <>
                <Text style={styles.originalPrice}>₹{batch.batchPrice.toLocaleString('en-IN')}</Text>
                <Text style={styles.discountPrice}>₹{batch.batchDiscountPrice.toLocaleString('en-IN')}</Text>
              </>
            ) : (
              <Text style={styles.price}>₹{batch.batchPrice.toLocaleString('en-IN')}</Text>
            )}
          </View>

          {batch.category && (
            <View style={[
              styles.categoryTag,
              batch.category === "online" && styles.categoryTagOnline,
              batch.category === "offline" && styles.categoryTagOffline,
              batch.category === "recorded" && styles.categoryTagRecorded,
            ]}>
              <Text style={[
                styles.categoryTagText,
                batch.category === "online" && styles.categoryTagTextOnline,
                batch.category === "offline" && styles.categoryTagTextOffline,
                batch.category === "recorded" && styles.categoryTagTextRecorded,
              ]}>
                {batch.category.toUpperCase()}
              </Text>
            </View>
          )}
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
    "/batchs",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );


  const courses = coursesResponse?.items || [];


const sortedCourses = [...courses].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);

// Filter categories + take first 6
const liveCourses = sortedCourses.filter(c => c.category === "online").slice(0, 6);
const offlineCourses = sortedCourses.filter(c => c.category === "offline").slice(0, 6);
const recordedCourses = sortedCourses.filter(c => c.category === "recorded").slice(0, 6);


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
        keyExtractor={(item) => `online-${item.id}`}
        cardWidth={CARD_WIDTH}
        isLoading={isLoading}
        error={error}
        onSeeAll={() => handleSeeAll("Online")}
      />


      {/* Recorded Courses Section */}
      <HorizontalSection
        title="Recorded Courses"
        data={recordedCourses}
        renderItem={({ item }) => <CourseCard item={item} navigation={navigation} />}
        keyExtractor={(item) => `recorded-${item.id}`}
        cardWidth={CARD_WIDTH}
        isLoading={isLoading}
        error={error}
        onSeeAll={() => handleSeeAll("Recorded")}
      />
       <HorizontalSection
        title="Offline Courses"
        data={offlineCourses}
        renderItem={({ item }) => <CourseCard item={item} navigation={navigation} />}
        keyExtractor={(item) => `offline-${item.id}`}
        cardWidth={CARD_WIDTH}
        isLoading={isLoading}
        error={error}
        onSeeAll={() => handleSeeAll("Offline")}
      />


  
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  
  // Stats Container
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
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
  
  // Loading State
  loadingContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  
  // Error State
  errorContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
  errorSubtext: {
    fontSize: 13,
    color: "#64748b",
  },
  
  // Empty State
  emptyContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94a3b8",
  },

  // Global Empty State
  globalEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    gap: 12,
  },
  globalEmptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 16,
  },
  globalEmptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Course Card Styles
  courseCard: {
    marginBottom:12,
    marginRight: CARD_MARGIN,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: .69,
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
    backgroundColor: "#e2e8f0",
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
  discountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  
  // Content Section
  cardContent: {
    padding: 12,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 20,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  programName: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
    marginBottom: 8,
  },
  
  // Meta Information
  metaContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
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
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  originalPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
    textDecorationLine: "line-through",
  },
  discountPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#22c55e",
    letterSpacing: -0.3,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagOnline: {
    backgroundColor: "#dbeafe",
  },
  categoryTagOffline: {
    backgroundColor: "#fef3c7",
  },
  categoryTagRecorded: {
    backgroundColor: "#f3e8ff",
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  categoryTagTextOnline: {
    color: "#1e40af",
  },
  categoryTagTextOffline: {
    color: "#92400e",
  },
  categoryTagTextRecorded: {
    color: "#6b21a8",
  },
});