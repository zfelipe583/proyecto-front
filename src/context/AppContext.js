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

  // Cargar información específica del usuario cuando inicie sesión
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
      if (!user.is_seller) {
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
      if (user.is_seller) {
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

  // Operaciones del Carrito (Mapeado a Mongoose: product_id, unit_price, quantity)
  const addToCart = async (product, quantity = 1) => {
    if (!user || user.is_seller) return;
    
    const updatedItems = [...cart.items];
    const existingIndex = updatedItems.findIndex(item => item.product_id === product._id);

    const price = product.price !== undefined ? product.price : product.precio;
    const name = product.name || product.nombre;

    if (existingIndex > -1) {
      updatedItems[existingIndex].quantity += quantity;
    } else {
      updatedItems.push({
        product_id: product._id,
        name: name,
        quantity: quantity,
        unit_price: price
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
    const updatedItems = cart.items.filter(item => item.product_id !== productId);
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
      if (item.product_id === productId) {
        return { ...item, quantity: newQuantity };
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

  // Crear Pedido (Mapeado a Mongoose: buyer_id, shipping_address, items: [{ product_id, seller_id, price_paid, shipping_status }])
  const processCheckout = async (direccionEnvio) => {
    if (!user || cart.items.length === 0) return;

    // Sumar el total
    const total = cart.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    // Mapear items al esquema de Pedidos de la base de datos
    const orderItems = cart.items.map(item => {
      const originalProd = products.find(p => p._id === item.product_id);
      return {
        product_id: item.product_id,
        seller_id: originalProd ? originalProd.seller_id : "665239a2f1b2c3d4e5f6a111", // default a Jaime
        name: item.name,
        quantity: item.quantity,
        price_paid: item.unit_price,
        shipping_status: "pending",
        tracking_code: null
      };
    });

    const orderData = {
      buyer_id: user._id,
      total,
      shipping_address: {
        street: direccionEnvio.street || direccionEnvio.calle,
        city: direccionEnvio.city || direccionEnvio.ciudad,
        state: direccionEnvio.state || direccionEnvio.estado,
        zip_code: direccionEnvio.zip_code || direccionEnvio.codigo_postal
      },
      items: orderItems
    };

    setLoading(true);
    try {
      const newOrder = await apiService.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      
      // Actualizar localmente el stock de los productos inmediatamente
      setProducts(prevProducts => {
        return prevProducts.map(p => {
          const orderedItem = orderItems.find(item => item.product_id === p._id);
          if (orderedItem) {
            return {
              ...p,
              stock: Math.max(0, p.stock - orderedItem.quantity)
            };
          }
          return p;
        });
      });

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
    if (!user || !user.is_seller) return;
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
    if (!user || !user.is_seller) return;
    setLoading(true);
    try {
      const newProduct = await apiService.createProduct({
        seller_id: user._id,
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
    if (!user || !user.is_seller) return;
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
