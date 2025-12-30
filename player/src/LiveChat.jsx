import { useEffect, useRef, useState } from "react";
import { MessageCircle, Users, X, Send } from "lucide-react";
import { useSocket } from "./context/socket";

export default function LiveChat({ 
  videoId, 
  userId, 
  visible, 
  onClose, 
  onLiveCountChange 
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (msg) => {
    const normalized = {
      id: msg.id || msg._id || `msg-${Date.now()}-${Math.random()}`,
      userId: msg.userId?.toString(),
      userName: msg.userName || "Unknown",
      message: msg.message || "",
      timestamp: msg.timestamp || msg.createdAt || new Date(),
      type: msg.messageType || "message"
    };

    setMessages((prev) => {
      // Check for duplicates
      const exists = prev.some(
        (m) =>
          m.message === normalized.message &&
          m.userId === normalized.userId &&
          Math.abs(new Date(m.timestamp) - new Date(normalized.timestamp)) < 2000
      );
      if (exists) return prev;
      return [...prev, normalized];
    });
  };

  const fetchChatHistory = async () => {
    try {
      const res = await fetch(
        `https://www.dikapi.olyox.in/api/chat/history/${videoId}?limit=500`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const chatMessages = data.data.filter(
          (msg) => msg.messageType === "message"
        );
        chatMessages.forEach(addMessage);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error.message);
    }
  };

  useEffect(() => {
    if (!visible || !videoId || !userId || !socket) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([]);
    fetchChatHistory();

    socket.emit("join-chat", { videoId, userId });

    const handleNewMessage = (data) => {
      if (data.messageType === "message") {
        addMessage(data);
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleTypingStart = (data) => {
      if (data.userId !== userId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleLiveCount = (data) => {
      const count = data.total || 0;
      setLiveCount(count);
      if (onLiveCountChange) onLiveCountChange(count);
    };

    const handleAdminMessage = (data) => {
      console.log("Admin message:", data);
      addMessage({
        ...data,
        userName: "Admin",
        messageType: "message"
      });
    };

    socket.on("chat-message", handleNewMessage);
    socket.on("user-typing", handleTypingStart);
    socket.on("live-watching-count", handleLiveCount);
    socket.on("admin-message", handleAdminMessage);

    return () => {
      socket.off("chat-message", handleNewMessage);
      socket.off("user-typing", handleTypingStart);
      socket.off("live-watching-count", handleLiveCount);
      socket.off("admin-message", handleAdminMessage);
      socket.emit("leave-chat", { videoId, userId });
    };
  }, [socket, visible, videoId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !socket) return;

    const messageData = {
      videoId,
      userId: userId.toString(),
      userName: "Student",
      message: trimmed,
      messageType: "message",
      timestamp: new Date()
    };

    socket.emit("send-chat-message", messageData);
    addMessage({ ...messageData, id: `temp-${Date.now()}` });
    setNewMessage("");
  };

  const handleTyping = () => {
    if (socket && newMessage.trim()) {
      socket.emit("typing", { videoId, userId });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Chat Panel */}
      <div className="relative bg-white rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none w-full md:w-96 h-[85vh] md:h-full md:max-h-screen flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-3xl md:rounded-tl-3xl md:rounded-tr-none">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MessageCircle className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold">Live Chat</h3>
              <div className="flex items-center gap-1.5 text-xs text-blue-100">
                <Users className="w-3 h-3" />
                <span>{liveCount} watching</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle className="w-12 h-12 mb-2" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Be the first to say hello!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.userId === userId.toString();
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                      isOwn
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
                    }`}
                  >
                    {!isOwn && (
                      <p className={`text-xs font-semibold mb-1 ${
                        isOwn ? "text-blue-100" : "text-blue-600"
                      }`}>
                        {msg.userName}
                      </p>
                    )}
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="flex items-center gap-2 text-sm text-gray-500 animate-fade-in">
              <div className="flex gap-1 bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
              <span>Someone is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white rounded-b-3xl md:rounded-bl-3xl">
          <div className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              maxLength={500}
              rows={1}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              style={{ minHeight: "42px", maxHeight: "120px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {newMessage.length}/500 characters
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}