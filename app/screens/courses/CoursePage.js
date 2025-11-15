import React, { useState, useMemo } from "react";
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
    TextInput,
    Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import useSWR from "swr";
import { fetcher } from "../../constant/fetcher";
import { useNavigation, useRoute } from "@react-navigation/native";
import Layout from "../../components/layout";
import { colors } from "../../constant/color";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;


export default function CoursePage() {
    const navigation = useNavigation();
    const route = useRoute();
    const {filter} =route.params || {}
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMode, setSelectedMode] = useState(filter ? filter :"all");
    const [sortBy, setSortBy] = useState("featured");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [priceRange, setPriceRange] = useState("all"); 

    const { data: coursesResponse, error, isLoading } = useSWR(
        "/courses",
        fetcher,
        { revalidateOnFocus: false, revalidateOnReconnect: false }
    );

    const courses = coursesResponse || [];

    // Extract unique categories and levels
    const categories = useMemo(() => {
        const cats = new Set(courses.map(c => c.category || c.badge).filter(Boolean));
        return ["all", ...Array.from(cats)];
    }, [courses]);

    const levels = useMemo(() => {
        const lvls = new Set(courses.map(c => c.level).filter(Boolean));
        return ["all", ...Array.from(lvls)];
    }, [courses]);

    // Filter and sort courses
    const filteredCourses = useMemo(() => {
        let filtered = [...courses];

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(course =>
                course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.instructor?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Mode filter
        if (selectedMode !== "all") {
            filtered = filtered.filter(c => c.courseMode === selectedMode);
        }

        // Category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter(c => 
                c.category === selectedCategory || c.badge === selectedCategory
            );
        }

        // Level filter
        if (selectedLevel !== "all") {
            filtered = filtered.filter(c => c.level === selectedLevel);
        }

        // Price range filter
        if (priceRange !== "all") {
            filtered = filtered.filter(c => {
                const price = c.price || 0;
                switch(priceRange) {
                    case "0-2000":
                        return price <= 2000;
                    case "2000-5000":
                        return price > 2000 && price <= 5000;
                    case "5000+":
                        return price > 5000;
                    default:
                        return true;
                }
            });
        }

        // Sort
        switch (sortBy) {
            case "price_low":
                filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case "price_high":
                filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case "rating":
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case "popular":
                filtered.sort((a, b) => (b.enrolled || 0) - (a.enrolled || 0));
                break;
            case "newest":
                filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
            default:
                break;
        }

        return filtered;
    }, [courses, searchQuery, selectedMode, sortBy, selectedCategory, selectedLevel, priceRange]);

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedMode("all");
        setSortBy("featured");
        setSelectedCategory("all");
        setSelectedLevel("all");
        setPriceRange("all");
    };

    const hasActiveFilters = searchQuery || selectedMode !== "all" || sortBy !== "featured" || 
                            selectedCategory !== "all" || selectedLevel !== "all" || priceRange !== "all";

    const activeFiltersCount = [
        searchQuery, 
        selectedMode !== "all", 
        sortBy !== "featured",
        selectedCategory !== "all",
        selectedLevel !== "all",
        priceRange !== "all"
    ].filter(Boolean).length;

    return (
        <Layout>
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Discover Courses</Text>
                    <Text style={styles.headerSubtitle}>
                        {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
                    </Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Feather name="search" size={20} color={colors.darkGray} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search courses..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery ? (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Feather name="x" size={20} color={colors.darkGray} />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <TouchableOpacity 
                        style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
                        onPress={() => setShowFilters(true)}
                    >
                        <Feather name="sliders" size={20} color={hasActiveFilters ? colors.white : colors.darkGray} />
                        {activeFiltersCount > 0 && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Quick Filters */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickFilters}
                    contentContainerStyle={styles.quickFiltersContent}
                >
                    <TouchableOpacity
                        style={[styles.quickFilterChip, selectedMode === "all" && styles.quickFilterChipActive]}
                        onPress={() => setSelectedMode("all")}
                    >
                        <Text style={[styles.quickFilterText, selectedMode === "all" && styles.quickFilterTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.quickFilterChip, selectedMode === "online" && styles.quickFilterChipActive]}
                        onPress={() => setSelectedMode("online")}
                    >
                        <Feather name="wifi" size={14} color={selectedMode === "online" ? colors.white : colors.darkGray} />
                        <Text style={[styles.quickFilterText, selectedMode === "online" && styles.quickFilterTextActive]}>
                            Online
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.quickFilterChip, selectedMode === "offline" && styles.quickFilterChipActive]}
                        onPress={() => setSelectedMode("offline")}
                    >
                        <Feather name="map-pin" size={14} color={selectedMode === "offline" ? colors.white : colors.darkGray} />
                        <Text style={[styles.quickFilterText, selectedMode === "offline" && styles.quickFilterTextActive]}>
                            Offline
                        </Text>
                    </TouchableOpacity>
                    {hasActiveFilters && (
                        <TouchableOpacity
                            style={styles.clearFilterChip}
                            onPress={clearFilters}
                        >
                            <Feather name="x" size={14} color={colors.danger} />
                            <Text style={styles.clearFilterText}>Clear All</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                {/* Course Grid */}
                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <Feather name="alert-circle" size={48} color={colors.danger} />
                        <Text style={styles.errorText}>Failed to load courses</Text>
                        <TouchableOpacity style={styles.retryButton}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredCourses.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Feather name="inbox" size={48} color={colors.border} />
                        <Text style={styles.emptyText}>No courses found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredCourses}
                        numColumns={2}
                        keyExtractor={item => `course-${item._id || item.id}`}
                        renderItem={({ item }) => <CourseCard course={item} navigation={navigation} />}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.gridContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Filter Modal */}
                <Modal
                    visible={showFilters}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowFilters(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Filters & Sort</Text>
                                <TouchableOpacity onPress={() => setShowFilters(false)}>
                                    <Feather name="x" size={24} color={colors.secondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                                {/* Sort By */}
                                <View style={styles.filterSection}>
                                    <Text style={styles.filterSectionTitle}>Sort By</Text>
                                    {[
                                        { value: "featured", label: "Featured", icon: "star" },
                                        { value: "newest", label: "Newest First", icon: "clock" },
                                        { value: "price_low", label: "Price: Low to High", icon: "arrow-up" },
                                        { value: "price_high", label: "Price: High to Low", icon: "arrow-down" },
                                        { value: "rating", label: "Highest Rated", icon: "award" },
                                        { value: "popular", label: "Most Popular", icon: "trending-up" },
                                    ].map(option => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[styles.filterOption, sortBy === option.value && styles.filterOptionActive]}
                                            onPress={() => setSortBy(option.value)}
                                        >
                                            <View style={styles.filterOptionLeft}>
                                                <Feather 
                                                    name={option.icon} 
                                                    size={18} 
                                                    color={sortBy === option.value ? colors.primary : colors.darkGray} 
                                                />
                                                <Text style={[styles.filterOptionText, sortBy === option.value && styles.filterOptionTextActive]}>
                                                    {option.label}
                                                </Text>
                                            </View>
                                            {sortBy === option.value && (
                                                <Feather name="check" size={20} color={colors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Price Range */}
                                <View style={styles.filterSection}>
                                    <Text style={styles.filterSectionTitle}>Price Range</Text>
                                    <View style={styles.categoryGrid}>
                                        {[
                                            { value: "all", label: "All Prices" },
                                            { value: "0-2000", label: "Under ₹2,000" },
                                            { value: "2000-5000", label: "₹2,000 - ₹5,000" },
                                            { value: "5000+", label: "Above ₹5,000" },
                                        ].map(range => (
                                            <TouchableOpacity
                                                key={range.value}
                                                style={[
                                                    styles.categoryChip,
                                                    priceRange === range.value && styles.categoryChipActive
                                                ]}
                                                onPress={() => setPriceRange(range.value)}
                                            >
                                                <Text style={[
                                                    styles.categoryChipText,
                                                    priceRange === range.value && styles.categoryChipTextActive
                                                ]}>
                                                    {range.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Categories */}
                                <View style={styles.filterSection}>
                                    <Text style={styles.filterSectionTitle}>Category</Text>
                                    <View style={styles.categoryGrid}>
                                        {categories.map(cat => (
                                            <TouchableOpacity
                                                key={cat}
                                                style={[
                                                    styles.categoryChip,
                                                    selectedCategory === cat && styles.categoryChipActive
                                                ]}
                                                onPress={() => setSelectedCategory(cat)}
                                            >
                                                <Text style={[
                                                    styles.categoryChipText,
                                                    selectedCategory === cat && styles.categoryChipTextActive
                                                ]}>
                                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Level */}
                                {levels.length > 1 && (
                                    <View style={styles.filterSection}>
                                        <Text style={styles.filterSectionTitle}>Skill Level</Text>
                                        <View style={styles.categoryGrid}>
                                            {levels.map(level => (
                                                <TouchableOpacity
                                                    key={level}
                                                    style={[
                                                        styles.categoryChip,
                                                        selectedLevel === level && styles.categoryChipActive
                                                    ]}
                                                    onPress={() => setSelectedLevel(level)}
                                                >
                                                    <Text style={[
                                                        styles.categoryChipText,
                                                        selectedLevel === level && styles.categoryChipTextActive
                                                    ]}>
                                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Course Mode */}
                                <View style={styles.filterSection}>
                                    <Text style={styles.filterSectionTitle}>Learning Mode</Text>
                                    <View style={styles.categoryGrid}>
                                        {[
                                            { value: "all", label: "All Modes", icon: "book" },
                                            { value: "online", label: "Online", icon: "wifi" },
                                            { value: "offline", label: "Offline", icon: "map-pin" },
                                        ].map(mode => (
                                            <TouchableOpacity
                                                key={mode.value}
                                                style={[
                                                    styles.modeChip,
                                                    selectedMode === mode.value && styles.modeChipActive
                                                ]}
                                                onPress={() => setSelectedMode(mode.value)}
                                            >
                                                <Feather 
                                                    name={mode.icon} 
                                                    size={14} 
                                                    color={selectedMode === mode.value ? colors.white : colors.darkGray} 
                                                />
                                                <Text style={[
                                                    styles.modeChipText,
                                                    selectedMode === mode.value && styles.modeChipTextActive
                                                ]}>
                                                    {mode.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={clearFilters}
                                >
                                    <Text style={styles.clearButtonText}>Clear All</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={() => setShowFilters(false)}
                                >
                                    <Text style={styles.applyButtonText}>Show {filteredCourses.length} Courses</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </Layout>
    );
}

const CourseCard = ({ course, navigation }) => {
    const imageUrl = course.image?.url || course.image;
    const discount = course.originalPrice
        ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
        : 0;

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation?.navigate?.("CourseDetail", { courseId: course._id || course.id })}
        >
            <View style={styles.cardImageContainer}>
                <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
                <View style={styles.cardOverlay}>
                    <Feather name="play-circle" size={32} color="rgba(255,255,255,0.95)" />
                </View>
                
                {course.badge && (
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{course.badge}</Text>
                    </View>
                )}
                {discount > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{discount}% OFF</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardContent}>
                <View style={styles.categoryRow}>
                    <Text style={styles.categoryLabel}>
                        {course.category || course.badge || "Course"}
                    </Text>
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>
                    {course.title}
                </Text>

                {course.instructor && (
                    <Text style={styles.instructorName} numberOfLines={1}>
                        {course.instructor}
                    </Text>
                )}

                <View style={styles.metaRow}>
                    {course.rating && (
                        <View style={styles.ratingContainer}>
                            <Feather name="star" size={12} color="#FFA500" />
                            <Text style={styles.ratingText}>{course.rating}</Text>
                        </View>
                    )}
                    {course.lectures && (
                        <View style={styles.metaItem}>
                            <Feather name="film" size={10} color={colors.darkGray} />
                            <Text style={styles.metaText}>{course.lectures}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.price}>₹{course.price?.toLocaleString()}</Text>
                        {course.originalPrice && (
                            <Text style={styles.originalPrice}>
                                ₹{course.originalPrice.toLocaleString()}
                            </Text>
                        )}
                    </View>
                    {course.courseMode && (
                        <View style={styles.modeTag}>
                            <Feather 
                                name={course.courseMode === "online" ? "wifi" : "map-pin"} 
                                size={10} 
                                color={colors.primary} 
                            />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.secondary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.secondary,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.secondary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
  },
  quickFilters: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  quickFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  quickFilterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.darkGray,
  },
  quickFilterTextActive: {
    color: colors.white,
  },
  clearFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFE5E5",
    borderWidth: 1,
    borderColor: "#FFB3B3",
    marginRight: 8,
  },
  clearFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.danger,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.darkGray,
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.darkGray,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  gridContent: {
    padding: 16,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageContainer: {
    position: "relative",
    height: 120,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.white,
    textTransform: "uppercase",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.white,
  },
  cardContent: {
    padding: 12,
  },
  categoryRow: {
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.secondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  instructorName: {
    fontSize: 11,
    color: colors.darkGray,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF4E5",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#CC8800",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: colors.darkGray,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.secondary,
  },
  originalPrice: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  modeTag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.secondary,
  },
  modalBody: {
    flex: 1,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.secondary,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.lightGray,
  },
  filterOptionActive: {
    backgroundColor: "#FFE5E5",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.darkGray,
  },
  filterOptionTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.darkGray,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  modeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.darkGray,
  },
  modeChipTextActive: {
    color: colors.white,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkGray,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
});