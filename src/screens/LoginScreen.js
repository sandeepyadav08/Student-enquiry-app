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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { colors } = useTheme();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await ApiService.login(email, password);

      if (
        (response.status === true || response.status === 201) &&
        response.token
      ) {
        await ApiService.setToken(response.token);
        navigation.replace("Main");
      } else {
        Alert.alert("Login Failed", "Invalid credentials or server error");
      }
    } catch (error) {
      console.log("Login error:", error);
      Alert.alert(
        "Login Failed",
        error.message || "Network error. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.primary }]}>
            Welcome Back!
          </Text>
          <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
            Sign in to continue your journey
          </Text>
        </View>

        <View style={[styles.formContainer, { backgroundColor: colors.white }]}>
          <Text style={[styles.signInText, { color: colors.primary }]}>
            Sign In
          </Text>

          <CustomInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
            style={styles.inputStyle}
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <CustomInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={errors.password}
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

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: colors.primary },
                  rememberMe && { backgroundColor: colors.primary },
                ]}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                )}
              </View>
              <Text
                style={[styles.rememberText, { color: colors.textSecondary }]}
              >
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text
                style={[styles.forgotText, { color: colors.textSecondary }]}
              >
                Forgot password
              </Text>
            </TouchableOpacity>
          </View>

          <CustomButton
            title="LOGIN"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />
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
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    textAlign: "center",
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
  signInText: {
    fontSize: 24,
    fontWeight: "bold",
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
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberText: {
    fontSize: 14,
  },
  forgotText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  loginButton: {
    marginTop: 8,
  },
});

export default LoginScreen;
