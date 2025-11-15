import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import Layout from '../../components/layout';
import { colors } from '../../constant/color';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Mock student data - Replace with actual API data
const STUDENT_DATA = {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    enrollmentId: 'DIK2024-1234',
    avatar: 'https://i.pravatar.cc/300?img=12',
    joinedDate: 'January 15, 2024',
    batchName: 'UPSC 2025 Batch',
    batchProgress: 68,
    totalCourses: 5,
    completedCourses: 3,
    inProgressCourses: 2,
    totalLectures: 450,
    completedLectures: 306,
    totalHours: 180,
    completedHours: 122,
    currentStreak: 12,
    longestStreak: 28,
    rank: 45,
    totalStudents: 320,
};


const PURCHASED_COURSES = [
    {
        id: '1',
        title: 'समाजशास्त्र (वैकल्पिक विषय) Foundation Course',
        progress: 85,
        totalLectures: 200,
        completedLectures: 170,
        thumbnail: 'https://dikshantiasnew-web.s3.ap-south-1.amazonaws.com/courses/1761373726090-9e946c97-4f7a-4fd3-b338-785711b4aefe-WhatsApp_Image_2025-10-25_at_11.16.20_(3).jpeg',
        status: 'in-progress',
    },
    {
        id: '2',
        title: 'General Studies Paper I',
        progress: 100,
        totalLectures: 150,
        completedLectures: 150,
        thumbnail: 'https://www.dikshantias.com/_next/image?url=https%3A%2F%2Fdikshantiasnew-web.s3.ap-south-1.amazonaws.com%2Fcourses%2F1763128297137-680bc855-5d82-43b8-b4e0-a355596f3cfc-GS-01_(1).jpg&w=1920&q=75',
        status: 'completed',
    },
    {
        id: '3',
        title: 'Essay Writing Masterclass',
        progress: 45,
        totalLectures: 50,
        completedLectures: 23,
        thumbnail: 'https://www.dikshantias.com/_next/image?url=https%3A%2F%2Fdikshantiasnew-web.s3.ap-south-1.amazonaws.com%2Fcourses%2F1757670918009-Complete-UPSC-Course.webp&w=1920&q=75',
        status: 'in-progress',
    },
    {
        id: '4',
        title: 'Current Affairs 2024',
        progress: 100,
        totalLectures: 80,
        completedLectures: 80,
        thumbnail: 'https://www.dikshantias.com/_next/image?url=https%3A%2F%2Fdikshantiasnew-web.s3.ap-south-1.amazonaws.com%2Fcourses%2F1759320543988-6c8941be-73a3-486b-9d9a-399d232a4c9c-WhatsApp_Image_2025-10-01_at_5.28.29_PM.jpeg&w=3840&q=75',
        status: 'completed',
    },
    {
        id: '5',
        title: 'Ethics & Integrity',
        progress: 30,
        totalLectures: 100,
        completedLectures: 30,
        thumbnail: 'https://www.dikshantias.com/_next/image?url=https%3A%2F%2Fdikshantiasnew-web.s3.ap-south-1.amazonaws.com%2Fcourses%2F1761373388489-2606b9e6-3eb9-4375-af27-1acf76a7b794-WhatsApp_Image_2025-10-25_at_11.16.20_(5).jpeg&w=3840&q=75',
        status: 'in-progress',
    },
];




// Weekly progress data
const WEEKLY_PROGRESS = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            data: [2.5, 3, 1.5, 4, 3.5, 5, 4.5],
            strokeWidth: 2,
        },
    ],
};

