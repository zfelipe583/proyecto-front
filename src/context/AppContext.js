import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../api/client';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Carlos (comprador) o Jaime (vendedor)
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar productos al iniciar
  useEffect(() => {
    fetchProductsList();
  }, []);

  // Cargar información específica del usuario (carrito, pedidos) cuando inicie sesión
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setCart({ items: [] });
      setOrders([]);
    }
  }, [user]);

  const fetchProductsList = async () => {
    try {
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Cargar Pedidos (si es vendedor, de su tienda; si es comprador, los que hizo él)
      await fetchUserOrders();
      // 2. Cargar Carrito (solo si es comprador)
      if (!user.es_vendedor) {
        const cartData = await apiService.getCart(user._id);
        setCart(cartData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!user) return;
    try {
      let ordersData = [];
      if (user.es_vendedor) {
        ordersData = await apiService.getSellerOrders(user._id);
      } else {
        ordersData = await apiService.getBuyerOrders(user._id);
      }
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Autenticación de Personas (Jaime o Carlos)
  const loginPersona = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiService.login(email, password);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerPersona = async (userData) => {
    setLoading(true);
    try {
      const newUser = await apiService.register(userData);
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Operaciones del Carrito
  const addToCart = async (product, quantity = 1) => {
    if (!user || user.es_vendedor) return;
    
    const updatedItems = [...cart.items];
    const existingIndex = updatedItems.findIndex(item => item.producto_id === product._id);

    if (existingIndex > -1) {
      updatedItems[existingIndex].cantidad += quantity;
    } else {
      updatedItems.push({
        producto_id: product._id,
        nombre: product.nombre,
        cantidad: quantity,
        precio_unitario: product.precio
      });
    }

    try {
      const updatedCart = await apiService.updateCart(user._id, updatedItems);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return;
    const updatedItems = cart.items.filter(item => item.producto_id !== productId);
    try {
      const updatedCart = await apiService.updateCart(user._id, updatedItems);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartItemQuantity = async (productId, newQuantity) => {
    if (!user || newQuantity < 1) return;
    const updatedItems = cart.items.map(item => {
      if (item.producto_id === productId) {
        return { ...item, cantidad: newQuantity };
      }
      return item;
    });
    try {
      const updatedCart = await apiService.updateCart(user._id, updatedItems);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  // Crear Pedido (Checkout del comprador Carlos)
  const processCheckout = async (direccionEnvio) => {
    if (!user || cart.items.length === 0) return;

    // Sumar el total
    const total = cart.items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);

    // Mapear items al esquema de Pedidos de MongoDB
    const orderItems = cart.items.map(item => {
      // Buscar el producto original para obtener el vendedor_id
      const originalProd = products.find(p => p._id === item.producto_id);
      return {
        producto_id: item.producto_id,
        vendedor_id: originalProd ? originalProd.vendedor_id : "665239a2f1b2c3d4e5f6a111", // default a Jaime
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio_pagado: item.precio_unitario,
        estado_envio: "pendiente_de_envio",
        codigo_rastreo: null
      };
    });

    const orderData = {
      comprador_id: user._id,
      total,
      direccion_envio: {
        calle: direccionEnvio.calle,
        ciudad: direccionEnvio.ciudad,
        estado: direccionEnvio.estado,
        codigo_postal: direccionEnvio.codigo_postal
      },
      items: orderItems
    };

    setLoading(true);
    try {
      const newOrder = await apiService.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      setCart({ items: [] }); // Vaciar localmente
      await fetchProductsList(); // Actualizar stock de los productos
      return newOrder;
    } catch (error) {
      console.error('Error processing checkout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Acciones del Vendedor (Jaime)
  const updateShippingDetails = async (orderId, productId, status, trackingCode = null) => {
    if (!user || !user.es_vendedor) return;
    setLoading(true);
    try {
      await apiService.updateShippingStatus(orderId, productId, status, trackingCode);
      // Recargar pedidos del vendedor para actualizar la vista
      await fetchUserOrders();
    } catch (error) {
      console.error('Error updating shipping status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Crear Producto Nuevo (Vendedor Jaime)
  const createNewProduct = async (productData) => {
    if (!user || !user.es_vendedor) return;
    setLoading(true);
    try {
      const newProduct = await apiService.createProduct({
        vendedor_id: user._id,
        ...productData,
      });
      await fetchProductsList(); // Recargar productos locales
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Editar Producto Existente (Vendedor Jaime)
  const updateExistingProduct = async (productId, productData) => {
    if (!user || !user.es_vendedor) return;
    setLoading(true);
    try {
      const updatedProduct = await apiService.updateProduct(productId, productData);
      await fetchProductsList(); // Recargar productos locales
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      products,
      cart,
      orders,
      loading,
      loginPersona,
      registerPersona,
      logout,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      processCheckout,
      updateShippingDetails,
      createNewProduct,
      updateExistingProduct,
      refreshData: loadUserData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
