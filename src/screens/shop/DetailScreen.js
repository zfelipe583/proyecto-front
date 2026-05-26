import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

export const DetailScreen = ({ route }) => {
  const { product } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <Text style={styles.description}>{product.description}</Text>
        
        <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Añadido", "Producto agregado al carrito.")}>
          <Text style={styles.buttonText}>Agregar al Carrito</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  info: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 22, color: '#007bff', fontWeight: '600', marginVertical: 10 },
  description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 20 },
  button: { backgroundColor: '#007bff', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});