import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSWR from 'swr';
import { useAuthStore } from '../../stores/auth.store';
import { fetcher } from '../../constant/fetcher';
import CourseHeader from '../CourseComponets/CourseHeader';
import SmartVideoPlayer from '../../utils/SmartVideoPlayer';
import VideoList from '../CourseComponets/VideoList';
import { colors } from '../../constant/color';
import CommentsPanel from '../CourseComponets/CommentsPanel';
import DoubtsModal from '../CourseComponets/DoubtsModal';
import MyDoubtsModal from '../CourseComponets/MyDoubtsModal';
import { VideoProgressProvider } from '../../context/VideoProgressContext';
import LoadingScreen from '../CourseComponets/LoadingScreen';
import LockedScreen from '../CourseComponets/LockedScreen';
import { SocketProvider } from '../../context/SocketContext';

export default function CourseScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId, unlocked = false, userId } = route.params || {};
  const { user } = useAuthStore();

  // Video States
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showDoubts, setShowDoubts] = useState(false);
  const [showMyDoubts, setShowMyDoubts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch course data
  const { data: batchData, isLoading: batchLoading, mutate: mutateBatch } = useSWR(
    courseId ? `/batchs/${courseId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: videosData, isLoading: videosLoading, mutate: mutateVideos } = useSWR(
    unlocked ? `/videocourses/batch/${courseId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const videos = videosData?.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([mutateBatch(), mutateVideos()]);
    setRefreshing(false);
  };

  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
    setShowComments(false);
    setShowDoubts(false);
    setShowMyDoubts(false);
  };

  const handleCloseModals = () => {
    setShowComments(false);
    setShowDoubts(false);
    setShowMyDoubts(false);
  };

  // Handle when live session ends - force switch to regular player
  const handleLiveEnded = () => {
    // Force re-render by updating the video object
    if (currentVideo) {
      setCurrentVideo({
        ...currentVideo,
        isLiveEnded: true,
      });
    }
    
    // Optionally refresh videos data to get updated status from server
    mutateVideos();
  };

  if (batchLoading || videosLoading) {
    return <LoadingScreen message="Loading your course..." />;
  }

  if (!unlocked) {
    return <LockedScreen />;
  }

  return (
    <SocketProvider userId={user?.id}>
      <VideoProgressProvider userId={user?.id} courseId={courseId}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Course Header */}
            {currentVideo ? null : (
              <CourseHeader
                batchData={batchData}
                videosCount={videos.length || 0}
              />
            )}

            {/* Smart Video Player - Automatically switches between Live and Regular */}
            {currentVideo && (
              <SmartVideoPlayer
                video={currentVideo}
                userId={user?.id}
                courseId={courseId}
                onShowComments={() => setShowComments(true)}
                onShowDoubts={() => setShowDoubts(true)}
                onShowMyDoubts={() => setShowMyDoubts(true)}
                onLiveEnded={handleLiveEnded}
              />
            )}

            {/* Video List */}
            {currentVideo ? null : (
              <VideoList
                videos={videos}
                startDate={batchData?.startDate}
                endDate={batchData?.endDate}
                currentVideo={currentVideo}
                            courseId={courseId}

                onVideoSelect={handleVideoSelect}
                userId={user?.id}
              />
            )}
          </ScrollView>

          {/* Comments Panel */}
          <CommentsPanel
            visible={showComments}
            onClose={() => setShowComments(false)}
            videoId={currentVideo?.id}
            userId={user?.id}
          />

          {/* Doubts Modal */}
          <DoubtsModal
            visible={showDoubts}
            onClose={() => setShowDoubts(false)}
            videoId={currentVideo?.id}
            courseId={courseId}
            userId={user?.id}
            currentTime={0}
          />

          {/* My Doubts Modal */}
          <MyDoubtsModal
            visible={showMyDoubts}
            onClose={() => setShowMyDoubts(false)}
            videoId={currentVideo?.id}
            courseId={courseId}
            userId={user?.id}
          />
        </SafeAreaView>
      </VideoProgressProvider>
    </SocketProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
});