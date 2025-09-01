// socketManager.js
let ioInstance = null;
const onlineUsers = new Map();

const setIo = (io) => {
  ioInstance = io;
};

const getIo = () => ioInstance;

module.exports = {
  onlineUsers,
  setIo,
  getIo,
};
