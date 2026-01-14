import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import DashboardScreen from "../screens/DashboardScreen";
import StudentEnquiryScreen from "../screens/StudentEnquiryScreen";
import RegistrationScreen from "../screens/RegistrationScreen";
import RegistrationListScreen from "../screens/RegistrationListScreen";
import FeesEntryScreen from "../screens/FeesEntryScreen";
import EnquiryListScreen from "../screens/EnquiryListScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ApiService from "../api/apiService";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }) => {
  const { colors, isDark } = useTheme();

  const menuItems = [
    {
      title: "Student Enquiry",
      icon: "list-outline",
      onPress: () => navigation.navigate("EnquiryList"),
    },
    {
      title: "Registration",
      icon: "clipboard-outline",
      onPress: () => navigation.navigate("RegistrationList"),
    },
    {
      title: "Fees Entry",
      icon: "card-outline",
      onPress: () => navigation.navigate("FeesEntry"),
    },
    {
      title: "Settings",
      icon: "settings-outline",
      onPress: () => navigation.navigate("Settings"),
    },
  ];

  return (
    <View style={[styles.drawerContainer, { backgroundColor: colors.white }]}>
      {/* New Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: isDark ? "#374151" : "#F0F0F0" },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          Menu
        </Text>
        <TouchableOpacity
          onPress={() => navigation.closeDrawer()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <DrawerContentScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color={colors.primary} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

const DrawerNavigator = () => {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.white,
          width: 300,
        },
        drawerType: "front",
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="StudentEnquiry" component={StudentEnquiryScreen} />
      <Drawer.Screen
        name="RegistrationList"
        component={RegistrationListScreen}
      />
      <Drawer.Screen name="EnquiryList" component={EnquiryListScreen} />
      <Drawer.Screen name="Registration" component={RegistrationScreen} />
      <Drawer.Screen name="FeesEntry" component={FeesEntryScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 50, // Safe area padding
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingTop: 10,
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  iconContainer: {
    width: 40,
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
});

export default DrawerNavigator;
