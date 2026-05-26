import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { useApp } from '../context/AppContext';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { user } = useApp();
  const isLoggedIn = user !== null;
  const userRole = user?.is_seller ? 'admin' : 'client'; 

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Le pasamos el rol como prop al navegador principal
          <Stack.Screen name="App">
            {(props) => <MainTabNavigator {...props} userRole={userRole} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};