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

const EnquiryListScreen = ({ navigation }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingRegistrationId, setLoadingRegistrationId] = useState(null);
  const { colors, isDark } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB").replace(/\//g, "-");
  };

  const formatDateTime = (dateTimeString) => {
    if (
      !dateTimeString ||
      dateTimeString === "N/A" ||
      dateTimeString.includes("0000-00-00")
    ) {
      return "N/A";
    }

    const date = new Date(dateTimeString);
    if (isNaN(date.getTime()) || date.getFullYear() < 1900) return "N/A";

    const formattedDate = date.toLocaleDateString("en-GB").replace(/\//g, "-");
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${formattedDate} ${formattedTime}`;
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
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
      Alert.alert("Error", "Failed to fetch enquiries");
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
      Alert.alert("Error", "Failed to fetch enquiry details");
      setDetailsModalVisible(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditEnquiry = () => {
    setDetailsModalVisible(false);
    navigation.navigate("StudentEnquiry", { editData: selectedEnquiry });
  };

  const handleRegistration = async (item) => {
    setLoadingRegistrationId(item.id);
    try {
      const response = await ApiService.getEnquiryRegistrationData(item.id);
      navigation.navigate("Registration", {
        enquiryData: response.data,
        timestamp: new Date().getTime(), // Force refresh if already on screen
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to fetch registration data"
      );
    } finally {
      setLoadingRegistrationId(null);
    }
  };

  const filterEnquiries = () => {
    if (!searchQuery.trim()) {
      setFilteredEnquiries(enquiries);
      return;
    }

    const filtered = enquiries.filter(
      (enquiry) =>
        enquiry.student_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        enquiry.contact_number.includes(searchQuery)
    );
    setFilteredEnquiries(filtered);
  };

  const renderEnquiryItem = ({ item }) => (
    <View style={[styles.enquiryCard, { backgroundColor: colors.white }]}>
      <View style={styles.enquiryHeader}>
        <Text style={[styles.studentName, { color: colors.text }]}>
          {item.student_name}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(item.enquiry_date)}
        </Text>
      </View>

      <View style={styles.enquiryDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.contact_number}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="school" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.course}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="business" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.franchisee}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.enquiryFooter,
          { borderTopColor: isDark ? "#374151" : "#F0F0F0" },
        ]}
      >
        <View style={styles.footerInfo}>
          <Text style={[styles.counsellor, { color: colors.textSecondary }]}>
            Counsellor: {item.counsellor_name || "N/A"}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          {item.register_status === "1" ? (
            <Text style={[styles.registeredText, { color: colors.success }]}>
              Registered
            </Text>
          ) : (
            <>
              {loadingRegistrationId === item.id ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginRight: 8 }}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => handleRegistration(item)}
                  style={styles.iconButton}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => handleViewDetails(item.id)}
                style={styles.iconButton}
              >
                <Ionicons name="eye-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="document-text-outline"
        size={64}
        color={colors.disabled}
      />
      <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
        No Enquiries Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.placeholder }]}>
        {searchQuery
          ? "Try adjusting your search"
          : "Create your first enquiry"}
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
          Enquiry List
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("StudentEnquiry", { editData: null })
          }
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.white }]}>
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
                Enquiry Details
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
              selectedEnquiry && (
                <>
                  <ScrollView
                    style={styles.detailsScroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                  >
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
                        {selectedEnquiry.student_name}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Date
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {formatDate(selectedEnquiry.enquiry_date)}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Contact Number
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedEnquiry.contact_number}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        WhatsApp Number
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedEnquiry.whatsapp_number || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Course
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedEnquiry.course}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Franchisee
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedEnquiry.franchisee}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Mode of Reference
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedEnquiry.reference_mode || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Counsellor
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedEnquiry.counsellor_name || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Place
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedEnquiry.place || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Remarks
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {selectedEnquiry.remarks || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Follow Up 1
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {formatDateTime(selectedEnquiry.follow_up_1)}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Follow Up 2
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {formatDateTime(selectedEnquiry.follow_up_2)}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Follow Up 3
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {formatDateTime(selectedEnquiry.follow_up_3)}
                      </Text>
                    </View>
                  </ScrollView>
                  <View
                    style={[
                      styles.modalFooter,
                      { borderTopColor: isDark ? "#374151" : "#F0F0F0" },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.editButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={handleEditEnquiry}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={colors.white}
                      />
                      <Text
                        style={[styles.editButtonText, { color: colors.white }]}
                      >
                        Edit Details
                      </Text>
                    </TouchableOpacity>
                  </View>
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
    fontWeight: "bold",
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  enquiryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enquiryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  date: {
    fontSize: 12,
  },
  enquiryDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  enquiryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerInfo: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  registeredText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  counsellor: {
    fontSize: 12,
    fontStyle: "italic",
  },
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
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "80%",
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsScroll: {
    flex: 1,
    padding: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  detailItem: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EnquiryListScreen;
