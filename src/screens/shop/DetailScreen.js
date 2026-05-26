import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export const DetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const { addToCart, cart } = useApp();
  const [seller, setSeller] = React.useState(null);

  React.useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const sellerId = product.seller_id || product.vendedor_id;
        if (sellerId) {
          const data = await apiService.getUser(sellerId);
          if (data) {
            setSeller(data);
          }
        }
      } catch (err) {
        console.error('Error fetching seller details:', err);
      }
    };
    fetchSellerInfo();
  }, [product]);

  const name = product.name || product.nombre || 'Sin nombre';
  const price = product.price !== undefined ? product.price : (product.precio || 0);
  const description = product.description || product.descripcion || 'Sin descripción';
  const imageUri = product.images?.[0] || product.imagenes?.[0] || product.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=200';
  const category = product.category?.name || product.categoria?.nombre || 'General';
  const stock = product.stock !== undefined ? product.stock : 5;
  const isOutOfStock = stock <= 0;

  // Manejo de carrusel de imágenes
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const images = product.images && product.images.length > 0 
    ? product.images 
    : (product.imagenes && product.imagenes.length > 0 ? product.imagenes : [imageUri]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveImageIndex(index);
  };

  // Comprobar cantidad actual en carrito
  const cartItem = cart.items.find(item => item.product_id === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    if (quantityInCart >= stock) {
      Alert.alert(
        'Stock limitado',
        `No puedes agregar más artículos de los disponibles. (Stock actual: ${stock})`
      );
      return;
    }

    addToCart(product, 1);
    Alert.alert(
      '¡Agregado!',
      `Se agregó ${name} al carrito.`,
      [
        { text: 'Seguir comprando', style: 'cancel' },
        { text: 'Ir al Carrito', onPress: () => navigation.navigate('CartTab') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Imagen del Producto (Carrusel) */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.productImage} />
            ))}
          </ScrollView>

          {/* Dot Indicators */}
          {images.length > 1 && (
            <View style={styles.indicatorContainer}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.indicatorDot,
                    activeImageIndex === idx && styles.activeIndicatorDot
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Detalles Principales */}
        <View style={styles.detailsContainer}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>{category}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#eab308" />
              <Text style={styles.ratingText}> 4.9</Text>
            </View>
          </View>

          <Text style={styles.productName}>{name}</Text>

          {/* Precio y Stock */}
          <View style={styles.priceStockRow}>
            <Text style={styles.productPrice}>
              ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </Text>
            
            <View style={[
              styles.stockBadge, 
              isOutOfStock ? styles.outOfStock : stock === 1 ? styles.lowStock : styles.inStock
            ]}>
              <Text style={[
                styles.stockText, 
                isOutOfStock ? styles.outOfStockText : stock === 1 ? styles.lowStockText : styles.inStockText
              ]}>
                {isOutOfStock ? 'Agotado' : stock === 1 ? '¡Última unidad!' : `${stock} unidades`}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Descripción */}
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.productDescription}>{description}</Text>

          <View style={styles.divider} />

          {/* Información del Vendedor */}
          <Text style={styles.sectionTitle}>Información del Vendedor</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Ionicons name="storefront" size={22} color="#6366f1" />
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>
                {seller?.seller_data?.store_name || seller?.datos_vendedor?.nombre_tienda || 'Tienda Colaboradora'}
              </Text>
              <Text style={styles.sellerSub}>
                Vendedor: {seller?.name || 'Vendedor Verificado'} • {seller?.addresses?.[0]?.city || seller?.direcciones?.[0]?.ciudad || 'Guanajuato'}
              </Text>
              <View style={styles.sellerRating}>
                <Ionicons name="shield-checkmark" size={13} color="#16a34a" />
                <Text style={styles.sellerRatingText}>
                  {' '}Calificación: {seller?.seller_data?.average_rating || seller?.datos_vendedor?.calificacion_promedio || '5.0'} / 5.0
                </Text>
              </View>
            </View>
          </View>

          {/* Nota de devolución */}
          <View style={styles.infoAlert}>
            <Ionicons name="information-circle-outline" size={18} color="#0284c7" />
            <Text style={styles.infoAlertText}>
              Compra Protegida. Recibe el producto que esperabas o te devolvemos tu dinero.
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* Panel Inferior Fijo de Acción */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarPriceInfo}>
          <Text style={styles.bottomPriceLabel}>Total aproximado</Text>
          <Text style={styles.bottomPrice}>
            ${price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, isOutOfStock && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Ionicons name="cart-outline" size={18} color="#ffffff" style={styles.btnIcon} />
          <Text style={styles.actionButtonText}>
            {isOutOfStock ? 'Sin stock' : quantityInCart > 0 ? `Agregar otro (${quantityInCart})` : 'Agregar al Carrito'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { paddingBottom: 110 },
  imageContainer: {
    width: width,
    height: 260,
    backgroundColor: '#f8fafc',
    position: 'relative',
  },
  productImage: { width: width, height: 260, resizeMode: 'cover' },
  indicatorContainer: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 3,
  },
  activeIndicatorDot: {
    backgroundColor: '#ffffff',
    width: 8,
  },
  detailsContainer: { padding: 16 },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9c3',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#854d0e',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 6,
  },
  priceStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  productPrice: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  inStock: { backgroundColor: '#dcfce7' },
  lowStock: { backgroundColor: '#ffedd5' },
  outOfStock: { backgroundColor: '#fee2e2' },
  stockText: { fontSize: 10, fontWeight: 'bold' },
  inStockText: { color: '#166534' },
  lowStockText: { color: '#9a3412' },
  outOfStockText: { color: '#991b1b' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  productDescription: { fontSize: 13, color: '#475569', lineHeight: 20 },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  sellerSub: { fontSize: 10, color: '#64748b', marginTop: 1 },
  sellerRating: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  sellerRatingText: { fontSize: 10, fontWeight: 'bold', color: '#166534' },
  infoAlert: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 10,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  infoAlertText: {
    flex: 1,
    fontSize: 10,
    color: '#0369a1',
    marginLeft: 6,
    lineHeight: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    elevation: 8,
  },
  bottomBarPriceInfo: { flex: 0.4 },
  bottomPriceLabel: { fontSize: 10, color: '#64748b' },
  bottomPrice: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 1 },
  actionButton: {
    flex: 0.58,
    backgroundColor: '#4f46e5',
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: { backgroundColor: '#cbd5e1', shadowOpacity: 0, elevation: 0 },
  btnIcon: { marginRight: 4 },
  actionButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
});