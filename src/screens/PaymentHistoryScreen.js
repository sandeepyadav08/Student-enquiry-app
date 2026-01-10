import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../api/apiService';
import COLORS from '../constants/colors';

const PaymentHistoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrationMapping, setRegistrationMapping] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB').replace(/\//g, '-');
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPaymentHistory();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchPaymentHistory = async () => {
    try {
      const [historyResponse, regResponse] = await Promise.all([
        ApiService.getPaymentHistory(),
        ApiService.getRegistrations()
      ]);

      if (regResponse && regResponse.data) {
        const regData = Array.isArray(regResponse.data) ? regResponse.data : [regResponse.data];
        const mapping = {};
        regData.forEach(item => {
          if (item.registration_no) {
            // Store with trimmed and uppercase key for robust matching
            const key = item.registration_no.toString().trim().toUpperCase();
            mapping[key] = item.student_name;
          }
        });
        setRegistrationMapping(mapping);
      }

      if (historyResponse && historyResponse.status === true) {
        setPayments(historyResponse.data || []);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Fetch Payment History Error:', error);
      Alert.alert('Error', 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (item) => {
    if (item.student_name) return item.student_name;
    if (!item.registration_no) return 'N/A';
    
    const key = item.registration_no.toString().trim().toUpperCase();
    return registrationMapping[key] || 'N/A';
  };

  const renderPaymentItem = ({ item }) => (
    <View style={styles.paymentCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.regNoLabel}>Registration No</Text>
          <Text style={styles.regNoValue}>{item.registration_no}</Text>
          <Text style={[styles.regNoLabel, { marginTop: 4 }]}>Student Name</Text>
          <Text style={styles.studentNameValue}>
            {getStudentName(item)}
          </Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Date</Text>
          <Text style={styles.dateValue}>{formatDate(item.fee_date)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Total Fees</Text>
            <Text style={styles.amountValue}>₹{item.total_fees}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: COLORS.success }]}>Paid Fees</Text>
            <Text style={[styles.amountValue, { color: COLORS.success }]}>₹{item.paid_fees}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: COLORS.error }]}>Due Fees</Text>
            <Text style={[styles.amountValue, { color: COLORS.error }]}>₹{item.due_fees}</Text>
          </View>
        </View>

        <View style={styles.paymentInfoRow}>
          <Ionicons name="card-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.paymentInfoText}>Paid Through: {item.paid_through}</Text>
        </View>
        
        {item.remarks ? (
          <View style={styles.paymentInfoRow}>
            <Ionicons name="chatbubble-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.paymentInfoText}>{item.remarks}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={COLORS.disabled} />
      <Text style={styles.emptyTitle}>No Payment History</Text>
      <Text style={styles.emptySubtitle}>No records of payments found.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20), paddingBottom: 20 }]}>
        <Text style={styles.headerTitle}>Payment History</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPaymentItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchPaymentHistory}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screenBackground,
  },
  header: {
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  paymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  regNoLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  regNoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  studentNameValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  cardBody: {
    gap: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 12,
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentInfoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.placeholder,
    textAlign: 'center',
  },
});

export default PaymentHistoryScreen;