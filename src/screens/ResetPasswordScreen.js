import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import ApiService from "../api/apiService";
import { useTheme } from "../context/ThemeContext";

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params || {};

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [timer, setTimer] = useState(20);
  const { colors } = useTheme();

  // Timer logic
  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await ApiService.forgotPassword(email);
      if (
        response.status === true ||
        response.status === 200 ||
        response.status === 201
      ) {
        Alert.alert("Success", "OTP Resent Successfully");
        setTimer(20);
      } else {
        Alert.alert("Error", response.message || "Failed to resend OTP");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!otp.trim()) {
      newErrors.otp = "OTP is required";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // API call to verify OTP and reset password
      const response = await ApiService.resetPassword(otp, newPassword);

      if (
        response.status === true ||
        response.status === 200 ||
        response.status === 201
      ) {
        Alert.alert(
          "Success",
          "Password reset successfully. Please login with your new password.",
          [{ text: "OK", onPress: () => navigation.popToTop() }]
        );
      } else {
        Alert.alert("Error", response.message || "Failed to reset password");
      }
    } catch (error) {
      console.log("Reset error", error);
      Alert.alert(
        "Error",
        error.message || "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.formContainer, { backgroundColor: colors.white }]}>
          <Text style={[styles.title, { color: colors.primary }]}>
            Reset Password
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter the OTP sent to {email}
          </Text>

          <CustomInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            error={error.otp}
            style={styles.inputStyle}
            maxLength={6}
          />

          <View style={styles.passwordContainer}>
            <CustomInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              error={error.newPassword}
              style={styles.inputStyle}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <CustomButton
            title="VERIFY & UPDATE"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: colors.textSecondary }]}>
              Didn't receive code?{" "}
            </Text>
            {timer > 0 ? (
              <Text style={[styles.timerText, { color: colors.primary }]}>
                Resend in {timer}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                <Text style={[styles.resendLink, { color: colors.primary }]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={[styles.backText, { color: colors.textSecondary }]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  formContainer: {
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  inputStyle: {
    marginBottom: 20,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 14,
  },
  button: {
    marginBottom: 24,
  },
  backButton: {
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
  },
  timerText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default ResetPasswordScreen;
