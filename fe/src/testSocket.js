// testSocket.js - Simple test for Socket.IO connection
import socketService from './services/SocketService';

const testSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found. Please login first.');
    return;
  }

  console.log('Testing Socket.IO connection...');
  socketService.connect(token);

  setTimeout(() => {
    if (socketService.isConnected) {
      console.log('✅ Socket connected successfully!');
      socketService.ping();
    } else {
      console.log('❌ Socket connection failed.');
    }
  }, 2000);
};

export default testSocket;