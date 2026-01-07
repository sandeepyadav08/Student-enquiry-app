import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CustomPicker from '../components/CustomPicker';
import ApiService from '../api/apiService';
import COLORS from '../constants/colors';

const initialFormData = {
  date: new Date(),
  studentName: '',
  contactNumber: '',
  whatsappNumber: '',
  courseEnquiry: '',
  modeOfReference: '',
  place: '',
  counsellorName: '',
  franchisee: '',
  remarks: '',
  followUp1: '',
  followUp2: '',
  followUp3: '',
};

const StudentEnquiryScreen = ({ navigation, route }) => {
  const { editData } = route.params || {};
  
  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [franchisees, setFranchisees] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      setFormData({
        date: editData.enquiry_date ? new Date(editData.enquiry_date) : new Date(),
        studentName: editData.student_name || '',
        contactNumber: editData.contact_number || '',
        whatsappNumber: editData.whatsapp_number || '',
        courseEnquiry: editData.course || '',
        modeOfReference: editData.reference_mode || '',
        place: editData.place || '',
        counsellorName: editData.counsellor_name || '',
        franchisee: editData.franchisee || '',
        remarks: editData.remarks || '',
        followUp1: editData.follow_up_1 || '',
        followUp2: editData.follow_up_2 || '',
        followUp3: editData.follow_up_3 || '',
      });
    } else {
      setFormData({
        date: new Date(),
        studentName: '',
        contactNumber: '',
        whatsappNumber: '',
        courseEnquiry: '',
        modeOfReference: '',
        place: '',
        counsellorName: '',
        franchisee: '',
        remarks: '',
        followUp1: '',
        followUp2: '',
        followUp3: '',
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
        ApiService.getFranchisees()
      ]);
      
      if (courseRes.data) {
        const courseItems = courseRes.data.map(item => ({
          label: item.course_name || item.name || item,
          value: item.course_name || item.name || item
        }));
        setCourses(courseItems);
      }

      if (franchiseeRes.data) {
        const franchiseeItems = franchiseeRes.data.map(item => ({
          label: item.franchisee_name || item.name || item,
          value: item.franchisee_name || item.name || item
        }));
        setFranchisees(franchiseeItems);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };



  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be 10 digits';
    }

    if (formData.whatsappNumber && !/^\d{10}$/.test(formData.whatsappNumber)) {
      newErrors.whatsappNumber = 'WhatsApp number must be 10 digits';
    }

    if (!formData.courseEnquiry) {
      newErrors.courseEnquiry = 'Course selection is required';
    }

    if (!formData.franchisee) {
      newErrors.franchisee = 'Franchisee selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    navigation.navigate('EnquiryList');
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submissionData = {
        enquiry_date: formData.date.toISOString().split('T')[0],
        student_name: formData.studentName,
        contact_number: formData.contactNumber,
        whatsapp_number: formData.whatsappNumber || '',
        course: formData.courseEnquiry,
        reference_mode: formData.modeOfReference || '',
        place: formData.place || '',
        counsellor_name: formData.counsellorName || '',
        franchisee: formData.franchisee,
        remarks: formData.remarks || '',
        follow_up_1: formData.followUp1 || '',
        follow_up_2: formData.followUp2 || '',
        follow_up_3: formData.followUp3 || '',
      };

      if (editData?.id) {
        await ApiService.updateEnquiry(editData.id, submissionData);
        Alert.alert('Success', 'Enquiry updated successfully', [
          { text: 'OK', onPress: () => handleBack() }
        ]);
      } else {
        await ApiService.createEnquiry(submissionData);
        setFormData(initialFormData);
        setErrors({});
        Alert.alert('Success', 'Enquiry created successfully', [
          { text: 'OK', onPress: () => handleBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create enquiry');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const confirmIOSDate = () => {
    setShowDatePicker(false);
  };

  const handleNumericInput = (field, value) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    updateFormData(field, numericValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editData ? 'Edit Enquiry' : 'Student Enquiry'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <View pointerEvents="none">
              <CustomInput
                label="Date"
                value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : ''}
                editable={false}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </TouchableOpacity>

          {showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={formData.date instanceof Date ? formData.date : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {Platform.OS === 'ios' && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.modalButton}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmIOSDate}>
                      <Text style={[styles.modalButton, styles.doneButton]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={formData.date instanceof Date ? formData.date : new Date()}
                    mode="date"
                    display="inline"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    style={styles.iosDatePicker}
                    themeVariant="light"
                  />
                </View>
              </View>
            </Modal>
          )}

          <CustomInput
            label="Student Name *"
            value={formData.studentName}
            onChangeText={(value) => updateFormData('studentName', value)}
            placeholder="Enter student name"
            error={errors.studentName}
            autoCapitalize="words"
          />

          <CustomInput
            label="Contact Number *"
            value={formData.contactNumber}
            onChangeText={(value) => handleNumericInput('contactNumber', value)}
            placeholder="Enter 10-digit contact number"
            keyboardType="numeric"
            error={errors.contactNumber}
            maxLength={10}
          />

          <CustomInput
            label="WhatsApp Number"
            value={formData.whatsappNumber}
            onChangeText={(value) => handleNumericInput('whatsappNumber', value)}
            placeholder="Enter 10-digit WhatsApp number"
            keyboardType="numeric"
            error={errors.whatsappNumber}
            maxLength={10}
          />

          <CustomPicker
            label="Course for Enquiry *"
            selectedValue={formData.courseEnquiry}
            onValueChange={(value) => updateFormData('courseEnquiry', value)}
            items={courses}
            placeholder="Select course"
            error={errors.courseEnquiry}
          />

          <CustomInput
            label="Mode of Reference"
            value={formData.modeOfReference}
            onChangeText={(value) => updateFormData('modeOfReference', value)}
            placeholder="Enter mode of reference"
          />

          <CustomInput
            label="Place"
            value={formData.place}
            onChangeText={(value) => updateFormData('place', value)}
            placeholder="Enter place"
          />

          <CustomInput
            label="Counsellor Name"
            value={formData.counsellorName}
            onChangeText={(value) => updateFormData('counsellorName', value)}
            placeholder="Enter counsellor name"
            autoCapitalize="words"
          />

          <CustomPicker
            label="Franchisee *"
            selectedValue={formData.franchisee}
            onValueChange={(value) => updateFormData('franchisee', value)}
            items={franchisees}
            placeholder="Select franchisee"
            error={errors.franchisee}
          />

          <CustomInput
            label="Remarks"
            value={formData.remarks}
            onChangeText={(value) => updateFormData('remarks', value)}
            placeholder="Enter remarks"
            multiline
          />

          <CustomInput
            label="Follow Up 1"
            value={formData.followUp1}
            onChangeText={(value) => updateFormData('followUp1', value)}
            placeholder="Enter follow up 1"
          />

          <CustomInput
            label="Follow Up 2"
            value={formData.followUp2}
            onChangeText={(value) => updateFormData('followUp2', value)}
            placeholder="Enter follow up 2"
          />

          <CustomInput
            label="Follow Up 3"
            value={formData.followUp3}
            onChangeText={(value) => updateFormData('followUp3', value)}
            placeholder="Enter follow up 3"
          />

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
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  modalButton: {
    color: COLORS.primary,
    fontSize: 17,
  },
  doneButton: {
    fontWeight: 'bold',
  },
  iosDatePicker: {
    height: 320,
    backgroundColor: COLORS.white,
  },
});

export default StudentEnquiryScreen;
