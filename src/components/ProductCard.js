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
      
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{category}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </Text>

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
    borderRadius: 18,
    margin: 8,
    width: width / 2 - 20,
    borderWidth: 0, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#F9FAFB',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.5,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  price: {
    fontSize: 16,
    color: '#EA580C',
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