import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Layout from '../../components/layout';
import * as Haptics from 'expo-haptics';

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'read'
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleTabChange = (tab) => {
    triggerHaptic();
    setActiveTab(tab);
  };

  const markAsRead = (id) => {
    triggerHaptic();
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    triggerHaptic();
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    triggerHaptic();
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type) => {
    const iconMap = {
      course: 'book-open',
      test: 'file-text',
      achievement: 'award',
      system: 'bell',
      payment: 'credit-card',
      update: 'info',
    };
    return iconMap[type] || 'bell';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      course: '#6366f1',
      test: '#f59e0b',
      achievement: '#10b981',
      system: '#64748b',
      payment: '#8b5cf6',
      update: '#3b82f6',
    };
    return colorMap[type] || '#6366f1';
  };

  return (
    <Layout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
              activeOpacity={0.7}
            >
              <Feather name="check-circle" size={18} color="#6366f1" />
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => handleTabChange('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}
            >
              All
            </Text>
            <View style={[styles.tabBadge, activeTab === 'all' && styles.activeTabBadge]}>
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === 'all' && styles.activeTabBadgeText,
                ]}
              >
                {notifications.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
            onPress={() => handleTabChange('unread')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'unread' && styles.activeTabText,
              ]}
            >
              Unread
            </Text>
            {unreadCount > 0 && (
              <View
                style={[
                  styles.tabBadge,
                  activeTab === 'unread' && styles.activeTabBadge,
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    activeTab === 'unread' && styles.activeTabBadgeText,
                  ]}
                >
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'read' && styles.activeTab]}
            onPress={() => handleTabChange('read')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabText, activeTab === 'read' && styles.activeTabText]}
            >
              Read
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366f1']}
              tintColor="#6366f1"
            />
          }
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Feather name="bell-off" size={48} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'unread'
                  ? "You're all caught up!"
                  : 'Check back later for updates'}
              </Text>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {filteredNotifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    !notification.read && styles.unreadCard,
                  ]}
                  onPress={() => !notification.read && markAsRead(notification.id)}
                  activeOpacity={0.7}
                >
                  {/* Left Side - Icon */}
                  <View
                    style={[
                      styles.notificationIcon,
                      {
                        backgroundColor:
                          getNotificationColor(notification.type) + '20',
                      },
                    ]}
                  >
                    <Feather
                      name={getNotificationIcon(notification.type)}
                      size={22}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>

                  {/* Middle - Content */}
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle} numberOfLines={2}>
                        {notification.title}
                      </Text>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <View style={styles.notificationFooter}>
                      <Feather name="clock" size={12} color="#94a3b8" />
                      <Text style={styles.notificationTime}>
                        {notification.time}
                      </Text>
                      {notification.category && (
                        <>
                          <View style={styles.timeDot} />
                          <Text style={styles.notificationCategory}>
                            {notification.category}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Right Side - Actions */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(notification.id)}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </Layout>
  );
}

// Mock Notifications Data
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'course',
    title: 'New Course Available',
    message: 'UPSC Prelims 2025 - Complete Test Series is now available for enrollment.',
    time: '2 hours ago',
    category: 'Courses',
    read: false,
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Congratulations! 🎉',
    message: 'You completed "Indian Polity" course with 95% score!',
    time: '5 hours ago',
    category: 'Achievement',
    read: false,
  },
  {
    id: '3',
    type: 'test',
    title: 'Test Reminder',
    message: 'Your mock test "Economics - Part 1" is scheduled for tomorrow at 10:00 AM.',
    time: '1 day ago',
    category: 'Tests',
    read: false,
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Successful',
    message: 'Your payment of ₹2,999 for UPSC Prelims course was successful.',
    time: '2 days ago',
    category: 'Payments',
    read: true,
  },
  {
    id: '5',
    type: 'update',
    title: 'New Features Added',
    message: 'Check out our new dark mode and improved video player!',
    time: '3 days ago',
    category: 'Updates',
    read: true,
  },
  {
    id: '6',
    type: 'course',
    title: 'Course Update',
    message: '5 new videos added to "Modern Indian History" course.',
    time: '3 days ago',
    category: 'Courses',
    read: true,
  },
  {
    id: '7',
    type: 'system',
    title: 'Maintenance Notice',
    message: 'Scheduled maintenance on Sunday, 2:00 AM - 4:00 AM IST.',
    time: '4 days ago',
    category: 'System',
    read: true,
  },
  {
    id: '8',
    type: 'achievement',
    title: 'Streak Milestone! 🔥',
    message: "You've maintained a 7-day learning streak. Keep it up!",
    time: '5 days ago',
    category: 'Achievement',
    read: true,
  },
  {
    id: '9',
    type: 'test',
    title: 'Test Results Available',
    message: 'Your results for "Geography Mock Test 2" are now available.',
    time: '6 days ago',
    category: 'Tests',
    read: true,
  },
  {
    id: '10',
    type: 'course',
    title: 'Course Expiring Soon',
    message: 'Your "Current Affairs 2024" course will expire in 7 days.',
    time: '1 week ago',
    category: 'Courses',
    read: true,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: '#fff',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  activeTabBadgeText: {
    color: '#6366f1',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },

  // Notifications List
  notificationsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  unreadCard: {
    borderColor: '#6366f1',
    borderWidth: 1.5,
    backgroundColor: '#fefefe',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    marginTop: 6,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  timeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#cbd5e1',
  },
  notificationCategory: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});