import axios from 'axios';

export const API_URL = 'http://172.23.90.190:4000/api';

export const USE_MOCK = false;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let mockUsuarios = [
  {
    "_id": "665239a2f1b2c3d4e5f6a111",
    "name": "Jaime Eduardo",
    "email": "jaime@example.com",
    "password_hash": "$2b$12$EjemploDeHashSeguro1234567890Vendedor",
    "registration_date": new Date().toISOString(),
    "is_seller": true,
    "seller_data": {
      "store_name": "Zermeño Tech Store",
      "bank_clabe": "012320012345678901",
      "average_rating": 4.9
    },
    "addresses": [
      {
        "label": "Oficina/Almacén",
        "street": "Av. Universidad 456",
        "city": "Purísima del Rincón",
        "state": "Guanajuato",
        "zip_code": "36400"
      }
    ]
  },
  {
    "_id": "665239a2f1b2c3d4e5f6b222",
    "name": "Carlos Gómez",
    "email": "carlos@example.com",
    "password_hash": "$2b$12$EjemploDeHashSeguro1234567890Comprador",
    "registration_date": new Date().toISOString(),
    "is_seller": false,
    "addresses": [
      {
        "label": "Casa",
        "street": "Calle Flores 123",
        "city": "León",
        "state": "Guanajuato",
        "zip_code": "37000"
      }
    ]
  }
];

let mockProductos = [
  {
    "_id": "665239a2f1b2c3d4e5f6p999",
    "seller_id": "665239a2f1b2c3d4e5f6a111",
    "name": "Cámara Réflex Profesional",
    "description": "Cámara seminueva, excelente para fotografía de estudio. Incluye lente kit 18-55mm.",
    "price": 12500.00,
    "stock": 1,
    "category": {
      "name": "Fotografía",
      "slug": "fotografia"
    },
    "images": [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop"
    ],
    "date_created": new Date().toISOString()
  },
  {
    "_id": "665239a2f1b2c3d4e5f6p888",
    "seller_id": "665239a2f1b2c3d4e5f6a111",
    "name": "Monitor Gamer 27\" 165Hz",
    "description": "Frecuencia de actualización ideal para desarrollo ágil y gaming de alto rendimiento.",
    "price": 4200.00,
    "stock": 5,
    "category": {
      "name": "Hardware",
      "slug": "hardware"
    },
    "images": [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop"
    ],
    "date_created": new Date().toISOString()
  }
];

let mockCarritos = [
  {
    "_id": "665239a2f1b2c3d4e5f6c333",
    "user_id": "665239a2f1b2c3d4e5f6b222",
    "updated_at": new Date().toISOString(),
    "items": [
      {
        "product_id": "665239a2f1b2c3d4e5f6p999",
        "name": "Cámara Réflex Profesional",
        "quantity": 1,
        "unit_price": 12500.00
      }
    ]
  }
];

let mockPedidos = [
  {
    "_id": "665239a2f1b2c3d4e5f6o888",
    "buyer_id": "665239a2f1b2c3d4e5f6b222",
    "order_date": new Date().toISOString(),
    "total": 12500.00,
    "status": "processing",
    "shipping_address": {
      "street": "Calle Flores 123",
      "city": "León",
      "state": "Guanajuato",
      "zip_code": "37000"
    },
    "items": [
      {
        "product_id": "665239a2f1b2c3d4e5f6p999",
        "seller_id": "665239a2f1b2c3d4e5f6a111",
        "name": "Cámara Réflex Profesional",
        "quantity": 1,
        "price_paid": 12500.00,
        "shipping_status": "pending",
        "tracking_code": null
      }
    ],
    "payment": {
      "method": "tarjeta_credito",
      "transaction_id": "ch_stripe_marketplace_777",
      "status": "approved",
      "payment_date": new Date().toISOString()
    }
  }
];

// Helper para simular delay de red
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// FUNCIONES DEL CLIENTE API
// ==========================================

