// Mock Socket.io Server instance for test compilation and emission tracking
let ioInstance: any = {
  emit: (event: string, data: any) => {
    console.log(`[Mock Socket IO] Broadcasted Event "${event}":`, data);
  },
  to: (room: string) => {
    return {
      emit: (event: string, data: any) => {
        console.log(`[Mock Socket IO] Room "${room}" Event "${event}":`, data);
      }
    };
  }
};

export const getIo = () => {
  return ioInstance;
};

export const setIo = (io: any) => {
  ioInstance = io;
};
