
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';

const CARRO_MOCK = [
  { id: '1', name: 'Playera Minimalista', price: 299.00, quantity: 2 },
  { id: '2', name: 'Tenis Urbanos', price: 1299.00, quantity: 1 }
];

export const CartScreen = () => {
  const [cartItems, setCartItems] = useState(CARRO_MOCK);
  const [zipCode, setZipCode] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (zipCode.length === 5) {
      buscarCodigoPostal(zipCode);
    } else {
      setState('');
      setCity('');
    }
  }, [zipCode]);

  const buscarCodigoPostal = async (cp) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.zippopotam.us/MX/${cp}`);
      const lugar = response.data.places[0];
      setCity(lugar['place name']);
      setState(lugar['state']);
    } catch (error) {
      Alert.alert('Error', 'No se encontró el Código Postal.');
      setState('');
      setCity('');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mi Carrito</Text>

      {cartItems.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)} x {item.quantity}</Text>
          </View>
          <Text style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
        </View>
      ))}

      <Text style={styles.totalText}>Total a pagar: ${calcularTotal().toFixed(2)}</Text>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Datos de Envío</Text>
      
      <Text style={styles.label}>Código Postal:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 37000"
        keyboardType="numeric"
        maxLength={5}
        value={zipCode}
        onChangeText={setZipCode}
      />

      {loading && <ActivityIndicator size="small" color="#0000ff" style={{ marginVertical: 10 }} />}

      <Text style={styles.label}>Estado:</Text>
      <TextInput
        style={[styles.input, styles.disabledInput]}
        value={state}
        editable={false}
        placeholder="Se rellena automáticamente"
      />

      <Text style={styles.label}>Ciudad / Municipio:</Text>
      <TextInput
        style={[styles.input, styles.disabledInput]}
        value={city}
        editable={false}
        placeholder="Se rellena automáticamente"
      />

      <TouchableOpacity 
        style={styles.btnComprar}
        onPress={() => Alert.alert("Procesando", "Aquí enviarás los datos con Axios al Backend de tu compañero")}
      >
        <Text style={styles.btnText}>Proceder al Pago</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#212529' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#495057' },
  itemCard: { 
    backgroundColor: '#fff', padding: 15, borderRadius: 8, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10, elevation: 1 
  },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemPrice: { fontSize: 14, color: '#6c757d', marginTop: 2 },
  itemTotal: { fontSize: 16, fontWeight: 'bold', color: '#212529' },
  totalText: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginTop: 10, color: '#198754' },
  divider: { height: 1, backgroundColor: '#dee2e6', marginVertical: 20 },
  label: { fontSize: 14, fontWeight: '500', marginTop: 10, color: '#495057' },
  input: { borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 10, marginTop: 5, backgroundColor: '#fff', fontSize: 16 },
  disabledInput: { backgroundColor: '#e9ecef', color: '#6c757d' },
  btnComprar: { backgroundColor: '#0d6efd', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});