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

const RegistrationListScreen = ({ navigation }) => {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB').replace(/\//g, '-');
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRegistrations();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterRegistrations();
  }, [searchQuery, registrations]);

  const fetchRegistrations = async () => {
    try {
      const response = await ApiService.getRegistrations();
      setRegistrations(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    setLoadingDetails(true);
    setDetailsModalVisible(true);
    try {
      const response = await ApiService.getRegistrationDetails(id);
      setSelectedRegistration(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch registration details');
      setDetailsModalVisible(false);
    } finally {
      setLoadingDetails(false);
    }
  };



  const filterRegistrations = () => {
    if (!searchQuery.trim()) {
      setFilteredRegistrations(registrations);
      return;
    }

    const filtered = registrations.filter(reg =>
      reg.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.registration_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.contact_no?.includes(searchQuery)
    );
    setFilteredRegistrations(filtered);
  };

  const renderRegistrationItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.studentName}>{item.student_name}</Text>
        <Text style={styles.date}>{formatDate(item.registration_date)}</Text>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="id-card" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.registration_no}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.contact_no || item.contact_number}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="school" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.course_admission_sought || item.course}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <Text style={styles.category}>Category: {item.category || 'N/A'}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleViewDetails(item.id)}
          style={styles.iconButton}
        >
          <Ionicons name="eye-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="clipboard-outline" size={64} color={COLORS.disabled} />
      <Text style={styles.emptyTitle}>No Registrations Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Try adjusting your search' : 'Register your first student'}
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
        <Text style={styles.headerTitle}>Registration List</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Registration', { editData: null, timestamp: Date.now() })}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <CustomInput
          placeholder="Search by name, reg no or contact"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredRegistrations}
        renderItem={renderRegistrationItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchRegistrations}
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
              <Text style={styles.modalTitle}>Registration Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {loadingDetails ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : selectedRegistration && (
              <>
                <ScrollView style={styles.detailsScroll}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Registration No</Text>
                    <Text style={styles.detailValue}>{selectedRegistration.registration_no}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Student Name</Text>
                    <Text style={styles.detailValue}>{selectedRegistration.student_name}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Course Sought</Text>
                    <Text style={styles.detailValue}>{selectedRegistration.course_admission_sought || selectedRegistration.course}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Contact No</Text>
                    <Text style={styles.detailValue}>{selectedRegistration.contact_no || selectedRegistration.contact_number}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Date of Registration</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedRegistration.registration_date)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Parent/Husband Name</Text>
                    <Text style={styles.detailValue}>{selectedRegistration.guardian_name || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{selectedRegistration.category || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{selectedRegistration.address || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{selectedRegistration.email || 'N/A'}</Text>
                  </View>
                </ScrollView>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  addButton: { padding: 8 },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  searchInput: { marginBottom: 0 },
  listContainer: { padding: 20, flexGrow: 1 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, flex: 1 },
  date: { fontSize: 12, color: COLORS.textSecondary },
  cardDetails: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 8 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.disabledInput,
  },
  footerInfo: { flex: 1 },
  iconButton: { padding: 4 },
  category: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textSecondary, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.placeholder, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%', width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: COLORS.disabledInput },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  modalLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  detailsScroll: { padding: 24 },
  detailItem: { marginBottom: 20 },
  detailLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 16, color: COLORS.text, fontWeight: '500' },

});

export default RegistrationListScreen;
