import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CustomPicker from '../components/CustomPicker';
import ApiService from '../api/apiService';
import COLORS from '../constants/colors';

const StudentEnquiryScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const courseOptions = [
    { label: 'UPSC', value: 'UPSC' },
    { label: 'RAS', value: 'RAS' },
    { label: 'SSC', value: 'SSC' },
    { label: 'BANK', value: 'BANK' },
    { label: 'Combo (B+S)', value: 'Combo (B+S)' },
    { label: 'Master Batch', value: 'Master Batch' },
    { label: 'CLAT', value: 'CLAT' },
    { label: 'Other', value: 'Other' },
  ];

  const franchiseeOptions = [
    { label: 'KS Academy', value: 'KS Academy' },
    { label: 'RS Academy', value: 'RS Academy' },
    { label: 'RPS Academy', value: 'RPS Academy' },
    { label: 'NS Academy', value: 'NS Academy' },
  ];

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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await ApiService.createEnquiry(formData);
      Alert.alert('Success', 'Enquiry created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Enquiry</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <CustomInput
            label="Date"
            value={formData.date}
            onChangeText={(value) => updateFormData('date', value)}
            placeholder="YYYY-MM-DD"
          />

          <CustomInput
            label="Student Name *"
            value={formData.studentName}
            onChangeText={(value) => updateFormData('studentName', value)}
            placeholder="Enter student name"
            error={errors.studentName}
          />

          <CustomInput
            label="Contact Number *"
            value={formData.contactNumber}
            onChangeText={(value) => updateFormData('contactNumber', value)}
            placeholder="Enter 10-digit contact number"
            keyboardType="numeric"
            error={errors.contactNumber}
          />

          <CustomInput
            label="WhatsApp Number"
            value={formData.whatsappNumber}
            onChangeText={(value) => updateFormData('whatsappNumber', value)}
            placeholder="Enter 10-digit WhatsApp number"
            keyboardType="numeric"
            error={errors.whatsappNumber}
          />

          <CustomPicker
            label="Course for Enquiry *"
            selectedValue={formData.courseEnquiry}
            onValueChange={(value) => updateFormData('courseEnquiry', value)}
            items={courseOptions}
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
          />

          <CustomPicker
            label="Franchisee *"
            selectedValue={formData.franchisee}
            onValueChange={(value) => updateFormData('franchisee', value)}
            items={franchiseeOptions}
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
            title="Submit Enquiry"
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
});

export default StudentEnquiryScreen;
