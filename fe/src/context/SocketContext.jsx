// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/SocketService';
import { registerAndSubscribeWebPush } from '../services/WebPushService';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const isTokenExpired = (token) => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;
    const payload = JSON.parse(atob(payloadBase64));
    if (!payload?.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch (_error) {
    return true;
  }
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      socketService.connect(token);
      setIsConnected(socketService.isConnected);
      registerAndSubscribeWebPush().catch((error) => {
        console.error('Web Push subscribe gagal:', error.message);
      });
    } else if (token) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, []);

  const connectSocket = (token) => {
    if (!token || isTokenExpired(token)) {
      setIsConnected(false);
      return;
    }
    socketService.connect(token);
    setIsConnected(socketService.isConnected);
    registerAndSubscribeWebPush().catch((error) => {
      console.error('Web Push subscribe gagal:', error.message);
    });
  };

  const disconnectSocket = () => {
    socketService.disconnect();
    setIsConnected(false);
  };

  return (
    <SocketContext.Provider value={{
      socket: socketService,
      isConnected,
      connectSocket,
      disconnectSocket
    }}>
      {children}
    </SocketContext.Provider>
  );
};

