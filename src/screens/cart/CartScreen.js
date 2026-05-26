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
  const [calle, setCalle] = useState(''); 
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
    return cart.items.reduce((sum, item) => sum + ((item.unit_price || item.precio_unitario || 0) * (item.quantity || item.cantidad || 0)), 0);
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
        street: calle,
        city: city,
        state: state,
        zip_code: zipCode
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


      {cart.items.map((item) => {
        const itemId = item.product_id || item.producto_id;
        const itemName = item.name || item.nombre;
        const itemPrice = item.unit_price !== undefined ? item.unit_price : (item.precio_unitario || 0);
        const itemQty = item.quantity !== undefined ? item.quantity : (item.cantidad || 0);
        
        const originalProd = products.find(p => p._id === itemId);
        const imageUrl = originalProd?.images?.[0] || originalProd?.imagenes?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=200';

        return (
          <View key={itemId} style={styles.itemCard}>
            <Image source={{ uri: imageUrl }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{itemName}</Text>
              <Text style={styles.itemPrice}>
                ${itemPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </Text>
              

              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  style={styles.qtyBtn} 
                  onPress={() => handleQuantityChange(itemId, itemQty, -1)}
                >
                  <Ionicons name="remove" size={14} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{itemQty}</Text>
                <TouchableOpacity 
                  style={styles.qtyBtn} 
                  onPress={() => handleQuantityChange(itemId, itemQty, 1)}
                >
                  <Ionicons name="add" size={14} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemoveItem(itemId)}>
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
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 }, 
  scrollContent: { paddingBottom: 50 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 20, color: '#0F172A', letterSpacing: -0.5 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginTop: 12, marginBottom: 12, color: '#0F172A' },
  itemCard: { 
    backgroundColor: '#ffffff', 
    padding: 16, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 16, 
    borderWidth: 0, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12, 
    backgroundColor: '#F3F4F6',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  itemPrice: { fontSize: 15, color: '#EA580C', marginTop: 2, fontWeight: '900' }, // Orange brand
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20, 
    alignSelf: 'flex-start',
    marginTop: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  qtyBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 10,
  },
  deleteBtn: {
    padding: 10, 
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  totalText: { fontSize: 24, fontWeight: '900', textAlign: 'right', marginTop: 12, color: '#0F172A', letterSpacing: -0.5 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 24 },
  label: { fontSize: 13, fontWeight: '800', marginTop: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { 
    borderWidth: 0, 
    borderRadius: 14, 
    padding: 16, 
    marginTop: 6, 
    backgroundColor: '#ffffff', 
    fontSize: 15, 
    color: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  disabledInput: { backgroundColor: '#F9FAFB', color: '#94A3B8', shadowOpacity: 0, elevation: 0 },
  btnComprar: { 
    backgroundColor: '#EA580C', 
    padding: 18, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginTop: 32,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledBtn: { backgroundColor: '#FDBA74', shadowOpacity: 0, elevation: 0 },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
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