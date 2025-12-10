import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  StatusBar,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ApplyScholarship() {
        const navigation = useNavigation()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    fatherName: '',
    motherName: '',
    category: '',
    annualIncome: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    qualification: '',
    percentage: '',
    boardUniversity: '',
    passingYear: '',
    aadharNumber: '',
  });

  const [selectedGender, setSelectedGender] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState('');

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Add your submission logic here
  };

  const GenderOption = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.optionButton, selectedGender === value && styles.optionButtonSelected]}
      onPress={() => setSelectedGender(value)}
    >
      <View style={[styles.radioOuter, selectedGender === value && styles.radioOuterSelected]}>
        {selectedGender === value && <View style={styles.radioInner} />}
      </View>
      <Text style={[styles.optionText, selectedGender === value && styles.optionTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const CategoryOption = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.categoryButton, selectedCategory === value && styles.categoryButtonSelected]}
      onPress={() => setSelectedCategory(value)}
    >
      <Text style={[styles.categoryText, selectedCategory === value && styles.categoryTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ScholarshipOption = ({ label, value, percentage }) => (
    <TouchableOpacity
      style={[styles.scholarshipCard, selectedScholarship === value && styles.scholarshipCardSelected]}
      onPress={() => setSelectedScholarship(value)}
    >
      <View style={styles.scholarshipContent}>
        <View style={[styles.checkboxOuter, selectedScholarship === value && styles.checkboxOuterSelected]}>
          {selectedScholarship === value && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
        <View style={styles.scholarshipInfo}>
          <Text style={styles.scholarshipPercentage}>{percentage}</Text>
          <Text style={styles.scholarshipLabel}>{label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply for Scholarship</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Scholarship Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Scholarship Type</Text>
          <ScholarshipOption 
            label="For EWS Students (Income Below 6 Lacs)" 
            value="70" 
            percentage="70% Scholarship"
          />
          <ScholarshipOption 
            label="For EWS Students (Income 6-8 Lacs)" 
            value="60" 
            percentage="60% Scholarship"
          />
          <ScholarshipOption 
            label="For Meritorious Students (All Income Groups)" 
            value="50" 
            percentage="50% Scholarship"
          />
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) => updateField('fullName', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="+91 XXXXX XXXXX"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              value={formData.dateOfBirth}
              onChangeText={(text) => updateField('dateOfBirth', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender <Text style={styles.required}>*</Text></Text>
            <View style={styles.optionsRow}>
              <GenderOption label="Male" value="male" />
              <GenderOption label="Female" value="female" />
              <GenderOption label="Other" value="other" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Father's Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter father's name"
              value={formData.fatherName}
              onChangeText={(text) => updateField('fatherName', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mother's Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter mother's name"
              value={formData.motherName}
              onChangeText={(text) => updateField('motherName', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Aadhar Number <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="XXXX XXXX XXXX"
              keyboardType="number-pad"
              maxLength={12}
              value={formData.aadharNumber}
              onChangeText={(text) => updateField('aadharNumber', text)}
            />
          </View>
        </View>

        {/* Category Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
            <View style={styles.categoryRow}>
              <CategoryOption label="General" value="general" />
              <CategoryOption label="OBC" value="obc" />
              <CategoryOption label="SC" value="sc" />
              <CategoryOption label="ST" value="st" />
              <CategoryOption label="EWS" value="ews" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Annual Family Income <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter annual income in ₹"
              keyboardType="numeric"
              value={formData.annualIncome}
              onChangeText={(text) => updateField('annualIncome', text)}
            />
          </View>
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Complete Address <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="House No., Street, Locality"
              multiline
              numberOfLines={3}
              value={formData.address}
              onChangeText={(text) => updateField('address', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>City <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => updateField('city', text)}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>State <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                value={formData.state}
                onChangeText={(text) => updateField('state', text)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pincode <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="6-digit pincode"
              keyboardType="number-pad"
              maxLength={6}
              value={formData.pincode}
              onChangeText={(text) => updateField('pincode', text)}
            />
          </View>
        </View>

        {/* Educational Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educational Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Highest Qualification <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10th, 12th, Graduation"
              value={formData.qualification}
              onChangeText={(text) => updateField('qualification', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Percentage/CGPA <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter percentage or CGPA"
              keyboardType="decimal-pad"
              value={formData.percentage}
              onChangeText={(text) => updateField('percentage', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Board/University <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter board or university name"
              value={formData.boardUniversity}
              onChangeText={(text) => updateField('boardUniversity', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year of Passing <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY"
              keyboardType="number-pad"
              maxLength={4}
              value={formData.passingYear}
              onChangeText={(text) => updateField('passingYear', text)}
            />
          </View>
        </View>

        {/* Documents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Documents</Text>
          
          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={24} color="#EF4444" />
            <Text style={styles.uploadText}>Upload Aadhar Card</Text>
            <Text style={styles.uploadSubtext}>(PDF, JPG, PNG - Max 2MB)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={24} color="#EF4444" />
            <Text style={styles.uploadText}>Upload Income Certificate</Text>
            <Text style={styles.uploadSubtext}>(PDF, JPG, PNG - Max 2MB)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={24} color="#EF4444" />
            <Text style={styles.uploadText}>Upload Marksheet</Text>
            <Text style={styles.uploadSubtext}>(PDF, JPG, PNG - Max 2MB)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={24} color="#EF4444" />
            <Text style={styles.uploadText}>Upload Photo</Text>
            <Text style={styles.uploadSubtext}>(JPG, PNG - Max 1MB)</Text>
          </TouchableOpacity>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <View style={styles.checkboxRow}>
            <TouchableOpacity style={styles.checkbox}>
              <Ionicons name="square-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.link}>Terms & Conditions</Text> and <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Application</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Note: All fields marked with <Text style={styles.required}>*</Text> are mandatory
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    gap: 8,
  },
  optionButtonSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#EF4444',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  optionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionTextSelected: {
    color: '#EF4444',
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
  },
  categoryButtonSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryTextSelected: {
    color: '#EF4444',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  link: {
    color: '#EF4444',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 16,
    marginHorizontal: 20,
  },
  scholarshipCard: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  scholarshipCardSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  scholarshipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxOuter: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxOuterSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  scholarshipInfo: {
    flex: 1,
  },
  scholarshipPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scholarshipLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});