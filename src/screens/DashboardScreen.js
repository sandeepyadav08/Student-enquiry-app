import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../api/apiService";
import { useFocusEffect } from "@react-navigation/native";
import { PieChart } from "react-native-chart-kit";
import { useTheme } from "../context/ThemeContext";

const DashboardScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const { colors, isDark } = useTheme();

  const fetchDashboardData = useCallback(async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getDashboardStats(),
      ]);

      if (profileRes && profileRes.status === 201) {
        setProfile(profileRes.data);
      }

      if (statsRes && statsRes.status === 201) {
        setStats(statsRes);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const statsData = [
    {
      label: "Enquiries",
      count: stats ? stats.total_enquiries : 0,
      color: colors.success,
    },
    {
      label: "Registrations",
      count: stats ? stats.total_registrations : 0,
      color: colors.info,
    },
    {
      label: "Fees Pending",
      count: stats ? stats.fees_not_paid : 0,
      color: colors.warning,
    },
  ];

  const pieData = [
    {
      name: "Enquiries",
      population: stats ? stats.total_enquiries : 0,
      color: colors.success,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: "Registrations",
      population: stats ? stats.total_registrations : 0,
      color: colors.info,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: "Fees Pending",
      population: stats ? stats.fees_not_paid : 0,
      color: colors.warning,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      isDark
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(74, 58, 255, ${opacity})`,
    labelColor: (opacity = 1) =>
      isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary,
    },
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          Student Enquiry
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.welcomeCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.welcomeTitle}>Welcome, {profile?.name || ""}</Text>
        <Text style={styles.welcomeSubtitle}>{profile?.email || ""}</Text>
      </View>

      <View style={styles.statsContainer}>
        {statsData.map((stat, index) => (
          <View
            key={index}
            style={[styles.statCard, { backgroundColor: stat.color + "20" }]}
          >
            <Text style={[styles.statCount, { color: stat.color }]}>
              {stat.count}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {stats && (
        <View style={styles.chartContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Overview Analytics
          </Text>
          <View
            style={[styles.chartWrapper, { backgroundColor: colors.white }]}
          >
            <PieChart
              data={pieData}
              width={Dimensions.get("window").width - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 40,
  },
  welcomeCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statCount: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  chartWrapper: {
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default DashboardScreen;
