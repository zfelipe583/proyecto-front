import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export const AdminScreen = ({ navigation }) => {
  const { user, orders, products, createNewProduct, updateExistingProduct, updateShippingDetails, logout } = useApp();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('5'); 
  const [category, setCategory] = useState('Hardware'); 
  const [imagenesInput, setImagenesInput] = useState(''); 

  const [editingProduct, setEditingProduct] = useState(null); 
  const [trackingCodes, setTrackingCodes] = useState({});
  const [creating, setCreating] = useState(false);

  const myProducts = products.filter(p => (p.seller_id || p.vendedor_id) === user?._id);

  const totalSales = orders.reduce((sum, order) => {
    const myItems = order.items.filter(item => (item.seller_id || item.vendedor_id) === user?._id);
    const myItemsSum = myItems.reduce((acc, curr) => {
      const price = curr.price_paid !== undefined ? curr.price_paid : (curr.precio_pagado || 0);
      const qty = curr.quantity !== undefined ? curr.quantity : (curr.cantidad || 0);
      return acc + (price * qty);
    }, 0);
    return sum + myItemsSum;
  }, 0);

  const pendingShipments = orders.reduce((count, order) => {
    const myPendingItems = order.items.filter(
      item => (item.seller_id || item.vendedor_id) === user?._id && 
              (item.shipping_status === 'pending' || item.shipping_status === 'pendiente_de_envio' || item.estado_envio === 'pendiente_de_envio')
    );
    return count + myPendingItems.length;
  }, 0);

  const handleStartEdit = (prod) => {
    setEditingProduct(prod);
    setName(prod.name || prod.nombre || '');
    setPrice((prod.price !== undefined ? prod.price : (prod.precio || 0)).toString());
    setDescription(prod.description || prod.descripcion || '');
    setStock((prod.stock !== undefined ? prod.stock : 5).toString());
    setCategory(prod.category?.name || prod.categoria?.nombre || 'Hardware');
    const imgs = prod.images || prod.imagenes || [];
    setImagenesInput(imgs.join(', '));
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setDescription('');
    setStock('5');
    setImagenesInput('');
  };

  const handleCreateProduct = async () => {
    if (!name || !price || !description) {
      Alert.alert("Campos vacíos", "Por favor llena todos los datos para continuar.");
      return;
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);
    if (isNaN(parsedPrice) || isNaN(parsedStock)) {
      Alert.alert("Error", "El precio y el stock deben ser números válidos.");
      return;
    }

    const listImagenes = imagenesInput
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const defaultImg = category === 'Fotografía' 
      ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600'
      : 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600';

    const finalImagenes = listImagenes.length > 0 ? listImagenes : [defaultImg];

    const productData = {
      name: name,
      price: parsedPrice,
      description: description,
      stock: parsedStock,
      category: {
        name: category,
        slug: category.toLowerCase()
      },
      images: finalImagenes
    };
    
    setCreating(true);
    try {
      if (editingProduct) {
        await updateExistingProduct(editingProduct._id, productData);
        Alert.alert("¡Producto Editado!", `Se actualizaron los datos de "${name}".`);
        setEditingProduct(null);
      } else {
        await createNewProduct({
          ...productData,
          seller_id: user._id 
        });
        Alert.alert("¡Producto Creado!", `Se agregó "${name}" al inventario.`);
      }

      setName('');
      setPrice('');
      setDescription('');
      setStock('5');
      setImagenesInput('');
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar el producto: " + e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleTrackingChange = (orderId, productId, code) => {
    setTrackingCodes(prev => ({
      ...prev,
      [`${orderId}_${productId}`]: code
    }));
  };

  const handleShipOrder = (orderId, item) => {
    const itemId = item.product_id || item.producto_id;
    const itemName = item.name || item.nombre;
    const codeKey = `${orderId}_${itemId}`;
    const code = trackingCodes[codeKey]?.trim() || '';

    if (!code) {
      Alert.alert('Código de Rastreo', 'Por favor ingresa un código de rastreo para despachar el producto.');
      return;
    }

    Alert.alert(
      'Confirmar Envío',
      `¿Deseas registrar el envío de "${itemName}" con guía "${code}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            await updateShippingDetails(orderId, itemId, 'shipped', code);
            Alert.alert('Despachado', 'Envío registrado correctamente.');
          } 
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <StatusBar style="dark" />

      <View style={styles.sellerHeader}>
        <View style={styles.storeLogo}>
          <Ionicons name="storefront" size={24} color="#b45309" />
        </View>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{user?.seller_data?.store_name || user?.datos_vendedor?.nombre_tienda || 'Zermeño Tech Store'}</Text>
          <Text style={styles.sellerName}>{user?.name || 'Jaime Eduardo'} (Rating: {user?.seller_data?.average_rating || user?.datos_vendedor?.calificacion_promedio || 5.0})</Text>
          <Text style={styles.clabeText}>CLABE: {user?.seller_data?.bank_clabe || user?.datos_vendedor?.clabe_interbancaria}</Text>
        </View>
        <TouchableOpacity style={styles.editProfileBtn} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="pencil-outline" size={18} color="#EA580C" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Ventas Totales</Text>
          <Text style={styles.metricValue}>
            ${totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={[styles.metricCard, pendingShipments > 0 && styles.metricCardAlert]}>
          <Text style={styles.metricLabel}>Envíos Pendientes</Text>
          <Text style={[styles.metricValue, pendingShipments > 0 && { color: '#b45309' }]}>
            {pendingShipments}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Pedidos Recibidos</Text>
      {orders.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No has recibido ningún pedido aún.</Text>
        </View>
      ) : (
        orders.map((order) => {
          const myItems = order.items.filter(item => (item.seller_id || item.vendedor_id) === user?._id);
          const orderDateVal = order.order_date || order.fecha_pedido;
          const streetVal = order.shipping_address?.street || order.direccion_envio?.calle || '';
          const cityVal = order.shipping_address?.city || order.direccion_envio?.ciudad || '';
          const zipVal = order.shipping_address?.zip_code || order.direccion_envio?.codigo_postal || '';

          return (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <Text style={styles.orderDate}>{new Date(orderDateVal).toLocaleDateString('es-MX')}</Text>
                <Text style={styles.orderClient}>Cliente: Carlos Gómez</Text>
              </View>

              <View style={styles.addressBox}>
                <Text style={styles.addressLabel}>Dirección de envío:</Text>
                <Text style={styles.addressText}>
                  {streetVal}, {cityVal}, C.P. {zipVal}
                </Text>
              </View>

              {myItems.map((item, idx) => {
                const itemId = item.product_id || item.producto_id;
                const itemName = item.name || item.nombre;
                const itemQty = item.quantity !== undefined ? item.quantity : (item.cantidad || 0);
                const shipStatus = item.shipping_status || item.estado_envio || 'pending';
                const trackCode = item.tracking_code || item.codigo_rastreo;
                
                const isPending = shipStatus === 'pending' || shipStatus === 'pendiente_de_envio';
                const codeKey = `${order._id}_${itemId}`;

                return (
                  <View key={idx} style={styles.itemBox}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{itemName}</Text>
                      <Text style={styles.itemQty}>Cant: {itemQty}</Text>
                    </View>
                    
                    {isPending ? (
                      <View style={styles.shippingForm}>
                        <TextInput
                          style={styles.trackingInput}
                          placeholder="Ingresa guía de rastreo (ej. MX-992)"
                          placeholderTextColor="#94a3b8"
                          value={trackingCodes[codeKey] || ''}
                          onChangeText={(text) => handleTrackingChange(order._id, itemId, text)}
                        />
                        <TouchableOpacity 
                          style={styles.shipBtn}
                          onPress={() => handleShipOrder(order._id, item)}
                        >
                          <Text style={styles.shipBtnText}>Enviar</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.shippedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#16a34a" style={{marginRight: 4}} />
                        <Text style={styles.shippedText}>
                          Despachado (Guía: <Text style={styles.shippedCode}>{trackCode}</Text>)
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })
      )}

      <Text style={styles.sectionTitle}>
        {editingProduct ? `Editar Producto: ${editingProduct.nombre || editingProduct.name}` : 'Agregar Producto al Inventario'}
      </Text>
      <View style={styles.formCard}>
        <Text style={styles.label}>Nombre del Producto:</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej. Cámara Réflex Profesional" 
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.formRow}>
          <View style={{ flex: 0.48 }}>
            <Text style={styles.label}>Precio ($ MXN):</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ej. 12500" 
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={{ flex: 0.48 }}>
            <Text style={styles.label}>Stock Disponible:</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ej. 5" 
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
            />
          </View>
        </View>

        <Text style={styles.label}>Categoría:</Text>
        <View style={styles.categorySelectRow}>
          {['Hardware', 'Fotografía', 'Audio', 'Celulares', 'Videojuegos'].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catSelectChip,
                category === cat && styles.catSelectChipActive
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[
                styles.catSelectChipText,
                category === cat && { color: '#ffffff' }
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Imágenes del Producto (URLs separadas por comas):</Text>
        <TextInput 
          style={styles.input} 
          placeholder="https://ejemplo.com/foto1.jpg, https://ejemplo.com/foto2.jpg" 
          placeholderTextColor="#94a3b8"
          value={imagenesInput}
          onChangeText={setImagenesInput}
        />

        <Text style={styles.label}>Descripción:</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Escribe los detalles del artículo..." 
          placeholderTextColor="#94a3b8"
          multiline={true}
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity 
          style={[styles.btnGuardar, creating && {backgroundColor: '#64748b'}]} 
          onPress={handleCreateProduct}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnText}>
              {editingProduct ? 'Guardar Cambios' : 'Agregar Producto'}
            </Text>
          )}
        </TouchableOpacity>

        {editingProduct && (
          <TouchableOpacity 
            style={[styles.btnGuardar, { backgroundColor: '#ef4444', marginTop: 8 }]} 
            onPress={handleCancelEdit}
          >
            <Text style={styles.btnText}>Cancelar Edición</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Productos en Venta ({myProducts.length})</Text>
      {myProducts.map((prod) => (
        <View key={prod._id} style={styles.catalogItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.catalogItemName}>{prod.name || prod.nombre}</Text>
            <Text style={styles.catalogItemPrice}>
              ${(prod.price !== undefined ? prod.price : (prod.precio || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.catalogItemCat}>Categoría: {prod.category?.name || prod.categoria?.nombre || 'General'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editProductIconBtn}
            onPress={() => handleStartEdit(prod)}
          >
            <Ionicons name="create-outline" size={18} color="#4f46e5" />
          </TouchableOpacity>

          <View style={[styles.stockBox, prod.stock === 0 ? {backgroundColor: '#fee2e2'} : {backgroundColor: '#f1f5f9'}]}>
            <Text style={styles.stockLabel}>Stock</Text>
            <Text style={styles.stockValueNum}>{prod.stock !== undefined ? prod.stock : 5}</Text>
          </View>
        </View>
      ))}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  scrollContent: { paddingBottom: 60 },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A', 
    padding: 20,
    borderRadius: 24, 
    borderWidth: 0,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  storeLogo: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1E293B', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  sellerName: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  clabeText: { fontSize: 10, color: '#64748B', marginTop: 4, fontFamily: 'monospace' },
  editProfileBtn: { padding: 10, backgroundColor: '#FFF7ED', borderRadius: 12, marginRight: 8 },
  logoutBtn: { padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  metricCard: {
    flex: 0.485,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  metricCardAlert: { backgroundColor: '#FFF7ED' },
  metricLabel: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  metricValue: { fontSize: 24, fontWeight: '900', color: '#EA580C', marginTop: 8 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginTop: 10, marginBottom: 16, letterSpacing: -0.5 },
  emptyCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 0, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  orderCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 16, borderWidth: 0, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
    borderLeftWidth: 6, borderLeftColor: '#2563EB', 
  },
  orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12, marginBottom: 12 },
  orderDate: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  orderClient: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  addressBox: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 0 },
  addressLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  addressText: { fontSize: 12, color: '#0F172A', marginTop: 2, fontWeight: '500' },
  itemBox: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 4 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 14, fontWeight: '800', color: '#0F172A', flex: 0.8 },
  itemQty: { fontSize: 13, color: '#EA580C', fontWeight: '900', flex: 0.2, textAlign: 'right' },
  shippingForm: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  trackingInput: {
    flex: 1, height: 44, borderWidth: 0, borderRadius: 10, paddingHorizontal: 12, fontSize: 13, color: '#0F172A', marginRight: 8, backgroundColor: '#F3F4F6',
  },
  shipBtn: { backgroundColor: '#EA580C', paddingHorizontal: 16, height: 44, borderRadius: 10, justifyContent: 'center', shadowColor: '#EA580C', shadowOpacity: 0.3, shadowOffset: {width: 0, height: 4}, shadowRadius: 6, elevation: 4 },
  shipBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 13 },
  shippedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  shippedText: { fontSize: 10, color: '#166534' },
  shippedCode: { fontWeight: 'bold' },
  formCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, borderWidth: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, marginBottom: 24 },
  formRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 13, fontWeight: '800', marginTop: 16, color: '#0F172A' },
  input: { borderWidth: 0, borderRadius: 12, padding: 14, marginTop: 8, fontSize: 14, color: '#0F172A', backgroundColor: '#F3F4F6' },
  textArea: { height: 80, textAlignVertical: 'top' },
  categorySelectRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4, marginTop: 8 },
  catSelectChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, borderWidth: 0, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8 },
  catSelectChipActive: { backgroundColor: '#2563EB' },
  catSelectChipText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  btnGuardar: { backgroundColor: '#EA580C', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 24, shadowColor: '#EA580C', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  catalogItem: {
    flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 16, padding: 14, borderWidth: 0, marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  catalogItemName: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  catalogItemPrice: { fontSize: 15, fontWeight: '900', color: '#EA580C', marginTop: 2 },
  catalogItemCat: { fontSize: 11, color: '#64748B', marginTop: 4, fontWeight: '600' },
  stockBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  stockLabel: { fontSize: 9, color: '#64748B', fontWeight: '700' },
  stockValueNum: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 1 },
  editProductIconBtn: { padding: 10, marginRight: 12, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});