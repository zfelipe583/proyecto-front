import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/shop/HomeScreen';
import { DetailScreen } from '../screens/shop/DetailScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { OrdersScreen } from '../screens/shop/OrdersScreen';
import { AdminScreen } from '../screens/profile/AdminScreen';

const Tab = createBottomTabNavigator();
const ShopStack = createStackNavigator();

const ShopStackScreen = () => (
  <ShopStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        color: '#0f172a',
      },
      headerTintColor: '#6366f1',
    }}
  >
    <ShopStack.Screen name="Tienda Principal" component={HomeScreen} options={{ title: 'E-Commerce' }} />
    <ShopStack.Screen name="ProductDetail" component={DetailScreen} options={{ title: 'Detalle del Producto' }} />
  </ShopStack.Navigator>
);

export const MainTabNavigator = ({ userRole }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'ShopTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'OrdersTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'AdminTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { 
          paddingBottom: 8, 
          height: 60, 
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.03,
          shadowRadius: 6,
          elevation: 4,
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#1e293b',
        },
      })}
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
      
      <Tab.Screen 
        name="OrdersTab" 
        component={OrdersScreen} 
        options={{ title: 'Mis Compras' }} 
      />
      
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