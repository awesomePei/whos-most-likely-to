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
    ],
    romance: [
        "Who's most likely to fall in love at first sight?",
        "Who's most likely to stop hanging out with friends when in a relationship?",
        "Who's most likely to hang on to a bad relationship?",
        "Whos's most likely to turn into a different person when they are in love?",
        "Who's most likely to stalk their ex online?",
        "Who's most likely to send a risky text at 2AM?",
        "Who's most likely to believe in soulmates?",
    ],
    moral: [
        "Who's most likely to cheat to pass an exam?",
        "Who's most likely to do illegal jobs for huge money?",
        "Who's most likely to jump a red light?",
        "Who's most likely to laugh when someone falls?",
        "Who's most likely to lie to get out of trouble?",
        "Who's most likely to break a promise and pretend they forgot?",
        "Who's most likely to gossip but say they hate drama?",
    ],
    dirty: [
        "Who is most likely to make out with a stranger?",
        "Who is most likely to make a sex tape?",
        "Who is most likely to read spicy romance books?",
        "Who is most likely to have a naughty dream about someone in the room?",
        "Who is most likely to have a naughty dream about someone in the room?",
        "Who is most likely to look innocent but isn’t?",
        "Who is most likely to have a secret OnlyFans account?",
        "Who is most likely to flirt just for fun?",
    ],
    "Who's the worst person": [
        "Who's most likely to forget their parents' birthday?",
        "Who's most likely to forget someone’s name immediately after meeting them?",
        "Most likely to lie on a resume?",
        "Who's most likely to ignore a group project and still ask for credit?",
        "Who's most likely to say 'I told you so' after your failure?",
        "Who's most likely to ghost someone and act like it's normal?",
        "Who's most likely to take credit for someone else's idea?",
    ],
    "Who's the best perosn": [
        "Who's most likely to help a stranger in need?",
        "Who's most likely to forgive someone who wronged them?",
        "Who's most likely to be the first to apologize after a fight?",
        "Who has the sweetest personality?",
        "Who's the most responsible teammate?",
        "Whos knows all the things about their friends?",
    ],
    "走心": [
        "誰身上最沒有值得你學習的東西？",
        "誰最有可能說『我有一個超棒的想法』結果超爛？",
        "誰最有可能在你需要的時候給你很糟的建議？",
        "誰最有可能在你低潮時講出一句話讓你更低潮？",
        "你覺得誰的稱讚最空洞？",
        "誰最常說自己社恐，但每次聚會都沒缺席？",
        "誰的訊息讓你總是不知道怎麼回？",
        "誰最常讓你懷疑自己是不是交錯朋友？",
        "你覺得誰根本沒在乎你，只是剛好有空？",
        "誰最有可能記得所有八卦，卻記不得你的生日？",
    ],
    
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

  socket.on("joinRoom", ({ roomId, nickname, clientId, isHost }) => {
    socket.join(roomId);

    let room = rooms.get(roomId) || {
      players: [],
      hostId: null,
      hostClientId: null,
      votes: {},         
      currentQuestion: "", 
      genre: "",
      questionIndex: 0,
      winTally: {},
      clientMap: {},
    };

    // 如果這個 clientId 已經存在，就代表是刷新頁面，要更新 socket.id
    const existing = room.players.find((p) => p.clientId === clientId);
    if (existing) {
      existing.id = socket.id; // 更新 socket id
      existing.nickname = nickname;
    } else {
      room.players.push({ id: socket.id, nickname, clientId });
    }

    // Host 判定與更新
    if (isHost) {
      if (!room.hostClientId) {
        room.hostId = socket.id;
        room.hostClientId = clientId;
      } else if (room.hostClientId === clientId) {
        room.hostId = socket.id;
      }
    } else {
      if (clientId === room.hostClientId) {
        room.hostId = socket.id;
      }
    }

    rooms.set(roomId, room);
    io.to(roomId).emit("players", room.players, room.hostId);
    console.log(`Room ${roomId} players:`);
    console.log(room.players.map(p => `${p.nickname} (${p.clientId} / ${p.id})`));
    console.log(`Host ID: ${room.hostId}`);

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

      // When a round ends (in your vote handler), after determining winners:
      winners.forEach((nickname) => {
        room.winTally[nickname] = (room.winTally[nickname] || 0) + 1;
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
      // Find the player(s) with the most wins
      const maxWins = Math.max(...Object.values(room.winTally));
      const overallWinners = Object.entries(room.winTally)
        .filter(([_, count]) => count === maxWins)
        .map(([nickname]) => nickname);

      io.to(roomId).emit("finalResults", {
          winTally: room.winTally,
          overallWinners,
      });
      io.to(roomId).emit("gameOver");
    //   room.hostId = null;
    } else {
      room.currentQuestion = questions[room.questionIndex];
      io.to(roomId).emit("newQuestion", room.currentQuestion);
    }

    rooms.set(roomId, room);
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

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});