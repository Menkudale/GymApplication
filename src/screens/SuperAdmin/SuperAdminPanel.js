import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer'; // For drawer navigation
import DashboardScreen from '../screens/SuperAdmin/DashboardScreen';
import BranchManagementScreen from '../screens/SuperAdmin/BranchManagementScreen';
import AdminManagementScreen from '../screens/SuperAdmin/AdminManagementScreen';
import CustomDrawerContent from './CustomDrawerContent'; // Create this component

const Drawer = createDrawerNavigator();

const SuperAdminStack = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Branch Management" component={BranchManagementScreen} />
      <Drawer.Screen name="Admin Management" component={AdminManagementScreen} />
    </Drawer.Navigator>
  );
};

export default SuperAdminStack;