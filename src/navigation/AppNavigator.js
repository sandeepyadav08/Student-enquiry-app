import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native";
import LoginScreen from "../screens/LoginScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import ApiService from "../api/apiService";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await ApiService.getToken();
      setUserToken(token);
    } catch (e) {
      console.log("Token check error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={userToken ? "Main" : "Login"}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
