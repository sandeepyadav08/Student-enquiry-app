import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../api/apiService";
import { useTheme } from "../context/ThemeContext";
import COLORS from "../constants/colors";

const PaymentHistoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrationMapping, setRegistrationMapping] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    // Handle the API date format: "10-01-2026 03:14 PM"
    if (dateString.includes(" ")) {
      return dateString; // Return full date and time
    }

    // Fallback for other date formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB").replace(/\//g, "-");
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchPaymentHistory();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchPaymentHistory = async () => {
    try {
      const [historyResponse, regResponse] = await Promise.all([
        ApiService.getPaymentHistory(),
        ApiService.getRegistrations(),
      ]);

      if (regResponse && regResponse.data) {
        const regData = Array.isArray(regResponse.data)
          ? regResponse.data
          : [regResponse.data];
        const mapping = {};
        regData.forEach((item) => {
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
      console.error("Fetch Payment History Error:", error);
      Alert.alert("Error", "Failed to fetch payment history");
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (item) => {
    if (item.student_name) return item.student_name;
    if (!item.registration_no) return "N/A";

    const key = item.registration_no.toString().trim().toUpperCase();
    return registrationMapping[key] || "N/A";
  };

  const handleViewPaymentDetails = async (item) => {
    try {
      setLoadingDetails(true);
      const paymentId = item.id || item.payment_id || item.fee_id;

      if (!paymentId) {
        Alert.alert("Error", "Payment ID not found");
        return;
      }

      const response = await ApiService.getPaymentDetails(paymentId);

      if (
        response &&
        (response.status === 201 || response.status === true) &&
        response.data
      ) {
        setSelectedPaymentDetails({
          item,
          details: response.data,
          studentName: getStudentName(item),
        });
        setModalVisible(true);
      } else {
        Alert.alert("Error", "Failed to fetch payment details");
      }
    } catch (error) {
      console.error("Fetch Payment Details Error:", error);
      Alert.alert(
        "Error",
        "Failed to fetch payment details. Please try again."
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const renderPaymentItem = ({ item }) => (
    <View
      style={[
        styles.paymentCard,
        {
          backgroundColor: colors.white,
          borderColor: isDark ? "#374151" : "#F0F0F0",
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.placeholder }]}>
            REGISTRATION NO
          </Text>
          <Text style={[styles.regNoValue, { color: colors.primary }]}>
            {item.registration_no}
          </Text>
        </View>
        <View style={styles.dateContainer}>
          <Text
            style={[
              styles.label,
              { color: colors.placeholder, textAlign: "right" },
            ]}
          >
            DATE
          </Text>
          <Text style={[styles.dateValue, { color: colors.text }]}>
            {formatDate(item.fee_date)}
          </Text>
        </View>
      </View>

      <View style={styles.studentNameContainer}>
        <Text style={[styles.label, { color: colors.placeholder }]}>
          STUDENT NAME
        </Text>
        <Text style={[styles.studentNameValue, { color: colors.text }]}>
          {getStudentName(item)}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={[styles.cardBody, { gap: 12 }]}>
        <View
          style={[
            styles.amountRow,
            { backgroundColor: isDark ? "#1F2937" : "#F9F9F9" },
          ]}
        >
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: colors.placeholder }]}>
              Total Fees
            </Text>
            <Text style={[styles.amountValue, { color: colors.text }]}>
              ₹{item.total_fees}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: colors.success }]}>
              Paid Fees
            </Text>
            <Text style={[styles.amountValue, { color: colors.success }]}>
              ₹{item.paid_fees}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: colors.error }]}>
              Due Fees
            </Text>
            <Text style={[styles.amountValue, { color: colors.error }]}>
              ₹{item.due_fees}
            </Text>
          </View>
        </View>

        <View style={styles.paymentInfoRow}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              flex: 1,
            }}
          >
            <Ionicons
              name="card-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.paymentInfoText, { color: colors.textSecondary }]}
            >
              Paid Through: {item.paid_through}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleViewPaymentDetails(item)}>
            <Ionicons name="eye-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {item.remarks ? (
          <View style={styles.paymentInfoRow}>
            <Ionicons
              name="chatbubble-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.paymentInfoText}>{item.remarks}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContent}>
      <Ionicons
        name="receipt-outline"
        size={64}
        color={isDark ? "#4B5563" : "#E5E7EB"}
      />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No payment history found
      </Text>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.screenBackground }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.white },
          { paddingTop: 50, paddingBottom: 20 },
        ]}
      >
        <View style={{ width: 40 }} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Payment History
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPaymentItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchPaymentHistory}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Payment Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
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
                Payment Details
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loadingDetails ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              selectedPaymentDetails && (
                <ScrollView
                  style={styles.detailsScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Student Information Section */}
                  <View style={styles.detailSection}>
                    <Text
                      style={[styles.sectionHeading, { color: colors.primary }]}
                    >
                      Student Information
                    </Text>

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
                        {selectedPaymentDetails.item.registration_no}
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
                        {selectedPaymentDetails.studentName}
                      </Text>
                    </View>
                  </View>

                  {/* Fee Summary Section */}
                  <View style={styles.detailSection}>
                    <Text
                      style={[styles.sectionHeading, { color: colors.primary }]}
                    >
                      Fee Summary
                    </Text>

                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Total Fees
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        ₹{selectedPaymentDetails.details.fee.total_fees}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text
                        style={[styles.detailLabel, { color: colors.success }]}
                      >
                        Paid Fees
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.success }]}
                      >
                        ₹{selectedPaymentDetails.details.fee.paid_fees}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text
                        style={[styles.detailLabel, { color: colors.error }]}
                      >
                        Due Fees
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.error }]}
                      >
                        ₹{selectedPaymentDetails.details.fee.due_fees}
                      </Text>
                    </View>
                  </View>

                  {/* Payment Transactions Section */}
                  <View style={[styles.detailSection, { marginBottom: 40 }]}>
                    <Text
                      style={[styles.sectionHeading, { color: colors.primary }]}
                    >
                      Payment Transactions
                    </Text>
                    {selectedPaymentDetails.details.payments &&
                    selectedPaymentDetails.details.payments.length > 0 ? (
                      selectedPaymentDetails.details.payments.map(
                        (payment, index) => (
                          <View
                            key={index}
                            style={[
                              styles.transactionCard,
                              {
                                backgroundColor: isDark ? "#111827" : "#F9F9F9",
                              },
                            ]}
                          >
                            <View style={styles.transactionHeader}>
                              <Text
                                style={[
                                  styles.transactionNumber,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                #{index + 1}
                              </Text>
                              <Text
                                style={[
                                  styles.transactionAmount,
                                  { color: colors.success },
                                ]}
                              >
                                ₹{payment.amount || "0.00"}
                              </Text>
                            </View>
                            <View style={styles.transactionDetails}>
                              <Text
                                style={[
                                  styles.transactionText,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                Method: {payment.payment_method || "N/A"}
                              </Text>
                              <Text
                                style={[
                                  styles.transactionText,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                Date: {formatDate(payment.payment_date)}
                              </Text>
                              <Text
                                style={[
                                  styles.transactionText,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                Received By: {payment.received_by || "N/A"}
                              </Text>
                            </View>
                          </View>
                        )
                      )
                    ) : (
                      <Text
                        style={[
                          styles.noTransactions,
                          { color: colors.placeholder },
                        ]}
                      >
                        No transactions found
                      </Text>
                    )}
                  </View>
                </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  paymentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  regNoValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  studentNameContainer: {
    marginBottom: 12,
  },
  studentNameValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateContainer: {
    alignItems: "flex-end",
  },
  dateValue: {
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  cardBody: {
    gap: 12,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
  },
  amountItem: {
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  paymentInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paymentInfoText: {
    fontSize: 13,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
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
    padding: 24,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
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
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionNumber: {
    fontSize: 12,
    fontWeight: "600",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionDetails: {
    gap: 4,
  },
  transactionText: {
    fontSize: 13,
  },
  noTransactions: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});

export default PaymentHistoryScreen;
