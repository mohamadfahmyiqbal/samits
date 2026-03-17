// src/services/SocketService.js
import { io } from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://pik1com074.local.ikoito.co.id:5002/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, '');
const ENABLE_WEBSOCKET = process.env.REACT_APP_SOCKET_USE_WEBSOCKET === 'true';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: {
        token: token
      },
      transports: ENABLE_WEBSOCKET ? ['websocket', 'polling'] : ['polling'],
      upgrade: ENABLE_WEBSOCKET,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      timeout: 15000
    });

    // Re-attach app listeners when socket is recreated/reconnected.
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket.on(event, callback);
      });
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    this.socket.on('socket:ready', () => {
    });

    this.socket.on('server:pong', () => {
    });

    this.socket.on('connect_error', () => {
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (!event || typeof callback !== 'function') return;

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (event && this.listeners.has(event) && typeof callback === 'function') {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  ping() {
    this.emit('client:ping');
  }
}

const socketService = new SocketService();
export default socketService;
