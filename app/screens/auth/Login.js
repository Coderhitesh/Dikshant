import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  Animated,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,

  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../components/Button";
import { useAuthStore } from "../../stores/auth.store";

import img1 from "../../assets/images/bg.png";
import img2 from "../../assets/images/g.png";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const images = [img2, img1];

export default function Login({ navigation }) {
  const insets = useSafeAreaInsets();
  const { sendOtp, login } = useAuthStore();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const scrollRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    const id = setInterval(() => {
      const next = (activeIdx + 1) % images.length;
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      setActiveIdx(next);
    }, 4000);
    return () => clearInterval(id);
  }, [activeIdx]);

  useEffect(() => {
    if (showModal) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showModal]);

  const onScroll = (e) => {
    const { contentOffset } = e.nativeEvent;
    const idx = Math.round(contentOffset.x / SCREEN_WIDTH);
    if (idx !== activeIdx) setActiveIdx(idx);
  };

  const handleSendOtp = async () => {
    try {
      // Validate phone number
      if (!/^[0-9]{10}$/.test(phone)) {
        setPhoneError("Enter a valid 10-digit phone number");
        return;
      }

      setPhoneError("");

      // Call OTP API
      const res = await login(phone);
      if (res.message) {
        setStep(2);

      }
      // If API success → move to next step

    } catch (error) {
      console.error("OTP Send Error:", error);
      setPhoneError(error.message);
      // setPhoneError("Failed to send OTP. Please try again.");
    }
  };

  const handleLogin = async () => {
    const res = await login(phone,otp);
    if (!res.success) {
      setOtpError(res.message);
      return;
    }
    setOtpError("");
    setShowModal(false);
    navigation.replace("Home");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView style={styles.mainContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>Dikshant Ias</Text>
            <Text style={styles.logoSubtext}>Education centre</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.imageSlider}
        >
          {images.map((src, i) => (
            <View key={i} style={styles.slide}>
              <Image source={src} style={styles.slideImg} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupTxt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <Animated.View
                  style={[
                    styles.bottomSheet,
                    {
                      paddingBottom: Math.max(40, insets.bottom + 20),
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <TouchableWithoutFeedback>
                    <View>
                      <View style={styles.sheetHandle} />
                      <Text style={styles.sheetTitle}>
                        {step === 1 ? "Sign in" : "Verify OTP"}
                      </Text>
                      <Text style={styles.sheetSubtitle}>
                        {step === 1
                          ? "Enter your phone number to continue"
                          : `We sent a 6-digit code to ${phone}`}
                      </Text>

                      {step === 1 && (
                        <>
                          <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                              style={[
                                styles.textInput,
                                phoneError ? styles.textInputError : null,
                              ]}
                              value={phone}
                              onChangeText={(t) => {
                                setPhone(t);
                                setPhoneError("");
                              }}
                              placeholder="Enter phone number"
                              placeholderTextColor="#999"
                              keyboardType="number-pad"
                              maxLength={10}
                              autoFocus
                              returnKeyType="done"
                              onSubmitEditing={handleSendOtp}
                            />
                            {phoneError ? (
                              <Text style={styles.errorText}>{phoneError}</Text>
                            ) : null}
                          </View>
                          <Button title="Send OTP" onPress={handleSendOtp} />
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Enter 6-digit OTP</Text>
                            <TextInput
                              style={[
                                styles.textInput,
                                styles.otpInput,
                                otpError ? styles.textInputError : null,
                              ]}
                              value={otp}
                              onChangeText={(t) => {
                                setOtp(t);
                                setOtpError("");
                              }}
                              placeholder="------"
                              placeholderTextColor="#999"
                              keyboardType="number-pad"
                              maxLength={6}
                              autoFocus
                              returnKeyType="done"
                              onSubmitEditing={handleLogin}
                            />
                            {otpError ? (
                              <Text style={styles.errorText}>{otpError}</Text>
                            ) : null}
                          </View>
                          <Button title="Verify & Sign in" onPress={handleLogin} />

                          <TouchableOpacity
                            onPress={() => {
                              setStep(1);
                              setOtp("");
                              setOtpError("");
                            }}
                            style={styles.changeBtn}
                          >
                            <Text style={styles.changeTxt}>Change Phone Number</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </TouchableWithoutFeedback>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainContent: {
    flex: 1,
  },
  logoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logoBox: {
    alignSelf: "flex-start",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "Geist",
    color: "#E74C3C",
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: 14,
    color: "#E74C3C",
    fontFamily: "Geist",
    marginTop: -4,
  },
  imageSlider: {
    height: SCREEN_HEIGHT * 0.35,
    marginTop: 40,
    margin: 12,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  slideImg: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: "#E74C3C",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Geist",
    color: "#E74C3C",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  signupTxt: {
    fontSize: 15,
    fontFamily: "Geist",
    color: "#FFFFFF",
  },
  signupLink: {
    fontSize: 15,
    fontFamily: "Geist",
    color: "#FFFFFF",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D0D0D0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Geist",
    textAlign: "center",
    color: "#000000",
    marginBottom: 8,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Geist",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Geist",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: "Geist",
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textInputError: {
    fontFamily: "Geist",
    borderColor: "#E74C3C",
    backgroundColor: "#FFF5F5",
  },
  otpInput: {
    letterSpacing: 8,
    fontFamily: "Geist",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
  },
  errorText: {
    color: "#E74C3C",
    fontFamily: "Geist",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  changeBtn: {
    marginTop: 16,
    alignSelf: "center",
  },
  changeTxt: {
    color: "#E74C3C",
    fontSize: 15,
    fontFamily: "Geist",
    fontWeight: "600",
  },
});