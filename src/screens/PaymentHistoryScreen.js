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
import COLORS from "../constants/colors";

const PaymentHistoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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
    <View style={styles.paymentCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.regNoLabel}>Registration No</Text>
          <Text style={styles.regNoValue}>{item.registration_no}</Text>
          <Text style={[styles.regNoLabel, { marginTop: 4 }]}>
            Student Name
          </Text>
          <Text style={styles.studentNameValue}>{getStudentName(item)}</Text>
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
            <Text style={[styles.amountLabel, { color: COLORS.success }]}>
              Paid Fees
            </Text>
            <Text style={[styles.amountValue, { color: COLORS.success }]}>
              ₹{item.paid_fees}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: COLORS.error }]}>
              Due Fees
            </Text>
            <Text style={[styles.amountValue, { color: COLORS.error }]}>
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
              color={COLORS.textSecondary}
            />
            <Text style={styles.paymentInfoText}>
              Paid Through: {item.paid_through}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleViewPaymentDetails(item)}>
            <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {item.remarks ? (
          <View style={styles.paymentInfoRow}>
            <Ionicons
              name="chatbubble-outline"
              size={16}
              color={COLORS.textSecondary}
            />
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
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 20), paddingBottom: 20 },
        ]}
      >
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

      {/* Payment Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payment Details</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {selectedPaymentDetails && (
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Student Info Card */}
              <View style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.detailCardTitle}>
                    Student Information
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Registration No</Text>
                  <Text style={styles.detailValue}>
                    {selectedPaymentDetails.item.registration_no}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Student Name</Text>
                  <Text style={styles.detailValue}>
                    {selectedPaymentDetails.studentName}
                  </Text>
                </View>
              </View>

              {/* Fee Summary Card */}
              <View style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <Ionicons
                    name="calculator-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.detailCardTitle}>Fee Summary</Text>
                </View>
                <View style={styles.feeGrid}>
                  <View style={styles.feeItem}>
                    <Text style={styles.feeLabel}>Total Fees</Text>
                    <Text
                      style={styles.feeValue}
                      adjustsFontSizeToFit={true}
                      numberOfLines={1}
                      minimumFontScale={0.7}
                    >
                      ₹{selectedPaymentDetails.details.fee.total_fees}
                    </Text>
                  </View>
                  <View style={[styles.feeItem, styles.successFee]}>
                    <Text style={[styles.feeLabel, { color: COLORS.success }]}>
                      Paid Fees
                    </Text>
                    <Text
                      style={[styles.feeValue, { color: COLORS.success }]}
                      adjustsFontSizeToFit={true}
                      numberOfLines={1}
                      minimumFontScale={0.7}
                    >
                      ₹{selectedPaymentDetails.details.fee.paid_fees}
                    </Text>
                  </View>
                  <View style={[styles.feeItem, styles.errorFee]}>
                    <Text style={[styles.feeLabel, { color: COLORS.error }]}>
                      Due Fees
                    </Text>
                    <Text
                      style={[styles.feeValue, { color: COLORS.error }]}
                      adjustsFontSizeToFit={true}
                      numberOfLines={1}
                      minimumFontScale={0.7}
                    >
                      ₹{selectedPaymentDetails.details.fee.due_fees}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Payment History Card */}
              <View style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <Ionicons
                    name="receipt-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.detailCardTitle}>
                    Payment Transactions
                  </Text>
                </View>
                {selectedPaymentDetails.details.payments &&
                selectedPaymentDetails.details.payments.length > 0 ? (
                  selectedPaymentDetails.details.payments.map(
                    (payment, index) => (
                      <View key={index} style={styles.transactionCard}>
                        <View style={styles.transactionHeader}>
                          <Text style={styles.transactionNumber}>
                            #{index + 1}
                          </Text>
                          <Text style={styles.transactionAmount}>
                            ₹{payment.amount || "0.00"}
                          </Text>
                        </View>
                        <View style={styles.transactionDetails}>
                          <View style={styles.transactionRow}>
                            <Ionicons
                              name="person-outline"
                              size={14}
                              color={COLORS.textSecondary}
                            />
                            <Text style={styles.transactionText}>
                              Received By:{" "}
                              {payment.received_by || "Not Specified"}
                            </Text>
                          </View>
                          <View style={styles.transactionRow}>
                            <Ionicons
                              name="card-outline"
                              size={14}
                              color={COLORS.textSecondary}
                            />
                            <Text style={styles.transactionText}>
                              Method: {payment.payment_method || "N/A"}
                            </Text>
                          </View>
                          <View style={styles.transactionRow}>
                            <Ionicons
                              name={
                                payment.payment_status === "Success"
                                  ? "checkmark-circle-outline"
                                  : "close-circle-outline"
                              }
                              size={14}
                              color={
                                payment.payment_status === "Success"
                                  ? COLORS.success
                                  : COLORS.error
                              }
                            />
                            <Text style={styles.transactionText}>
                              Status: {payment.payment_status || "Success"}
                            </Text>
                          </View>
                          <View style={styles.transactionRow}>
                            <Ionicons
                              name="calendar-outline"
                              size={14}
                              color={COLORS.textSecondary}
                            />
                            <Text style={styles.transactionText}>
                              Date: {formatDate(payment.payment_date)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )
                  )
                ) : (
                  <View style={styles.noTransactions}>
                    <Ionicons
                      name="receipt-outline"
                      size={32}
                      color={COLORS.disabled}
                    />
                    <Text style={styles.noTransactionsText}>
                      No payment transactions found
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
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
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  regNoLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  regNoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  studentNameValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  dateContainer: {
    alignItems: "flex-end",
  },
  dateLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 12,
  },
  cardBody: {
    gap: 12,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 12,
  },
  amountItem: {
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  paymentInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paymentInfoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.placeholder,
    textAlign: "center",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.screenBackground,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  detailCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  feeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  feeItem: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 70,
  },
  successFee: {
    backgroundColor: "#F0F9F0",
  },
  errorFee: {
    backgroundColor: "#FFF0F0",
  },
  feeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 6,
    textAlign: "center",
  },
  feeValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  transactionCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.success,
  },
  transactionDetails: {
    gap: 6,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transactionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  noTransactions: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noTransactionsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});

export default PaymentHistoryScreen;
