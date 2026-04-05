let ioInstance = null;

export const setSocketServer = (io) => {
  ioInstance = io;
};

export const getSocketServer = () => ioInstance;

export const emitToAllClients = (eventName, payload) => {
  if (!ioInstance) {
    return;
  }
  ioInstance.emit(eventName, payload);
};

export const emitToUserRoom = (roomName, eventName, payload) => {
  if (!ioInstance || !roomName) {
    return;
  }
  ioInstance.to(roomName).emit(eventName, payload);
};
