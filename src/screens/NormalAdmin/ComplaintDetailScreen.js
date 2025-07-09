import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Button,
  Alert,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const ComplaintDetailScreen = ({ route, navigation }) => {
  const { complaintId } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`YOUR_BACKEND_API/normal_admin/complaints/${complaintId}`);
      setComplaint(response.data);
      setNewStatus(response.data.status); // Set initial status for picker
      setAdminNotes(response.data.admin_notes || '');
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      Alert.alert('Error', 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!newStatus) {
      Alert.alert('Validation Error', 'Please select a status.');
      return;
    }

    try {
      await axios.put(`YOUR_BACKEND_API/normal_admin/complaints/${complaintId}/status`, {
        status: newStatus,
        admin_notes: adminNotes,
      });
      Alert.alert('Success', 'Complaint status updated successfully!');
      navigation.goBack(); // Go back to list after update
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.noDataText}>Complaint not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Complaint Details</Text>

      <View style={styles.detailCard}>
        <Text style={styles.label}>Subject:</Text>
        <Text style={styles.value}>{complaint.subject}</Text>

        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{complaint.description}</Text>

        <Text style={styles.label}>User Email:</Text>
        <Text style={styles.value}>{complaint.user_email}</Text>

        <Text style={styles.label}>Submitted On:</Text>
        <Text style={styles.value}>{new Date(complaint.created_at).toLocaleString()}</Text>

        {complaint.branch_name && (
          <>
            <Text style={styles.label}>Branch:</Text>
            <Text style={styles.value}>{complaint.branch_name}</Text>
          </>
        )}

        {complaint.category_name && (
          <>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.value}>{complaint.category_name}</Text>
          </>
        )}

        <Text style={styles.label}>Current Status:</Text>
        <Text style={[styles.value, styles[complaint.status.toLowerCase() + 'Status']]}>
          {complaint.status}
        </Text>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.sectionTitle}>Change Status / Add Notes</Text>

        <Text style={styles.pickerLabel}>Update Status:</Text>
        <Picker
          selectedValue={newStatus}
          onValueChange={(itemValue) => setNewStatus(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Open" value="open" />
          <Picker.Item label="Pending" value="pending" />
          <Picker.Item label="Resolved" value="resolved" />
        </Picker>

        <Text style={styles.inputLabel}>Admin Notes (Optional):</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Add your notes here..."
          value={adminNotes}
          onChangeText={setAdminNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Button title="Update Status" onPress={handleChangeStatus} color="#007bff" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#777',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  openStatus: {
    color: '#e44c2f', // Red for open
    fontWeight: 'bold',
  },
  pendingStatus: {
    color: '#ffc107', // Orange for pending
    fontWeight: 'bold',
  },
  resolvedStatus: {
    color: '#28a745', // Green for resolved
    fontWeight: 'bold',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
    marginTop: 10,
  },
  textArea: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    height: 100,
    backgroundColor: '#fff',
  },
});

export default ComplaintDetailScreen;