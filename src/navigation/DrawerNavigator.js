import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import StudentEnquiryScreen from '../screens/StudentEnquiryScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import FeesEntryScreen from '../screens/FeesEntryScreen';
import EnquiryListScreen from '../screens/EnquiryListScreen';
import ApiService from '../api/apiService';
import COLORS from '../constants/colors';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }) => {
  const menuItems = [
    {
      title: 'Student Enquiry',
      icon: 'list-outline',
      onPress: () => navigation.navigate('EnquiryList'),
    },
    {
      title: 'Registration',
      icon: 'clipboard-outline',
      onPress: () => navigation.navigate('Registration'),
    },
    {
      title: 'Fees Entry',
      icon: 'card-outline',
      onPress: () => navigation.navigate('FeesEntry'),
    },
  ];

  return (
    <View style={styles.drawerContainer}>
      {/* New Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <TouchableOpacity onPress={() => navigation.closeDrawer()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={COLORS.primary} />
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
                 <Ionicons name={item.icon} size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: COLORS.white,
          width: 300,
        },
        drawerType: 'front',
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="StudentEnquiry" component={StudentEnquiryScreen} />
      <Drawer.Screen name="EnquiryList" component={EnquiryListScreen} />
      <Drawer.Screen name="Registration" component={RegistrationScreen} />
      <Drawer.Screen name="FeesEntry" component={FeesEntryScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 50, // Safe area padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.disabledInput,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default DrawerNavigator;