export const apiService = {
  // --- USUARIOS (`/api/users`) ---
  getUser: async (userId) => {
    if (USE_MOCK) {
      await delay();
      return mockUsuarios.find(u => u._id === userId);
    } else {
      const response = await api.get('/users');
      return response.data.find(u => u._id === userId);
    }
  },

  login: async (email, password) => {
    if (USE_MOCK) {
      await delay();
      const user = mockUsuarios.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) throw new Error('Usuario no encontrado');
      return { token: 'mock-jwt-token-12345', user };
    } else {
      const response = await api.get('/users');
      // Comparamos ambos en minúsculas para evitar problemas de capitalización
      const user = response.data.find(
        u => u.email && u.email.trim().toLowerCase() === email.trim().toLowerCase()
      );
      if (!user) throw new Error('Usuario no encontrado');
      return { token: 'real-jwt-token-' + user._id, user };
    }
  },

  register: async (userData) => {
    if (USE_MOCK) {
      await delay();
      const exists = mockUsuarios.some(u => u.email === userData.email);
      if (exists) throw new Error('El correo electrónico ya está registrado');
      
      const newUser = {
        _id: 'user_' + Math.random().toString(36).substring(2, 9),
        registration_date: new Date().toISOString(),
        ...userData,
      };
      mockUsuarios.push(newUser);
      return newUser;
    } else {
      try {
        // Registro va a POST /api/users
        const response = await api.post('users', userData);
        return response.data;
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          const serverMsg = err.response.data.message;
          // Si es un error de duplicado de índice de MongoDB/Mongoose (ej. email)
          if (serverMsg.includes('E11000') || serverMsg.includes('duplicate key') || serverMsg.includes('email_1')) {
            throw new Error('El correo electrónico ya está registrado por otro usuario.');
          }
          throw new Error(serverMsg);
        }
        throw err;
      }
    }
  },

  // --- PRODUCTOS (`/api/products`) ---
  getProducts: async () => {
    if (USE_MOCK) {
      await delay();
      return [...mockProductos];
    } else {
      const response = await api.get('/products');
      return response.data;
    }
  },

  createProduct: async (productData) => {
    if (USE_MOCK) {
      await delay();
      const newProduct = {
        _id: Math.random().toString(36).substring(2, 9),
        date_created: new Date().toISOString(),
        ...productData,
      };
      mockProductos.push(newProduct);
      return newProduct;
    } else {
      const response = await api.post('/products', productData);
      return response.data;
    }
  },
  
  updateProduct: async (productId, productData) => {
    if (USE_MOCK) {
      await delay();
      const index = mockProductos.findIndex(p => p._id === productId);
      if (index !== -1) {
        mockProductos[index] = {
          ...mockProductos[index],
          ...productData,
        };
        return mockProductos[index];
      }
      throw new Error('Producto no encontrado');
    } else {
      // El backend usa PATCH /api/products/:id para actualizar
      const response = await api.patch(`products/${productId}`, productData);
      return response.data;
    }
  },

  deleteProduct: async (productId) => {
    if (USE_MOCK) {
      await delay();
      const index = mockProductos.findIndex(p => p._id === productId);
      if (index !== -1) {
        mockProductos.splice(index, 1);
        return { success: true };
      }
      throw new Error('Producto no encontrado');
    } else {
      // El backend usa DELETE /api/products/:id
      const response = await api.delete(`products/${productId}`);
      return response.data;
    }
  },

  // --- CARRITOS (`/api/carts`) ---
  getCart: async (userId) => {
    if (USE_MOCK) {
      await delay();
      let cart = mockCarritos.find(c => c.user_id === userId);
      if (!cart) {
        cart = {
          _id: Math.random().toString(36).substring(2, 9),
          user_id: userId,
          updated_at: new Date().toISOString(),
          items: [],
        };
        mockCarritos.push(cart);
      }
      return cart;
    } else {
      // Buscamos el carrito del usuario en la lista completa
      const response = await api.get('/carts');
      let cart = response.data.find(c => c.user_id === userId);
      if (!cart) {
        // Si no existe, intentamos crearlo en el backend
        try {
          const createResponse = await api.post('/carts', { user_id: userId, items: [] });
          cart = createResponse.data;
        } catch (err) {
          // Si el backend rechaza la creación (ej. 400), usamos un carrito vacío local
          console.warn('No se pudo crear carrito en servidor, usando carrito local vacío:', err.message);
          cart = { user_id: userId, items: [], _local: true };
        }
      }
      return cart;
    }
  },


  updateCart: async (userId, items) => {
    if (USE_MOCK) {
      await delay();
      let cartIndex = mockCarritos.findIndex(c => c.user_id === userId);
      if (cartIndex === -1) {
        const newCart = {
          _id: Math.random().toString(36).substring(2, 9),
          user_id: userId,
          updated_at: new Date().toISOString(),
          items,
        };
        mockCarritos.push(newCart);
        return newCart;
      } else {
        mockCarritos[cartIndex].items = items;
        mockCarritos[cartIndex].updated_at = new Date().toISOString();
        return mockCarritos[cartIndex];
      }
    } else {
      // Buscamos el carrito del usuario primero
      const response = await api.get('/carts');
      let cart = response.data.find(c => c.user_id === userId);
      if (cart) {
        // El backend usa PATCH /api/carts/:id para actualizar
        await api.patch(`/carts/${cart._id}`, { user_id: userId, items });
        return { ...cart, items, updated_at: new Date().toISOString() };
      } else {
        // Si no existe, lo creamos
        const createResponse = await api.post('/carts', { user_id: userId, items });
        return createResponse.data;
      }
    }
  },

  // --- PEDIDOS (`/api/orders`) ---
  getBuyerOrders: async (buyerId) => {
    if (USE_MOCK) {
      await delay();
      return mockPedidos.filter(o => o.buyer_id === buyerId);
    } else {
      // Filtrar compras en todos los pedidos en backend
      const response = await api.get('/orders');
      return response.data.filter(o => o.buyer_id === buyerId);
    }
  },

  createOrder: async (orderData) => {
    if (USE_MOCK) {
      await delay();
      const newOrder = {
        _id: 'order_' + Math.random().toString(36).substring(2, 9),
        order_date: new Date().toISOString(),
        status: 'processing',
        payment: {
          method: 'tarjeta_credito',
          transaction_id: 'ch_stripe_mock_' + Math.random().toString(36).substring(2, 9),
          status: 'approved',
          payment_date: new Date().toISOString(),
        },
        ...orderData,
      };
      mockPedidos.push(newOrder);

      // Vaciar carrito
      const cartIndex = mockCarritos.findIndex(c => c.user_id === orderData.buyer_id);
      if (cartIndex !== -1) {
        mockCarritos[cartIndex].items = [];
      }

      // Restar stock
      orderData.items.forEach(item => {
        const prod = mockProductos.find(p => p._id === item.product_id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      });

      return newOrder;
    } else {
      // Registrar orden nueva
      const orderPayload = {
        status: 'processing',
        payment: {
          method: 'tarjeta_credito',
          transaction_id: 'ch_stripe_' + Math.random().toString(36).substring(2, 9),
          status: 'approved',
          payment_date: new Date().toISOString(),
        },
        ...orderData
      };
      const response = await api.post('/orders', orderPayload);

      // Vaciar carrito en el servidor
      try {
        const cartsRes = await api.get('/carts');
        const cartObj = cartsRes.data.find(c => c.user_id === orderData.buyer_id);
        if (cartObj) {
          await api.patch(`/carts/${cartObj._id}`, { user_id: orderData.buyer_id, items: [] });
        }
      } catch (err) {
        console.error('Error al vaciar carrito en servidor:', err);
      }

      // Descontar stock del producto en el servidor
      try {
        for (const item of orderData.items) {
          const prodRes = await api.get('/products');
          const product = prodRes.data.find(p => p._id === item.product_id);
          if (product) {
            const newStock = Math.max(0, product.stock - item.quantity);
            await api.patch(`/products/${product._id}`, { stock: newStock });
          }
        }
      } catch (err) {
        console.error('Error al descontar stock en servidor:', err);
      }

      return response.data;
    }
  },

  getSellerOrders: async (sellerId) => {
    if (USE_MOCK) {
      await delay();
      return mockPedidos.filter(order =>
        order.items.some(item => item.seller_id === sellerId)
      );
    } else {
      // Obtener pedidos en los que el vendedor tenga artículos
      const response = await api.get('/orders');
      return response.data.filter(order =>
        order.items.some(item => item.seller_id === sellerId)
      );
    }
  },

  // --- ACTUALIZAR USUARIO (`/api/users/:id`) ---
  updateUser: async (userId, userData) => {
    if (USE_MOCK) {
      await delay();
      const index = mockUsuarios.findIndex(u => u._id === userId);
      if (index !== -1) {
        mockUsuarios[index] = { ...mockUsuarios[index], ...userData };
        return mockUsuarios[index];
      }
      throw new Error('Usuario no encontrado');
    } else {
      const response = await api.patch(`/users/${userId}`, userData);
      return response.data;
    }
  },

  updateShippingStatus: async (orderId, productId, status, trackingCode = null) => {
    if (USE_MOCK) {
      await delay();
      const order = mockPedidos.find(o => o._id === orderId);
      if (order) {
        const item = order.items.find(i => i.product_id === productId);
        if (item) {
          item.shipping_status = status;
          if (trackingCode !== null) {
            item.tracking_code = trackingCode;
          }
        }
        const allShipped = order.items.every(i => i.shipping_status === 'shipped');
        if (allShipped) {
          order.status = 'shipped';
        }
      }
      return order;
    } else {
      // Obtener la orden existente
      const ordersRes = await api.get('/orders');
      const order = ordersRes.data.find(o => o._id === orderId);
      if (!order) throw new Error('Orden no encontrada');

      // Modificar item de envío
      const updatedItems = order.items.map(item => {
        if (item.product_id === productId) {
          return {
            ...item,
            shipping_status: status,
            tracking_code: trackingCode !== null ? trackingCode : item.tracking_code
          };
        }
        return item;
      });

      const allShipped = updatedItems.every(i => i.shipping_status === 'shipped');
      const orderStatus = allShipped ? 'shipped' : order.status;

      const response = await api.patch(`/orders/${orderId}`, {
        ...order,
        status: orderStatus,
        items: updatedItems
      });

      return { ...order, status: orderStatus, items: updatedItems };
    }
  }
};
