import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './src/navigation/AuthStack';
import SuperAdminStack from './src/navigation/SuperAdminStack';
import NormalAdminStack from './src/navigation/NormalAdminStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './src/context/AuthContext'; // Custom Auth Context

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'super_admin' or 'normal_admin'

  const authContext = React.useMemo(() => ({
    signIn: async (token, role) => {
      setIsLoading(true);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userRole', role);
      setUserToken(token);
      setUserRole(role);
      setIsLoading(false);
    },
    signOut: async () => {
      setIsLoading(true);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      setUserToken(null);
      setUserRole(null);
      setIsLoading(false);
    },
    signUp: () => {
      // Not typically for admin apps
    },
  }), []);

  useEffect(() => {
    const checkUserToken = async () => {
      let token;
      let role;
      try {
        token = await AsyncStorage.getItem('userToken');
        role = await AsyncStorage.getItem('userRole');
      } catch (e) {
        console.error('Failed to load token or role:', e);
      } finally {
        setUserToken(token);
        setUserRole(role);
        setIsLoading(false);
      }
    };
    checkUserToken();
  }, []);

  if (isLoading) {
    console.log('App is loading...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  console.log('Rendering App: userToken =', userToken, ', userRole =', userRole);
  return (
    <View style={{ flex: 1 }}>
      Hello, this is the App component!
      </View>
    // <AuthContext.Provider value={authContext}>
    //   <NavigationContainer>
    //     {userToken == null ? (
    //       (() => { console.log('Rendering AuthStack'); return <AuthStack /> })()
    //     ) : userRole === 'super_admin' ? (
    //       (() => { console.log('Rendering SuperAdminStack'); return <SuperAdminStack /> })()
    //     ) : (
    //       (() => { console.log('Rendering NormalAdminStack'); return <NormalAdminStack /> })()
    //     )}
    //   </NavigationContainer>  
    // </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;