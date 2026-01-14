import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "../components/CustomInput";
import ApiService from "../api/apiService";
import { useTheme } from "../context/ThemeContext";

const RegistrationListScreen = ({ navigation }) => {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { colors, isDark } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB").replace(/\//g, "-");
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
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
      Alert.alert("Error", "Failed to fetch registrations");
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
      Alert.alert("Error", "Failed to fetch registration details");
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

    const filtered = registrations.filter(
      (reg) =>
        reg.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.registration_no
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        reg.contact_no?.includes(searchQuery)
    );
    setFilteredRegistrations(filtered);
  };

  const renderRegistrationItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.white }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.studentName, { color: colors.text }]}>
          {item.student_name}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(item.registration_date)}
        </Text>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="id-card" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.registration_no}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.contact_no || item.contact_number}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="school" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.course_admission_sought || item.course}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.cardFooter,
          { borderTopColor: isDark ? "#374151" : "#F0F0F0" },
        ]}
      >
        <View style={styles.footerInfo}>
          <Text style={[styles.category, { color: colors.textSecondary }]}>
            Category: {item.category || "N/A"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleViewDetails(item.id)}
          style={styles.iconButton}
        >
          <Ionicons name="eye-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="clipboard-outline" size={64} color={colors.disabled} />
      <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
        No Registrations Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.placeholder }]}>
        {searchQuery
          ? "Try adjusting your search"
          : "Register your first student"}
      </Text>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.screenBackground }]}
    >
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Registration List
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Registration", {
              editData: null,
              timestamp: Date.now(),
            })
          }
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.white }]}>
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
          <View
            style={[styles.modalContent, { backgroundColor: colors.white }]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: isDark ? "#374151" : "#F0F0F0" },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Registration Details
              </Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loadingDetails ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              selectedRegistration && (
                <>
                  <ScrollView style={styles.detailsScroll}>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Registration No
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedRegistration.registration_no}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Student Name
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedRegistration.student_name}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Course Sought
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedRegistration.course_admission_sought ||
                          selectedRegistration.course}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Contact No
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedRegistration.contact_no ||
                          selectedRegistration.contact_number}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Date of Registration
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {formatDate(selectedRegistration.registration_date)}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Parent/Husband Name
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedRegistration.guardian_name || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Category
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedRegistration.category || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Address
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedRegistration.address || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Email
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedRegistration.email || "N/A"}
                      </Text>
                    </View>
                  </ScrollView>
                </>
              )
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  addButton: { padding: 8 },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: { marginBottom: 0 },
  listContainer: { padding: 20, flexGrow: 1 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  studentName: { fontSize: 18, fontWeight: "bold", flex: 1 },
  date: { fontSize: 12 },
  cardDetails: { marginBottom: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  detailText: { fontSize: 14, marginLeft: 8 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerInfo: { flex: 1 },
  iconButton: { padding: 4 },
  category: { fontSize: 12, fontStyle: "italic" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: { fontSize: 14, textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%",
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  modalLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  detailsScroll: { padding: 24 },
  detailItem: { marginBottom: 20 },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: { fontSize: 16, fontWeight: "500" },
});

export default RegistrationListScreen;
