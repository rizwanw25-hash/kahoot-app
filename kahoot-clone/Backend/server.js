const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Mengizinkan akses dari domain frontend apa saja
    methods: ["GET", "POST"]
  }
});

let players = {};

io.on('connection', (socket) => {
  console.log('User terhubung:', socket.id);

  // Player bergabung ke game
  socket.on('join-game', (data) => {
    players[socket.id] = { name: data.name, score: 0 };
    io.emit('update-player-list', Object.values(players));
  });

  // Host memulai kuis
  socket.on('start-quiz', () => {
    io.emit('game-started');
  });

  // Player mengirim jawaban
  socket.on('submit-answer', (data) => {
    if (players[socket.id] && data.isCorrect) {
      players[socket.id].score += 100; // Tambah poin jika benar
    }
    io.emit('update-player-list', Object.values(players));
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('update-player-list', Object.values(players));
    console.log('User terputus:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
