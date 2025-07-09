import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ComplaintListScreen from '../screens/NormalAdmin/ComplaintListScreen';
import ComplaintDetailScreen from '../screens/NormalAdmin/ComplaintDetailScreen';
import CustomDrawerContent from './CustomDrawerContent'; // Re-use the same drawer component

const Drawer = createDrawerNavigator();

const NormalAdminStack = () => {
  return (
    <Drawer.Navigator
      initialRouteName="ComplaintList"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="ComplaintList" component={ComplaintListScreen} options={{ title: 'Complaints' }} />
      <Drawer.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ title: 'Complaint Details' }} />
    </Drawer.Navigator>
  );
};

export default NormalAdminStack;