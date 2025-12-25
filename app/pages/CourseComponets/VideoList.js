import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors } from "../../constant/color";
import { useSocket } from "../../context/SocketContext";

export default function VideoList({
  videos,
  currentVideo,
  onVideoSelect,
  userId,
}) {
  const { socket } = useSocket();

  // Jab video select ho → join chat room
  const handleVideoPress = (video) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Parent ko video select karne ke liye batao
    onVideoSelect(video);

    if (socket && video.isLive === true && video.isEnded === false && userId) {
      socket.emit("join-chat", {
        videoId: video.id,
        userId,
      });
    }

  };

  useEffect(() => {
    return () => {
      if (socket && currentVideo?.isLive && userId) {
        socket.emit("leave-chat", {
          videoId: currentVideo.id,
          userId,
        });
      }
    };
  }, [currentVideo?.id, socket, userId]);

  const renderVideoItem = ({ item, index }) => {
    const isCurrentPlaying = currentVideo?.id === item.id;
    const isLive = item.isLive === true && item.isEnded === false;

    const isDemo = item.isDemo;
    const isActuallyLive = item.isLive === true && item.isEnded === false;


    return (
      <TouchableOpacity
        style={[styles.videoCard, isCurrentPlaying && styles.videoCardActive]}
        onPress={() => handleVideoPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.videoCardContent}>
          <View
            style={[
              styles.videoNumber,
              isCurrentPlaying && styles.videoNumberActive,
              isLive && styles.videoNumberLive,
            ]}
          >
            {isLive ? (
              <Feather name="radio" size={16} color="#fff" />
            ) : (
              <Text
                style={[
                  styles.videoNumberText,
                  isCurrentPlaying && styles.videoNumberTextActive,
                ]}
              >
                {index + 1}
              </Text>
            )}
          </View>


          <View style={styles.videoCardInfo}>
            <View style={styles.videoTitleRow}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {isLive && (
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              )}
              {isDemo && (
                <View style={styles.demoBadge}>
                  <Text style={styles.demoBadgeText}>DEMO</Text>
                </View>
              )}
            </View>

            {item.subject && (
              <Text style={styles.videoSubject}>📖 {item.subject}</Text>
            )}

            {isLive && item.DateOfLive && item.TimeOfLIve && (
              <Text style={styles.liveTime}>
                🕒{" "}
                {new Date(`${item.DateOfLive} ${item.TimeOfLIve}`).toLocaleString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "numeric",
                    month: "short",
                  }
                )}
              </Text>
            )}
          </View>

          <View style={styles.videoActions}>
            {isCurrentPlaying && (
              <View style={styles.playingIndicator}>
                <Feather name="play-circle" size={28} color={colors.primary} />
              </View>
            )}

            {item.isDownloadable && (
              <TouchableOpacity style={styles.downloadButton}>
                <Feather name="download" size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!videos || videos.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Feather name="video-off" size={64} color={colors.textMuted} />
        <Text style={styles.emptyText}>
          No videos have been uploaded yet 🙂
          {"\n"}
          As soon as a video becomes available,
          you will be notified.
        </Text>

      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📚 All Lectures</Text>

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVideoItem}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
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
  videoNumberLive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  videoNumberText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15,
  },
  videoNumberTextActive: {
    color: "#fff",
  },
  videoCardInfo: {
    flex: 1,
  },
  videoTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 8,
  },
  videoTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 20,
  },
  liveBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  demoBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  demoBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  videoSubject: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "600",
    marginBottom: 4,
  },
  liveTime: {
    fontSize: 11,
    color: colors.error,
    fontWeight: "600",
  },
  videoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playingIndicator: {
    marginLeft: 12,
  },
  downloadButton: {
    padding: 8,
  },
});