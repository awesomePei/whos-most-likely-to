// server/index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const QUESTION_BANK = {
    basic: [
        "Who's most likely to become a millionaire?",
        "Who's most likely to go skydiving?",
        "Who's most likely to cry during a movie?",
        "Who's most likely to start their own company?",
        "Who's most likely to forget their best friend’s birthday?"
    ],
    romance: [
        "Who's most likely to fall in love at first sight?",
        "Who's most likely to stop hanging out with friends when in a relationship?",
        "Who's most likely to hang on to a bad relationship?",
        "Whos's most likely to turn into a different person when they are in love?",
    ],
    moral: [
        "Who's most likely to cheat to pass an exam?",
        "Who's most likely to do illegal jobs for huge money?",
        "Who's most likely to jump a red light?",
        "Who's most likely to laugh when someone falls?",
    ]
}

// Room state map
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("getPlayers", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      io.to(socket.id).emit("players", room.players, room.hostId);
    }
  });

  socket.on("joinRoom", ({ roomId, nickname, isHost }) => {
    socket.join(roomId);

    let room = rooms.get(roomId) || {
      players: [],
      hostId: null,
      votes: {},         
      currentQuestion: "", 
    };

    room.players.push({ id: socket.id, nickname });
    // if (!room.hostId) room.hostId = socket.id;
    if (isHost && !room.hostId) {
      room.hostId = socket.id;
    }

    rooms.set(roomId, room);
    io.to(roomId).emit("players", room.players, room.hostId);
  });

  socket.on("getGenres", () => {
    socket.emit("genres", Object.keys(QUESTION_BANK));
  });

  socket.on("startGame", ({ roomId, genre }) => {
    const room = rooms.get(roomId);
    if (!room || !QUESTION_BANK[genre]) return;

    room.votes = {}; // Reset votes at game start
    room.genre = genre;
    room.questionIndex = 0;  // Add this
    room.currentQuestion = QUESTION_BANK[genre][0];
    // room.hostId = socket.id;  // Set host here

    rooms.set(roomId, room);

    io.to(roomId).emit("gameStarted");
    io.to(roomId).emit("newQuestion", room.currentQuestion);
    io.to(roomId).emit("players", room.players, room.hostId);
  });

  socket.on("vote", ({ roomId, votedFor }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Record vote using voter's socket.id
    room.votes[socket.id] = votedFor;

    // Check if all players have voted
    if (Object.keys(room.votes).length === room.players.length) {
      // Tally votes
      const tally = {};
      Object.values(room.votes).forEach((id) => {
        tally[id] = (tally[id] || 0) + 1;
      });

      // Determine winner(s)
      const maxVotes = Math.max(...Object.values(tally));
      const winners = Object.entries(tally)
        .filter(([_, count]) => count === maxVotes)
        .map(([id]) => {
          const player = room.players.find((p) => p.id === id);
          return player ? player.nickname : "Unknown";
        });

      // Broadcast results
      io.to(roomId).emit("votingResults", {
        tally,
        winners,
      });

      // Clear votes for next round
      room.votes = {};
    }

    rooms.set(roomId, room);
  });

  socket.on("nextQuestion", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.votes = {};
    room.questionIndex++;
    const questions = QUESTION_BANK[room.genre];

    if (room.questionIndex >= questions.length) {
      io.to(roomId).emit("gameOver");
      room.hostId = null; // reset host when game ends
    } else {
      room.currentQuestion = questions[room.questionIndex];
    }

    rooms.set(roomId, room);

    if (room.questionIndex >= questions.length) {
      io.to(roomId).emit("gameOver");
    } else {
      io.to(roomId).emit("newQuestion", room.currentQuestion);
    }
    io.to(roomId).emit("players", room.players, room.hostId);
  });

  socket.on("getCurrentQuestion", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    socket.emit("newQuestion", room.currentQuestion);
  });


  socket.on("disconnect", () => {
    for (const [roomId, room] of rooms) {
      room.players = room.players.filter((p) => p.id !== socket.id);
      delete room.votes?.[socket.id];

    //   if (room.hostId === socket.id) {
    //     room.hostId = room.players.length ? room.players[0].id : null;
    //   }

      rooms.set(roomId, room);
      io.to(roomId).emit("players", room.players, room.hostId);
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
