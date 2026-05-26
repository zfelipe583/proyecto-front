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

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const images = product.images && product.images.length > 0 
    ? product.images 
    : (product.imagenes && product.imagenes.length > 0 ? product.imagenes : [imageUri]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveImageIndex(index);
  };

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

        <View style={styles.detailsContainer}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>{category}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#eab308" />
              <Text style={styles.ratingText}> 4.9</Text>
            </View>
          </View>

          <Text style={styles.productName}>{name}</Text>

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

          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.productDescription}>{description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Información del Vendedor</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Ionicons name="storefront" size={22} color="#2563EB" />
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

          <View style={styles.infoAlert}>
            <Ionicons name="information-circle-outline" size={18} color="#0284c7" />
            <Text style={styles.infoAlertText}>
              Compra Protegida. Recibe el producto que esperabas o te devolvemos tu dinero.
            </Text>
          </View>

        </View>
      </ScrollView>

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
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { paddingBottom: 110 },
  imageContainer: {
    width: width,
    height: 380, 
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  productImage: { width: width, height: 380, resizeMode: 'cover', opacity: 0.95 },
  indicatorContainer: {
    position: 'absolute',
    bottom: 75, 
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 3,
  },
  detailsContainer: { 
    padding: 24, 
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40,
    marginTop: -60, 
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB', 
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
    fontSize: 26, 
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 10,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  priceStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  productPrice: { fontSize: 28, fontWeight: '900', color: '#EA580C' },
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
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
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
  bottomBar: {
    position: 'absolute',
    bottom: 20, 
    left: 20,
    right: 20,
    backgroundColor: '#0F172A', 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 15,
  },
  bottomBarPriceInfo: { flex: 0.35 },
  bottomPriceLabel: { fontSize: 11, color: '#94A3B8' },
  bottomPrice: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginTop: 1 },
  actionButton: {
    flex: 0.58,
    backgroundColor: '#EA580C',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: { backgroundColor: '#FDBA74', shadowOpacity: 0, elevation: 0 },
  btnIcon: { marginRight: 6 },
  actionButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
});