import { useEffect, useState } from "react";
import { Menu, MessageCircle, Calendar, Clock, Radio, WifiOff, AlertTriangle, RefreshCw, Shield } from "lucide-react";
import Sidebar from "./Sidebar";
import LiveChat from "./LiveChat";
import LiveStatusOverlay from "./LiveStatusOverlay";
import useLiveSession from "./context/useLiveSession";
import { SocketProvider } from "./context/socket";
import VideoPlayer from "./VideoPlayer";
import useAuth from "./hooks/use-auth";

function LMSContent() {
  const UserParams = new URLSearchParams(window.location.search);
  const userId = UserParams.get("userId");
  const token = UserParams.get("token");
  
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

    // Check if token format is valid (basic check)
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
      // Auto-retry on reconnection
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
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const [batchRes, videosRes] = await Promise.all([
          fetch("http://192.168.1.9:5001/api/batchs/8", {
            signal: controller.signal,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch("http://192.168.1.9:5001/api/videocourses/batch/8", {
            signal: controller.signal,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        clearTimeout(timeoutId);

        // Handle HTTP errors
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
          setVideos(videoList);

          // Check URL params for specific video
          const params = new URLSearchParams(window.location.search);
          const videoParam = params.get("video");
          
          if (videoParam) {
            const found = videoList.find((v) => v.url.includes(videoParam));
            if (!found) {
              // Video ID in URL but not found in list
              setNotFound(true);
              setLoading(false);
              return;
            }
            setCurrentVideo(found);
          } else {
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

    // Update URL
    const url = new URL(window.location.href);
    const embedId = video.url.split("embed/")[1]?.split("?")[0];
    if (embedId) {
      url.searchParams.set("video", embedId);
      window.history.replaceState({}, "", url);
    }
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

              {/* Video Player */}
              {(canJoin || !currentVideo.isLive) && (
                <VideoPlayer
                  video={currentVideo}
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

  return (
    <SocketProvider userId={userId}>
      <LMSContent />
    </SocketProvider>
  );
}