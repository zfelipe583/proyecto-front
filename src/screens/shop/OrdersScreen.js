import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Clipboard, Alert, Dimensions } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export const OrdersScreen = () => {
  const { orders } = useApp();

  const copyToClipboard = (text, label) => {
    Clipboard.setString(text);
    Alert.alert('Copiado', `${label} copiado al portapapeles.`);
  };

  const renderOrderItem = ({ item: order }) => {
    const orderDateVal = order.order_date || order.fecha_pedido;
    const formattedDate = new Date(orderDateVal).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const isOrderShipped = order.status === 'shipped' || order.estado_general === 'enviado';

    return (
      <View style={[styles.orderCard, { borderLeftColor: isOrderShipped ? '#16A34A' : '#EA580C' }]}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId} numberOfLines={1}>ID: {order._id}</Text>
            <Text style={styles.orderDate}>{formattedDate}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            (order.status === 'shipped' || order.estado_general === 'enviado') ? styles.statusShipped : styles.statusProcessing
          ]}>
            <Text style={[
              styles.statusText,
              (order.status === 'shipped' || order.estado_general === 'enviado') ? styles.statusShippedText : styles.statusProcessingText
            ]}>
              {(order.status === 'shipped' || order.estado_general === 'enviado') ? 'Enviado' : 'Procesando'}
            </Text>
          </View>
        </View>


        <View style={styles.itemsList}>
          {order.items.map((item, idx) => {
            const itemName = item.name || item.nombre;
            const itemQty = item.quantity !== undefined ? item.quantity : (item.cantidad || 0);
            const itemPrice = item.price_paid !== undefined ? item.price_paid : (item.precio_pagado || 0);
            const shipStatus = item.shipping_status || item.estado_envio || 'pending';
            const trackCode = item.tracking_code || item.codigo_rastreo;

            const isItemShipped = shipStatus === 'shipped' || shipStatus === 'enviado';

            return (
              <View key={idx} style={styles.itemRow}>
                <View style={[
                  styles.itemIconBox, 
                  { 
                    backgroundColor: isItemShipped ? '#16A34A' : '#EA580C',
                    shadowColor: isItemShipped ? '#16A34A' : '#EA580C' 
                  }
                ]}>
                  <Ionicons name="cube" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>{itemName}</Text>
                  <Text style={styles.itemSub}>
                    Cant: {itemQty} x ${itemPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </Text>
                  
                  <View style={styles.shippingStateRow}>
                    <Text style={styles.shippingLabel}>Envío: </Text>
                    <Text style={[
                      styles.shippingVal,
                      shipStatus === 'shipped' ? { color: '#16a34a' } : { color: '#d97706' }
                    ]}>
                      {shipStatus === 'pending' || shipStatus === 'pendiente_de_envio' ? 'Pendiente de envío' : 'En camino / Enviado'}
                    </Text>
                  </View>

                  {trackCode ? (
                    <TouchableOpacity 
                      style={styles.trackingBox}
                      onPress={() => copyToClipboard(trackCode, 'Guía de rastreo')}
                    >
                      <Ionicons name="car-outline" size={13} color="#2563EB" />
                      <Text style={styles.trackingText}>
                        Guía: <Text style={styles.trackingCode}>{trackCode}</Text> 📋
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.trackingBox}>
                      <Ionicons name="hourglass-outline" size={13} color="#64748b" />
                      <Text style={[styles.trackingText, { color: '#64748b', fontStyle: 'italic' }]}>
                        Guía: Esperando despacho del vendedor
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.paymentBox}>
            <Text style={styles.paymentMethod}>💳 Pago: Tarjeta (Stripe)</Text>
            <TouchableOpacity onPress={() => {
              const txId = order.payment?.transaction_id || order.pago?.transaccion_id || 'N/A';
              copyToClipboard(txId, 'Transacción Stripe');
            }}>
              <Text style={styles.paymentTx} numberOfLines={1}>
                Tx: {order.payment?.transaction_id || order.pago?.transaccion_id || 'N/A'} 📋
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Monto total</Text>
            <Text style={styles.totalPrice}>
              ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={56} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No tienes compras aún</Text>
            <Text style={styles.emptySubtitle}>
              Cuando confirmes una compra en el carrito, podrás ver su estado y código de rastreo aquí.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' }, 
  listContent: { padding: 20, paddingBottom: 40 },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, 
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 14,
  },
  orderId: { fontSize: 15, fontWeight: '900', color: '#111827', maxWidth: width * 0.5 },
  orderDate: { fontSize: 13, color: '#475569', marginTop: 4, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusProcessing: { backgroundColor: '#F1F5F9' },
  statusShipped: { backgroundColor: '#DCFCE7' },
  statusText: { fontSize: 11, fontWeight: '800' },
  statusProcessingText: { color: '#475569' },
  statusShippedText: { color: '#166534' },
  itemsList: { paddingVertical: 12 },
  itemRow: { 
    flexDirection: 'row', 
    marginBottom: 12, 
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  itemIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  itemSub: { fontSize: 12, color: '#475569', marginTop: 2 },
  shippingStateRow: { flexDirection: 'row', marginTop: 6, alignItems: 'center' },
  shippingLabel: { fontSize: 12, color: '#475569' },
  shippingVal: { fontSize: 12, fontWeight: '800' },
  trackingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF', 
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE', 
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  trackingText: { fontSize: 11, color: '#1D4ED8', marginLeft: 8, fontWeight: '700' }, 
  trackingCode: { fontWeight: '900', textDecorationLine: 'underline' },
  orderFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0', 
    marginTop: 4 
  },
  paymentBox: { flex: 0.6 },
  paymentMethod: { fontSize: 13, color: '#475569', fontWeight: '700' },
  paymentTx: { fontSize: 12, color: '#64748B', marginTop: 2 },
  totalBox: { flex: 0.4, alignItems: 'flex-end' },
  totalLabel: { fontSize: 12, color: '#475569', fontWeight: '700', textTransform: 'uppercase' },
  totalPrice: { fontSize: 20, fontWeight: '900', color: '#111827', marginTop: 2 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
