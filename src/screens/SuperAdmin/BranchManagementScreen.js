import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Button,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BranchManagementScreen = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null); // For edit mode
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [admins, setAdmins] = useState([]); // List of available admins
  const [selectedAdmin, setSelectedAdmin] = useState(null); // Admin assigned to branch

  useEffect(() => {
    fetchBranchesAndAdmins();
  }, []);

  const fetchBranchesAndAdmins = async () => {
    setLoading(true);
    try {
      const branchesRes = await axios.get('YOUR_BACKEND_API/super_admin/branches');
      const adminsRes = await axios.get('YOUR_BACKEND_API/super_admin/admins/unassigned'); // Get admins not assigned to a branch
      setBranches(branchesRes.data);
      setAdmins(adminsRes.data); // Make sure this includes 'None' option if an admin can be unassigned
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load branches or admins.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateOrUpdateBranch = async () => {
    if (!branchName.trim() || !branchAddress.trim()) {
      Alert.alert('Validation Error', 'Branch Name and Address are required.');
      return;
    }

    try {
      if (currentBranch) {
        // Update existing branch
        await axios.put(`YOUR_BACKEND_API/super_admin/branches/${currentBranch.id}`, {
          name: branchName,
          address: branchAddress,
          assigned_admin_id: selectedAdmin, // Send null if unassigned
        });
        Alert.alert('Success', 'Branch updated successfully.');
      } else {
        // Create new branch
        await axios.post('YOUR_BACKEND_API/super_admin/branches', {
          name: branchName,
          address: branchAddress,
          assigned_admin_id: selectedAdmin,
        });
        Alert.alert('Success', 'Branch created successfully.');
      }
      setModalVisible(false);
      resetForm();
      fetchBranchesAndAdmins(); // Refresh data
    } catch (error) {
      console.error('Error saving branch:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save branch.');
    }
  };

  const handleDeleteBranch = (branchId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this branch? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`YOUR_BACKEND_API/super_admin/branches/${branchId}`);
              Alert.alert('Success', 'Branch deleted successfully.');
              fetchBranchesAndAdmins(); // Refresh data
            } catch (error) {
              console.error('Error deleting branch:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete branch.');
            }
          },
        },
      ],
    );
  };

  const openCreateModal = () => {
    setCurrentBranch(null);
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (branch) => {
    setCurrentBranch(branch);
    setBranchName(branch.name);
    setBranchAddress(branch.address);
    setSelectedAdmin(branch.admin_id || null); // Pre-select assigned admin
    setModalVisible(true);
  };

  const resetForm = () => {
    setBranchName('');
    setBranchAddress('');
    setSelectedAdmin(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBranchesAndAdmins();
  };

  const renderBranchItem = ({ item }) => (
    <View style={styles.branchItem}>
      <View style={styles.branchDetails}>
        <Text style={styles.branchName}>{item.name}</Text>
        <Text style={styles.branchAddress}>{item.address}</Text>
        <Text style={styles.assignedAdmin}>Admin: {item.admin_name || 'Not Assigned'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
          <Icon name="edit" size={20} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteBranch(item.id)} style={styles.actionButton}>
          <Icon name="delete" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Branch Management</Text>
      <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Branch</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={branches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBranchItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          resetForm();
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {currentBranch ? 'Edit Branch' : 'Create New Branch'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Branch Name"
              value={branchName}
              onChangeText={setBranchName}
            />
            <TextInput
              style={styles.input}
              placeholder="Branch Address"
              value={branchAddress}
              onChangeText={setBranchAddress}
            />

            <Text style={styles.pickerLabel}>Assign Admin:</Text>
            <Picker
              selectedValue={selectedAdmin}
              onValueChange={(itemValue) => setSelectedAdmin(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="None" value={null} />
              {admins.map((admin) => (
                <Picker.Item key={admin.id} label={admin.name} value={admin.id} />
              ))}
              {/* If editing and the admin is already assigned to this branch, ensure it's in the list */}
              {currentBranch && currentBranch.admin_id && !admins.find(a => a.id === currentBranch.admin_id) && (
                  <Picker.Item key={currentBranch.admin_id} label={currentBranch.admin_name} value={currentBranch.admin_id} />
              )}
            </Picker>

            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#dc3545" />
              <Button
                title={currentBranch ? 'Update' : 'Create'}
                onPress={handleCreateOrUpdateBranch}
                color="#007bff"
              />
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#28a745', // Success green
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  branchItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  branchDetails: {
    flex: 1,
  },
  branchName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  branchAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  assignedAdmin: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#007bff',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 15,
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: '100%',
    backgroundColor: '#fff',
  },
  pickerLabel: {
    alignSelf: 'flex-start',
    marginLeft: 5,
    marginBottom: 5,
    fontSize: 16,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 50,
  },
});

export default BranchManagementScreen;