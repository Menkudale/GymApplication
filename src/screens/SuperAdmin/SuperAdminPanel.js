import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer'; // For drawer navigation
import DashboardScreen from './DashboardScreen';
import BranchManagementScreen from './BranchManagementScreen';
import AdminManagementScreen from './AdminManagementScreen';
import CustomDrawerContent from '../../navigation/CustomDrawerContent';

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