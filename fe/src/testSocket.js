// testSocket.js - Simple test for Socket.IO connection
import socketService from './services/SocketService';

const testSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) {

    return;
  }

  socketService.connect(token);

  setTimeout(() => {
    if (socketService.isConnected) {

      socketService.ping();
    } else {

    }
  }, 2000);
};

export default testSocket;