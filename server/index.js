require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.use(cors());

const userSocketMap = {};

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join', ({ roomId, username }) => {
        console.log(`User ${username} joining room: ${roomId}`);
        userSocketMap[socket.id] = username;
        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit('joined', {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on('code-change', ({ roomId, code }) => {
        console.log(`Code change in room ${roomId}`);
        socket.to(roomId).emit('code-change', { code });
    });

    socket.on('sync-code', ({ socketId, code }) => {
        console.log(`Sync code to socket ${socketId}`);
        io.to(socketId).emit('code-change', { code });
    });

    socket.on('mssg', ({ user, mssg, roomId }) => {
        console.log(`Message from ${user} in room ${roomId}`);
        socket.in(roomId).emit('mssg', { user, mssg });
    });

    socket.on('lang', ({ lang, roomId }) => {
        console.log(`Language change to ${lang} in room ${roomId}`);
        socket.in(roomId).emit('lang', { lang });
    });

    socket.on("input-change", ({ inp, roomId }) => {
        console.log(`Input change in room ${roomId}`);
        socket.to(roomId).emit("input-change", { inp });
    });

    socket.on("output-change", ({ out, roomId }) => {
        console.log(`Output change in room ${roomId}`);
        socket.in(roomId).emit("output-change", { out });
    });

    socket.on("sync-lang", ({ socketId, lang }) => {
        console.log(`Sync language to socket ${socketId}`);
        io.to(socketId).emit("lang", { lang });
    });

    socket.on("sync-input", ({ socketId, inp }) => {
        console.log(`Sync input to socket ${socketId}`);
        io.to(socketId).emit("input-change", { inp });
    });

    socket.on("sync-output", ({ socketId, out }) => {
        console.log(`Sync output to socket ${socketId}`);
        io.to(socketId).emit("output-change", { out });
    });

    socket.on("sync-mssg", ({ allMssg, socketId }) => {
        console.log(`Sync messages to socket ${socketId}`);
        io.to(socketId).emit("all-mssg", allMssg);
    });

    socket.on('disconnecting', () => {
        console.log(`Socket ${socket.id} disconnecting`);
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.to(roomId).emit('disconnected', {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        console.log(`Socket ${socket.id} disconnected`);
    });
});

app.get('/', (req, res) => {
    res.json({ msg: "Hello there" });
});

const PORT = process.env.PORT || 3000; // Use the PORT from .env file, default to 3000 if not specified

server.listen(PORT, () => {
    console.log(`Web server listening on port ${PORT}`);
});
