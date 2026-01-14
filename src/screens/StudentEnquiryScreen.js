import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import CustomPicker from "../components/CustomPicker";
import ApiService from "../api/apiService";
import { useTheme } from "../context/ThemeContext";

const initialFormData = {
  date: new Date(),
  studentName: "",
  contactNumber: "",
  whatsappNumber: "",
  courseEnquiry: "",
  modeOfReference: "",
  place: "",
  counsellorName: "",
  franchisee: "",
  remarks: "",
  followUp1: new Date(),
  followUp2: null,
  followUp3: null,
};

const StudentEnquiryScreen = ({ navigation, route }) => {
  const { editData } = route.params || {};
  const { colors, isDark } = useTheme();

  const [formData, setFormData] = useState(initialFormData);

  // Helper function to validate and parse dates
  const parseValidDate = (dateString) => {
    if (
      !dateString ||
      dateString === "" ||
      dateString === null ||
      dateString === undefined
    ) {
      return null;
    }

    // Check for invalid date formats like "0000-00-00" or "0000-00-00 00:00:00"
    if (
      dateString.includes("0000-00-00") ||
      dateString === "0000-00-00" ||
      dateString === "0000-00-00 00:00:00"
    ) {
      return null;
    }

    // Check if it's just zeros or invalid patterns
    if (dateString.match(/^0+[^1-9]*$/) || dateString.includes("00:00:00")) {
      return null;
    }

    const date = new Date(dateString);

    // Check if date is valid and not a weird date like year < 1900
    if (
      isNaN(date.getTime()) ||
      date.getFullYear() < 1900 ||
      date.getFullYear() > 2100
    ) {
      return null;
    }

    return date;
  };

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [franchisees, setFranchisees] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFollowUpDatePicker, setShowFollowUpDatePicker] = useState(false);
  const [showFollowUpTimePicker, setShowFollowUpTimePicker] = useState(false);
  const [showFollowUp2DatePicker, setShowFollowUp2DatePicker] = useState(false);
  const [showFollowUp2TimePicker, setShowFollowUp2TimePicker] = useState(false);
  const [showFollowUp3DatePicker, setShowFollowUp3DatePicker] = useState(false);
  const [showFollowUp3TimePicker, setShowFollowUp3TimePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Clear form when screen is focused, but only if not in edit mode
      if (!editData) {
        setFormData(initialFormData);
        setErrors({});
      }
      return () => {};
    }, [editData])
  );

  useEffect(() => {
    if (editData) {
      // Parse enquiry date with special handling for invalid dates
      let enquiryDate = new Date();
      if (
        editData.enquiry_date &&
        editData.enquiry_date !== "0000-00-00" &&
        editData.enquiry_date !== ""
      ) {
        const parsedEnquiryDate = new Date(editData.enquiry_date);
        if (
          !isNaN(parsedEnquiryDate.getTime()) &&
          parsedEnquiryDate.getFullYear() > 1900
        ) {
          enquiryDate = parsedEnquiryDate;
        }
      }

      setFormData({
        date: enquiryDate,
        studentName: editData.student_name || "",
        contactNumber: editData.contact_number || "",
        whatsappNumber: editData.whatsapp_number || "",
        courseEnquiry: editData.course || "",
        modeOfReference: editData.reference_mode || "",
        place: editData.place || "",
        counsellorName: editData.counsellor_name || "",
        franchisee: editData.franchisee || "",
        remarks: editData.remarks || "",
        followUp1: editData.follow_up_1
          ? new Date(editData.follow_up_1)
          : new Date(),
        followUp2: parseValidDate(editData.follow_up_2),
        followUp3: parseValidDate(editData.follow_up_3),
      });
    } else {
      setFormData({
        date: new Date(),
        studentName: "",
        contactNumber: "",
        whatsappNumber: "",
        courseEnquiry: "",
        modeOfReference: "",
        place: "",
        counsellorName: "",
        franchisee: "",
        remarks: "",
        followUp1: new Date(),
        followUp2: null,
        followUp3: null,
      });
    }
  }, [editData]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [courseRes, franchiseeRes] = await Promise.all([
        ApiService.getCourses(),
        ApiService.getFranchisees(),
      ]);

      if (courseRes.data) {
        const courseItems = courseRes.data.map((item) => ({
          label: item.course_name || item.name || item,
          value: item.course_name || item.name || item,
        }));
        setCourses(courseItems);
      }

      if (franchiseeRes.data) {
        const franchiseeItems = franchiseeRes.data.map((item) => ({
          label: item.franchisee_name || item.name || item,
          value: item.franchisee_name || item.name || item,
        }));
        setFranchisees(franchiseeItems);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = "Student name is required";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 10 digits";
    }

    if (formData.whatsappNumber && !/^\d{10}$/.test(formData.whatsappNumber)) {
      newErrors.whatsappNumber = "WhatsApp number must be 10 digits";
    }

    if (!formData.courseEnquiry) {
      newErrors.courseEnquiry = "Course selection is required";
    }

    if (!formData.franchisee) {
      newErrors.franchisee = "Franchisee selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    navigation.navigate("EnquiryList");
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Helper function to format date as YYYY-MM-DD
      const formatDateForBackend = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
      };

      // Helper function to format datetime as YYYY-MM-DD HH:MM:SS (MySQL format)
      const formatDateTimeForBackend = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = "00";
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const submissionData = {
        enquiry_date: formatDateForBackend(formData.date),
        student_name: formData.studentName,
        contact_number: formData.contactNumber,
        whatsapp_number: formData.whatsappNumber || "",
        course: formData.courseEnquiry,
        reference_mode: formData.modeOfReference || "",
        place: formData.place || "",
        counsellor_name: formData.counsellorName || "",
        franchisee: formData.franchisee,
        remarks: formData.remarks || "",
        follow_up_1:
          formData.followUp1 instanceof Date
            ? formatDateTimeForBackend(formData.followUp1)
            : formatDateTimeForBackend(new Date()),
      };

      // For updates, always send all follow-up fields (including null values)
      // For new entries, only send if they have values
      if (editData?.id) {
        // Update mode - send all follow-up fields
        submissionData.follow_up_2 =
          formData.followUp2 instanceof Date
            ? formatDateTimeForBackend(formData.followUp2)
            : null;
        submissionData.follow_up_3 =
          formData.followUp3 instanceof Date
            ? formatDateTimeForBackend(formData.followUp3)
            : null;
      } else {
        // Create mode - only send if they have values
        if (formData.followUp2 instanceof Date) {
          submissionData.follow_up_2 = formatDateTimeForBackend(
            formData.followUp2
          );
        }
        if (formData.followUp3 instanceof Date) {
          submissionData.follow_up_3 = formatDateTimeForBackend(
            formData.followUp3
          );
        }
      }

      if (editData?.id) {
        await ApiService.updateEnquiry(editData.id, submissionData);
        Alert.alert("Success", "Enquiry updated successfully", [
          { text: "OK", onPress: () => handleBack() },
        ]);
      } else {
        await ApiService.createEnquiry(submissionData);
        setFormData(initialFormData);
        setErrors({});
        Alert.alert("Success", "Enquiry created successfully", [
          { text: "OK", onPress: () => handleBack() },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create enquiry");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setFormData((prev) => ({ ...prev, date: selectedDate }));
    }
  };

  const confirmIOSDate = () => {
    setShowDatePicker(false);
  };

  const handleNumericInput = (field, value) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    updateFormData(field, numericValue);
  };

  const handleFollowUpDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowFollowUpDatePicker(false);
    }
    if (selectedDate) {
      const updatedDate = new Date(formData.followUp1);
      updatedDate.setFullYear(selectedDate.getFullYear());
      updatedDate.setMonth(selectedDate.getMonth());
      updatedDate.setDate(selectedDate.getDate());
      setFormData((prev) => ({ ...prev, followUp1: updatedDate }));
    }
  };

  const handleFollowUpTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") {
      setShowFollowUpTimePicker(false);
    }
    if (selectedTime) {
      const updatedDate = new Date(formData.followUp1);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setFormData((prev) => ({ ...prev, followUp1: updatedDate }));
    }
  };

  const handleFollowUp2DateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowFollowUp2DatePicker(false);
    }
    if (selectedDate) {
      const updatedDate =
        formData.followUp2 instanceof Date
          ? new Date(formData.followUp2)
          : new Date();
      updatedDate.setFullYear(selectedDate.getFullYear());
      updatedDate.setMonth(selectedDate.getMonth());
      updatedDate.setDate(selectedDate.getDate());
      setFormData((prev) => ({ ...prev, followUp2: updatedDate }));
    }
  };

  const handleFollowUp2TimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") {
      setShowFollowUp2TimePicker(false);
    }
    if (selectedTime) {
      const updatedDate =
        formData.followUp2 instanceof Date
          ? new Date(formData.followUp2)
          : new Date();
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setFormData((prev) => ({ ...prev, followUp2: updatedDate }));
    }
  };

  const handleFollowUp3DateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowFollowUp3DatePicker(false);
    }
    if (selectedDate) {
      const updatedDate =
        formData.followUp3 instanceof Date
          ? new Date(formData.followUp3)
          : new Date();
      updatedDate.setFullYear(selectedDate.getFullYear());
      updatedDate.setMonth(selectedDate.getMonth());
      updatedDate.setDate(selectedDate.getDate());
      setFormData((prev) => ({ ...prev, followUp3: updatedDate }));
    }
  };

  const handleFollowUp3TimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") {
      setShowFollowUp3TimePicker(false);
    }
    if (selectedTime) {
      const updatedDate =
        formData.followUp3 instanceof Date
          ? new Date(formData.followUp3)
          : new Date();
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setFormData((prev) => ({ ...prev, followUp3: updatedDate }));
    }
  };

  const confirmIOSFollowUpDate = () => {
    setShowFollowUpDatePicker(false);
  };

  const confirmIOSFollowUpTime = () => {
    setShowFollowUpTimePicker(false);
  };

  const confirmIOSFollowUp2Date = () => {
    setShowFollowUp2DatePicker(false);
  };

  const confirmIOSFollowUp2Time = () => {
    setShowFollowUp2TimePicker(false);
  };

  const confirmIOSFollowUp3Date = () => {
    setShowFollowUp3DatePicker(false);
  };

  const confirmIOSFollowUp3Time = () => {
    setShowFollowUp3TimePicker(false);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.screenBackground }]}
    >
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {editData ? "Edit Enquiry" : "Student Enquiry"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <View pointerEvents="none">
              <CustomInput
                label="Date"
                value={
                  formData.date instanceof Date
                    ? formData.date
                        .toLocaleDateString("en-GB")
                        .replace(/\//g, "-")
                    : ""
                }
                editable={false}
                placeholder="DD-MM-YYYY"
              />
            </View>
          </TouchableOpacity>

          {showDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={formData.date instanceof Date ? formData.date : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {Platform.OS === "ios" && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalContainer}>
                <View
                  style={[
                    styles.modalContent,
                    { backgroundColor: colors.white },
                  ]}
                >
                  <View
                    style={[
                      styles.modalHeader,
                      {
                        borderBottomColor: isDark ? "#374151" : "#F0F0F0",
                        backgroundColor: colors.white,
                      },
                    ]}
                  >
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text
                        style={[styles.modalButton, { color: colors.text }]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmIOSDate}>
                      <Text
                        style={[
                          styles.modalButton,
                          styles.doneButton,
                          { color: colors.primary },
                        ]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={
                      formData.date instanceof Date ? formData.date : new Date()
                    }
                    mode="date"
                    display="inline"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    style={styles.iosDatePicker}
                    themeVariant={isDark ? "dark" : "light"}
                  />
                </View>
              </View>
            </Modal>
          )}

          <CustomInput
            label="Student Name *"
            value={formData.studentName}
            onChangeText={(value) => updateFormData("studentName", value)}
            placeholder="Enter student name"
            error={errors.studentName}
            autoCapitalize="words"
          />

          <CustomInput
            label="Contact Number *"
            value={formData.contactNumber}
            onChangeText={(value) => handleNumericInput("contactNumber", value)}
            placeholder="Enter 10-digit contact number"
            keyboardType="numeric"
            error={errors.contactNumber}
            maxLength={10}
          />

          <CustomInput
            label="WhatsApp Number"
            value={formData.whatsappNumber}
            onChangeText={(value) =>
              handleNumericInput("whatsappNumber", value)
            }
            placeholder="Enter 10-digit WhatsApp number"
            keyboardType="numeric"
            error={errors.whatsappNumber}
            maxLength={10}
          />

          <CustomPicker
            label="Course for Enquiry *"
            selectedValue={formData.courseEnquiry}
            onValueChange={(value) => updateFormData("courseEnquiry", value)}
            items={courses}
            placeholder="Select course"
            error={errors.courseEnquiry}
          />

          <CustomInput
            label="Mode of Reference"
            value={formData.modeOfReference}
            onChangeText={(value) => updateFormData("modeOfReference", value)}
            placeholder="Enter mode of reference"
          />

          <CustomInput
            label="Place"
            value={formData.place}
            onChangeText={(value) => updateFormData("place", value)}
            placeholder="Enter place"
          />

          <CustomInput
            label="Counsellor Name"
            value={formData.counsellorName}
            onChangeText={(value) => updateFormData("counsellorName", value)}
            placeholder="Enter counsellor name"
            autoCapitalize="words"
          />

          <CustomPicker
            label="Franchisee *"
            selectedValue={formData.franchisee}
            onValueChange={(value) => updateFormData("franchisee", value)}
            items={franchisees}
            placeholder="Select franchisee"
            error={errors.franchisee}
          />

          <CustomInput
            label="Remarks"
            value={formData.remarks}
            onChangeText={(value) => updateFormData("remarks", value)}
            placeholder="Enter remarks"
            multiline
          />

          <Text style={[styles.followUpLabel, { color: colors.text }]}>
            Follow Up 1
          </Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[
                styles.dateButton,
                { borderColor: isDark ? "#374151" : "#E5E7EB" },
              ]}
              onPress={() => setShowFollowUpDatePicker(true)}
            >
              <Text style={[styles.dateButtonText, { color: colors.text }]}>
                {formData.followUp1 instanceof Date
                  ? formData.followUp1
                      .toLocaleDateString("en-GB")
                      .replace(/\//g, "-")
                  : "12-01-2026"}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.timeButton,
                { borderColor: isDark ? "#374151" : "#E5E7EB" },
              ]}
              onPress={() => setShowFollowUpTimePicker(true)}
            >
              <Text style={[styles.timeButtonText, { color: colors.text }]}>
                {formData.followUp1 instanceof Date
                  ? formData.followUp1.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "11:07 AM"}
              </Text>
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {showFollowUpDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={
                formData.followUp1 instanceof Date
                  ? formData.followUp1
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={handleFollowUpDateChange}
              minimumDate={new Date()}
              themeVariant={isDark ? "dark" : "light"}
            />
          )}

          {showFollowUpTimePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={
                formData.followUp1 instanceof Date
                  ? formData.followUp1
                  : new Date()
              }
              mode="time"
              display="default"
              onChange={handleFollowUpTimeChange}
              themeVariant={isDark ? "dark" : "light"}
            />
          )}

          {showFollowUp2DatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={
                formData.followUp2 instanceof Date
                  ? formData.followUp2
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={handleFollowUp2DateChange}
              minimumDate={new Date()}
              themeVariant={isDark ? "dark" : "light"}
            />
          )}

          {showFollowUp2TimePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={
                formData.followUp2 instanceof Date
                  ? formData.followUp2
                  : new Date()
              }
              mode="time"
              display="default"
              onChange={handleFollowUp2TimeChange}
              themeVariant={isDark ? "dark" : "light"}
            />
          )}

          {showFollowUp3DatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={
                formData.followUp3 instanceof Date
                  ? formData.followUp3
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={handleFollowUp3DateChange}
              minimumDate={new Date()}
              themeVariant={isDark ? "dark" : "light"}
            />
          )}

          {showFollowUp3TimePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={
                formData.followUp3 instanceof Date
                  ? formData.followUp3
                  : new Date()
              }
              mode="time"
              display="default"
              onChange={handleFollowUp3TimeChange}
              themeVariant={isDark ? "dark" : "light"}
            />
          )}

          {Platform.OS === "ios" && (
            <>
              <Modal
                transparent={true}
                animationType="slide"
                visible={showFollowUpDatePicker}
                onRequestClose={() => setShowFollowUpDatePicker(false)}
              >
                <View style={styles.modalContainer}>
                  <View
                    style={[
                      styles.modalContent,
                      { backgroundColor: colors.white },
                    ]}
                  >
                    <View
                      style={[
                        styles.modalHeader,
                        {
                          borderBottomColor: isDark ? "#374151" : "#F0F0F0",
                          backgroundColor: colors.white,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setShowFollowUpDatePicker(false)}
                      >
                        <Text
                          style={[styles.modalButton, { color: colors.text }]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={confirmIOSFollowUpDate}>
                        <Text
                          style={[
                            styles.modalButton,
                            styles.doneButton,
                            { color: colors.primary },
                          ]}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={
                        formData.followUp1 instanceof Date
                          ? formData.followUp1
                          : new Date()
                      }
                      mode="date"
                      display="inline"
                      onChange={handleFollowUpDateChange}
                      minimumDate={new Date()}
                      style={styles.iosDatePicker}
                      themeVariant={isDark ? "dark" : "light"}
                    />
                  </View>
                </View>
              </Modal>

              <Modal
                transparent={true}
                animationType="slide"
                visible={showFollowUpTimePicker}
                onRequestClose={() => setShowFollowUpTimePicker(false)}
              >
                <View style={styles.modalContainer}>
                  <View
                    style={[
                      styles.modalContent,
                      { backgroundColor: colors.white },
                    ]}
                  >
                    <View
                      style={[
                        styles.modalHeader,
                        {
                          borderBottomColor: isDark ? "#374151" : "#F0F0F0",
                          backgroundColor: colors.white,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setShowFollowUpTimePicker(false)}
                      >
                        <Text
                          style={[styles.modalButton, { color: colors.text }]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={confirmIOSFollowUpTime}>
                        <Text
                          style={[
                            styles.modalButton,
                            styles.doneButton,
                            { color: colors.primary },
                          ]}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={
                        formData.followUp1 instanceof Date
                          ? formData.followUp1
                          : new Date()
                      }
                      mode="time"
                      display="inline"
                      onChange={handleFollowUpTimeChange}
                      style={styles.iosDatePicker}
                      themeVariant={isDark ? "dark" : "light"}
                    />
                  </View>
                </View>
              </Modal>

              <Modal
                transparent={true}
                animationType="slide"
                visible={showFollowUp2DatePicker}
                onRequestClose={() => setShowFollowUp2DatePicker(false)}
              >
                <View style={styles.modalContainer}>
                  <View
                    style={[
                      styles.modalContent,
                      { backgroundColor: colors.white },
                    ]}
                  >
                    <View
                      style={[
                        styles.modalHeader,
                        {
                          borderBottomColor: isDark ? "#374151" : "#F0F0F0",
                          backgroundColor: colors.white,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setShowFollowUp2DatePicker(false)}
                      >
                        <Text
                          style={[styles.modalButton, { color: colors.text }]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={confirmIOSFollowUp2Date}>
                        <Text
                          style={[
                            styles.modalButton,
                            styles.doneButton,
                            { color: colors.primary },
                          ]}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={
                        formData.followUp2 instanceof Date
                          ? formData.followUp2
                          : new Date()
                      }
                      mode="date"
                      display="inline"
                      onChange={handleFollowUp2DateChange}
                      minimumDate={new Date()}
                      style={styles.iosDatePicker}
                      themeVariant={isDark ? "dark" : "light"}
                    />
                  </View>
                </View>
              </Modal>

              <Modal
                transparent={true}
                animationType="slide"
                visible={showFollowUp2TimePicker}
                onRequestClose={() => setShowFollowUp2TimePicker(false)}
              >
                <View style={styles.modalContainer}>
                  <View
                    style={[
                      styles.modalContent,
                      { backgroundColor: colors.white },
                    ]}
                  >
                    <View
                      style={[
                        styles.modalHeader,
                        {
                          borderBottomColor: isDark ? "#374151" : "#F0F0F0",
                          backgroundColor: colors.white,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setShowFollowUp2TimePicker(false)}
                      >
                        <Text
                          style={[styles.modalButton, { color: colors.text }]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={confirmIOSFollowUp2Time}>
                        <Text
                          style={[
                            styles.modalButton,
                            styles.doneButton,
                            { color: colors.primary },
                          ]}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={
                        formData.followUp2 instanceof Date
                          ? formData.followUp2
                          : new Date()
                      }
                      mode="time"
                      display="inline"
                      onChange={handleFollowUp2TimeChange}
                      style={styles.iosDatePicker}
                      themeVariant={isDark ? "dark" : "light"}
                    />
                  </View>
                </View>
              </Modal>

              <Modal
                transparent={true}
                animationType="slide"
                visible={showFollowUp3DatePicker}
                onRequestClose={() => setShowFollowUp3DatePicker(false)}
              >
                <View style={styles.modalContainer}>
                  <View
                    style={[
                      styles.modalContent,
                      { backgroundColor: colors.white },
                    ]}
                  >
                    <View
                      style={[
                        styles.modalHeader,
                        {
                          borderBottomColor: isDark ? "#374151" : "#F0F0F0",
                          backgroundColor: colors.white,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setShowFollowUp3DatePicker(false)}
                      >
                        <Text
                          style={[styles.modalButton, { color: colors.text }]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={confirmIOSFollowUp3Date}>
                        <Text
                          style={[
                            styles.modalButton,
                            styles.doneButton,
                            { color: colors.primary },
                          ]}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={
                        formData.followUp3 instanceof Date
                          ? formData.followUp3
                          : new Date()
                      }
                      mode="date"
                      display="inline"
                      onChange={handleFollowUp3DateChange}
                      minimumDate={new Date()}
                      style={styles.iosDatePicker}
                      themeVariant={isDark ? "dark" : "light"}
                    />
                  </View>
                </View>
              </Modal>

              <Modal
                transparent={true}
                animationType="slide"
                visible={showFollowUp3TimePicker}
                onRequestClose={() => setShowFollowUp3TimePicker(false)}
              >
                <View style={styles.modalContainer}>
                  <View
                    style={[
                      styles.modalContent,
                      { backgroundColor: colors.white },
                    ]}
                  >
                    <View
                      style={[
                        styles.modalHeader,
                        {
                          borderBottomColor: isDark ? "#374151" : "#F0F0F0",
                          backgroundColor: colors.white,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setShowFollowUp3TimePicker(false)}
                      >
                        <Text
                          style={[styles.modalButton, { color: colors.text }]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={confirmIOSFollowUp3Time}>
                        <Text
                          style={[
                            styles.modalButton,
                            styles.doneButton,
                            { color: colors.primary },
                          ]}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={
                        formData.followUp3 instanceof Date
                          ? formData.followUp3
                          : new Date()
                      }
                      mode="time"
                      display="inline"
                      onChange={handleFollowUp3TimeChange}
                      style={styles.iosDatePicker}
                      themeVariant={isDark ? "dark" : "light"}
                    />
                  </View>
                </View>
              </Modal>
            </>
          )}

          <Text style={[styles.followUpLabel, { color: colors.text }]}>
            Follow Up 2
          </Text>
          {formData.followUp2 ? (
            <View>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={[styles.dateButton, { borderColor: colors.border }]}
                  onPress={() => setShowFollowUp2DatePicker(true)}
                >
                  <Text style={[styles.dateButtonText, { color: colors.text }]}>
                    {formData.followUp2
                      .toLocaleDateString("en-GB")
                      .replace(/\//g, "-")}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.timeButton, { borderColor: colors.border }]}
                  onPress={() => setShowFollowUp2TimePicker(true)}
                >
                  <Text style={[styles.timeButtonText, { color: colors.text }]}>
                    {formData.followUp2.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </Text>
                  <Ionicons name="time-outline" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.removeFollowUpButton}
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    followUp2: null,
                    followUp3: null,
                  }))
                }
              >
                <Ionicons name="close-circle" size={20} color={colors.error} />
                <Text
                  style={[styles.removeFollowUpText, { color: colors.error }]}
                >
                  Remove Follow Up 2
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.addFollowUpButton,
                { borderColor: colors.primary },
              ]}
              onPress={() => {
                setFormData((prev) => ({ ...prev, followUp2: new Date() }));
              }}
            >
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={[styles.addFollowUpText, { color: colors.primary }]}>
                Add Follow Up 2
              </Text>
            </TouchableOpacity>
          )}

          {formData.followUp2 && (
            <>
              <Text style={[styles.followUpLabel, { color: colors.text }]}>
                Follow Up 3
              </Text>
              {formData.followUp3 ? (
                <View>
                  <View style={styles.dateTimeRow}>
                    <TouchableOpacity
                      style={[
                        styles.dateButton,
                        { borderColor: colors.border },
                      ]}
                      onPress={() => setShowFollowUp3DatePicker(true)}
                    >
                      <Text
                        style={[styles.dateButtonText, { color: colors.text }]}
                      >
                        {formData.followUp3
                          .toLocaleDateString("en-GB")
                          .replace(/\//g, "-")}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={colors.text}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.timeButton,
                        { borderColor: colors.border },
                      ]}
                      onPress={() => setShowFollowUp3TimePicker(true)}
                    >
                      <Text
                        style={[styles.timeButtonText, { color: colors.text }]}
                      >
                        {formData.followUp3.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Text>
                      <Ionicons
                        name="time-outline"
                        size={20}
                        color={colors.text}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.removeFollowUpButton}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, followUp3: null }))
                    }
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={colors.error}
                    />
                    <Text
                      style={[
                        styles.removeFollowUpText,
                        { color: colors.error },
                      ]}
                    >
                      Remove Follow Up 3
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.addFollowUpButton,
                    { borderColor: colors.primary },
                  ]}
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, followUp3: new Date() }));
                  }}
                >
                  <Ionicons
                    name="add-circle"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.addFollowUpText, { color: colors.primary }]}
                  >
                    Add Follow Up 3
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <CustomButton
            title={editData ? "Update Enquiry" : "Submit Enquiry"}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    borderRadius: 14,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalButton: {
    fontSize: 17,
  },
  doneButton: {
    fontWeight: "bold",
  },
  iosDatePicker: {
    height: 320,
  },
  dateTimeRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  followUpLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
  },
  dateButtonText: {
    fontSize: 16,
  },
  timeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
  },
  timeButtonText: {
    fontSize: 16,
  },
  addFollowUpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  addFollowUpText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "500",
  },
  removeFollowUpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
    padding: 8,
  },
  removeFollowUpText: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default StudentEnquiryScreen;
