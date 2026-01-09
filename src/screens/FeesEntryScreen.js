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
  registrationNo: '',
  date: new Date(),
  studentName: '',
  course: '',
  totalFees: '',
  paidFees: '',
  initialDue: '',
  dueFees: '',
  dueDate: new Date(),
  paidThrough: '',
  receivedBy: '',
};

const FeesEntryScreen = ({ navigation }) => {
  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registrationOptions, setRegistrationOptions] = useState([]);
  const [fullRegistrationList, setFullRegistrationList] = useState([]);
  const [activeDateField, setActiveDateField] = useState(null);

  const paymentMethods = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Card', value: 'Card' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Net Banking', value: 'Net Banking' },
    { label: 'Cheque', value: 'Cheque' },
  ];

  useFocusEffect(
    useCallback(() => {
      // Clear form when screen is focused
      setFormData(initialFormData);
      setErrors({});
      fetchRegistrations();
      return () => {};
    }, [])
  );

  useEffect(() => {
    // Other side effects if needed
  }, []);

  useEffect(() => {
    // Calculate due fees when initial due or paid fees change
    calculateDueFees();
  }, [formData.initialDue, formData.paidFees]);

  const fetchRegistrations = async () => {
    try {
      const response = await ApiService.getFeeRegistrationNumbers();
      
      if (response && (response.status === true || response.status === 200 || response.status === 'true') && response.data) {
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setFullRegistrationList(data);
        
        const options = data.map(item => ({
          label: `${item.registration_no} - ${item.student_name}`,
          value: item.registration_no
        }));
        
        setRegistrationOptions(options);
      } else {
        console.error('Invalid response format:', response);
        setRegistrationOptions([]);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      Alert.alert('Error', 'Failed to fetch registration numbers');
    }
  };

  const calculateDueFees = () => {
    const initialDue = parseFloat(formData.initialDue) || 0;
    const paid = parseFloat(formData.paidFees) || 0;
    const due = initialDue - paid;
    
    setFormData(prev => ({
      ...prev,
      dueFees: due >= 0 ? due.toString() : '0'
    }));
  };

  const handleRegistrationSelect = async (registrationNo) => {
    updateFormData('registrationNo', registrationNo);
    
    if (registrationNo) {
      const selectedStudent = fullRegistrationList.find(
        student => student.registration_no === registrationNo
      );

      if (selectedStudent) {
        setFormData(prev => ({
          ...prev,
          studentName: selectedStudent.student_name,
          course: selectedStudent.course,
          totalFees: selectedStudent.total_fees || '',
          initialDue: (selectedStudent.due_fees && parseFloat(selectedStudent.due_fees) > 0) 
            ? selectedStudent.due_fees 
            : (selectedStudent.total_fees || ''),
          dueFees: (selectedStudent.due_fees && parseFloat(selectedStudent.due_fees) > 0) 
            ? selectedStudent.due_fees 
            : (selectedStudent.total_fees || ''),
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        studentName: '',
        course: '',
        totalFees: '',
        initialDue: '',
        dueFees: '',
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

    const initialDue = parseFloat(formData.initialDue) || 0;
    const paidFees = parseFloat(formData.paidFees) || 0;
    
    if (paidFees > initialDue) {
      newErrors.paidFees = 'Paid fees cannot exceed initial due';
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

  const handleDateChange = (event, selectedDate) => {
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

          <TouchableOpacity onPress={() => setActiveDateField('date')}>
            <View pointerEvents="none">
              <CustomInput
                label="Date"
                value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : ''}
                editable={false}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </TouchableOpacity>

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
            label="Total Fees"
            value={formData.totalFees}
            editable={false}
            style={styles.disabledInputStyle}
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

          <TouchableOpacity onPress={() => setActiveDateField('dueDate')}>
            <View pointerEvents="none">
              <CustomInput
                label="Due Date"
                value={formData.dueDate instanceof Date ? formData.dueDate.toISOString().split('T')[0] : ''}
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
              maximumDate={activeDateField === 'date' ? new Date() : undefined}
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
                    maximumDate={activeDateField === 'date' ? new Date() : undefined}
                    style={styles.iosDatePicker}
                    themeVariant="light"
                  />
                </View>
              </View>
            </Modal>
          )}

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

export default FeesEntryScreen;