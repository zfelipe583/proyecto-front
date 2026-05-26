import React, { useState, useEffect, useRef } from 'react';
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

export const LoginScreen = ({ navigation }) => {
  const { loginPersona } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingPersona, setLoadingPersona] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      {/* Premium Background Gradient Fade */}
      <LinearGradient
        colors={['#FED7AA', '#F3F4F6']} // Softer orange fading seamlessly into the light gray base
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
          style={{ opacity: fadeAnim }}
        >
          {/* Header on Background */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Ionicons name="bag-handle" size={32} color="#2563EB" style={{ marginRight: 8 }} />
              <Text style={styles.logoText}>GTO Market</Text>
            </View>
            <Text style={styles.subtitle}>Inicia sesión para comprar</Text>
          </View>

          {/* Elevated Premium Card */}
          <View style={styles.card}>
            
            <Text style={styles.inputLabel}>Tu cuenta</Text>
            <TextInput 
              style={styles.input} 
              placeholder="E-mail o teléfono"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity 
              style={styles.forgotPassword}
              activeOpacity={0.6}
              onPress={() => Alert.alert("Próximamente", "Recuperación de contraseña en construcción.")}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, loadingPersona !== null && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loadingPersona !== null}
              activeOpacity={0.8}
            >
              {loadingPersona === 'form' ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Continuar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>¿Nuevo en GTO Market?</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.createAccountButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <Text style={styles.createAccountText}>Crear cuenta nueva</Text>
            </TouchableOpacity>
          </View>

          {/* Trust Footer */}
          <View style={styles.footer}>
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark" size={18} color="#EA580C" />
              <Text style={styles.trustText}>Compra Protegida</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="cube" size={18} color="#2563EB" />
              <Text style={styles.trustText}>Envíos Rápidos</Text>
            </View>
          </View>

        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background
  },
  fadeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45, // Gives enough room to fade perfectly into the gray
  },
  container: { 
    flex: 1, 
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40, // Reduced to help lift the header
    paddingBottom: 30,
    justifyContent: 'center', 
  },
  header: {
    alignItems: 'center',
    marginBottom: 60, // Increased to push card down and title up
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#EA580C', // Orange
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
    paddingHorizontal: 16, // Adjusted slightly since there's no visible box border
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: '#2563EB', // Blue link
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: { 
    width: '100%',
    backgroundColor: '#EA580C', 
    height: 52,
    justifyContent: 'center',
    alignItems: 'center', 
    borderRadius: 10, 
  },
  buttonDisabled: {
    backgroundColor: '#FDBA74',
  },
  loginButtonText: { 
    color: '#ffffff', 
    fontSize: 17, 
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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
  createAccountButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  createAccountText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  trustText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  }
});