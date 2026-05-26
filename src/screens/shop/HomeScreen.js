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
      <StatusBar style="dark" />
      
      <View style={styles.headerArea}>
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.helloText}>Descubrir</Text>
            <Text style={styles.subWelcome}>Hola, {user?.name || 'Comprador'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="person-circle-outline" size={44} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
  container: { flex: 1, backgroundColor: '#F8FAFC' }, 
  headerArea: {
    backgroundColor: '#F8FAFC',
    paddingTop: 16, 
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helloText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -1,
  },
  subWelcome: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
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
    marginLeft: 16,
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16, 
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0', 
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
    marginTop: 24,
    marginBottom: 8,
  },
  categoryListContent: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12, 
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0', 
  },
  activeCategoryChip: {
    backgroundColor: '#EA580C', 
    borderColor: '#EA580C',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  activeCategoryChipText: {
    color: '#ffffff',
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    marginTop: 8, 
    marginBottom: 16, 
    paddingLeft: 20, 
    color: '#111827',
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