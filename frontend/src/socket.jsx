import { io } from "socket.io-client";

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: "Infinity",
        timeout: 10000,
        transports: ['websocket'],
    };

    // Get backend URL from environment variables
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    console.log('Attempting to connect to', backendUrl);

    const socket = io(backendUrl, options);

    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
    });

    socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
    });

    return socket;
};
