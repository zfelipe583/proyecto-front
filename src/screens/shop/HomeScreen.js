import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ProductCard } from '../../components/ProductCard';
import { useApp } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

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
      <StatusBar style="dark" />

      {/* Greeting Banner */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.helloText}>Hola, {user?.name || 'Comprador'} 👋</Text>
          <Text style={styles.subWelcome}>¿Qué deseas adquirir hoy?</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.avatarButton}>
            <Ionicons name="person-circle" size={36} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  helloText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subWelcome: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  avatarButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutBtn: {
    marginLeft: 10,
    padding: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    marginTop: 14,
    marginBottom: 4,
  },
  categoryListContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  activeCategoryChip: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  activeCategoryChipText: {
    color: '#ffffff',
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginVertical: 14, 
    paddingLeft: 16, 
    color: '#1e293b' 
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