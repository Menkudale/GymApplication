import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from '../../navigation/CustomDrawerContent';
import ComplaintListScreen from './ComplaintListScreen';
import ComplaintDetailScreen from './ComplaintDetailScreen';

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