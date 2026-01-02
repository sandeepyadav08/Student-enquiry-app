import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../components/CustomInput';
import ApiService from '../api/apiService';
import COLORS from '../constants/colors';

const EnquiryListScreen = ({ navigation }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    filterEnquiries();
  }, [searchQuery, enquiries]);

  const fetchEnquiries = async () => {
    try {
      const response = await ApiService.getEnquiries();
      setEnquiries(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  const filterEnquiries = () => {
    if (!searchQuery.trim()) {
      setFilteredEnquiries(enquiries);
      return;
    }

    const filtered = enquiries.filter(enquiry =>
      enquiry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.contactNumber.includes(searchQuery)
    );
    setFilteredEnquiries(filtered);
  };

  const handleEnquiryPress = (enquiry) => {
    navigation.navigate('Registration', { enquiryData: enquiry });
  };

  const renderEnquiryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.enquiryCard}
      onPress={() => handleEnquiryPress(item)}
    >
      <View style={styles.enquiryHeader}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      
      <View style={styles.enquiryDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.contactNumber}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="school" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.courseEnquiry}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="business" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.franchisee}</Text>
        </View>
      </View>

      <View style={styles.enquiryFooter}>
        <Text style={styles.counsellor}>Counsellor: {item.counsellorName || 'N/A'}</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color={COLORS.disabled} />
      <Text style={styles.emptyTitle}>No Enquiries Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Try adjusting your search' : 'Create your first enquiry'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enquiry List</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('StudentEnquiry')}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <CustomInput
          placeholder="Search by name or contact number"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredEnquiries}
        renderItem={renderEnquiryItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchEnquiries}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screenBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  enquiryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  enquiryDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  enquiryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.disabledInput,
  },
  counsellor: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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

export default EnquiryListScreen;
