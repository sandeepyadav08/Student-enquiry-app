import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
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
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingRegistrationId, setLoadingRegistrationId] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEnquiries();
    });
    return unsubscribe;
  }, [navigation]);

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

  const handleViewDetails = async (id) => {
    setLoadingDetails(true);
    setDetailsModalVisible(true);
    try {
      const response = await ApiService.getEnquiryDetails(id);
      setSelectedEnquiry(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch enquiry details');
      setDetailsModalVisible(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditEnquiry = () => {
    setDetailsModalVisible(false);
    navigation.navigate('StudentEnquiry', { editData: selectedEnquiry });
  };

  const handleRegistration = async (item) => {
    setLoadingRegistrationId(item.id);
    try {
      const response = await ApiService.getEnquiryRegistrationData(item.id);
      navigation.navigate('Registration', { 
        enquiryData: response.data,
        timestamp: new Date().getTime() // Force refresh if already on screen
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch registration data');
    } finally {
      setLoadingRegistrationId(null);
    }
  };

  const filterEnquiries = () => {
    if (!searchQuery.trim()) {
      setFilteredEnquiries(enquiries);
      return;
    }

    const filtered = enquiries.filter(enquiry =>
      enquiry.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.contact_number.includes(searchQuery)
    );
    setFilteredEnquiries(filtered);
  };



  const renderEnquiryItem = ({ item }) => (
    <View
      style={styles.enquiryCard}
    >
      <View style={styles.enquiryHeader}>
        <Text style={styles.studentName}>{item.student_name}</Text>
        <Text style={styles.date}>{item.enquiry_date}</Text>
      </View>
      
      <View style={styles.enquiryDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.contact_number}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="school" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.course}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="business" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.franchisee}</Text>
        </View>
      </View>

      <View style={styles.enquiryFooter}>
        <View style={styles.footerInfo}>
          <Text style={styles.counsellor}>Counsellor: {item.counsellor_name || 'N/A'}</Text>
        </View>
        <View style={styles.actionButtons}>
          {item.register_status === '1' ? (
            <Text style={styles.registeredText}>Registered</Text>
          ) : (
            <>
              {loadingRegistrationId === item.id ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 8 }} />
              ) : (
                <TouchableOpacity 
                  onPress={() => handleRegistration(item)}
                  style={styles.iconButton}
                >
                  <Ionicons name="person-add-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={() => handleViewDetails(item.id)}
                style={styles.iconButton}
              >
                <Ionicons name="eye-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
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
          onPress={() => navigation.navigate('StudentEnquiry', { editData: null })}
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

      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enquiry Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {loadingDetails ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : selectedEnquiry && (
              <>
                <ScrollView style={styles.detailsScroll}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Student Name</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.student_name}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.enquiry_date}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Contact Number</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.contact_number}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>WhatsApp Number</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.whatsapp_number || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Course</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.course}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Franchisee</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.franchisee}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Mode of Reference</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.reference_mode || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Counsellor</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.counsellor_name || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Place</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.place || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Remarks</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.remarks || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Follow Up 1</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.follow_up_1 || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Follow Up 2</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.follow_up_2 || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Follow Up 3</Text>
                    <Text style={styles.detailValue}>{selectedEnquiry.follow_up_3 || 'N/A'}</Text>
                  </View>
                </ScrollView>
                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={handleEditEnquiry}
                  >
                    <Ionicons name="create-outline" size={20} color={COLORS.white} />
                    <Text style={styles.editButtonText}>Edit Details</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  footerInfo: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  registeredText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.success,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.disabledInput,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsScroll: {
    padding: 24,
  },
  detailItem: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.disabledInput,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EnquiryListScreen;
