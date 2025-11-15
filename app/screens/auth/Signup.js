import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Animated,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import { useAuthStore } from "../../stores/auth.store";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Exam options for the mission picker
const EXAM_OPTIONS = [
    { label: "IAS (Indian Administrative Service)", value: "ias" },
    { label: "UPSC Civil Services", value: "upsc" },
    { label: "IPS (Indian Police Service)", value: "ips" },
    { label: "IFS (Indian Forest Service)", value: "ifs" },
    { label: "State PCS", value: "pcs" },
    { label: "Other Competitive Exams", value: "other" },
];

export default function Signup({ navigation }) {
    const { signup, verifySignupOtp } = useAuthStore();
    const insets = useSafeAreaInsets();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        mission: "",
    });
    const [otp, setOtp] = useState("");
    const [errors, setErrors] = useState({});
    const [showPicker, setShowPicker] = useState(false);

    const pickerAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (showPicker) {
            Animated.spring(pickerAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        } else {
            Animated.timing(pickerAnim, {
                toValue: 300,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [showPicker]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!formData.phone) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = "Enter a valid 10-digit phone number";
        }

        if (!formData.mission) {
            newErrors.mission = "Please select your exam goal";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        try {
            const res = await signup(formData);
            if (res.success) {
                setStep(2);
            } else {
                setErrors({ submit: res.message || "Failed to create account" });
            }
        } catch (error) {
            console.error("Signup Error:", error);
            setErrors({ submit: error.message || "Failed to create account. Please try again." });
        }
    };
    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setErrors({ otp: "Please enter a valid 6-digit OTP" });
            return;
        }

        try {
            const res = await verifySignupOtp(otp);
            if (res.success) {
                // ✅ Account created and user logged in, redirect to Home
                navigation.replace("Home");
            } else {
                setErrors({ otp: res.message || "Invalid OTP" });
            }
        } catch (error) {
            console.error("OTP Verification Error:", error);
            setErrors({ otp: error.message || "Invalid OTP. Please try again." });
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: "", submit: "" }));
    };

    const selectMission = (value) => {
        updateField("mission", value);
        setShowPicker(false);
    };

    const getMissionLabel = () => {
        const selected = EXAM_OPTIONS.find(opt => opt.value === formData.mission);
        return selected ? selected.label : "Select your exam goal";
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <View style={styles.backButton} />
                </View>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={0}
                >

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Progress Indicator */}
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
                            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
                            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
                        </View>


                        {step === 1 ? (
                            // Step 1: Registration Form
                            <View style={styles.formContainer}>
                                <Text style={styles.stepTitle}>Student Registration</Text>
                                <Text style={styles.stepSubtitle}>
                                    Fill in your details to get started
                                </Text>

                                {/* Name Input */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Full Name</Text>
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            errors.name ? styles.textInputError : null,
                                        ]}
                                        value={formData.name}
                                        onChangeText={(text) => updateField("name", text)}
                                        placeholder="Enter your full name"
                                        placeholderTextColor="#999"
                                        autoCapitalize="words"
                                    />
                                    {errors.name ? (
                                        <Text style={styles.errorText}>{errors.name}</Text>
                                    ) : null}
                                </View>

                                {/* Email Input */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Email Address</Text>
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            errors.email ? styles.textInputError : null,
                                        ]}
                                        value={formData.email}
                                        onChangeText={(text) => updateField("email", text)}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#999"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    {errors.email ? (
                                        <Text style={styles.errorText}>{errors.email}</Text>
                                    ) : null}
                                </View>

                                {/* Phone Input */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Phone Number</Text>
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            errors.phone ? styles.textInputError : null,
                                        ]}
                                        value={formData.phone}
                                        onChangeText={(text) => updateField("phone", text)}
                                        placeholder="Enter 10-digit phone number"
                                        placeholderTextColor="#999"
                                        keyboardType="number-pad"
                                        maxLength={10}
                                    />
                                    {errors.phone ? (
                                        <Text style={styles.errorText}>{errors.phone}</Text>
                                    ) : null}
                                </View>

                                {/* Mission Picker */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Your Mission</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.pickerButton,
                                            errors.mission ? styles.textInputError : null,
                                        ]}
                                        onPress={() => setShowPicker(true)}
                                    >
                                        <Text
                                            style={[
                                                styles.pickerButtonText,
                                                !formData.mission && styles.pickerPlaceholder,
                                            ]}
                                        >
                                            {getMissionLabel()}
                                        </Text>
                                        <Text style={styles.pickerArrow}>▼</Text>
                                    </TouchableOpacity>
                                    {errors.mission ? (
                                        <Text style={styles.errorText}>{errors.mission}</Text>
                                    ) : null}
                                </View>

                                {errors.submit ? (
                                    <Text style={styles.submitError}>{errors.submit}</Text>
                                ) : null}

                                {/* Submit Button */}
                                <Button title="Continue" onPress={handleSignup} />

                                {/* Login Link */}
                                <View style={styles.loginRow}>
                                    <Text style={styles.loginTxt}>Already have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                        <Text style={styles.loginLink}>Login</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            // Step 2: OTP Verification
                            <View style={styles.formContainer}>
                                <Text style={styles.stepTitle}>Verify OTP</Text>
                                <Text style={styles.stepSubtitle}>
                                    We sent a 6-digit code to {formData.phone}
                                </Text>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Enter 6-digit OTP</Text>
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            styles.otpInput,
                                            errors.otp ? styles.textInputError : null,
                                        ]}
                                        value={otp}
                                        onChangeText={(text) => {
                                            setOtp(text);
                                            setErrors(prev => ({ ...prev, otp: "" }));
                                        }}
                                        placeholder="------"
                                        placeholderTextColor="#999"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        autoFocus
                                        returnKeyType="done"
                                        onSubmitEditing={handleVerifyOtp}
                                    />
                                    {errors.otp ? (
                                        <Text style={styles.errorText}>{errors.otp}</Text>
                                    ) : null}
                                </View>

                                <Button title="Verify & Create Account" onPress={handleVerifyOtp} />

                                <TouchableOpacity
                                    onPress={() => {
                                        setStep(1);
                                        setOtp("");
                                        setErrors({});
                                    }}
                                    style={styles.changeBtn}
                                >
                                    <Text style={styles.changeTxt}>Change Details</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.resendBtn}
                                    onPress={handleSignup}
                                >
                                    <Text style={styles.resendTxt}>Didn't receive code? Resend</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                    </ScrollView>
                </KeyboardAvoidingView>

            </SafeAreaView>

            {/* Mission Picker Modal */}
            {showPicker && (
                <View style={styles.pickerOverlay}>
                    <TouchableOpacity
                        style={styles.pickerBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowPicker(false)}
                    />
                    <Animated.View
                        style={[
                            styles.pickerModal,
                            { transform: [{ translateY: pickerAnim }] },
                        ]}
                    >
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Select Your Exam Goal</Text>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <Text style={styles.pickerClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerScroll}>
                            {EXAM_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.pickerOption,
                                        formData.mission === option.value && styles.pickerOptionSelected,
                                    ]}
                                    onPress={() => selectMission(option.value)}
                                >
                                    <Text
                                        style={[
                                            styles.pickerOptionText,
                                            formData.mission === option.value && styles.pickerOptionTextSelected,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {formData.mission === option.value && (
                                        <Text style={styles.pickerCheck}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Animated.View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    backText: {
        fontSize: 24,
        fontFamily: "Geist",
        color: "#E74C3C",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        fontFamily: "Geist",
        color: "#000000",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 40,
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 40,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#E0E0E0",
    },
    progressDotActive: {
        backgroundColor: "#E74C3C",
    },
    progressLine: {
        width: 60,
        height: 2,
        backgroundColor: "#E0E0E0",
        marginHorizontal: 8,
    },
    progressLineActive: {
        backgroundColor: "#E74C3C",
    },
    formContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: "700",
        fontFamily: "Geist",
        color: "#000000",
        marginBottom: 8,
        textAlign: "center",
    },
    stepSubtitle: {
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
        paddingVertical: 14,
        fontSize: 16,
        fontFamily: "Geist",
        color: "#000",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    textInputError: {
        borderColor: "#E74C3C",
        backgroundColor: "#FFF5F5",
    },
    otpInput: {
        letterSpacing: 8,
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
    pickerButton: {
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pickerButtonText: {
        fontSize: 16,
        fontFamily: "Geist",
        color: "#000",
        flex: 1,
    },
    pickerPlaceholder: {
        color: "#999",
    },
    pickerArrow: {
        fontSize: 12,
        color: "#666",
    },
    submitError: {
        color: "#E74C3C",
        fontFamily: "Geist",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    loginRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
    },
    loginTxt: {
        fontSize: 15,
        fontFamily: "Geist",
        color: "#666666",
    },
    loginLink: {
        fontSize: 15,
        fontFamily: "Geist",
        color: "#E74C3C",
        fontWeight: "700",
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
    resendBtn: {
        marginTop: 12,
        alignSelf: "center",
    },
    resendTxt: {
        color: "#666666",
        fontFamily: "Geist",
        fontSize: 14,
    },
    pickerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    pickerBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    pickerModal: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "70%",
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
    pickerHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: "700",
        fontFamily: "Geist",
        color: "#000000",
    },
    pickerClose: {
        fontSize: 24,
        color: "#666666",
    },
    pickerScroll: {
        maxHeight: 400,
    },
    pickerOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
    },
    pickerOptionSelected: {
        backgroundColor: "#FFF5F5",
    },
    pickerOptionText: {
        fontSize: 16,
        fontFamily: "Geist",
        color: "#333333",
        flex: 1,
    },
    pickerOptionTextSelected: {
        color: "#E74C3C",
        fontWeight: "600",
    },
    pickerCheck: {
        fontSize: 20,
        color: "#E74C3C",
        marginLeft: 12,
    },
});