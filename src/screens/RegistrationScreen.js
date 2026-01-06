import React, { useState, useEffect, useRef } from 'react';
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

const RegistrationScreen = ({ navigation, route }) => {
  const { enquiryData, editData, timestamp } = route.params || {};
  
  const [formData, setFormData] = useState({
    registrationNo: '',
    studentName: enquiryData?.student_name || '',
    parentHusbandName: '',
    parentHusbandOccupation: '',
    courseAdmissionSought: enquiryData?.course || '',
    dob: null,
    address: '',
    contactNo: enquiryData?.contact_number || '',
    guardianContactNo: '',
    email: '',
    category: '',
    computerCourse: '',
    medium: '',
    dateOfRegistration: new Date(),
    registrationFees: '',
  });

  const [activeDateField, setActiveDateField] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const categoryOptions = [
    { label: 'General', value: 'General' },
    { label: 'OBC', value: 'OBC' },
    { label: 'SC', value: 'SC' },
    { label: 'ST', value: 'ST' },
    { label: 'EWS', value: 'EWS' },
    { label: 'Ex-Serviceman', value: 'Ex-Serviceman' },
    { label: 'PH', value: 'PH' },
  ];

  const mediumOptions = [
    { label: 'Hindi', value: 'Hindi' },
    { label: 'English', value: 'English' },
  ];

  useEffect(() => {
    if (editData) {
      setFormData({
        registrationNo: editData.registration_no || '',
        studentName: editData.student_name || '',
        parentHusbandName: editData.parent_husband_name || '',
        parentHusbandOccupation: editData.parent_husband_occupation || '',
        courseAdmissionSought: editData.course_admission_sought || editData.course || '',
        dob: editData.dob ? new Date(editData.dob) : null,
        address: editData.address || '',
        contactNo: editData.contact_no || editData.contact_number || '',
        guardianContactNo: editData.guardian_contact_no || '',
        email: editData.email || '',
        category: typeof editData.category === 'string' ? editData.category : (editData.category?.[0] || ''),
        computerCourse: editData.computer_course || '',
        medium: typeof editData.medium === 'string' ? editData.medium : (editData.medium?.[0] || ''),
        dateOfRegistration: editData.date_of_registration ? new Date(editData.date_of_registration) : new Date(),
        registrationFees: editData.registration_fees?.toString() || '',
      });
    } else {
      resetForm();
      fetchRegistrationNumber();
      // Scroll to top when form opens
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    }
  }, [editData, enquiryData, timestamp]);

  const fetchRegistrationNumber = async () => {
    try {
      const response = await ApiService.getRegistrationNumber();
      setFormData(prev => ({ ...prev, registrationNo: response.data }));
    } catch (error) {
      console.error('Error fetching registration number:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.parentHusbandName.trim()) {
      newErrors.parentHusbandName = 'Parent/Husband name is required';
    }

    if (!formData.courseAdmissionSought.trim()) {
      newErrors.courseAdmissionSought = 'Course is required';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.contactNo.trim()) {
      newErrors.contactNo = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNo)) {
      newErrors.contactNo = 'Contact number must be 10 digits';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.registrationFees.trim()) {
      newErrors.registrationFees = 'Registration fees is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    navigation.navigate('RegistrationList');
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submissionData = {
        registration_no: formData.registrationNo,
        student_name: formData.studentName,
        guardian_name: formData.parentHusbandName,
        guardian_occupation: formData.parentHusbandOccupation,
        course: formData.courseAdmissionSought,
        dob: formData.dob ? formData.dob.toISOString().split('T')[0] : '',
        address: formData.address,
        contact_no: formData.contactNo,
        guardian_contact_no: formData.guardianContactNo,
        email: formData.email,
        category: formData.category,
        computer_course: formData.computerCourse,
        medium: formData.medium,
        registration_date: formData.dateOfRegistration.toISOString().split('T')[0],
        registration_fees: formData.registrationFees,
      };

      if (editData?.id) {
        await ApiService.updateRegistration(editData.id, submissionData);
        Alert.alert('Success', 'Registration updated successfully', [
          { text: 'OK', onPress: () => handleBack() }
        ]);
      } else {
        await ApiService.createRegistration(submissionData);
        Alert.alert('Success', 'Registration created successfully', [
          { text: 'OK', onPress: () => handleBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save registration');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      registrationNo: '',
      studentName: enquiryData?.student_name || '',
      parentHusbandName: '',
      parentHusbandOccupation: '',
      courseAdmissionSought: enquiryData?.course || '',
      dob: null,
      address: '',
      contactNo: enquiryData?.contact_number || '',
      guardianContactNo: '',
      email: '',
      category: '',
      computerCourse: '',
      medium: '',
      dateOfRegistration: new Date(),
      registrationFees: '',
    });
    setErrors({});
  };

  const handleContactInput = (field, value) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    updateFormData(field, numericValue);
  };

  const handleNumericInput = (field, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    updateFormData(field, numericValue);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
  };

  const toggleMedium = (medium) => {
    setFormData(prev => ({
      ...prev,
      medium: prev.medium === medium ? '' : medium
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    // On Android, the picker closes automatically.
    if (Platform.OS === 'android') {
      setActiveDateField(null);
    }
    
    if (selectedDate && activeDateField) {
      setFormData(prev => ({ ...prev, [activeDateField]: selectedDate }));
    }
  };

  const confirmIOSDate = () => {
    setActiveDateField(null);
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
        <Text style={styles.headerTitle}>{editData ? 'Edit Registration' : 'Registration'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <CustomInput
            label="Registration No"
            value={formData.registrationNo}
            editable={false}
            style={styles.disabledInputStyle}
          />

          <CustomInput
            label="Student Name *"
            value={formData.studentName}
            onChangeText={(value) => updateFormData('studentName', value)}
            placeholder="Enter student name"
            editable={!enquiryData}
            error={errors.studentName}
            autoCapitalize="words"
          />

          <CustomInput
            label="Parent/Husband Name *"
            value={formData.parentHusbandName}
            onChangeText={(value) => updateFormData('parentHusbandName', value)}
            placeholder="Enter parent/husband name"
            error={errors.parentHusbandName}
            autoCapitalize="words"
          />

          <CustomInput
            label="Parent/Husband Occupation"
            value={formData.parentHusbandOccupation}
            onChangeText={(value) => updateFormData('parentHusbandOccupation', value)}
            placeholder="Enter occupation"
          />

          <CustomInput
            label="Course in which admission sought *"
            value={formData.courseAdmissionSought}
            onChangeText={(value) => updateFormData('courseAdmissionSought', value)}
            placeholder="Enter course"
            error={errors.courseAdmissionSought}
          />

          <TouchableOpacity onPress={() => setActiveDateField('dob')}>
            <View pointerEvents="none">
              <CustomInput
                label="Date of Birth *"
                value={formData.dob instanceof Date ? formData.dob.toISOString().split('T')[0] : ''}
                editable={false}
                placeholder="YYYY-MM-DD"
                error={errors.dob}
              />
            </View>
          </TouchableOpacity>

          <CustomInput
            label="Address *"
            value={formData.address}
            onChangeText={(value) => updateFormData('address', value)}
            placeholder="Enter address"
            multiline
            error={errors.address}
          />

          <CustomInput
            label="Contact No *"
            value={formData.contactNo}
            onChangeText={(value) => handleContactInput('contactNo', value)}
            placeholder="Enter 10-digit contact number"
            keyboardType="numeric"
            editable={!enquiryData}
            error={errors.contactNo}
            maxLength={10}
          />

          <CustomInput
            label="Guardian Contact No"
            value={formData.guardianContactNo}
            onChangeText={(value) => handleContactInput('guardianContactNo', value)}
            placeholder="Enter guardian contact number"
            keyboardType="numeric"
            maxLength={10}
          />

          <CustomInput
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="Enter email address"
            keyboardType="email-address"
            error={errors.email}
            autoCapitalize="none"
          />

          <View style={styles.checkboxSection}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.checkboxContainer}>
              {categoryOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.checkboxItem}
                  onPress={() => toggleCategory(option.value)}
                >
                  <View style={[
                    styles.checkbox,
                    formData.category === option.value && styles.checkedBox
                  ]}>
                    {formData.category === option.value && (
                      <Ionicons name="checkmark" size={16} color={COLORS.white} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <CustomInput
            label="Computer Course"
            value={formData.computerCourse}
            onChangeText={(value) => updateFormData('computerCourse', value)}
            placeholder="Enter computer course"
          />

          <View style={styles.checkboxSection}>
            <Text style={styles.sectionTitle}>Medium</Text>
            <View style={styles.checkboxContainer}>
              {mediumOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.checkboxItem}
                  onPress={() => toggleMedium(option.value)}
                >
                  <View style={[
                    styles.checkbox,
                    formData.medium === option.value && styles.checkedBox
                  ]}>
                    {formData.medium === option.value && (
                      <Ionicons name="checkmark" size={16} color={COLORS.white} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={() => setActiveDateField('dateOfRegistration')}>
            <View pointerEvents="none">
              <CustomInput
                label="Date of Registration"
                value={formData.dateOfRegistration instanceof Date ? formData.dateOfRegistration.toISOString().split('T')[0] : ''}
                editable={false}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </TouchableOpacity>

          {activeDateField && Platform.OS === 'android' && (
            <DateTimePicker
              value={
                (formData[activeDateField] instanceof Date) 
                  ? formData[activeDateField] 
                  : new Date()
              }
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
              visible={!!activeDateField}
              onRequestClose={() => setActiveDateField(null)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setActiveDateField(null)}>
                      <Text style={styles.modalButton}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmIOSDate}>
                      <Text style={[styles.modalButton, styles.doneButton]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={
                      (activeDateField && formData[activeDateField] instanceof Date)
                        ? formData[activeDateField]
                        : new Date()
                    }
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
            label="Registration Fees *"
            value={formData.registrationFees}
            onChangeText={(value) => handleNumericInput('registrationFees', value)}
            placeholder="Enter registration fees"
            keyboardType="numeric"
            error={errors.registrationFees}
          />

          <CustomButton
            title={editData ? "Update Registration" : "Create Registration"}
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
  disabledInputStyle: {
    opacity: 0.7,
  },
  checkboxSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    color: COLORS.text,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    minWidth: '45%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
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

export default RegistrationScreen;
