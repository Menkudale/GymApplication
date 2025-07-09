import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ComplaintListScreen = ({ navigation }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'open', 'resolved', 'pending'
  const [selectedDate, setSelectedDate] = useState(null); // Filter by date
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [selectedStatus, selectedDate, searchQuery]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint and parameters
      const response = await axios.get('YOUR_BACKEND_API/normal_admin/complaints', {
        params: {
          status: selectedStatus === 'all' ? null : selectedStatus,
          date: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
          search: searchQuery.trim() === '' ? null : searchQuery,
        },
      });
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      // Handle error, show alert
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const renderComplaintItem = ({ item }) => (
    <TouchableOpacity
      style={styles.complaintItem}
      onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item.id })}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.subject}</Text>
        <Text style={[styles.itemStatus, styles[item.status.toLowerCase() + 'Status']]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.itemDate}>{new Date(item.created_at).toLocaleString()}</Text>
      <Text style={styles.itemDescription} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Complaints & Feedback</Text>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by subject or description..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <Text style={styles.filterLabel}>Status:</Text>
        <Picker
          selectedValue={selectedStatus}
          onValueChange={(itemValue) => setSelectedStatus(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All" value="all" />
          <Picker.Item label="Open" value="open" />
          <Picker.Item label="Pending" value="pending" />
          <Picker.Item label="Resolved" value="resolved" />
        </Picker>

        <Text style={styles.filterLabel}>Date:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text>{selectedDate ? selectedDate.toDateString() : 'Select Date'}</Text>
          {selectedDate && (
            <TouchableOpacity onPress={() => setSelectedDate(null)} style={styles.clearDateButton}>
                <Icon name="clear" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        {showDatePicker && (
          <DatePicker
            modal
            open={showDatePicker}
            date={selectedDate || new Date()}
            onConfirm={(date) => {
              setShowDatePicker(false);
              setSelectedDate(date);
            }}
            onCancel={() => {
              setShowDatePicker(false);
            }}
            mode="date"
          />
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderComplaintItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.noDataText}>No complaints found.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  filterContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  filterLabel: {
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
    marginBottom: 10,
  },
  datePickerButton: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearDateButton: {
    padding: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  complaintItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
    color: '#333',
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  openStatus: {
    backgroundColor: '#ffc107',
    color: '#fff',
  },
  pendingStatus: {
    backgroundColor: '#6c757d',
    color: '#fff',
  },
  resolvedStatus: {
    backgroundColor: '#28a745',
    color: '#fff',
  },
  itemDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#555',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#777',
  },
});

export default ComplaintListScreen;