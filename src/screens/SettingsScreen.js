import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { useTheme } from "../context/ThemeContext";

const SettingsScreen = ({ navigation }) => {
  const { colors, themeMode, changeTheme, isDark } = useTheme();

  const themeOptions = [
    {
      id: "automatic",
      title: "Automatic",
      description: "Follow system theme",
      icon: "phone-portrait-outline",
    },
    {
      id: "light",
      title: "Light",
      description: "Always light theme",
      icon: "sunny-outline",
    },
    {
      id: "dark",
      title: "Dark",
      description: "Always dark theme",
      icon: "moon-outline",
    },
  ];

  const aboutOptions = [
    {
      title: "Version",
      value: Constants.expoConfig?.version || Application.nativeAppVersion,
      icon: "information-circle-outline",
    },
    {
      title: "Privacy Policy",
      icon: "shield-checkmark-outline",
    },
    {
      title: "Terms & Conditions",
      icon: "document-text-outline",
    },
  ];

  const renderThemeOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionItem,
        { borderBottomColor: isDark ? "#374151" : "#F0F0F0" },
      ]}
      onPress={() => changeTheme(option.id)}
    >
      <View style={styles.optionLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={option.icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={[styles.optionTitle, { color: colors.text }]}>
            {option.title}
          </Text>
          <Text
            style={[styles.optionDescription, { color: colors.textSecondary }]}
          >
            {option.description}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.radioButton,
          { borderColor: isDark ? "#4B5563" : "#E0E0E0" },
          themeMode === option.id && {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          },
        ]}
      >
        {themeMode === option.id && (
          <Ionicons
            name="checkmark"
            size={16}
            color={isDark ? colors.white : "#FFFFFF"}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAboutOption = (option) => (
    <TouchableOpacity
      key={option.title}
      style={[
        styles.optionItem,
        { borderBottomColor: isDark ? "#374151" : "#F0F0F0" },
      ]}
      onPress={() => {
        if (option.title === "Privacy Policy") {
          WebBrowser.openBrowserAsync(
            "https://www.udaipurcoaching.com/privacy-policy"
          );
        } else if (option.title === "Terms & Conditions") {
          WebBrowser.openBrowserAsync("https://anushkaacademy.com/contact/");
        }
      }}
    >
      <View style={styles.optionLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={option.icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={[styles.optionTitle, { color: colors.text }]}>
            {option.title}
          </Text>
          {option.value && (
            <Text style={[styles.optionValue, { color: colors.textSecondary }]}>
              {option.value}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.screenBackground }]}
    >
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Theme
        </Text>
        <View
          style={[styles.sectionBackground, { backgroundColor: colors.white }]}
        >
          {themeOptions.map(renderThemeOption)}
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { marginTop: 24, color: colors.primary },
          ]}
        >
          About
        </Text>
        <View
          style={[styles.sectionBackground, { backgroundColor: colors.white }]}
        >
          {aboutOptions.map(renderAboutOption)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionBackground: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    alignItems: "center",
  },
  optionTextContainer: {
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  optionValue: {
    fontSize: 14,
    marginTop: 2,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SettingsScreen;
