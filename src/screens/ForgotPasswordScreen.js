import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import ApiService from "../api/apiService";
import { useTheme } from "../context/ThemeContext";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { colors } = useTheme();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await ApiService.forgotPassword(email);
      if (
        response.status === true ||
        response.status === 200 ||
        response.status === 201
      ) {
        Alert.alert(
          "Success",
          response.message || "OTP sent to your email address"
        );
        navigation.navigate("ResetPassword", { email: email });
      } else {
        Alert.alert("Error", response.message || "Failed to send OTP");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to send OTP. Please try again."
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
      <View style={styles.content}>
        <View style={[styles.formContainer, { backgroundColor: colors.white }]}>
          <Text style={[styles.title, { color: colors.primary }]}>
            Forgot Password
          </Text>

          <CustomInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={error}
            style={styles.inputStyle}
            autoCapitalize="none"
          />

          <CustomButton
            title="SEND OTP"
            onPress={handleSendOTP}
            loading={loading}
            style={styles.sendButton}
          />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={[styles.backText, { color: colors.textSecondary }]}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
    marginBottom: 32,
  },
  inputStyle: {
    marginBottom: 24,
  },
  sendButton: {
    marginBottom: 24,
  },
  backButton: {
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default ForgotPasswordScreen;
