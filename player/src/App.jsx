import { useEffect, useState } from "react";
import { Menu, MessageCircle, Calendar, Clock, Radio, WifiOff, AlertTriangle, RefreshCw, Shield } from "lucide-react";
import Sidebar from "./Sidebar";
import LiveChat from "./LiveChat";
import LiveStatusOverlay from "./LiveStatusOverlay";
import useLiveSession from "./context/useLiveSession";
import { SocketProvider } from "./context/socket";
import VideoPlayer from "./VideoPlayer";
import useAuth from "./hooks/use-auth";
import axios from "axios";
import devtools from 'devtools-detect';
import { addListener, launch } from 'devtools-detector';
function LMSContent() {
  const UserParams = new URLSearchParams(window.location.search);
  const userId = UserParams.get("userId");
  const token = UserParams.get("token");
  const courseId = UserParams.get("courseId");


  const { user, loading: userLoading, error: authError, isAuthenticated, refetch } = useAuth(token);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const [duration, setDuration] = useState(0);

  // Data states
  const [batch, setBatch] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Video decryption states
  const [playableUrl, setPlayableUrl] = useState(null);
  const [videoSource, setVideoSource] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // Error & Network states
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);

  // Validate URL parameters
  const validateUrlParams = () => {
    const requiredParams = ['userId', 'token'];
    const missingParams = requiredParams.filter(param => !UserParams.get(param));

    if (missingParams.length > 0) {
      setNotFound(true);
      return false;
    }

    const tokenValue = UserParams.get('token');
    if (tokenValue && tokenValue.length < 20) {
      setNotFound(true);
      return false;
    }

    return true;
  };

  // Check initial URL validity
  useEffect(() => {
    if (!validateUrlParams()) {
      setLoading(false);
    }
  }, []);

  // Network monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
      if (!isAuthenticated && token) {
        refetch();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setError({
        type: 'network',
        message: 'No internet connection. Please check your network.',
        icon: WifiOff
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, token, refetch]);

  // Live session hook
  const {
    canJoin,
    isLive,
    hasEnded,
    timeToLive,
    viewerCount,
    handleJoinLive
  } = useLiveSession(currentVideo, userId);

  // Security validation
  const validateAccess = () => {
    if (!token || token.length < 20) {
      setError({
        type: 'auth',
        message: 'Invalid authentication token. Please login again.',
        icon: Shield
      });
      return false;
    }

    if (!userId) {
      setError({
        type: 'auth',
        message: 'User ID is required. Please login again.',
        icon: Shield
      });
      return false;
    }

    return true;
  };

  // Update video token in state (for refresh)
  const updateVideoToken = (videoId, newToken) => {
    setVideos(prevVideos =>
      prevVideos.map(v =>
        v.id === videoId ? { ...v, secureToken: newToken } : v
      )
    );

    if (currentVideo?.id === videoId) {
      setCurrentVideo(prev => ({ ...prev, secureToken: newToken }));
    }
  };

  useEffect(() => {
    if (!currentVideo || !currentVideo.secureToken) return;

    const decryptVideo = async () => {
      try {
        setVideoLoading(true);
        setPlayableUrl(null);
        setVideoSource(null);

        const res = await axios.post(
          `https://www.dikapi.olyox.in/api/videocourses/decrypt/batch/${userId}`,
          { token: currentVideo.secureToken },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = res.data;

        // 🎥 REAL URL ONLY HERE
        setPlayableUrl(data.videoUrl);
        setVideoSource(data.videoSource);

        // 🔄 TOKEN REFRESH SUPPORT
        if (data.refreshedToken) {
          updateVideoToken(currentVideo.id, data.refreshedToken);
        }
      } catch (err) {
        console.error("Video decryption error:", err);

        // Axios errors have response object
        const status = err.response?.status;

        if (status === 401 || status === 403) {
          setError({
            type: "auth",
            message: "You don't have access to this video. Please check your subscription.",
            icon: Shield,
          });
        } else {
          setError({
            type: "auth",
            message: "Video access expired or invalid. Please refresh the page.",
            icon: Shield,
          });
        }
      } finally {
        setVideoLoading(false);
      }
    };

    decryptVideo();
  }, [currentVideo?.id, currentVideo?.secureToken, userId, token]);
  // Fetch batch and videos data with error handling
  useEffect(() => {
    if (!isOnline) return;

    if (!validateAccess()) {
      setLoading(false);
      return;
    }

    refetch();

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const [batchRes, videosRes] = await Promise.all([
          fetch(`https://www.dikapi.olyox.in/api/batchs/${courseId}`, {
            signal: controller.signal,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`https://www.dikapi.olyox.in/api/videocourses/batch/${courseId}`, {
            signal: controller.signal,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        clearTimeout(timeoutId);

        if (!batchRes.ok || !videosRes.ok) {
          if (batchRes.status === 401 || videosRes.status === 401) {
            throw new Error('UNAUTHORIZED');
          }
          if (batchRes.status === 403 || videosRes.status === 403) {
            throw new Error('FORBIDDEN');
          }
          if (batchRes.status === 404) {
            setNotFound(true);
            setLoading(false);
            return;
          }
          throw new Error('SERVER_ERROR');
        }

        const batchData = await batchRes.json();
        const videosData = await videosRes.json();

        if (!batchData || !videosData.success) {
          throw new Error('INVALID_DATA');
        }

        setBatch(batchData);

        if (videosData.data.length > 0) {
          const videoList = videosData.data;

          // 🔒 STORE ONLY: id, title, secureToken (NEVER raw URLs)
          setVideos(videoList);

          // Check URL params for specific video
          const params = new URLSearchParams(window.location.search);
          const videoParam = params.get("video");

          if (videoParam && videoList.length) {
            let found = null;

            // Try matching by secureToken first (from URL)
            found = videoList.find(v => v.secureToken === videoParam);

            // Fallback: try matching by videoId (if it's a number)
            if (!found && !isNaN(videoParam)) {
              found = videoList.find(v => v.id === parseInt(videoParam));
            }

            if (!found) {
              // If no match, use first video
              setCurrentVideo(videoList[0]);
            } else {
              setCurrentVideo(found);
            }
          } else if (videoList.length) {
            setCurrentVideo(videoList[0]);
          }

        } else {
          setError({
            type: 'empty',
            message: 'No videos available in this course.',
            icon: AlertTriangle
          });
        }

        setRetryCount(0);
      } catch (err) {
        console.error("Failed to load course data:", err);

        if (err.name === 'AbortError') {
          setError({
            type: 'timeout',
            message: 'Request timeout. Server is taking too long to respond.',
            icon: AlertTriangle
          });
        } else if (err.message === 'UNAUTHORIZED') {
          setError({
            type: 'auth',
            message: 'Your session has expired. Please login again.',
            icon: Shield
          });
        } else if (err.message === 'FORBIDDEN') {
          setError({
            type: 'auth',
            message: 'You do not have permission to access this course.',
            icon: Shield
          });
        } else if (err.message === 'Failed to fetch' || !isOnline) {
          setError({
            type: 'network',
            message: 'Network error. Please check your internet connection.',
            icon: WifiOff
          });
        } else {
          setError({
            type: 'server',
            message: 'Failed to load course. Please try again later.',
            icon: AlertTriangle
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isOnline, retryCount]);

  const handleVideoClick = (video) => {
    setCurrentVideo(video);
    setSidebarOpen(false);

    // Update URL with secureToken (matches backend URL format)
    const url = new URL(window.location.href);
    url.searchParams.set("video", video.secureToken);
    url.searchParams.set("batchId",courseId); // Keep batchId in sync
    window.history.replaceState({}, "", url);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Loading State
  if (loading || userLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  // 404 Not Found State
  if (notFound) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <h1 className="text-[150px] lg:text-[200px] font-black text-white mb-4 leading-none">
              404
            </h1>
            <div className="w-32 h-1 bg-blue-500 mx-auto mb-8"></div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or you don't have access to it.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to Home
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors ml-0 sm:ml-3 mt-3 sm:mt-0"
            >
              Go Back
            </button>
          </div>

          <div className="mt-12 text-gray-500 text-sm">
            <p>Possible reasons:</p>
            <ul className="mt-2 space-y-1">
              <li>• Invalid or expired link</li>
              <li>• Missing required parameters (userId, token)</li>
              <li>• Video or course doesn't exist</li>
              <li>• You don't have permission to access this content</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    const Icon = error.icon;
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error.type === 'network' ? 'Connection Error' :
              error.type === 'auth' ? 'Access Denied' :
                'Something went wrong'}
          </h2>
          <p className="text-gray-600 mb-6">{error.message}</p>

          <div className="space-y-3">
            {(error.type === 'network' || error.type === 'timeout' || error.type === 'server') && (
              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Retry
              </button>
            )}

            {error.type === 'auth' && (
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Go to Login
              </button>
            )}

            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized State
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            {authError || 'Please login to access this course.'}
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Network Status Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 z-50 flex items-center justify-center gap-2">
          <WifiOff className="w-5 h-5" />
          <span className="text-sm font-medium">No internet connection</span>
        </div>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 shadow-xl lg:shadow-none`}
      >
        <Sidebar
          videos={videos}
          user={user}
          duration={duration}
          currentVideo={currentVideo}
          batch={batch}
          onVideoClick={handleVideoClick}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 ml-12 lg:ml-0">
              <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
                {currentVideo?.title || "Select a lesson"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {batch?.name || "Course"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Live Status Badge */}
              {currentVideo?.isLive && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                  <Radio className="w-4 h-4" />
                  <span>{timeToLive}</span>
                </div>
              )}

              {/* Chat Button */}
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Open Live Chat"
              >
                <MessageCircle className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                {liveCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {liveCount > 99 ? "99+" : liveCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Live Status */}
          {currentVideo?.isLive && (
            <div className="sm:hidden mt-3 flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium w-fit">
              <Radio className="w-4 h-4" />
              <span>{timeToLive}</span>
            </div>
          )}
        </header>

        {/* Video Player Container */}
        <div className="flex-1 relative bg-black overflow-hidden">
          {currentVideo && (
            <>
              {/* Live Status Overlay */}
              {currentVideo.isLive && (
                <LiveStatusOverlay
                  user={user}
                  token={token}
                  canJoin={canJoin}
                  hasEnded={hasEnded}
                  timeToLive={timeToLive}
                  onJoinLive={handleJoinLive}
                />
              )}

              {/* Video Loading State */}
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">Loading video...</p>
                  </div>
                </div>
              )}

              {/* Video Player - Only render when URL is decrypted */}
              {!videoLoading && playableUrl && (canJoin || !currentVideo.isLive) && (
                <VideoPlayer
                  video={currentVideo}
                  playableUrl={playableUrl}
                  videoSource={videoSource}
                  durationSet={setDuration}
                  isLive={isLive}
                  user={user}
                  token={token}
                  userId={userId}
                  canJoin={canJoin}
                  viewerCount={viewerCount}
                />
              )}
            </>
          )}

          {!currentVideo && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a lesson to start learning</p>
              </div>
            </div>
          )}
        </div>

        {/* Lesson Info Section */}
        <section className="bg-white border-t border-gray-200 p-4 lg:p-8 overflow-y-auto max-h-64">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              {currentVideo?.dateOfClass && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(currentVideo.dateOfClass).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      }
                    )}
                  </span>
                  {currentVideo.TimeOfClass && (
                    <>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{currentVideo.TimeOfClass}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Live Chat Component */}
      {currentVideo && currentVideo.isLive && (
        <LiveChat
          videoId={currentVideo.id}
          userId={userId}
          user={user}
          visible={chatOpen}
          onClose={() => setChatOpen(false)}
          onLiveCountChange={setLiveCount}
        />
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Main App with Socket Provider
export default function App() {
  const UserParams = new URLSearchParams(window.location.search);
  const userId = UserParams.get("userId");
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  useEffect(() => {
    launch(); // whatever this does

    const handleDevToolsOpen = (isOpen) => {
      setDevToolsOpen(isOpen);
      if (isOpen) {
        alert('Developer tools detected. Access restricted.');
      }
    };

    addListener(handleDevToolsOpen);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  useEffect(() => {
    const handleDevToolsChange = (event) => {
      if (event.detail.isOpen) {
        alert('Developer tools detected. Video playback restricted.');
        window.location.blur();
        setDevToolsOpen(true);
      }
    };

    window.addEventListener('devtoolschange', handleDevToolsChange);
    return () => window.removeEventListener('devtoolschange', handleDevToolsChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F12') e.preventDefault();
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) e.preventDefault();
      if (e.ctrlKey && e.key.toUpperCase() === 'U') e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Only show LMSContent if dev tools are NOT open
  if (devToolsOpen) {
    return (
      <div className="flex-1 relative bg-black overflow-hidden blur-xl transition-all duration-300">
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-white text-center">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-bold">Developer Tools Detected</p>
            <p className="mt-2">Video playback disabled for security.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider userId={userId}>
      <LMSContent />
    </SocketProvider>
  );
}