export default function Profile() {
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('all'); // all, in-progress, completed

    const triggerHaptic = () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) { }
    };

    const filteredCourses = PURCHASED_COURSES.filter((course) => {
        if (selectedTab === 'all') return true;
        return course.status === selectedTab;
    });

    const overallProgress = Math.round(
        (STUDENT_DATA.completedLectures / STUDENT_DATA.totalLectures) * 100
    );

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#EF4444',
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: '#E5E7EB',
            strokeWidth: 1,
        },
    };

    const progressData = {
        labels: ['Completed'],
        data: [overallProgress / 100],
        colors: ['#EF4444'],
    };

    if (loading) {
        return (
            <Layout isHeaderShow={false}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#EF4444" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </Layout>
        );
    }

    return (
        <Layout isHeaderShow={false}>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <View style={styles.profileHeader}>
                        <Image
                            source={{ uri: STUDENT_DATA.avatar }}
                            style={styles.avatar}
                        />
                        <View style={styles.headerInfo}>
                            <Text style={styles.studentName}>{STUDENT_DATA.name}</Text>
                            <Text style={styles.enrollmentId}>
                                ID: {STUDENT_DATA.enrollmentId}
                            </Text>
                            <View style={styles.batchBadge}>
                                <Feather name="users" size={12} color="#000" />
                                <Text style={styles.batchText}>{STUDENT_DATA.batchName}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.contactInfo}>
                        <View style={styles.contactRow}>
                            <Feather name="mail" size={14} color="#666" />
                            <Text style={styles.contactText}>{STUDENT_DATA.email}</Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Feather name="phone" size={14} color="#666" />
                            <Text style={styles.contactText}>{STUDENT_DATA.phone}</Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Feather name="calendar" size={14} color="#666" />
                            <Text style={styles.contactText}>
                                Joined {STUDENT_DATA.joinedDate}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Batch Progress Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Batch Progress</Text>
                    <View style={styles.batchProgressCard}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.batchProgressTitle}>
                                {STUDENT_DATA.batchName}
                            </Text>
                            <Text style={styles.progressPercentage}>
                                {STUDENT_DATA.batchProgress}%
                            </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    { width: `${STUDENT_DATA.batchProgress}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressDescription}>
                            {STUDENT_DATA.batchProgress}% of batch curriculum completed
                        </Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Learning Statistics</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Feather name="book-open" size={24} color="#EF4444" />
                            <Text style={styles.statValue}>{STUDENT_DATA.totalCourses}</Text>
                            <Text style={styles.statLabel}>Total Courses</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Feather name="check-circle" size={24} color="#10B981" />
                            <Text style={styles.statValue}>
                                {STUDENT_DATA.completedCourses}
                            </Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Feather name="play-circle" size={24} color="#3B82F6" />
                            <Text style={styles.statValue}>
                                {STUDENT_DATA.inProgressCourses}
                            </Text>
                            <Text style={styles.statLabel}>In Progress</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Feather name="clock" size={24} color="#F59E0B" />
                            <Text style={styles.statValue}>
                                {STUDENT_DATA.completedHours}h
                            </Text>
                            <Text style={styles.statLabel}>
                                of {STUDENT_DATA.totalHours}h
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Overall Progress Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overall Progress</Text>
                    <View style={styles.chartCard}>
                        <ProgressChart
                            data={progressData}
                            width={width - 64}
                            height={180}
                            strokeWidth={12}
                            radius={60}
                            chartConfig={chartConfig}
                            hideLegend={false}
                        />
                        <Text style={styles.chartDescription}>
                            {STUDENT_DATA.completedLectures} of {STUDENT_DATA.totalLectures}{' '}
                            lectures completed
                        </Text>
                    </View>
                </View>

                {/* Weekly Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Weekly Activity (Hours)</Text>
                    <View style={styles.chartCard}>
                        <LineChart
                            data={WEEKLY_PROGRESS}
                            width={width - 64}
                            height={200}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.lineChart}
                        />
                    </View>
                </View>

                {/* Streak & Rank */}
                <View style={styles.section}>
                    <View style={styles.twoColumnGrid}>
                        <View style={styles.streakCard}>
                            <Feather name="zap" size={28} color="#F59E0B" />
                            <Text style={styles.streakValue}>
                                {STUDENT_DATA.currentStreak}
                            </Text>
                            <Text style={styles.streakLabel}>Day Streak</Text>
                            <Text style={styles.streakSub}>
                                Longest: {STUDENT_DATA.longestStreak} days
                            </Text>
                        </View>
                        <View style={styles.rankCard}>
                            <Feather name="award" size={28} color="#8B5CF6" />
                            <Text style={styles.rankValue}>#{STUDENT_DATA.rank}</Text>
                            <Text style={styles.rankLabel}>Class Rank</Text>
                            <Text style={styles.rankSub}>
                                of {STUDENT_DATA.totalStudents} students
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Purchased Courses */}
                <View style={styles.section}>
                    <View style={styles.coursesHeader}>
                        <Text style={styles.sectionTitle}>My Courses</Text>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.tab,
                                    selectedTab === 'all' && styles.tabActive,
                                ]}
                                onPress={() => {
                                    triggerHaptic();
                                    setSelectedTab('all');
                                }}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        selectedTab === 'all' && styles.tabTextActive,
                                    ]}
                                >
                                    All
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.tab,
                                    selectedTab === 'in-progress' && styles.tabActive,
                                ]}
                                onPress={() => {
                                    triggerHaptic();
                                    setSelectedTab('in-progress');
                                }}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        selectedTab === 'in-progress' && styles.tabTextActive,
                                    ]}
                                >
                                    In Progress
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.tab,
                                    selectedTab === 'completed' && styles.tabActive,
                                ]}
                                onPress={() => {
                                    triggerHaptic();
                                    setSelectedTab('completed');
                                }}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        selectedTab === 'completed' && styles.tabTextActive,
                                    ]}
                                >
                                    Completed
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {filteredCourses.map((course) => (
                        <TouchableOpacity
                            key={course.id}
                            style={styles.courseCard}
                            onPress={triggerHaptic}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={{ uri: course.thumbnail }}
                                style={styles.courseThumbnail}
                                resizeMode="cover"
                            />
                            <View style={styles.courseDetails}>
                                <Text style={styles.courseTitle} numberOfLines={2}>
                                    {course.title}
                                </Text>
                                <View style={styles.courseStats}>
                                    <View style={styles.courseStat}>
                                        <Feather name="play-circle" size={14} color="#666" />
                                        <Text style={styles.courseStatText}>
                                            {course.completedLectures}/{course.totalLectures} lectures
                                        </Text>
                                    </View>
                                    {course.status === 'completed' && (
                                        <View style={styles.completedBadge}>
                                            <Feather name="check" size={12} color="#10B981" />
                                            <Text style={styles.completedText}>Completed</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.courseProgressContainer}>
                                    <View
                                        style={[
                                            styles.courseProgressBar,
                                            { width: `${course.progress}%` },
                                            course.status === 'completed' && styles.progressCompleted,
                                        ]}
                                    />
                                </View>
                                <Text style={styles.courseProgressText}>
                                    {course.progress}% completed
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={triggerHaptic}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Feather name="settings" size={24} color="#3B82F6" />
                            </View>
                            <Text style={styles.actionLabel}>Settings</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={triggerHaptic}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
                                <Feather name="share-2" size={24} color="#6366F1" />
                            </View>
                            <Text style={styles.actionLabel}>Share App</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={triggerHaptic}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                                <Feather name="star" size={24} color="#F59E0B" />
                            </View>
                            <Text style={styles.actionLabel}>Rate Us</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={triggerHaptic}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
                                <Feather name="award" size={24} color="#10B981" />
                            </View>
                            <Text style={styles.actionLabel}>Scholarships</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={triggerHaptic}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                                <Feather name="gift" size={24} color="#EF4444" />
                            </View>
                            <Text style={styles.actionLabel}>Offers</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={triggerHaptic}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#FCE7F3' }]}>
                                <Feather name="help-circle" size={24} color="#EC4899" />
                            </View>
                            <Text style={styles.actionLabel}>Help & Support</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Additional Menu Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>More Options</Text>
                    <View style={styles.menuCard}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={triggerHaptic}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuLeft}>
                                <Feather name="bell" size={20} color="#000000" />
                                <Text style={styles.menuText}>Notifications</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#666666" />
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={triggerHaptic}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuLeft}>
                                <Feather name="credit-card" size={20} color="#000000" />
                                <Text style={styles.menuText}>Payment History</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#666666" />
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={triggerHaptic}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuLeft}>
                                <Feather name="download" size={20} color="#000000" />
                                <Text style={styles.menuText}>Downloads</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#666666" />
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={triggerHaptic}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuLeft}>
                                <Feather name="file-text" size={20} color="#000000" />
                                <Text style={styles.menuText}>Terms & Conditions</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#666666" />
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={triggerHaptic}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuLeft}>
                                <Feather name="shield" size={20} color="#000000" />
                                <Text style={styles.menuText}>Privacy Policy</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#666666" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout Button */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={triggerHaptic}
                        activeOpacity={0.8}
                    >
                        <Feather name="log-out" size={20} color="#EF4444" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },

    // Header Card
    headerCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 20,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#EF4444',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 16,
    },
    studentName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#000000',
        marginBottom: 4,
    },
    enrollmentId: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 8,
    },
    batchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    batchText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#000000',
    },
    contactInfo: {
        gap: 10,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    contactText: {
        fontSize: 13,
        color: '#666666',
    },

    // Section
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000000',
        marginBottom: 12,
    },

    // Batch Progress
    batchProgressCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    batchProgressTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000000',
        flex: 1,
    },
    progressPercentage: {
        fontSize: 24,
        fontWeight: '900',
        color: '#EF4444',
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#EF4444',
        borderRadius: 6,
    },
    progressDescription: {
        fontSize: 12,
        color: '#666666',
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#000000',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
        fontWeight: '600',
    },

    // Chart Card
    chartCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chartDescription: {
        fontSize: 13,
        color: '#666666',
        marginTop: 12,
        textAlign: 'center',
    },
    lineChart: {
        borderRadius: 12,
    },

    // Two Column Grid
    twoColumnGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    streakCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    streakValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#000000',
        marginTop: 8,
    },
    streakLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#000000',
        marginTop: 4,
    },
    streakSub: {
        fontSize: 11,
        color: '#666666',
        marginTop: 4,
    },
    rankCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    rankValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#000000',
        marginTop: 8,
    },
    rankLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#000000',
        marginTop: 4,
    },
    rankSub: {
        fontSize: 11,
        color: '#666666',
        marginTop: 4,
        textAlign: 'center',
    },

    // Courses Section
    coursesHeader: {
        marginBottom: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    tabActive: {
        backgroundColor: '#000000',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666666',
    },
    tabTextActive: {
        color: '#ffffff',
    },
    courseCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    courseThumbnail: {
        width: 120,
        height: 120,
        backgroundColor: '#F3F4F6',
    },
    courseDetails: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    courseTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000000',
        lineHeight: 20,
        marginBottom: 8,
    },
    courseStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    courseStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    courseStatText: {
        fontSize: 11,
        color: '#666666',
        fontWeight: '500',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    completedText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#10B981',
    },
    courseProgressContainer: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 6,
    },
    courseProgressBar: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 3,
    },
    progressCompleted: {
        backgroundColor: '#10B981',
    },
    courseProgressText: {
        fontSize: 11,
        color: '#666666',
        fontWeight: '600',
    },

    // Quick Actions
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionCard: {
        width: (width - 56) / 3,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center',
    },

    // Menu Card
    menuCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000000',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
    },

    // Logout Button
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#ffffff',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#EF4444',
    },
});