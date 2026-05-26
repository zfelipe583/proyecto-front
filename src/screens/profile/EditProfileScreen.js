import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../../context/AppContext';

export const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useApp();

  const [name, setName]     = useState(user?.name || '');
  const [email, setEmail]   = useState(user?.email || '');
  const [storeName, setStoreName] = useState(user?.seller_data?.store_name || '');
  const [bankClabe, setBankClabe] = useState(user?.seller_data?.bank_clabe || '');
  const [saving, setSaving] = useState(false);

  const isSeller = user?.is_seller;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'El nombre no puede estar vacío.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Correo inválido', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    setSaving(true);
    try {
      const updatedData = { name: name.trim(), email: email.trim().toLowerCase() };
      if (isSeller) {
        updatedData.seller_data = {
          ...(user.seller_data || {}),
          store_name: storeName.trim(),
          bank_clabe: bankClabe.trim(),
        };
      }
      await updateUser(updatedData);
      Alert.alert('¡Listo!', 'Tu perfil ha sido actualizado correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar tu perfil: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <StatusBar style="dark" />

      {/* Avatar / Icono */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={48} color="#EA580C" />
        </View>
        <Text style={styles.avatarName}>{user?.name || 'Usuario'}</Text>
        <Text style={styles.avatarRole}>
          {isSeller ? '🏪 Vendedor' : '🛍️ Comprador'}
        </Text>
      </View>

      {/* Sección: Datos personales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos Personales</Text>

        <Text style={styles.label}>NOMBRE COMPLETO</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre completo"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Sección: Datos de tienda (solo vendedor) */}
      {isSeller && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de Tu Tienda</Text>

          <Text style={styles.label}>NOMBRE DE LA TIENDA</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="storefront-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="Nombre de tu tienda"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={styles.label}>CLABE BANCARIA</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="card-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={bankClabe}
              onChangeText={setBankClabe}
              placeholder="18 dígitos"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={18}
            />
          </View>
        </View>
      )}

      {/* Info de solo lectura */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color="#EA580C" />
        <Text style={styles.infoText}>
          Tu ID de usuario y fecha de registro no pueden modificarse.
        </Text>
      </View>

      {/* Botón guardar */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveBtnText}>Guardar Cambios</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Botón cancelar */}
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelBtnText}>Cancelar</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 50,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#EA580C',
    marginBottom: 12,
  },
  avatarName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  avatarRole: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    fontWeight: '600',
  },

  // Sections
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // Inputs
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7ED',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    fontWeight: '500',
  },

  // Buttons
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#EA580C',
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnDisabled: {
    backgroundColor: '#FDBA74',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  cancelBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },
});
