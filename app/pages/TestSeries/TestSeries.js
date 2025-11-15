import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Layout from '../../components/layout';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Mock data for available test series
const AVAILABLE_TEST_SERIES = [
  {
    id: '1',
    title: 'UPSC Prelims 2025 - Complete Test Series',
    description: 'Comprehensive test series covering all subjects',
    totalTests: 25,
    duration: '180 mins per test',
    price: 2999,
    originalPrice: 4999,
    rating: 4.8,
    students: 12500,
    level: 'Advanced',
    subjects: ['History', 'Polity', 'Geography', 'Economy'],
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500',
  },
  {
    id: '2',
    title: 'IAS Mains Essay Writing Mock Tests',
    description: 'Master essay writing with expert evaluation',
    totalTests: 15,
    duration: '90 mins per test',
    price: 1999,
    originalPrice: 3499,
    rating: 4.6,
    students: 8900,
    level: 'Intermediate',
    subjects: ['Essay', 'Ethics'],
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500',
  },
  {
    id: '3',
    title: 'Current Affairs 2025 - Monthly Test Pack',
    description: 'Stay updated with monthly current affairs tests',
    totalTests: 12,
    duration: '60 mins per test',
    price: 999,
    originalPrice: 1999,
    rating: 4.7,
    students: 15600,
    level: 'Beginner',
    subjects: ['Current Affairs'],
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500',
  },
  {
    id: '4',
    title: 'CSAT Paper-II Full Length Tests',
    description: 'Aptitude and reasoning test series',
    totalTests: 20,
    duration: '120 mins per test',
    price: 1499,
    originalPrice: 2999,
    rating: 4.5,
    students: 9800,
    level: 'Intermediate',
    subjects: ['Aptitude', 'Reasoning'],
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500',
  },
];

// Mock data for enrolled test series
const MY_TEST_SERIES = [
  {
    id: '1',
    title: 'UPSC Prelims 2025 - Complete Test Series',
    totalTests: 25,
    completedTests: 12,
    averageScore: 68,
    lastAttempted: '2 days ago',
    nextTest: 'Test 13: Indian Economy',
    progress: 48,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500',
  },
  {
    id: '3',
    title: 'Current Affairs 2025 - Monthly Test Pack',
    totalTests: 12,
    completedTests: 8,
    averageScore: 75,
    lastAttempted: '5 hours ago',
    nextTest: 'Test 9: September Current Affairs',
    progress: 67,
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500',
  },
];

