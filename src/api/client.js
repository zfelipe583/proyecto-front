import axios from 'axios';

// ==========================================
// CONFIGURACIÓN DE CONEXIÓN CON BACKEND/DB
// ==========================================
// 1. Cambia 'API_URL' por la dirección de tus endpoints reales (ej. http://192.168.1.100:5000/api)
export const API_URL = 'http://YOUR_BACKEND_IP:5000/api';

// 2. Cambia 'USE_MOCK' a false para empezar a consumir tus endpoints reales a través de Axios
export const USE_MOCK = true;

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// DATOS MOCK DE PRUEBA (Estructura de MongoDB)
// ==========================================
let mockUsuarios = [
  {
    "_id": "665239a2f1b2c3d4e5f6a111",
    "nombre": "Jaime Eduardo",
    "email": "jaime@example.com",
    "password_hash": "$2b$12$EjemploDeHashSeguro1234567890Vendedor",
    "fecha_registro": new Date().toISOString(),
    "es_vendedor": true,
    "datos_vendedor": {
      "nombre_tienda": "Zermeño Tech Store",
      "clabe_interbancaria": "012320012345678901",
      "calificacion_promedio": 4.9
    },
    "direcciones": [
      {
        "etiqueta": "Oficina/Almacén",
        "calle": "Av. Universidad 456",
        "ciudad": "Purísima del Rincón",
        "estado": "Guanajuato",
        "codigo_postal": "36400"
      }
    ]
  },
  {
    "_id": "665239a2f1b2c3d4e5f6b222",
    "nombre": "Carlos Gómez",
    "email": "carlos@example.com",
    "password_hash": "$2b$12$EjemploDeHashSeguro1234567890Comprador",
    "fecha_registro": new Date().toISOString(),
    "es_vendedor": false,
    "direcciones": [
      {
        "etiqueta": "Casa",
        "calle": "Calle Flores 123",
        "ciudad": "León",
        "estado": "Guanajuato",
        "codigo_postal": "37000"
      }
    ]
  }
];

let mockProductos = [
  {
    "_id": "665239a2f1b2c3d4e5f6p999",
    "vendedor_id": "665239a2f1b2c3d4e5f6a111",
    "nombre": "Cámara Réflex Profesional",
    "descripcion": "Cámara seminueva, excelente para fotografía de estudio. Incluye lente kit 18-55mm.",
    "precio": 12500.00,
    "stock": 1,
    "categoria": {
      "nombre": "Fotografía",
      "slug": "fotografia"
    },
    "imagenes": [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop"
    ],
    "fecha_creacion": new Date().toISOString()
  },
  {
    "_id": "665239a2f1b2c3d4e5f6p888",
    "vendedor_id": "665239a2f1b2c3d4e5f6a111",
    "nombre": "Monitor Gamer 27 165Hz",
    "descripcion": "Frecuencia de actualización ideal para desarrollo ágil y gaming de alto rendimiento.",
    "precio": 4200.00,
    "stock": 5,
    "categoria": {
      "nombre": "Hardware",
      "slug": "hardware"
    },
    "imagenes": [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop"
    ],
    "fecha_creacion": new Date().toISOString()
  }
];

let mockCarritos = [
  {
    "_id": "665239a2f1b2c3d4e5f6c333",
    "usuario_id": "665239a2f1b2c3d4e5f6b222",
    "actualizado_en": new Date().toISOString(),
    "items": [
      {
        "producto_id": "665239a2f1b2c3d4e5f6p999",
        "nombre": "Cámara Réflex Profesional",
        "cantidad": 1,
        "precio_unitario": 12500.00
      }
    ]
  }
];

let mockPedidos = [
  {
    "_id": "665239a2f1b2c3d4e5f6o888",
    "comprador_id": "665239a2f1b2c3d4e5f6b222",
    "fecha_pedido": new Date().toISOString(),
    "total": 12500.00,
    "estado_general": "procesando",
    "direccion_envio": {
      "calle": "Calle Flores 123",
      "ciudad": "León",
      "estado": "Guanajuato",
      "codigo_postal": "37000"
    },
    "items": [
      {
        "producto_id": "665239a2f1b2c3d4e5f6p999",
        "vendedor_id": "665239a2f1b2c3d4e5f6a111",
        "nombre": "Cámara Réflex Profesional",
        "cantidad": 1,
        "precio_pagado": 12500.00,
        "estado_envio": "pendiente_de_envio",
        "codigo_rastreo": null
      }
    ],
    "pago": {
      "metodo": "tarjeta_credito",
      "transaccion_id": "ch_stripe_marketplace_777",
      "estado": "aprobado",
      "fecha_pago": new Date().toISOString()
    }
  }
];

// Helper para simular delay de red
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// FUNCIONES DEL CLIENTE API
// ==========================================

