import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export const LoginScreen = ({ navigation }) => {
  const { loginPersona } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingPersona, setLoadingPersona] = useState(null); // 'carlos' | 'jaime' | 'form' | null

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor llena todos los campos.");
      return;
    }
    setLoadingPersona('form');
    try {
      await loginPersona(email.trim().toLowerCase(), password);
    } catch (error) {
      Alert.alert("Error", "Usuario o contraseña inválidos.");
    } finally {
      setLoadingPersona(null);
    }
  };



  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.logo}>🛒 Gto Marketplace</Text>
        <Text style={styles.subtitle}>E-Commerce & Control de Inventario</Text>
      </View>

      {/* Formulario Estándar */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Iniciar Sesión</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Correo Electrónico" 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#94a3b8"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Contraseña" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />
        
        <TouchableOpacity 
          style={[styles.button, loadingPersona !== null && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loadingPersona !== null}
        >
          {loadingPersona === 'form' ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </View>



      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate aquí</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#f8fafc' 
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#4f46e5' 
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#cbd5e1', 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 12, 
    fontSize: 15,
    color: '#334155',
    backgroundColor: '#ffffff',
  },
  button: { 
    backgroundColor: '#4f46e5', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: 'bold' 
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 10,
    paddingLeft: 4,
  },
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  shortcutActive: {
    borderColor: '#4f46e5',
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shortcutInfo: {
    flex: 1,
  },
  shortcutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shortcutName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginRight: 8,
  },
  badgeComprador: {
    fontSize: 9,
    color: '#4f46e5',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  badgeVendedor: {
    fontSize: 9,
    color: '#d97706',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  shortcutEmail: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  linkText: { 
    color: '#4f46e5', 
    textAlign: 'center', 
    marginTop: 16, 
    fontSize: 13,
    fontWeight: '500',
  }
});