export default function TestSeries() {
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'my-tests'

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  };

  const handleTabChange = (tab) => {
    triggerHaptic();
    setActiveTab(tab);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return '#10b981';
      case 'Intermediate':
        return '#f59e0b';
      case 'Advanced':
        return '#ef4444';
      default:
        return '#DC3545';
    }
  };

  return (
    <Layout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Test Series</Text>
            <Text style={styles.headerSubtitle}>Practice makes perfect</Text>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={triggerHaptic}>
            <Feather name="search" size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'available' && styles.activeTab,
            ]}
            onPress={() => handleTabChange('available')}
            activeOpacity={0.7}
          >
            <Feather
              name="grid"
              size={18}
              color={activeTab === 'available' ? '#DC3545' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'available' && styles.activeTabText,
              ]}
            >
              All Test Series
            </Text>
            <View
              style={[
                styles.badge,
                activeTab === 'available' && styles.activeBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  activeTab === 'available' && styles.activeBadgeText,
                ]}
              >
                {AVAILABLE_TEST_SERIES.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'my-tests' && styles.activeTab]}
            onPress={() => handleTabChange('my-tests')}
            activeOpacity={0.7}
          >
            <Feather
              name="bookmark"
              size={18}
              color={activeTab === 'my-tests' ? '#DC3545' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'my-tests' && styles.activeTabText,
              ]}
            >
              My Test Series
            </Text>
            <View
              style={[
                styles.badge,
                activeTab === 'my-tests' && styles.activeBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  activeTab === 'my-tests' && styles.activeBadgeText,
                ]}
              >
                {MY_TEST_SERIES.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'available' ? (
            // Available Test Series
            <View style={styles.section}>
              {AVAILABLE_TEST_SERIES.map((testSeries) => (
                <TouchableOpacity
                  key={testSeries.id}
                  style={styles.testCard}
                  onPress={triggerHaptic}
                  activeOpacity={0.8}
                >
                  {/* Image */}
                  <View style={styles.testImageContainer}>
                    <Image
                      source={{ uri: testSeries.image }}
                      style={styles.testImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <View
                        style={[
                          styles.levelBadge,
                          { backgroundColor: getLevelColor(testSeries.level) },
                        ]}
                      >
                        <Text style={styles.levelText}>{testSeries.level}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Content */}
                  <View style={styles.testContent}>
                    <Text style={styles.testTitle} numberOfLines={2}>
                      {testSeries.title}
                    </Text>
                    <Text style={styles.testDescription} numberOfLines={2}>
                      {testSeries.description}
                    </Text>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Feather name="file-text" size={14} color="#64748b" />
                        <Text style={styles.statText}>
                          {testSeries.totalTests} Tests
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Feather name="clock" size={14} color="#64748b" />
                        <Text style={styles.statText}>
                          {testSeries.duration}
                        </Text>
                      </View>
                    </View>

                    {/* Subjects */}
                    <View style={styles.subjectsRow}>
                      {testSeries.subjects.slice(0, 3).map((subject, idx) => (
                        <View key={idx} style={styles.subjectTag}>
                          <Text style={styles.subjectText}>{subject}</Text>
                        </View>
                      ))}
                      {testSeries.subjects.length > 3 && (
                        <View style={styles.subjectTag}>
                          <Text style={styles.subjectText}>
                            +{testSeries.subjects.length - 3}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Rating & Students */}
                    <View style={styles.metaRow}>
                      <View style={styles.ratingContainer}>
                        <Feather name="star" size={14} color="#fbbf24" />
                        <Text style={styles.ratingText}>
                          {testSeries.rating}
                        </Text>
                      </View>
                      <View style={styles.studentsContainer}>
                        <Feather name="users" size={14} color="#64748b" />
                        <Text style={styles.studentsText}>
                          {testSeries.students.toLocaleString()} students
                        </Text>
                      </View>
                    </View>

                    {/* Price */}
                    <View style={styles.priceRow}>
                      <View>
                        <Text style={styles.originalPrice}>
                          ₹{testSeries.originalPrice}
                        </Text>
                        <Text style={styles.price}>₹{testSeries.price}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.enrollButton}
                        onPress={triggerHaptic}
                      >
                        <Text style={styles.enrollButtonText}>Enroll Now</Text>
                        <Feather name="arrow-right" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // My Test Series
            <View style={styles.section}>
              {MY_TEST_SERIES.map((testSeries) => (
                <TouchableOpacity
                  key={testSeries.id}
                  style={styles.myTestCard}
                  onPress={triggerHaptic}
                  activeOpacity={0.8}
                >
                  {/* Header with Image */}
                  <View style={styles.myTestHeader}>
                    <Image
                      source={{ uri: testSeries.image }}
                      style={styles.myTestImage}
                      resizeMode="cover"
                    />
                    <View style={styles.myTestHeaderContent}>
                      <Text style={styles.myTestTitle} numberOfLines={2}>
                        {testSeries.title}
                      </Text>
                      <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>
                          {testSeries.completedTests}/{testSeries.totalTests}{' '}
                          Tests
                        </Text>
                        <Text style={styles.progressPercentage}>
                          {testSeries.progress}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${testSeries.progress}%` },
                      ]}
                    />
                  </View>

                  {/* Stats Grid */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Feather name="target" size={20} color="#DC3545" />
                      <Text style={styles.statValue}>
                        {testSeries.averageScore}%
                      </Text>
                      <Text style={styles.statLabel}>Avg Score</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Feather name="check-circle" size={20} color="#10b981" />
                      <Text style={styles.statValue}>
                        {testSeries.completedTests}
                      </Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Feather name="clock" size={20} color="#f59e0b" />
                      <Text style={styles.statValue}>
                        {testSeries.totalTests - testSeries.completedTests}
                      </Text>
                      <Text style={styles.statLabel}>Remaining</Text>
                    </View>
                  </View>

                  {/* Next Test */}
                  <View style={styles.nextTestContainer}>
                    <View style={styles.nextTestHeader}>
                      <Feather name="arrow-right-circle" size={18} color="#DC3545" />
                      <Text style={styles.nextTestLabel}>Next Test</Text>
                    </View>
                    <Text style={styles.nextTestTitle}>
                      {testSeries.nextTest}
                    </Text>
                    <Text style={styles.lastAttempted}>
                      Last attempted {testSeries.lastAttempted}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={triggerHaptic}
                    >
                      <Feather name="bar-chart-2" size={18} color="#DC3545" />
                      <Text style={styles.actionButtonText}>View Analytics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.primaryActionButton}
                      onPress={triggerHaptic}
                    >
                      <Text style={styles.primaryActionButtonText}>
                        Continue Test
                      </Text>
                      <Feather name="play" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Empty State for no enrolled tests */}
              {MY_TEST_SERIES.length === 0 && (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Feather name="clipboard" size={48} color="#cbd5e1" />
                  </View>
                  <Text style={styles.emptyTitle}>No Test Series Yet</Text>
                  <Text style={styles.emptyText}>
                    Enroll in a test series to start practicing
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => handleTabChange('available')}
                  >
                    <Text style={styles.emptyButtonText}>
                      Browse Test Series
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </Layout>
  );
}

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
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  activeTab: {
    backgroundColor: '#eef2ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#DC3545',
  },
  badge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#DC3545',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  activeBadgeText: {
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: 16,
    gap: 16,
  },

  // Test Card (Available)
  testCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  testImageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  testImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    justifyContent: 'flex-end',
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  testContent: {
    padding: 16,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    lineHeight: 24,
  },
  testDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  subjectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  subjectTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  studentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentsText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DC3545',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  enrollButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // My Test Card
  myTestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  myTestHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  myTestImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  myTestHeaderContent: {
    flex: 1,
  },
  myTestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC3545',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#DC3545',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  nextTestContainer: {
    backgroundColor: '#eef2ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  nextTestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  nextTestLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC3545',
    textTransform: 'uppercase',
  },
  nextTestTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  lastAttempted: {
    fontSize: 12,
    color: '#64748b',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DC3545',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC3545',
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC3545',
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});