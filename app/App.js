import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useFontStyle from "./hooks/useFontLoad";
import Splash from "./screens/splash/splash";
import Login from "./screens/auth/Login";
import Home from "./pages/Home/Home";
import { StatusBar } from "expo-status-bar";
import Signup from "./screens/auth/Signup";
import CourseDetail from "./screens/courses/CourseDetail";
import Course from "./screens/courses/Courses";
import CoursePage from "./screens/courses/CoursePage";
import { Text, TextInput, Alert, AppState } from "react-native";
import EBooks from "./pages/Books/EBooks";
import TestScreen from "./screens/Tests/Tests";
import QuesAndScreen from "./screens/Tests/QuesAndScreen";
import Profile from "./pages/Profile/Profile";
import Downloads from "./pages/Downloads/Downloads";
import RecordedCourses from "./pages/RecordedCourses/RecordedCourses";
import TestSeries from "./pages/TestSeries/TestSeries";
import { Settings } from "./screens/Others/Settings";
import { HelpSupport } from "./screens/Others/HelpSupport";
import { About } from "./screens/Others/About";
import Notifications from "./screens/Others/Notifications";
import PermissionsScreen from "./screens/Others/PermissionsScreen";
import { useEffect, useState, useRef } from "react";
import * as ExpoNotifications from "expo-notifications";
import * as Location from "expo-location";
import * as Device from "expo-device";
import { Platform } from "react-native";

const Stack = createNativeStackNavigator();

// Configure notification handler
ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const fontsLoaded = useFontStyle();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    requestAllPermissions();
    setupNotificationListeners();

    // Monitor app state for screen time tracking
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
      // You can track session start time here
    } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      console.log('App has gone to the background!');
      // You can track session end time here
    }
    appState.current = nextAppState;
  };

  const setupNotificationListeners = () => {
    // Handle notifications when app is in foreground
    notificationListener.current = ExpoNotifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    // Handle notification taps
    responseListener.current = ExpoNotifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        const screen = response.notification.request.content.data?.screen;
        if (screen) {
          // Navigate to specific screen
          // navigation.navigate(screen);
        }
      }
    );
  };

  const requestAllPermissions = async () => {
    try {
      console.log('🔐 Starting permission requests...');
      
      // 1. Request Notification Permissions
      const notifGranted = await requestNotificationPermission();
      console.log('✅ Notifications:', notifGranted ? 'Granted' : 'Denied');

      // 2. Request Location Permissions
      const locationGranted = await requestLocationPermission();
      console.log('✅ Location:', locationGranted ? 'Granted' : 'Denied');

      // 3. Request Physical Activity Permission (Android only)
      if (Platform.OS === 'android') {
        const activityGranted = await requestActivityRecognitionPermission();
        console.log('✅ Activity Recognition:', activityGranted ? 'Granted' : 'Denied');
      }

      setPermissionsGranted(true);
      console.log('✅ All permissions processed');
    } catch (error) {
      console.error("❌ Error requesting permissions:", error);
      setPermissionsGranted(true); // Continue anyway
    }
  };

  const requestNotificationPermission = async () => {
    try {
      if (!Device.isDevice) {
        console.warn('⚠️ Push notifications only work on physical devices');
        return false;
      }

      const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await ExpoNotifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        // Alert.alert(
        //   "Notifications Disabled",
        //   "Please enable notifications in Settings to receive important updates about your courses and tests.",
        //   [{ text: "OK" }]
        // );
        return false;
      }

      // Get push notification token
      try {
        const token = await ExpoNotifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PROJECT_ID || "your-project-id",
        });
        console.log("📱 Push Token:", token.data);
        setExpoPushToken(token.data);
      } catch (tokenError) {
        console.error("Token error:", tokenError);
      }

      // Configure notification channels for Android
      if (Platform.OS === "android") {
        await ExpoNotifications.setNotificationChannelAsync("default", {
          name: "Default Notifications",
          importance: ExpoNotifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#6366f1",
          sound: 'default',
        });

        await ExpoNotifications.setNotificationChannelAsync("courses", {
          name: "Course Updates",
          importance: ExpoNotifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#10b981",
          sound: 'default',
        });

        await ExpoNotifications.setNotificationChannelAsync("tests", {
          name: "Test Reminders",
          importance: ExpoNotifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#f59e0b",
          sound: 'default',
        });

        await ExpoNotifications.setNotificationChannelAsync("achievements", {
          name: "Achievements",
          importance: ExpoNotifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#8b5cf6",
          sound: 'default',
        });

        console.log('📢 Notification channels configured');
      }

      return true;
    } catch (error) {
      console.error("❌ Notification permission error:", error);
      return false;
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Location Permission",
          "Location access helps us provide location-based features like nearby test centers and local study groups.",
          [{ text: "OK" }]
        );
        return false;
      }

      // Get current location
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        console.log("📍 Location:", location.coords.latitude, location.coords.longitude);
      } catch (locError) {
        console.warn("Location fetch error:", locError);
      }

      return true;
    } catch (error) {
      console.error("❌ Location permission error:", error);
      return false;
    }
  };

  const requestActivityRecognitionPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const { PermissionsAndroid } = require("react-native");
        
        // For Android 10+ (API 29+), request ACTIVITY_RECOGNITION permission
        if (Platform.Version >= 29) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
            {
              title: "Physical Activity Permission",
              message:
                "This app would like to track your study activity patterns to help you maintain healthy study habits and monitor screen time.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Activity recognition permission granted");
            return true;
          } else {
            // Alert.alert(
            //   "Activity Tracking",
            //   "Activity tracking helps monitor your study patterns and screen time for better learning habits.",
            //   [{ text: "OK" }]
            // );
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      console.error("❌ Activity recognition permission error:", error);
      return false;
    }
  };

  // Optional: Schedule a welcome notification (uncomment to use)
  const scheduleWelcomeNotification = async () => {
    try {
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: "Welcome! 🎉",
          body: "Start your learning journey today!",
          data: { screen: "Home" },
          sound: true,
          badge: 1,
        },
        trigger: {
          seconds: 5,
        },
      });
    } catch (error) {
      console.error("Notification scheduling error:", error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  // Apply Geist font globally
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = { fontFamily: "Geist" };

  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.style = { fontFamily: "Geist" };

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="CourseDetail" component={CourseDetail} />
        <Stack.Screen name="Courses" component={CoursePage} />
        <Stack.Screen name="EBooks" component={EBooks} />
        <Stack.Screen name="Quiz" component={TestScreen} />
        <Stack.Screen name="startQuz" component={QuesAndScreen} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Downloads" component={Downloads} />
        <Stack.Screen name="RecordedCourses" component={RecordedCourses} />
        <Stack.Screen name="TestSeries" component={TestSeries} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Support" component={HelpSupport} />
        <Stack.Screen name="About" component={About} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="Permissions" component={PermissionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}