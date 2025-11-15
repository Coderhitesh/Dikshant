// ============================================
// utils/permissions.js - Permissions Utility
// ============================================
import * as ExpoNotifications from "expo-notifications";
import * as Location from "expo-location";
import * as Device from "expo-device";
import { Platform, PermissionsAndroid, Alert, Linking } from "react-native";

export const PermissionTypes = {
  NOTIFICATIONS: "notifications",
  LOCATION: "location",
  ACTIVITY: "activity",
  CAMERA: "camera",
  MEDIA_LIBRARY: "media_library",
};

export const checkPermission = async (permissionType) => {
  try {
    switch (permissionType) {
      case PermissionTypes.NOTIFICATIONS:
        const { status: notifStatus } = await ExpoNotifications.getPermissionsAsync();
        return notifStatus === "granted";

      case PermissionTypes.LOCATION:
        const { status: locStatus } = await Location.getForegroundPermissionsAsync();
        return locStatus === "granted";

      case PermissionTypes.ACTIVITY:
        if (Platform.OS === "android" && Platform.Version >= 29) {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
          );
          return granted;
        }
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking ${permissionType} permission:`, error);
    return false;
  }
};

export const requestPermission = async (permissionType) => {
  try {
    switch (permissionType) {
      case PermissionTypes.NOTIFICATIONS:
        return await requestNotifications();

      case PermissionTypes.LOCATION:
        return await requestLocation();

      case PermissionTypes.ACTIVITY:
        return await requestActivityRecognition();

      default:
        return false;
    }
  } catch (error) {
    console.error(`Error requesting ${permissionType} permission:`, error);
    return false;
  }
};

const requestNotifications = async () => {
  if (!Device.isDevice) {
    Alert.alert("Error", "Push notifications only work on physical devices.");
    return false;
  }

  const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await ExpoNotifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert(
      "Permission Required",
      "Please enable notifications in Settings to receive updates.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }

  // Configure notification channels for Android
  if (Platform.OS === "android") {
    await ExpoNotifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: ExpoNotifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6366f1",
    });
  }

  return true;
};

const requestLocation = async () => {
  const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Location.requestForegroundPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert(
      "Permission Required",
      "Location access helps provide location-based features.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }

  return true;
};

const requestActivityRecognition = async () => {
  if (Platform.OS !== "android" || Platform.Version < 29) {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
    {
      title: "Physical Activity Permission",
      message: "Track your study activity patterns and screen time.",
      buttonNeutral: "Ask Me Later",
      buttonNegative: "Cancel",
      buttonPositive: "OK",
    }
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const openAppSettings = () => {
  Linking.openSettings();
};