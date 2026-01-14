import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DrawerNavigator from "./DrawerNavigator";
import FeesEntryScreen from "../screens/FeesEntryScreen";
import PaymentHistoryScreen from "../screens/PaymentHistoryScreen";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import ApiService from "../api/apiService";
import COLORS from "../constants/colors";

const Tab = createBottomTabNavigator();

// Dummy component for Logout tab since we handle the action in the listener
const LogoutComponent = () => null;

const BottomTabNavigator = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const handleLogout = (navigation) => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await ApiService.logout();
          } catch (error) {
            console.log("Logout API error:", error);
          }
          await ApiService.removeToken();
          navigation.replace("Login");
        },
      },
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Payment") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "Logout") {
            iconName = focused ? "log-out" : "log-out-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 85 : 60 + insets.bottom,
          paddingBottom:
            Platform.OS === "ios" ? 30 : Math.max(insets.bottom, 10),
          paddingTop: 10,
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 0, // Remove shadow on Android to use our border
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DrawerNavigator}
        listeners={({ navigation }) => ({
          tabPress: () => {
            // Always navigate to Dashboard when Home tab is pressed
            navigation.navigate("Home", { screen: "Dashboard" });
          },
        })}
      />
      <Tab.Screen name="Payment" component={PaymentHistoryScreen} />
      <Tab.Screen
        name="Logout"
        component={LogoutComponent}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            handleLogout(navigation);
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
