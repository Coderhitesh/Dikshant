import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Slider,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import YoutubePlayer from "react-native-youtube-iframe";
import useSWR from "swr";
import { fetcher } from "../../constant/fetcher";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL_LOCAL_ENDPOINT } from "../../constant/api";
import { useAuthStore } from "../../stores/auth.store";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;

// Modern Light Color Palette
const colors = {
  primary: "#EF4444", // Indigo
  primaryLight: "#EEF2FF",
  primaryDark: "#4F46E5",
  accent: "#EC4899", // Pink
  background: "#FAFAFA",
  card: "#FFFFFF",
  text: "#1F2937",
  textLight: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  shadow: "rgba(0, 0, 0, 0.1)",
};

// Automatic progress tracking every 10 seconds
const saveProgress = async (userId, videoId, batchId, watched, duration) => {
  if (!userId || !videoId || !batchId) return;

  const payload = {
    userId,
    videoId,
    batchId,
    watched: Math.floor(watched),
    duration: Math.floor(duration || 3600),
    percentage: Math.min(
      100,
      Math.round((Math.floor(watched) / (duration || 3600)) * 100)
    ),
    lastPosition: Math.floor(watched),
    lastWatchedAt: new Date().toISOString(),
    completedAt: Math.floor(watched) / (duration || 3600) > 0.95 ? new Date().toISOString() : null,
  };

  try {
    const response = await fetch(
      `${API_URL_LOCAL_ENDPOINT}/courseprogresss`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (response.ok) {
      console.log("✅ Progress saved:", payload.percentage + "%");
    }
  } catch (error) {
    console.log("❌ Progress save failed:", error.message);
  }
};

const fetchProgress = async (userId, videoId) => {
  try {
    const response = await fetch(
      `${API_URL_LOCAL_ENDPOINT}/courseprogresss/${userId}/${videoId}`,
      { method: "GET" }
    );
    if (response.ok) {
      const data = await response.json();
      return data[0]?.lastPosition || 0;
    }
  } catch (error) {
    console.log("Fetch progress error:", error.message);
  }
  return 0;
};

export default function MyEnrollCourse() {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId, unlocked = false, userId } = route.params || {};
  const { user } = useAuthStore();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showDoubts, setShowDoubts] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showSpeed, setShowSpeed] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(100);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const playerRef = useRef(null);
  const progressInterval = useRef(null);

  const { data: batchData, isLoading: batchLoading } = useSWR(
    courseId ? `/batchs/${courseId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: videosData, isLoading: videosLoading } = useSWR(
    unlocked ? `/videocourses/batch/${courseId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const videos = videosData?.data || [];

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/))([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const playVideo = async (video) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentVideo(video);
    setCurrentTime(0);
    setIsPlaying(true);
    setShowComments(false);
    setShowDoubts(false);

    const savedPosition = await fetchProgress(user?.id, video.id);
    if (savedPosition > 0) {
      setTimeout(() => {
        playerRef.current?.seekTo(savedPosition, true);
        setCurrentTime(savedPosition);
      }, 500);
    }

    // Load mock comments
    setComments([
      {
        id: 1,
        user: "Priya Singh",
        avatar: "👩",
        text: "Great explanation! This concept was confusing before.",
        timestamp: "2 mins ago",
        likes: 12,
      },
      {
        id: 2,
        user: "Amit Kumar",
        avatar: "👨",
        text: "Can you solve the example problem at 15:30?",
        timestamp: "1 min ago",
        likes: 5,
      },
    ]);
  };

  // Automatic progress tracking every 10 seconds
  useEffect(() => {
    if (!currentVideo || !isPlaying) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      return;
    }

    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    // Set up new interval to save every 10 seconds
    progressInterval.current = setInterval(() => {
      if (currentTime > 0) {
        saveProgress(user?.id, currentVideo.id, courseId, currentTime, videoDuration);
      }
    }, 10000); // 10 seconds

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentVideo, currentTime, videoDuration, isPlaying, user?.id, courseId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: comments.length + 1,
      user: user?.name || "You",
      avatar: user?.avatar || "👤",
      text: newComment,
      timestamp: "now",
      likes: 0,
    };

    setComments([newCommentObj, ...comments]);
    setNewComment("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDoubts = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDoubts(true);
  };

  const handleBookmark = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("✅ Bookmarked", `${currentVideo?.title} added to bookmarks`);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (batchLoading || videosLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your course...</Text>
      </SafeAreaView>
    );
  }

  if (!unlocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lockedView}>
          <Feather name="lock" size={80} color={colors.primary} />
          <Text style={styles.lockedTitle}>Course Locked</Text>
          <Text style={styles.lockedText}>Please enroll to watch videos</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progressPercentage =
    videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;
  const videoId = currentVideo ? getYouTubeId(currentVideo.url) : null;

  return (
    <SafeAreaView style={styles.container}>
      {currentVideo && (
        <>
          {/* Modern Player Container */}
          <View style={styles.playerContainer}>
            <View style={styles.playerBackground}>
              {/* Player */}
              <YoutubePlayer
                ref={playerRef}
                height={isTablet ? 400 : 240}
                width={width}
                videoId={videoId}
                play={isPlaying}
                volume={isMuted ? 0 : volume}
                playbackRate={playbackSpeed}
                onProgress={(data) => {
                  setCurrentTime(data.currentTime);
                  setVideoDuration(data.duration);
                }}
                onChangeState={(state) => {
                  if (state === "playing") setIsPlaying(true);
                  if (state === "paused") setIsPlaying(false);
                }}
                initialPlayerParams={{
                  controls: false,
                  rel: false,
                  modestbranding: true,
                  fs: false,
                  playsinline: 1,
                }}
                webViewProps={{
                  allowsInlineMediaPlayback: true,
                  mediaPlaybackRequiresUserAction: false,
                }}
              />

          
              {/* Progress Bar */}
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(progressPercentage, 100)}%` },
                  ]}
                />
              </View>

              {/* Video Title & Actions */}
              <View style={styles.playerHeader}>
                <View style={styles.titleSection}>
                  <Text style={styles.playerTitle} numberOfLines={2}>
                    {currentVideo.title}
                  </Text>
                </View>

                <View style={styles.playerActions}>
                  <TouchableOpacity onPress={handleBookmark} style={styles.iconButton}>
                    <Feather name="bookmark" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Enhanced Action Bar */}
            <View style={styles.actionBar}>
              <TouchableOpacity
                style={[
                  styles.actionBarButton,
                  showComments && styles.actionBarButtonActive,
                ]}
                onPress={() => {
                  setShowComments(!showComments);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Feather name="message-circle" size={22} color={colors.primary} />
                <Text style={styles.actionBarLabel}>Comments</Text>
              </TouchableOpacity>

       
              <TouchableOpacity
                style={styles.actionBarButton}
                onPress={handleDoubts}
              >
                <Feather name="help-circle" size={22} color={colors.primary} />
                <Text style={styles.actionBarLabel}>Ask Doubt</Text>
              </TouchableOpacity>
            </View>

            {/* Speed Selector */}
            {showSpeed && (
              <View style={styles.controlPanel}>
                <Text style={styles.controlPanelTitle}>Playback Speed</Text>
                <View style={styles.speedGrid}>
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                    <TouchableOpacity
                      key={speed}
                      style={[
                        styles.speedOption,
                        playbackSpeed === speed && styles.speedOptionActive,
                      ]}
                      onPress={() => {
                        setPlaybackSpeed(speed);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }}
                    >
                      <Text
                        style={[
                          styles.speedText2,
                          playbackSpeed === speed && styles.speedTextActive,
                        ]}
                      >
                        {speed}x
                      </Text>
                      {playbackSpeed === speed && (
                        <Feather name="check" size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Volume Control */}
            {showVolumeControl && (
              <View style={styles.controlPanel}>
                <View style={styles.volumeHeader}>
                  <Text style={styles.controlPanelTitle}>Volume Control</Text>
                  <TouchableOpacity 
                    onPress={toggleMute}
                    style={styles.muteButton}
                  >
                    <Feather 
                      name={isMuted ? "volume-x" : "volume-2"} 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={styles.muteText}>
                      {isMuted ? "Unmute" : "Mute"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.volumeSliderContainer}>
                  <Feather name="volume-1" size={18} color={colors.textLight} />
                  <Slider
                    style={styles.volumeSlider}
                    minimumValue={0}
                    maximumValue={100}
                    value={isMuted ? 0 : volume}
                    onValueChange={setVolume}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                    disabled={isMuted}
                  />
                  <Feather name="volume-2" size={18} color={colors.textLight} />
                  <Text style={styles.volumeText}>{Math.round(volume)}%</Text>
                </View>
              </View>
            )}

            {/* Comments Section */}
            {showComments && (
              <View style={styles.commentsPanel}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentTitle}>💬 Comments & Discussion</Text>
                  <TouchableOpacity onPress={() => setShowComments(false)}>
                    <Feather name="x" size={22} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={comments}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={true}
                  style={styles.commentsList}
                  renderItem={({ item }) => (
                    <View style={styles.commentItem}>
                      <Text style={styles.commentAvatar}>{item.avatar}</Text>
                      <View style={styles.commentContent}>
                        <View style={styles.commentHeader2}>
                          <Text style={styles.commentUser}>{item.user}</Text>
                          <Text style={styles.commentTime}>{item.timestamp}</Text>
                        </View>
                        <Text style={styles.commentText}>{item.text}</Text>
                        <View style={styles.commentActions}>
                          <TouchableOpacity style={styles.commentAction}>
                            <Feather name="thumbs-up" size={14} color={colors.primary} />
                            <Text style={styles.commentActionText}>{item.likes}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.commentAction}>
                            <Feather name="corner-up-left" size={14} color={colors.primary} />
                            <Text style={styles.commentActionText}>Reply</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                />

                {/* Add Comment */}
                <KeyboardAvoidingView behavior="padding" style={styles.addCommentBox}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor={colors.textMuted}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.commentSendBtn}
                    onPress={handleAddComment}
                  >
                    <Feather name="send" size={18} color="#fff" />
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              </View>
            )}
          </View>
        </>
      )}

      {/* Video List */}
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          !currentVideo ? (
            <>
              <View style={styles.courseInfo}>
                <Image
                  source={{
                    uri: batchData?.imageUrl || "https://via.placeholder.com/300",
                  }}
                  style={styles.courseImage}
                />
                <View style={styles.courseDetails}>
                  <Text style={styles.courseName}>{batchData?.name || "Course"}</Text>
                  <Text style={styles.courseDesc}>
                    {batchData?.shortDescription || "Loading..."}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                      <Feather name="video" size={14} color={colors.primary} />
                      <Text style={styles.metaText}>{videos.length} Videos</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>📚 All Lectures</Text>
            </>
          ) : null
        }
        renderItem={({ item, index }) => {
          const isCurrentPlaying = currentVideo?.id === item.id;

          return (
            <TouchableOpacity
              style={[
                styles.videoCard,
                isCurrentPlaying && styles.videoCardActive,
              ]}
              onPress={() => playVideo(item)}
              activeOpacity={0.7}
            >
              <View style={styles.videoCardContent}>
                <View style={[
                  styles.videoNumber,
                  isCurrentPlaying && styles.videoNumberActive
                ]}>
                  <Text style={styles.videoNumberText}>{index + 1}</Text>
                </View>

                <View style={styles.videoCardInfo}>
                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.subject && (
                    <Text style={styles.videoSubject}>📖 {item.subject}</Text>
                  )}
                  <View style={styles.tagsContainer}>
                    {item.isLive && (
                      <View style={styles.liveBadge}>
                        <View style={styles.liveIndicator} />
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    )}
                    {item.isNotes && (
                      <View style={styles.tagBadge}>
                        <Feather name="file-text" size={10} color={colors.primary} />
                        <Text style={styles.tagText}>Notes</Text>
                      </View>
                    )}
                    {item.isPdf && (
                      <View style={styles.tagBadge}>
                        <Feather name="download" size={10} color={colors.success} />
                        <Text style={styles.tagText}>PDF</Text>
                      </View>
                    )}
                  </View>
                </View>

                {isCurrentPlaying && (
                  <View style={styles.playingIndicator}>
                    <Feather name="play-circle" size={28} color={colors.primary} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Doubts Modal */}
      <Modal
        visible={showDoubts}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDoubts(false)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.doubtModal}
        >
          <View style={styles.doubtContent}>
            <View style={styles.doubtHeader}>
              <Text style={styles.doubtTitle}>❓ Ask Your Doubt</Text>
              <TouchableOpacity onPress={() => setShowDoubts(false)}>
                <Feather name="x" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.doubtInput}
              placeholder="Describe your doubt in detail..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={6}
            />

            <TouchableOpacity 
              style={styles.submitDoubtBtn}
              onPress={() => {
                setShowDoubts(false);
                Alert.alert("✅ Doubt Submitted", "Instructors will respond within 24 hours");
              }}
            >
              <Feather name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.submitDoubtBtnText}>Submit Doubt</Text>
            </TouchableOpacity>

            <Text style={styles.doubtInfo}>
              ⚡ Your doubt will be answered by instructors within 24 hours
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.text,
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  lockedView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  lockedTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 20,
  },
  lockedText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 10,
  },

  playerContainer: {
    backgroundColor: "#000",
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playerBackground: {
    backgroundColor: "#000",
    position: "relative",
  },
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 10,
    justifyContent: "space-between",
  },
  topControls: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  centerControls: {
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomControls: {
    padding: 16,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  speedText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  playerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  playerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  actionBar: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: "space-around",
  },
  actionBarButton: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  actionBarButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  actionBarLabel: {
    fontSize: 11,
    color: colors.text,
    marginTop: 4,
    fontWeight: "600",
  },

  controlPanel: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  controlPanelTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  speedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  speedOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 80,
    justifyContent: "center",
  },
  speedOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  speedText2: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "700",
  },
  speedTextActive: {
    color: "#fff",
  },

  volumeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  muteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  muteText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  volumeSliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  volumeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "700",
    minWidth: 45,
    textAlign: "right",
  },

  commentsPanel: {
    maxHeight: height * 0.4,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  commentAvatar: {
    fontSize: 28,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader2: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  commentTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    gap: 16,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  addCommentBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentSendBtn: {
    marginLeft: 10,
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  content: {
    padding: 16,
  },
  courseInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  courseImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
  },
  courseDetails: {
    flex: 1,
    justifyContent: "center",
  },
  courseName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },
  courseDesc: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 10,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  metaText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 16,
  },

  videoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  videoCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    elevation: 3,
    shadowOpacity: 0.2,
  },
  videoCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  videoNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  videoNumberActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  videoNumberText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15,
  },
  videoCardInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  videoSubject: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "600",
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "700",
  },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: "700",
  },
  playingIndicator: {
    marginLeft: 12,
  },

  doubtModal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  doubtContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
    elevation: 8,
  },
  doubtHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  doubtTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  doubtInput: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
    textAlignVertical: "top",
    minHeight: 120,
  },
  submitDoubtBtn: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitDoubtBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  doubtInfo: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 18,
  },
});