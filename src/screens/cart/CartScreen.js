import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView, Image } from 'react-native';
import axios from 'axios';
import { useApp } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export const CartScreen = ({ navigation }) => {
  const { cart, removeFromCart, updateCartItemQuantity, processCheckout, products } = useApp();
  const [zipCode, setZipCode] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [calle, setCalle] = useState('Calle Flores 123'); 
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

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
      Alert.alert('Código Postal', 'No se encontró información para el código postal ingresado.');
      setState('');
      setCity('');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, currentQty, amount) => {
    const originalProd = products.find(p => p._id === productId);
    const maxStock = originalProd ? originalProd.stock : 999;
    const newQty = currentQty + amount;

    if (newQty > maxStock) {
      Alert.alert('Stock Máximo', `Solo hay ${maxStock} unidades disponibles de este producto.`);
      return;
    }
    if (newQty < 1) {
      handleRemoveItem(productId);
      return;
    }
    updateCartItemQuantity(productId, newQty);
  };

  const handleRemoveItem = (productId) => {
    Alert.alert(
      'Quitar artículo',
      '¿Deseas eliminar este producto de tu carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => removeFromCart(productId) }
      ]
    );
  };

  const calcularTotal = () => {
    return cart.items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;
    if (!zipCode || !state || !city) {
      Alert.alert("Datos incompletos", "Por favor ingresa un código de envío válido (Código Postal) para autocompletar la ciudad/estado.");
      return;
    }
    if (!calle) {
      Alert.alert("Datos incompletos", "Por favor ingresa una calle y número para el envío.");
      return;
    }

    setCheckingOut(true);
    try {
      await processCheckout({
        calle,
        ciudad: city,
        estado: state,
        codigo_postal: zipCode
      });
      Alert.alert(
        "Compra Exitosa", 
        "¡Pedido registrado exitosamente!",
        [{ text: "Entendido" }]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo realizar la compra: " + error.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar style="dark" />
        <Ionicons name="cart-outline" size={64} color="#cbd5e1" />
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptySubtitle}>Explora la tienda y agrega productos para iniciar una compra.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Mi Carrito</Text>

      {cart.items.map((item) => {
        const originalProd = products.find(p => p._id === item.producto_id);
        const imageUrl = originalProd?.imagenes?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=200';

        return (
          <View key={item.producto_id} style={styles.itemCard}>
            <Image source={{ uri: imageUrl }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.nombre}</Text>
              <Text style={styles.itemPrice}>
                ${item.precio_unitario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </Text>
              

              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  style={styles.qtyBtn} 
                  onPress={() => handleQuantityChange(item.producto_id, item.cantidad, -1)}
                >
                  <Ionicons name="remove" size={14} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.cantidad}</Text>
                <TouchableOpacity 
                  style={styles.qtyBtn} 
                  onPress={() => handleQuantityChange(item.producto_id, item.cantidad, 1)}
                >
                  <Ionicons name="add" size={14} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemoveItem(item.producto_id)}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        );
      })}

      <Text style={styles.totalText}>
        Total a pagar: ${calcularTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Datos de Envío</Text>
      
      <Text style={styles.label}>Calle y Número:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Calle Flores 123"
        placeholderTextColor="#94a3b8"
        value={calle}
        onChangeText={setCalle}
      />

      <Text style={styles.label}>Código Postal:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 37000"
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
        maxLength={5}
        value={zipCode}
        onChangeText={setZipCode}
      />

      {loading && <ActivityIndicator size="small" color="#6366f1" style={{ marginVertical: 10 }} />}

      <Text style={styles.label}>Estado:</Text>
      <TextInput
        style={[styles.input, styles.disabledInput]}
        value={state}
        editable={false}
        placeholder="Se rellena automáticamente al ingresar C.P."
        placeholderTextColor="#94a3b8"
      />

      <Text style={styles.label}>Ciudad / Municipio:</Text>
      <TextInput
        style={[styles.input, styles.disabledInput]}
        value={city}
        editable={false}
        placeholder="Se rellena automáticamente al ingresar C.P."
        placeholderTextColor="#94a3b8"
      />

      <TouchableOpacity 
        style={[styles.btnComprar, checkingOut && styles.disabledBtn]}
        onPress={handleCheckout}
        disabled={checkingOut}
      >
        {checkingOut ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnText}>Pagar con Stripe / Confirmar Compra</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  scrollContent: { paddingBottom: 50 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#0f172a' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 8, color: '#1e293b' },
  itemCard: { 
    backgroundColor: '#ffffff', padding: 12, borderRadius: 14, 
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' 
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#cbd5e1',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  itemPrice: { fontSize: 13, color: '#6366f1', marginTop: 2, fontWeight: '600' },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    padding: 1,
  },
  qtyBtn: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 8,
  },
  deleteBtn: {
    padding: 6,
  },
  totalText: { fontSize: 17, fontWeight: 'bold', textAlign: 'right', marginTop: 12, color: '#16a34a' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 16 },
  label: { fontSize: 12, fontWeight: 'bold', marginTop: 8, color: '#475569' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginTop: 4, backgroundColor: '#ffffff', fontSize: 14, color: '#334155' },
  disabledInput: { backgroundColor: '#f1f5f9', color: '#64748b' },
  btnComprar: { backgroundColor: '#4f46e5', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  disabledBtn: { backgroundColor: '#cbd5e1' },
  btnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 40,
  },
});