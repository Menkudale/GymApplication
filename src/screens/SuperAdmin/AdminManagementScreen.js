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
  Switch,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

const AdminManagementScreen = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null); // For edit mode
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [permissions, setPermissions] = useState({ viewOnly: false, fullAccess: false });
  const [isActive, setIsActive] = useState(true); // For deactivating login
  const [assignedBranch, setAssignedBranch] = useState(null);
  const [branches, setBranches] = useState([]); // List of all branches

  useEffect(() => {
    fetchAdminsAndBranches();
  }, []);

  const fetchAdminsAndBranches = async () => {
    setLoading(true);
    try {
      const adminsRes = await axios.get('YOUR_BACKEND_API/super_admin/admins');
      const branchesRes = await axios.get('YOUR_BACKEND_API/super_admin/branches/unassigned'); // Branches not assigned an admin, plus the branch of the current admin if editing
      setAdmins(adminsRes.data);
      setBranches([{ id: null, name: 'No Branch Assigned' }, ...branchesRes.data]);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load admins or branches.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateOrUpdateAdmin = async () => {
    if (!adminName.trim() || !adminEmail.trim()) {
      Alert.alert('Validation Error', 'Admin Name and Email are required.');
      return;
    }
    if (!currentAdmin && !adminPassword.trim()) {
      Alert.alert('Validation Error', 'Password is required for new admin accounts.');
      return;
    }
    if (!permissions.viewOnly && !permissions.fullAccess) {
      Alert.alert('Validation Error', 'Please select at least one permission.');
      return;
    }

    try {
      const adminData = {
        name: adminName,
        email: adminEmail,
        password: adminPassword || undefined, // Only send if new or being reset
        permissions: permissions,
        is_active: isActive,
        branch_id: assignedBranch,
      };

      if (currentAdmin) {
        // Update existing admin
        await axios.put(`YOUR_BACKEND_API/super_admin/admins/${currentAdmin.id}`, adminData);
        Alert.alert('Success', 'Admin account updated successfully.');
      } else {
        // Create new admin
        await axios.post('YOUR_BACKEND_API/super_admin/admins', adminData);
        Alert.alert('Success', 'Admin account created successfully.');
      }
      setModalVisible(false);
      resetForm();
      fetchAdminsAndBranches(); // Refresh data
    } catch (error) {
      console.error('Error saving admin:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save admin.');
    }
  };

  const handleDeleteAdmin = (adminId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this admin account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`YOUR_BACKEND_API/super_admin/admins/${adminId}`);
              Alert.alert('Success', 'Admin account deleted successfully.');
              fetchAdminsAndBranches(); // Refresh data
            } catch (error) {
              console.error('Error deleting admin:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete admin.');
            }
          },
        },
      ],
    );
  };

  const handleResetPassword = (adminId) => {
    Alert.alert(
      'Reset Password',
      'Are you sure you want to send a password reset link to this admin?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              await axios.post(`YOUR_BACKEND_API/super_admin/admins/${adminId}/reset-password`);
              Alert.alert('Success', 'Password reset link sent.');
            } catch (error) {
              console.error('Error resetting password:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to send reset link.');
            }
          },
        },
      ],
    );
  };

  const openCreateModal = () => {
    setCurrentAdmin(null);
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (admin) => {
    setCurrentAdmin(admin);
    setAdminName(admin.name);
    setAdminEmail(admin.email);
    setPermissions(admin.permissions || { viewOnly: false, fullAccess: false });
    setIsActive(admin.is_active);
    setAssignedBranch(admin.branch_id || null);
    setModalVisible(true);
  };

  const resetForm = () => {
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setPermissions({ viewOnly: false, fullAccess: false });
    setIsActive(true);
    setAssignedBranch(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminsAndBranches();
  };

  const renderAdminItem = ({ item }) => (
    <View style={styles.adminItem}>
      <View style={styles.adminDetails}>
        <Text style={styles.adminName}>{item.name}</Text>
        <Text style={styles.adminEmail}>{item.email}</Text>
        <Text style={styles.adminPermissions}>
          Permissions: {item.permissions?.fullAccess ? 'Full Access' : item.permissions?.viewOnly ? 'View Only' : 'None'}
        </Text>
        <Text style={styles.adminStatus}>Status: {item.is_active ? 'Active' : 'Inactive'}</Text>
        <Text style={styles.adminBranch}>Branch: {item.branch_name || 'Not Assigned'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
          <Icon name="edit" size={20} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleResetPassword(item.id)} style={styles.actionButton}>
          <Icon name="vpn-key" size={20} color="#ffc107" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteAdmin(item.id)} style={styles.actionButton}>
          <Icon name="delete" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Management</Text>
      <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
        <Icon name="person-add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Admin</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={admins}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAdminItem}
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
              {currentAdmin ? 'Edit Admin' : 'Create New Admin'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Admin Name"
              value={adminName}
              onChangeText={setAdminName}
            />
            <TextInput
              style={styles.input}
              placeholder="Admin Email"
              value={adminEmail}
              onChangeText={setAdminEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!currentAdmin && ( // Only show password for new admin
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={adminPassword}
                onChangeText={setAdminPassword}
                secureTextEntry
              />
            )}

            <View style={styles.permissionToggle}>
              <Text style={styles.permissionText}>View Only:</Text>
              <Switch
                value={permissions.viewOnly}
                onValueChange={(newValue) =>
                  setPermissions({ viewOnly: newValue, fullAccess: newValue ? false : permissions.fullAccess })
                }
              />
            </View>
            <View style={styles.permissionToggle}>
              <Text style={styles.permissionText}>Full Access:</Text>
              <Switch
                value={permissions.fullAccess}
                onValueChange={(newValue) =>
                  setPermissions({ fullAccess: newValue, viewOnly: newValue ? false : permissions.viewOnly })
                }
              />
            </View>

            <View style={styles.permissionToggle}>
              <Text style={styles.permissionText}>Account Active:</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
            </View>

            <Text style={styles.pickerLabel}>Assign Branch:</Text>
            <Picker
              selectedValue={assignedBranch}
              onValueChange={(itemValue) => setAssignedBranch(itemValue)}
              style={styles.picker}
            >
              {branches.map((branch) => (
                <Picker.Item key={branch.id} label={branch.name} value={branch.id} />
              ))}
              {/* If editing and the branch is already assigned to this admin, ensure it's in the list */}
              {currentAdmin && currentAdmin.branch_id && !branches.find(b => b.id === currentAdmin.branch_id) && (
                  <Picker.Item key={currentAdmin.branch_id} label={currentAdmin.branch_name} value={currentAdmin.branch_id} />
              )}
            </Picker>

            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#dc3545" />
              <Button
                title={currentAdmin ? 'Update' : 'Create'}
                onPress={handleCreateOrUpdateAdmin}
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
    backgroundColor: '#28a745',
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
  adminItem: {
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
  adminDetails: {
    flex: 1,
  },
  adminName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  adminEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  adminPermissions: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#007bff',
  },
  adminStatus: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
  },
  adminBranch: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
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
  permissionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#555',
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

export default AdminManagementScreen;