// src/screens/profile/AdminScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';

export const AdminScreen = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateProduct = () => {
    if (!name || !price || !description) {
      Alert.alert("Campos vacíos", "Por favor llena todos los datos para crear el producto.");
      return;
    }
    
    // Simulación del CRUD - Create
    Alert.alert(
      "¡Producto Creado!", 
      `Nombre: ${name}\nPrecio: $${price}\nEsto enviará un POST a la base de datos MongoDB.`
    );
    
    // Limpiar formulario
    setName('');
    setPrice('');
    setDescription('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>
      <Text style={styles.subtitle}>Módulo CRUD: Gestión de Inventario</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Nombre del Producto:</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej. Sudadera Oversize" 
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Precio ($ MXN):</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej. 499.00" 
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Descripción:</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Escribe los detalles del artículo..." 
          multiline={true}
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.btnGuardar} onPress={handleCreateProduct}>
          <Text style={styles.btnText}>Agregar Producto</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#212529' },
  subtitle: { fontSize: 14, color: '#6c757d', marginBottom: 20 },
  formCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, color: '#495057' },
  input: { borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 10, marginTop: 5, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  btnGuardar: { backgroundColor: '#198754', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 25 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});