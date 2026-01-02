import React, { useState, useEffect } from 'react';
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

const FeesEntryScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    registrationNo: '',
    date: new Date().toISOString().split('T')[0],
    studentName: '',
    course: '',
    totalFees: '',
    paidFees: '',
    dueFees: '',
    dueDate: '',
    paidThrough: '',
    receivedBy: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registrationOptions, setRegistrationOptions] = useState([]);

  const paymentMethods = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Card', value: 'Card' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Net Banking', value: 'Net Banking' },
    { label: 'Cheque', value: 'Cheque' },
  ];

  useEffect(() => {
    // Fetch registration numbers for dropdown
    fetchRegistrations();
  }, []);

  useEffect(() => {
    // Calculate due fees when total or paid fees change
    calculateDueFees();
  }, [formData.totalFees, formData.paidFees]);

  const fetchRegistrations = async () => {
    try {
      // Simulate API call to get registrations
      const mockRegistrations = [
        { label: 'REG001 - John Doe', value: 'REG001' },
        { label: 'REG002 - Jane Smith', value: 'REG002' },
        { label: 'REG003 - Mike Johnson', value: 'REG003' },
      ];
      setRegistrationOptions(mockRegistrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const calculateDueFees = () => {
    const total = parseFloat(formData.totalFees) || 0;
    const paid = parseFloat(formData.paidFees) || 0;
    const due = total - paid;
    
    setFormData(prev => ({
      ...prev,
      dueFees: due >= 0 ? due.toString() : '0'
    }));
  };

  const handleRegistrationSelect = async (registrationNo) => {
    updateFormData('registrationNo', registrationNo);
    
    if (registrationNo) {
      // Auto-fetch student details based on registration number
      try {
        // Simulate API call to get student details
        const mockStudentData = {
          studentName: 'John Doe',
          course: 'UPSC Preparation',
        };
        
        setFormData(prev => ({
          ...prev,
          studentName: mockStudentData.studentName,
          course: mockStudentData.course,
        }));
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        studentName: '',
        course: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.registrationNo) {
      newErrors.registrationNo = 'Registration number is required';
    }

    if (!formData.totalFees.trim()) {
      newErrors.totalFees = 'Total fees is required';
    } else if (isNaN(parseFloat(formData.totalFees))) {
      newErrors.totalFees = 'Total fees must be a valid number';
    }

    if (!formData.paidFees.trim()) {
      newErrors.paidFees = 'Paid fees is required';
    } else if (isNaN(parseFloat(formData.paidFees))) {
      newErrors.paidFees = 'Paid fees must be a valid number';
    }

    if (!formData.paidThrough) {
      newErrors.paidThrough = 'Payment method is required';
    }

    if (!formData.receivedBy.trim()) {
      newErrors.receivedBy = 'Received by is required';
    }

    const totalFees = parseFloat(formData.totalFees) || 0;
    const paidFees = parseFloat(formData.paidFees) || 0;
    
    if (paidFees > totalFees) {
      newErrors.paidFees = 'Paid fees cannot exceed total fees';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await ApiService.createFeesEntry(formData);
      Alert.alert('Success', 'Fees entry created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create fees entry');
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
        <Text style={styles.headerTitle}>Fees Entry</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <CustomPicker
            label="Registration No *"
            selectedValue={formData.registrationNo}
            onValueChange={handleRegistrationSelect}
            items={registrationOptions}
            placeholder="Select registration number"
            error={errors.registrationNo}
          />

          <CustomInput
            label="Date"
            value={formData.date}
            onChangeText={(value) => updateFormData('date', value)}
            placeholder="YYYY-MM-DD"
          />

          <CustomInput
            label="Student Name"
            value={formData.studentName}
            editable={false}
            style={styles.disabledInputStyle}
          />

          <CustomInput
            label="Course"
            value={formData.course}
            editable={false}
            style={styles.disabledInputStyle}
          />

          <CustomInput
            label="Total Fees *"
            value={formData.totalFees}
            onChangeText={(value) => updateFormData('totalFees', value)}
            placeholder="Enter total fees"
            keyboardType="numeric"
            error={errors.totalFees}
          />

          <CustomInput
            label="Paid Fees *"
            value={formData.paidFees}
            onChangeText={(value) => updateFormData('paidFees', value)}
            placeholder="Enter paid fees"
            keyboardType="numeric"
            error={errors.paidFees}
          />

          <CustomInput
            label="Due Fees"
            value={formData.dueFees}
            editable={false}
            style={styles.disabledInputStyle}
          />

          <CustomInput
            label="Due Date"
            value={formData.dueDate}
            onChangeText={(value) => updateFormData('dueDate', value)}
            placeholder="YYYY-MM-DD"
          />

          <CustomPicker
            label="Paid Through *"
            selectedValue={formData.paidThrough}
            onValueChange={(value) => updateFormData('paidThrough', value)}
            items={paymentMethods}
            placeholder="Select payment method"
            error={errors.paidThrough}
          />

          <CustomInput
            label="Received By *"
            value={formData.receivedBy}
            onChangeText={(value) => updateFormData('receivedBy', value)}
            placeholder="Enter receiver name"
            error={errors.receivedBy}
          />

          <CustomButton
            title="Submit Fees Entry"
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
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});

export default FeesEntryScreen;