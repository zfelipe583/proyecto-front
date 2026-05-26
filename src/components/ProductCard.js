import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const ProductCard = ({ product, onPress }) => {
  const imageUri = product.images?.[0] || product.imagenes?.[0] || product.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=200';
  const name = product.name || product.nombre || 'Sin nombre';
  const price = product.price !== undefined ? product.price : (product.precio || 0);
  const category = product.category?.name || product.categoria?.nombre || 'General';
  const isLowStock = product.stock === 1;
  const isOutOfStock = product.stock <= 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      
      {/* Category Badge */}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{category}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </Text>

          {/* Stock Tag */}
          {isOutOfStock ? (
            <View style={[styles.stockBadge, styles.stockAlert]}>
              <Text style={[styles.stockText, { color: '#991b1b' }]}>Agotado</Text>
            </View>
          ) : isLowStock ? (
            <View style={[styles.stockBadge, styles.stockWarning]}>
              <Text style={[styles.stockText, { color: '#9a3412' }]}>¡Último!</Text>
            </View>
          ) : product.stock !== undefined ? (
            <View style={[styles.stockBadge, styles.stockOk]}>
              <Text style={[styles.stockText, { color: '#166534' }]}>{product.stock} disp.</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20, // More rounded, modern
    margin: 8,
    width: width / 2 - 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 0, // No border for minimalist look
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: 150, // Much taller for visual impact
    backgroundColor: '#F3F4F6',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#2563EB', // Blue brand
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    fontSize: 15,
    color: '#EA580C', // Orange brand
    fontWeight: '900'
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockOk: {
    backgroundColor: '#dcfce7',
  },
  stockWarning: {
    backgroundColor: '#ffedd5',
  },
  stockAlert: {
    backgroundColor: '#fee2e2',
  },
  stockText: {
    fontSize: 8,
    fontWeight: 'bold',
  }
});