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

    return (
      <View style={styles.orderCard}>
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

            return (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.bullet} />
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
                      <Ionicons name="car-outline" size={13} color="#4f46e5" />
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  listContent: { padding: 16, paddingBottom: 30 },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  orderId: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', maxWidth: width * 0.5 },
  orderDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusProcessing: { backgroundColor: '#eff6ff' },
  statusShipped: { backgroundColor: '#dcfce7' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  statusProcessingText: { color: '#1d4ed8' },
  statusShippedText: { color: '#166534' },
  itemsList: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  itemRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6366f1', marginTop: 5, marginRight: 8 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  itemSub: { fontSize: 11, color: '#64748b', marginTop: 1 },
  shippingStateRow: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
  shippingLabel: { fontSize: 11, color: '#64748b' },
  shippingVal: { fontSize: 11, fontWeight: 'bold' },
  trackingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  trackingText: { fontSize: 10, color: '#4f46e5', marginLeft: 4, fontWeight: '500' },
  trackingCode: { fontWeight: 'bold', textDecorationLine: 'underline' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 },
  paymentBox: { flex: 0.6 },
  paymentMethod: { fontSize: 11, color: '#475569', fontWeight: '500' },
  paymentTx: { fontSize: 10, color: '#94a3b8', marginTop: 1 },
  totalBox: { flex: 0.4, alignItems: 'flex-end' },
  totalLabel: { fontSize: 10, color: '#64748b' },
  totalPrice: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginTop: 1 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginTop: 16 },
  emptySubtitle: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 6, lineHeight: 18 },
});
