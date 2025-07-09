import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import axios from 'axios';
import DatePicker from 'react-native-date-picker'; // You might need to install this: npm install react-native-date-picker
import { Picker } from '@react-native-picker/picker'; // You might need to install this: npm install @react-native-picker/picker

const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [branches, setBranches] = useState([]); // Populate from API
  const [categories, setCategories] = useState([]); // Populate from API

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Example API call - replace with your actual endpoint and parameters
      const response = await axios.get('YOUR_BACKEND_API/super_admin/dashboard', {
        params: {
          date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD
          branch_id: selectedBranch === 'all' ? null : selectedBranch,
          category: selectedCategory === 'all' ? null : selectedCategory,
        },
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Handle error, show alert
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFiltersData = async () => {
    try {
      // Fetch branches and categories
      const branchesRes = await axios.get('YOUR_BACKEND_API/branches');
      const categoriesRes = await axios.get('YOUR_BACKEND_API/complaint_categories');
      setBranches([{ id: 'all', name: 'All Branches' }, ...branchesRes.data]);
      setCategories([{ id: 'all', name: 'All Categories' }, ...categoriesRes.data]);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate, selectedBranch, selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Date:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text>{selectedDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DatePicker
            modal
            open={showDatePicker}
            date={selectedDate}
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

        <Text style={styles.filterLabel}>Branch:</Text>
        <Picker
          selectedValue={selectedBranch}
          onValueChange={(itemValue) => setSelectedBranch(itemValue)}
          style={styles.picker}
        >
          {branches.map((branch) => (
            <Picker.Item key={branch.id} label={branch.name} value={branch.id} />
          ))}
        </Picker>

        <Text style={styles.filterLabel}>Category:</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
        >
          {categories.map((category) => (
            <Picker.Item key={category.id} label={category.name} value={category.id} />
          ))}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : dashboardData ? (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Complaints/Feedback</Text>
            <Text style={styles.cardValue}>{dashboardData.totalComplaints}</Text>
          </View>

          <View style={styles.statusCardsContainer}>
            <View style={[styles.statusCard, styles.openCard]}>
              <Text style={styles.statusCardTitle}>Open</Text>
              <Text style={styles.statusCardValue}>{dashboardData.openComplaints}</Text>
            </View>
            <View style={[styles.statusCard, styles.resolvedCard]}>
              <Text style={styles.statusCardTitle}>Resolved</Text>
              <Text style={styles.statusCardValue}>{dashboardData.resolvedComplaints}</Text>
            </View>
            <View style={[styles.statusCard, styles.pendingCard]}>
              <Text style={styles.statusCardTitle}>Pending</Text>
              <Text style={styles.statusCardValue}>{dashboardData.pendingComplaints}</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>No dashboard data available.</Text>
      )}
    </ScrollView>
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
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  datePickerButton: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#007bff', // Primary blue
  },
  statusCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    width: '32%', // Approx 1/3 minus spacing
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  openCard: { borderColor: '#ffc107', borderWidth: 1 }, // Warning yellow
  resolvedCard: { borderColor: '#28a745', borderWidth: 1 }, // Success green
  pendingCard: { borderColor: '#6c757d', borderWidth: 1 }, // Secondary gray
  statusCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  statusCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
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

export default DashboardScreen;