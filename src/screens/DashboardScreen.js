import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import ApiService from '../api/apiService';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';

const DashboardScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getDashboardStats(),
      ]);

      if (profileRes && profileRes.status === true) {
        setProfile(profileRes.data);
      }

      if (statsRes && statsRes.status === true) {
        setStats(statsRes);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );



  const statsData = [
    {
      label: 'Enquiries',
      count: stats ? stats.total_enquiries : 0,
      color: COLORS.success,
    },
    {
      label: 'Registrations',
      count: stats ? stats.total_registrations : 0,
      color: COLORS.info,
    },
    {
      label: 'Fees Pending',
      count: stats ? stats.fees_not_paid : 0,
      color: COLORS.warning,
    },
  ];

  const pieData = [
    {
      name: 'Enquiries',
      population: stats ? stats.total_enquiries : 0,
      color: COLORS.success,
      legendFontColor: COLORS.text,
      legendFontSize: 12,
    },
    {
      name: 'Registrations',
      population: stats ? stats.total_registrations : 0,
      color: COLORS.info,
      legendFontColor: COLORS.text,
      legendFontSize: 12,
    },
    {
      name: 'Fees Pending',
      population: stats ? stats.fees_not_paid : 0,
      color: COLORS.warning,
      legendFontColor: COLORS.text,
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(74, 58, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Enquiry</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>
          Welcome, {profile?.name || ''}
        </Text>
        <Text style={styles.welcomeSubtitle}>
          {profile?.email || ''}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        {statsData.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: stat.color + '20' }]}>
            <Text style={[styles.statCount, { color: stat.color }]}>{stat.count}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>



      {stats && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Overview Analytics</Text>
          <View style={styles.chartWrapper}>
            <PieChart
              data={pieData}
              width={Dimensions.get('window').width - 40}
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  notificationButton: {
    padding: 8,
  },
  welcomeCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  chartWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    shadowColor: COLORS.black,
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
