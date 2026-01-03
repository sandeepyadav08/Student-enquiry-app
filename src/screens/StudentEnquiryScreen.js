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
import { useEffect } from 'react';

const StudentEnquiryScreen = ({ navigation, route }) => {
  const { editData } = route.params || {};
  
  const [formData, setFormData] = useState({
    date: editData?.enquiry_date || new Date().toISOString().split('T')[0],
    studentName: editData?.student_name || '',
    contactNumber: editData?.contact_number || '',
    whatsappNumber: editData?.whatsapp_number || '',
    courseEnquiry: editData?.course || '',
    modeOfReference: editData?.reference_mode || '',
    place: editData?.place || '',
    counsellorName: editData?.counsellor_name || '',
    franchisee: editData?.franchisee || '',
    remarks: editData?.remarks || '',
    followUp1: editData?.follow_up_1 || '',
    followUp2: editData?.follow_up_2 || '',
    followUp3: editData?.follow_up_3 || '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [franchisees, setFranchisees] = useState([]);

  useEffect(() => {
    if (editData) {
      setFormData({
        date: editData.enquiry_date || new Date().toISOString().split('T')[0],
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
    if (editData) {
      navigation.navigate('EnquiryList');
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submissionData = {
        enquiry_date: formData.date,
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
});

export default StudentEnquiryScreen;
