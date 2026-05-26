import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export const RegisterScreen = ({ navigation }) => {
  const { registerPersona } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [esVendedor, setEsVendedor] = useState(false);
  const [nombreTienda, setNombreTienda] = useState('');
  const [clabe, setClabe] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }
    
    if (esVendedor && (!nombreTienda || !clabe)) {
      Alert.alert("Datos de Vendedor", "Por favor ingresa el nombre de tu tienda y CLABE bancaria.");
      return;
    }

    if (esVendedor && clabe.length !== 18) {
      Alert.alert("CLABE Inválida", "La CLABE interbancaria debe tener exactamente 18 dígitos.");
      return;
    }

    // Configurar objeto de usuario según esquema de MongoDB
    const userData = {
      name: name,
      email: email.trim().toLowerCase(),
      is_seller: esVendedor,
      password_hash: '$2b$12$EjemploDeHashSeguro1234567890...' + (esVendedor ? 'Vendedor' : 'Comprador'),
      addresses: esVendedor 
        ? [
            {
              label: "Oficina/Almacén",
              street: "Av. Universidad 456",
              city: "Purísima del Rincón",
              state: "Guanajuato",
              zip_code: "36400"
            }
          ]
        : [
            {
              label: "Casa",
              street: "Calle Flores 123",
              city: "León",
              state: "Guanajuato",
              zip_code: "37000"
            }
          ]
    };

    if (esVendedor) {
      userData.seller_data = {
        store_name: nombreTienda,
        bank_clabe: clabe,
        average_rating: 5.0
      };
    }

    setLoading(true);
    try {
      await registerPersona(userData);
      Alert.alert("¡Registro Exitoso!", "Tu cuenta ha sido creada en la base de datos. Ya puedes iniciar sesión.", [
        { text: "Iniciar Sesión", onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Únete al Marketplace de Guanajuato</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Nombre Completo:</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej. Juan Pérez" 
          value={name} 
          onChangeText={setName} 
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Correo Electrónico:</Text>
        <TextInput 
          style={styles.input} 
          placeholder="correo@ejemplo.com" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none" 
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Contraseña:</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Mínimo 6 caracteres" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
          placeholderTextColor="#94a3b8"
        />

        {/* Selector de Rol */}
        <Text style={styles.label}>Tipo de Perfil:</Text>
        <View style={styles.roleSelectorRow}>
          <TouchableOpacity
            style={[styles.roleChip, !esVendedor && styles.roleChipActive]}
            onPress={() => setEsVendedor(false)}
          >
            <Ionicons name="cart-outline" size={16} color={!esVendedor ? '#ffffff' : '#475569'} style={{marginRight: 4}} />
            <Text style={[styles.roleChipText, !esVendedor && { color: '#ffffff' }]}>Comprador</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.roleChip, esVendedor && styles.roleChipActiveActive]}
            onPress={() => setEsVendedor(true)}
          >
            <Ionicons name="storefront-outline" size={16} color={esVendedor ? '#ffffff' : '#475569'} style={{marginRight: 4}} />
            <Text style={[styles.roleChipText, esVendedor && { color: '#ffffff' }]}>Vendedor</Text>
          </TouchableOpacity>
        </View>

        {/* Campos Condicionales del Vendedor */}
        {esVendedor && (
          <View style={styles.sellerSection}>
            <View style={styles.divider} />
            <Text style={styles.sellerTitle}>Datos de tu Tienda</Text>
            
            <Text style={styles.label}>Nombre de la Tienda:</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ej. Zermeño Tech Store" 
              value={nombreTienda} 
              onChangeText={setNombreTienda} 
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.label}>CLABE Interbancaria (18 dígitos):</Text>
            <TextInput 
              style={styles.input} 
              placeholder="012320012345678901" 
              value={clabe} 
              onChangeText={setClabe} 
              keyboardType="numeric"
              maxLength={18}
              placeholderTextColor="#94a3b8"
            />
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 16 }}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  scrollContent: { paddingBottom: 40, justifyContent: 'center' },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 4 },
  formCard: { 
    backgroundColor: '#ffffff', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  label: { fontSize: 12, fontWeight: 'bold', marginTop: 10, color: '#475569' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', padding: 10, borderRadius: 8, marginTop: 4, marginBottom: 4, fontSize: 14, color: '#334155', backgroundColor: '#ffffff' },
  roleSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 10,
  },
  roleChip: {
    flex: 0.48,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  roleChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  roleChipActiveActive: {
    backgroundColor: '#d97706',
    borderColor: '#d97706',
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  sellerSection: {
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  sellerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b45309',
    marginBottom: 6,
  },
  button: { backgroundColor: '#4f46e5', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { backgroundColor: '#cbd5e1' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  linkText: { color: '#4f46e5', textAlign: 'center', fontSize: 13, fontWeight: '500' }
});