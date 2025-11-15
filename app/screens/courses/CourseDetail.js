import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import useSWR from "swr";
import { fetcher } from "../../constant/fetcher";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import YoutubePlayer from "react-native-youtube-iframe";
import { colors } from "../../constant/color";
import { WebView } from "react-native-webview";
const { width } = Dimensions.get("window");

const FALLBACK_DEMOS = [
  {
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Course Introduction & Overview",
    duration: "5:30",
  },
  {
    url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    title: "What You'll Learn",
    duration: "8:45",
  },
  {
    url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    title: "Course Preview & Curriculum",
    duration: "12:20",
  },
];

export default function CourseDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId } = route.params || {};

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playing, setPlaying] = useState(false);

  const {
    data: course,
    error,
    isLoading,
  } = useSWR(`/courses/${courseId}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) { }
  };

  const handleBack = () => {
    triggerHaptic();
    navigation.goBack();
  };

  const handleEnrollPress = () => {
    triggerHaptic();
    setShowPaymentModal(true);
  };

  const handlePaymentSelect = (type) => {
    triggerHaptic();
    setSelectedPayment(type);
  };

  const handleConfirmPayment = () => {
    triggerHaptic();
    setShowPaymentModal(false);
    console.log("Payment confirmed:", selectedPayment);
  };

  const handleVideoPress = (video) => {
    triggerHaptic();
    setCurrentVideo(video);
    setShowVideoModal(true);
    setPlaying(true);
  };

  const handleCloseVideo = () => {
    triggerHaptic();
    setPlaying(false);
    setShowVideoModal(false);
    setTimeout(() => setCurrentVideo(null), 300);
  };

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  // YouTube Helpers
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : null;
  };

  // Demo Videos Logic with Fallback
  const demoVideos = (() => {
    const videos = [];

    if (course?.demoVideo && typeof course.demoVideo === "string") {
      videos.push({
        url: course.demoVideo,
        title: "Course Introduction",
      });
    }

    if (Array.isArray(course?.videos)) {
      course.videos.forEach((url) => {
        videos.push({
          url,
          title: `Demo Video ${videos.length + 1}`,
        });
      });
    }

    // Use fallback if no videos available
    return videos.length > 0 ? videos : FALLBACK_DEMOS;
  })();

  const totalVideos = course?.totalVideos || 45;
  const lockedVideos = Math.max(
    0,
    totalVideos - (demoVideos === FALLBACK_DEMOS ? 0 : demoVideos.length)
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading course...</Text>
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Feather name="alert-circle" size={64} color={colors.danger} />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorText}>
          We couldn't load the course details
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
          <Feather name="arrow-left" size={20} color={colors.white} />
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const imageUrl = course.image?.url;
  const discount = course.originalPrice
    ? Math.round(
      ((course.originalPrice - course.price) / course.originalPrice) * 100
    )
    : 0;

  const hasInstallments =
    course.firstInstallment ||
    course.secondInstallment ||
    course.thirdInstallment ||
    course.fourthInstallment;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Course Details
        </Text>
        <TouchableOpacity style={styles.iconButton} onPress={triggerHaptic}>
          <Feather name="share-2" size={22} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <View style={styles.hero}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {course.badge && (
            <View style={styles.heroBadge}>
              <Feather name="award" size={14} color={colors.white} />
              <Text style={styles.heroBadgeText}>{course.badge}</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.discountTag}>
              <Text style={styles.discountTagText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Course Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          {course.shortContent && (
            <Text style={styles.courseSubtitle}>{course.shortContent}</Text>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="play-circle" size={18} color={colors.primary} />
              <Text style={styles.statText}>{course.lectures} Lectures</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather name="clock" size={18} color={colors.primary} />
              <Text style={styles.statText}>{course.duration}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather name="globe" size={18} color={colors.primary} />
              <Text style={styles.statText}>{course.languages}</Text>
            </View>
          </View>

          {/* Mode Badge */}
          <View
            style={[
              styles.modeBadge,
              course.courseMode === "online"
                ? styles.onlineBadge
                : styles.offlineBadge,
            ]}
          >
            <Feather
              name={course.courseMode === "online" ? "wifi" : "download"}
              size={16}
              color={colors.white}
            />
            <Text style={styles.modeText}>
              {course.courseMode === "online" ? "Online" : "Offline"} Course
            </Text>
          </View>
        </View>

        {/* Demo Videos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Demo Videos</Text>
            <View style={styles.videoCountBadge}>
              <Feather name="unlock" size={11} color={colors.success} />
              <Text style={styles.videoCountText}>{demoVideos.length} Free</Text>
            </View>
          </View>

          {demoVideos === FALLBACK_DEMOS && (
            <View style={styles.fallbackNotice}>
              <Feather name="info" size={12} color={colors.softRed} />
              <Text style={styles.fallbackText}>Sample preview videos</Text>
            </View>
          )}

          {/* Video List - Compact */}
          {demoVideos.map((video, index) => {
            const videoId = getYouTubeVideoId(video.url);
            const thumbnailUrl = getYouTubeThumbnail(video.url);

            return (
              <TouchableOpacity
                key={index}
                style={styles.videoItem}
                onPress={() => handleVideoPress(video)}
                activeOpacity={0.7}
              >
                <View style={styles.videoThumb}>
                  {thumbnailUrl ? (
                    <Image
                      source={{ uri: thumbnailUrl }}
                      style={styles.thumbImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.thumbPlaceholder}>
                      <Feather name="video" size={16} color={colors.white} />
                    </View>
                  )}
                  <View style={styles.playIcon}>
                    <Feather name="play" size={12} color={colors.white} />
                  </View>
                  {video.duration && (
                    <View style={styles.durationTag}>
                      <Text style={styles.durationText}>{video.duration}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.videoDetails}>
                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <View style={styles.videoFooter}>
                    <View style={styles.freeTag}>
                      <Text style={styles.freeTagText}>FREE</Text>
                    </View>
                    <Feather name="chevron-right" size={14} color={colors.darkGray} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Locked Videos */}
          {lockedVideos > 0 && (
            <View style={styles.lockedCard}>
              <Feather name="lock" size={16} color={colors.darkGray} />
              <Text style={styles.lockedText}>
                +{lockedVideos} videos locked · Enroll to unlock
              </Text>
            </View>
          )}
        </View>

        {/* Pricing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Pricing</Text>

          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <View>
                {course.originalPrice && (
                  <Text style={styles.originalPrice}>
                    ₹{course.originalPrice?.toLocaleString()}
                  </Text>
                )}
                <Text style={styles.finalPrice}>
                  ₹{course.price?.toLocaleString()}
                </Text>
              </View>
              {discount > 0 && (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveText}>
                    Save ₹{(course.originalPrice - course.price).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>

            {course.oneTimeFee && (
              <View style={styles.paymentRow}>
                <View style={styles.paymentInfo}>
                  <Feather name="zap" size={20} color={colors.primary} />
                  <Text style={styles.paymentLabel}>One-Time Payment</Text>
                </View>
                <Text style={styles.paymentValue}>
                  ₹{course.oneTimeFee.toLocaleString()}
                </Text>
              </View>
            )}

            {hasInstallments && (
              <View style={styles.installmentCard}>
                <View style={styles.installmentHeader}>
                  <Feather name="credit-card" size={20} color={colors.primary} />
                  <Text style={styles.installmentTitle}>
                    Easy Installment Plan
                  </Text>
                </View>

                {[
                  { label: "1st", value: course.firstInstallment },
                  { label: "2nd", value: course.secondInstallment },
                  { label: "3rd", value: course.thirdInstallment },
                  { label: "4th", value: course.fourthInstallment },
                ]
                  .filter((i) => i.value)
                  .map((installment, idx) => (
                    <View key={idx} style={styles.installmentRow}>
                      <Text style={styles.installmentLabel}>
                        {installment.label} Installment
                      </Text>
                      <Text style={styles.installmentValue}>
                        ₹{installment.value.toLocaleString()}
                      </Text>
                    </View>
                  ))}
              </View>
            )}
          </View>
        </View>
    

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Fixed Enroll Button */}
      <View style={styles.enrollContainer}>
        <TouchableOpacity
          style={styles.enrollButton}
          onPress={handleEnrollPress}
          activeOpacity={0.9}
        >
          <Text style={styles.enrollButtonText}>Enroll Now</Text>
          <Feather name="arrow-right" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Video Modal with YouTube Player */}
      <Modal
        visible={showVideoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseVideo}
      >
        <View style={styles.videoModalOverlay}>
          <SafeAreaView style={styles.videoModalContainer}>
            <View style={styles.videoModalHeader}>
              <View style={styles.videoModalTitleContainer}>
                <Text style={styles.videoModalTitle} numberOfLines={1}>
                  {currentVideo?.title}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseVideo}
              >
                <Feather name="x" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.videoPlayerWrapper}>
              {currentVideo?.url && (
                <YoutubePlayer
                  height={width * 0.5625}
                  width={width}
                  videoId={getYouTubeVideoId(currentVideo.url)}
                  play={playing}
                  onChangeState={onStateChange}
                  webViewStyle={styles.youtubePlayer}
                />
              )}
            </View>

            <View style={styles.videoModalFooter}>
              <Feather name="info" size={18} color={colors.lightGray} />
              <Text style={styles.videoModalDesc}>
                Explore the course content through this preview
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            triggerHaptic();
            setShowPaymentModal(false);
          }}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Choose Payment Option</Text>
            <Text style={styles.modalSubtitle}>
              Select your preferred payment method
            </Text>

            {course.oneTimeFee && (
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPayment === "full" && styles.paymentOptionActive,
                ]}
                onPress={() => handlePaymentSelect("full")}
                activeOpacity={0.8}
              >
                <View style={styles.paymentOptionIcon}>
                  <Feather name="zap" size={24} color={colors.primary} />
                </View>
                <View style={styles.paymentOptionDetails}>
                  <Text style={styles.paymentOptionTitle}>Full Payment</Text>
                  <Text style={styles.paymentOptionDesc}>
                    Pay once, get instant access
                  </Text>
                  <Text style={styles.paymentOptionPrice}>
                    ₹{course.oneTimeFee.toLocaleString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    selectedPayment === "full" && styles.radioCircleActive,
                  ]}
                >
                  {selectedPayment === "full" && (
                    <View style={styles.radioDot} />
                  )}
                </View>
              </TouchableOpacity>
            )}

            {hasInstallments && (
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPayment === "installment" &&
                  styles.paymentOptionActive,
                ]}
                onPress={() => handlePaymentSelect("installment")}
                activeOpacity={0.8}
              >
                <View style={styles.paymentOptionIcon}>
                  <Feather name="credit-card" size={24} color={colors.primary} />
                </View>
                <View style={styles.paymentOptionDetails}>
                  <Text style={styles.paymentOptionTitle}>Installments</Text>
                  <Text style={styles.paymentOptionDesc}>
                    Pay in easy monthly installments
                  </Text>
                  <Text style={styles.paymentOptionPrice}>
                    ₹{course.firstInstallment?.toLocaleString()}
                    <Text style={styles.paymentOptionSub}> /first</Text>
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    selectedPayment === "installment" &&
                    styles.radioCircleActive,
                  ]}
                >
                  {selectedPayment === "installment" && (
                    <View style={styles.radioDot} />
                  )}
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedPayment && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmPayment}
              disabled={!selectedPayment}
              activeOpacity={0.9}
            >
              <Text style={styles.confirmButtonText}>Continue to Payment</Text>
              <Feather name="arrow-right" size={20} color={colors.white} />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.lightGray,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.secondary,
    textAlign: "center",
    marginHorizontal: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.lightGray,
  },

  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { paddingBottom: 100 },

  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.darkGray,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.white,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.secondary,
    marginTop: 16,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    color: colors.darkGray,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },

  // Hero
  hero: {
    width: "100%",
    height: width,
    position: "relative",
    backgroundColor: colors.lightGray,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
    textTransform: "uppercase",
  },
  discountTag: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  discountTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.white,
  },

  // Info Card
  infoCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.secondary,
    marginBottom: 6,
    lineHeight: 24,
  },
  courseSubtitle: {
    fontSize: 13,
    color: colors.darkGray,
    lineHeight: 18,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.darkGray,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
    marginHorizontal: 10,
  },
  modeBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  onlineBadge: { backgroundColor: colors.softRed },
  offlineBadge: { backgroundColor: colors.secondary },
  modeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
  },

  // Section
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.secondary,
  },
  videoCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  videoCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.success,
  },

  // Fallback Notice
  fallbackNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF3F3",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  videoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  videoThumb: {
    width: 100,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    position: "relative",
    marginRight: 12,
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.darkGray,
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -14 }, { translateY: -14 }],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  durationTag: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.white,
  },
  videoDetails: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.secondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  videoFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  freeTag: {
    backgroundColor: colors.lightRed2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.softRed,
  },

  // Locked Card
  lockedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  lockedText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.darkGray,
  },
  fallbackText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  // Video Card
  videoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  videoThumbnail: {
    width: "100%",
    height: 200,
    backgroundColor: colors.secondary,
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.darkGray,
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  durationBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
  videoContent: {
    padding: 16,
  },
  videoHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  videoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.secondary,
    lineHeight: 22,
    marginRight: 8,
  },
  freeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F8F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.success,
  },

  // Locked Card
  lockedCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  lockedContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  lockedInfo: {
    flex: 1,
  },
  lockedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.secondary,
    marginBottom: 4,
  },
  lockedText: {
    fontSize: 13,
    color: colors.darkGray,
  },

  // Price Card
  priceCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.darkGray,
    textDecorationLine: "line-through",
    marginBottom: 4,
  },
  finalPrice: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.primary,
  },
  saveBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.white,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.secondary,
  },
  paymentValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.secondary,
  },

  // Installment Card
  installmentCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  installmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  installmentTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.secondary,
  },
  installmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 8,
  },
  installmentLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.darkGray,
  },
  installmentValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.secondary,
  },

  // Enroll Button
  enrollContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  enrollButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  enrollButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.white,
  },

  // Video Modal
  videoModalOverlay: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  videoModalContainer: {
    flex: 1,
  },
  videoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  videoModalTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  videoModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  videoPlayerWrapper: {
    flex: 1,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayer: {
    width: "100%",
    height: width * 0.5625,
  },
  videoModalFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.9)",
    padding: 20,
  },
  videoModalDesc: {
    flex: 1,
    fontSize: 14,
    color: colors.lightGray,
    lineHeight: 20,
  },

  // Payment Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 44,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.secondary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: colors.darkGray,
    marginBottom: 28,
  },

  // Payment Options
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentOptionActive: {
    backgroundColor: "#FFF3F3",
    borderColor: colors.primary,
  },
  paymentOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  paymentOptionDetails: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.secondary,
    marginBottom: 4,
  },
  paymentOptionDesc: {
    fontSize: 13,
    color: colors.darkGray,
    marginBottom: 8,
  },
  paymentOptionPrice: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.primary,
  },
  paymentOptionSub: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.darkGray,
  },
  radioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },

  // Confirm Button
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.white,
  },
}); 