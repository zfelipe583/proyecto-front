// src/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { HomeScreen } from '../screens/shop/HomeScreen';
import { DetailScreen } from '../screens/shop/DetailScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { AdminScreen } from '../screens/profile/AdminScreen';

const Tab = createBottomTabNavigator();
const ShopStack = createStackNavigator();

const ShopStackScreen = () => (
  <ShopStack.Navigator>
    <ShopStack.Screen name="Tienda Principal" component={HomeScreen} options={{ title: 'E-Commerce' }} />
    <ShopStack.Screen name="ProductDetail" component={DetailScreen} options={{ title: 'Detalle del Producto' }} />
  </ShopStack.Navigator>
);

// Recibimos userRole desde las props
export const MainTabNavigator = ({ userRole }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0d6efd',
        tabBarInactiveTintColor: '#6c757d',
        tabBarStyle: { paddingBottom: 5, height: 60 },
      }}
    >
      <Tab.Screen 
        name="ShopTab" 
        component={ShopStackScreen} 
        options={{ title: 'Tienda', headerShown: false }} 
      />
      <Tab.Screen 
        name="CartTab" 
        component={CartScreen} 
        options={{ title: 'Mi Carrito' }} 
      />
      
      {/* Condicional: Si el rol es admin, muestra la pestaña; si es cliente, la esconde */}
      {userRole === 'admin' && (
        <Tab.Screen 
          name="AdminTab" 
          component={AdminScreen} 
          options={{ title: 'Admin / Panel' }} 
        />
      )}
    </Tab.Navigator>
  );
};