export const apiService = {
  // --- USUARIOS ---
  login: async (email, password) => {
    if (USE_MOCK) {
      await delay();
      const user = mockUsuarios.find(u => u.email === email);
      if (!user) throw new Error('Usuario no encontrado');
      // En producción deberías verificar el hash, aquí simulamos que coincide
      return { token: 'mock-jwt-token-12345', user };
    } else {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    }
  },

  // --- PRODUCTOS ---
  getProducts: async () => {
    if (USE_MOCK) {
      await delay();
      return [...mockProductos];
    } else {
      const response = await api.get('/productos');
      return response.data;
    }
  },

  createProduct: async (productData) => {
    if (USE_MOCK) {
      await delay();
      const newProduct = {
        _id: Math.random().toString(36).substring(2, 9),
        fecha_creacion: new Date().toISOString(),
        ...productData,
      };
      mockProductos.push(newProduct);
      return newProduct;
    } else {
      const response = await api.post('/productos', productData);
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
      const response = await api.put(`/productos/${productId}`, productData);
      return response.data;
    }
  },

  // --- CARRITOS ---
  getCart: async (userId) => {
    if (USE_MOCK) {
      await delay();
      let cart = mockCarritos.find(c => c.usuario_id === userId);
      if (!cart) {
        cart = {
          _id: Math.random().toString(36).substring(2, 9),
          usuario_id: userId,
          actualizado_en: new Date().toISOString(),
          items: [],
        };
        mockCarritos.push(cart);
      }
      return cart;
    } else {
      const response = await api.get(`/carritos/${userId}`);
      return response.data;
    }
  },

  updateCart: async (userId, items) => {
    if (USE_MOCK) {
      await delay();
      let cartIndex = mockCarritos.findIndex(c => c.usuario_id === userId);
      if (cartIndex === -1) {
        const newCart = {
          _id: Math.random().toString(36).substring(2, 9),
          usuario_id: userId,
          actualizado_en: new Date().toISOString(),
          items,
        };
        mockCarritos.push(newCart);
        return newCart;
      } else {
        mockCarritos[cartIndex].items = items;
        mockCarritos[cartIndex].actualizado_en = new Date().toISOString();
        return mockCarritos[cartIndex];
      }
    } else {
      const response = await api.put(`/carritos/${userId}`, { items });
      return response.data;
    }
  },

  // --- PEDIDOS (COMPRAS) ---
  getBuyerOrders: async (buyerId) => {
    if (USE_MOCK) {
      await delay();
      return mockPedidos.filter(o => o.comprador_id === buyerId);
    } else {
      const response = await api.get(`/pedidos/buyer/${buyerId}`);
      return response.data;
    }
  },

  createOrder: async (orderData) => {
    if (USE_MOCK) {
      await delay();
      const newOrder = {
        _id: 'order_' + Math.random().toString(36).substring(2, 9),
        fecha_pedido: new Date().toISOString(),
        estado_general: 'procesando',
        pago: {
          metodo: 'tarjeta_credito',
          transaccion_id: 'ch_stripe_mock_' + Math.random().toString(36).substring(2, 9),
          estado: 'aprobado',
          fecha_pago: new Date().toISOString(),
        },
        ...orderData,
      };
      mockPedidos.push(newOrder);

      // Vaciar carrito
      const cartIndex = mockCarritos.findIndex(c => c.usuario_id === orderData.comprador_id);
      if (cartIndex !== -1) {
        mockCarritos[cartIndex].items = [];
      }

      // Restar stock de productos
      orderData.items.forEach(item => {
        const prod = mockProductos.find(p => p._id === item.producto_id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.cantidad);
        }
      });

      return newOrder;
    } else {
      const response = await api.post('/pedidos', orderData);
      return response.data;
    }
  },

  // --- PEDIDOS (VENTAS - PARA EL VENDEDOR) ---
  getSellerOrders: async (sellerId) => {
    if (USE_MOCK) {
      await delay();
      // Filtrar pedidos que contengan artículos de este vendedor
      return mockPedidos.filter(order =>
        order.items.some(item => item.vendedor_id === sellerId)
      );
    } else {
      const response = await api.get(`/pedidos/seller/${sellerId}`);
      return response.data;
    }
  },

  updateShippingStatus: async (orderId, itemId, status, trackingCode = null) => {
    if (USE_MOCK) {
      await delay();
      const order = mockPedidos.find(o => o._id === orderId);
      if (order) {
        const item = order.items.find(i => i.producto_id === itemId);
        if (item) {
          item.estado_envio = status;
          if (trackingCode !== null) {
            item.codigo_rastreo = trackingCode;
          }
        }
        // Si todos los items están enviados, actualizar el estado general
        const allShipped = order.items.every(i => i.estado_envio === 'enviado');
        if (allShipped) {
          order.estado_general = 'enviado';
        }
      }
      return order;
    } else {
      const response = await api.put(`/pedidos/${orderId}/items/${itemId}/status`, {
        estado_envio: status,
        codigo_rastreo: trackingCode,
      });
      return response.data;
    }
  }
};
