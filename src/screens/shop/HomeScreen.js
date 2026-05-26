import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ProductCard } from '../../components/ProductCard';
import { useApp } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export const HomeScreen = ({ navigation }) => {
  const { user, products, loading, logout } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Hardware', 'Fotografía', 'Audio', 'Celulares', 'Videojuegos'];

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir de tu perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: logout }
      ]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      (product.name || product.nombre || '').toLowerCase().includes(search.toLowerCase()) || 
      (product.description || product.descripcion || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'Todos' || 
      (product.category?.name || product.categoria?.nombre || '') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading && products.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Premium Dark Header */}
      <View style={styles.darkHeader}>
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.helloText}>Hola, {user?.name || 'Comprador'} 👋</Text>
            <Text style={styles.subWelcome}>¿Qué deseas adquirir hoy?</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.avatarButton}>
              <Ionicons name="person-circle" size={44} color="#EA580C" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Floating Overlapping Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cámaras, hardware..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories chips list */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.activeCategoryChip
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === item && styles.activeCategoryChipText
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryListContent}
        />
      </View>

      <Text style={styles.headerTitle}>Productos Destacados</Text>
      
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id || item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptySubtitle}>No encontramos productos que coincidan con tu búsqueda.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  darkHeader: {
    backgroundColor: '#0F172A',
    paddingTop: 55,
    paddingBottom: 45, // Extra space for overlap
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  helloText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subWelcome: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  avatarButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 22,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutBtn: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Subtle red
    borderRadius: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 56, // Taller and more prominent
    borderRadius: 16, // Smoother corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    marginTop: -28, // OVERLAPS the dark header
    zIndex: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  categoryContainer: {
    marginTop: 24, // Space from search bar
    marginBottom: 8,
  },
  categoryListContent: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  activeCategoryChip: {
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  activeCategoryChipText: {
    color: '#ffffff',
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '900', 
    marginVertical: 16, 
    paddingLeft: 20, 
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 20, paddingHorizontal: 8 },
  gridRow: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 30,
  },
});