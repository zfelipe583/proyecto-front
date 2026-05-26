import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      <LinearGradient
        colors={['#FED7AA', '#F3F4F6']}
        style={styles.fadeBackground}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={Platform.OS === 'ios'}
        style={styles.container}
      >
        <Animated.ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Ionicons name="bag-handle" size={32} color="#2563EB" style={{ marginRight: 8 }} />
              <Text style={styles.logoText}>GTO Market</Text>
            </View>
            <Text style={styles.subtitle}>Crea tu cuenta gratis</Text>
          </View>

          <View style={styles.card}>
            
            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ej. Juan Pérez" 
              value={name} 
              onChangeText={setName} 
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Correo Electrónico</Text>
            <TextInput 
              style={styles.input} 
              placeholder="correo@ejemplo.com" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" 
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Mínimo 6 caracteres" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>¿Qué quieres hacer?</Text>
            <View style={styles.roleSelectorRow}>
              <TouchableOpacity
                style={[styles.roleChip, !esVendedor && styles.roleChipActiveBuyer]}
                onPress={() => setEsVendedor(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="cart" size={18} color={!esVendedor ? '#ffffff' : '#6B7280'} style={{marginRight: 6}} />
                <Text style={[styles.roleChipText, !esVendedor && { color: '#ffffff' }]}>Comprar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.roleChip, esVendedor && styles.roleChipActiveSeller]}
                onPress={() => setEsVendedor(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="storefront" size={18} color={esVendedor ? '#ffffff' : '#6B7280'} style={{marginRight: 6}} />
                <Text style={[styles.roleChipText, esVendedor && { color: '#ffffff' }]}>Vender</Text>
              </TouchableOpacity>
            </View>

            {esVendedor && (
              <View style={styles.sellerSection}>
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Datos de Tienda</Text>
                  <View style={styles.dividerLine} />
                </View>
                
                <Text style={styles.inputLabel}>Nombre de la Tienda</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ej. Zermeño Tech Store" 
                  value={nombreTienda} 
                  onChangeText={setNombreTienda} 
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.inputLabel}>CLABE Bancaria (18 dígitos)</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="012320012345678901" 
                  value={clabe} 
                  onChangeText={setClabe} 
                  keyboardType="numeric"
                  maxLength={18}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Registrarme</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink} activeOpacity={0.6}>
              <Text style={styles.loginLinkText}>¿Ya tienes cuenta? Inicia Sesión</Text>
            </TouchableOpacity>
          </View>

        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', 
  },
  fadeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
  },
  container: { 
    flex: 1, 
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center', 
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#EA580C',
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: { 
    backgroundColor: '#F9FAFB', 
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB', 
    borderRadius: 10,
    fontSize: 16,
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  roleSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleChip: {
    flex: 0.48,
    flexDirection: 'row',
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  roleChipActiveBuyer: {
    backgroundColor: '#2563EB', 
    borderColor: '#2563EB',
  },
  roleChipActiveSeller: {
    backgroundColor: '#EA580C', 
    borderColor: '#EA580C',
  },
  roleChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  sellerSection: {
    marginTop: 0,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  button: { 
    width: '100%',
    backgroundColor: '#EA580C', 
    height: 52,
    justifyContent: 'center',
    alignItems: 'center', 
    borderRadius: 10, 
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#FDBA74',
  },
  buttonText: { 
    color: '#ffffff', 
    fontSize: 17, 
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  loginLinkText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
});