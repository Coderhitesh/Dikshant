import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import * as Haptics from 'expo-haptics';
import { colors } from '../constant/color';
import { useVideoProgress } from '../context/VideoProgressContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;



export default function VideoPlayer({
  video,
  userId,
  courseId,
  onShowComments,
  onShowDoubts,
  onShowMyDoubts,
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  const playerRef = useRef(null);
  const { saveProgress, getProgress } = useVideoProgress();

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/))([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Load saved progress when video changes
  useEffect(() => {
    if (video && userId) {
      const loadProgress = async () => {
        const savedPosition = await getProgress(video.id);
        if (savedPosition > 30) { // Only resume if more than 30 seconds watched
          Alert.alert(
            'Resume Video',
            `Continue from ${formatTime(savedPosition)}?`,
            [
              { text: 'Start Over', style: 'cancel' },
              {
                text: 'Resume',
                onPress: () => {
                  setTimeout(() => {
                    playerRef.current?.seekTo(savedPosition, true);
                    setCurrentTime(savedPosition);
                  }, 1000);
                },
              },
            ]
          );
        }
      };
      loadProgress();
    }
  }, [video, userId]);

  // Auto-save progress every 10 seconds
  useEffect(() => {
    if (!video || !isPlaying || currentTime === 0) return;

    const interval = setInterval(() => {
      saveProgress(video.id, courseId, currentTime, videoDuration);
    }, 10000);

    return () => clearInterval(interval);
  }, [video, currentTime, videoDuration, isPlaying, courseId]);

  const handleBookmark = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('✅ Bookmarked', `${video?.title} added to bookmarks`);
  };

  const handleOpenDoubts = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShowDoubts();
  };

  const progressPercentage = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;
  const videoId = getYouTubeId(video?.url);

  if (!video) return null;

  return (
    <View style={styles.container}>
      <View style={styles.playerBackground}>
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
            if (state === 'playing') setIsPlaying(true);
            if (state === 'paused') setIsPlaying(false);
          }}
          initialPlayerParams={{
            controls: true,
            rel: false,
            modestbranding: true,
            fs: true,
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

        {/* Video Info Header */}
        <View style={styles.playerHeader}>
          <View style={styles.titleSection}>
            <Text style={styles.playerTitle} numberOfLines={2}>
              {video.title}
            </Text>
            <Text style={styles.playerTime}>
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </Text>
          </View>

          <View style={styles.playerActions}>
            <TouchableOpacity onPress={handleBookmark} style={styles.iconButton}>
              <Feather name="bookmark" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBarButton} onPress={onShowComments}>
          <Feather name="message-circle" size={22} color={colors.primary} />
          <Text style={styles.actionBarLabel}>Comments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBarButton} onPress={handleOpenDoubts}>
          <Feather name="help-circle" size={22} color={colors.primary} />
          <Text style={styles.actionBarLabel}>Ask Doubt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBarButton} onPress={onShowMyDoubts}>
          <Feather name="list" size={22} color={colors.primary} />
          <Text style={styles.actionBarLabel}>My Doubts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playerBackground: {
    backgroundColor: '#000',
    position: 'relative',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  playerTime: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  playerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: 'space-around',
  },
  actionBarButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  actionBarLabel: {
    fontSize: 11,
    color: colors.text,
    marginTop: 4,
    fontWeight: '600',
  },
});