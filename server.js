import express from "express";
import http from "http";
import { Server } from "socket.io";
import { crearInforme } from "./services/api.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
let operadores;

/* ======================================================
   CONFIG
====================================================== */
const basePoints = 1000;
const timerDuration = 20;

/* ======================================================
   MULTIPARTIDAS
====================================================== */
const games = {}; // 👈 Aquí se guardan todas las partidas

/* ======================================================
   FUNCIONES AUXILIARES
====================================================== */
function generateGameCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function generateOperations(operador) {
  let ops = [];
  let divisionAceptada = false;
  operadores = operador;
  for (let i = 0; i < 10; i++) {
    divisionAceptada = false
    if (operadores=="random") {
      const operadors = ["+", "-", "*", "/"];
      operador = operadors[Math.floor(Math.random() * operadors.length)];
    }
    let a = Math.floor(Math.random() * 20) + 1;
    let b = Math.floor(Math.random() * 20) + 1;
    if (operador=="+") {
      ops.push({ question: `${a} + ${b}`, answer: a + b });
    }
    else if (operador=="-") {
      if (a >= b) {
        ops.push({ question: `${a} - ${b}`, answer: a - b });
      }
      else {
        ops.push({ question: `${b} - ${a}`, answer: b - a });
      }
    }
    else if (operador=="*") {
      ops.push({ question: `${a} X ${b}`, answer: a * b });
    }
    else {
      while (!divisionAceptada) {
        if (a%b==0) {
          ops.push({ question: `${a} / ${b}`, answer: a / b });
          divisionAceptada = true
        }
        else {
          a = Math.floor(Math.random() * 20) + 1;
          b = Math.floor(Math.random() * 20) + 1;
        }
      }
    }
  }
  return ops;
}

/* ======================================================
   SERVIR ARCHIVOS
====================================================== */
app.use(express.static("public"));

/* ======================================================
   ENDPOINT PARA OBTENER CÓDIGO
====================================================== */
app.get("/game-code", (req, res) => {
  const { operador } = req.query;
  const code = generateGameCode();
  games[code] = {
    code,
    participants: [],
    operations: generateOperations(operador),
    currentOperationIndex: -1,
    timer: null,
    remainingTime: timerDuration
  };
  console.log("🎮 Nueva partida creada:", code);
  io.emit("game-code", code);
  res.json({ code });
});

/* ======================================================
   FUNCIONES DEL JUEGO
====================================================== */
function startTimer(game) {
  game.remainingTime = timerDuration;
  emitToGame(game.code, "timer-start", {
    remaining: game.remainingTime,
    operation: game.operations[game.currentOperationIndex].question
  });

  game.timer = setInterval(() => {
    game.remainingTime--;
    emitToGame(game.code, "timer-update", { remaining: game.remainingTime });

    if (game.remainingTime <= 0) {
      clearInterval(game.timer);
      game.timer = null;
      endOperation(game);
    }
  }, 1000);
}

function endOperation(game) {
  console.log("⏱ Operación terminada en partida", game.code);

  game.participants.forEach(p => {
    const ans = p.answers[game.currentOperationIndex];
    if (ans === game.operations[game.currentOperationIndex].answer) {
      const timeTaken = p.responseTime[game.currentOperationIndex];
      const speedFactor = Math.max(0, (timerDuration - timeTaken) / timerDuration);
      const pointsEarned = Math.floor(basePoints * speedFactor);
      const streakBonusPercent = Math.min(p.streak * 10, 30);
      const bonusPoints = Math.floor(basePoints * (streakBonusPercent / 100));
      const totalPoints = pointsEarned + bonusPoints;
      p.score += totalPoints;
      p.streak++;
      p.correctAnswers++;
      io.to(p.id).emit("respuesta_correcta", { points: totalPoints });
    } else {
      p.streak = 0;
      io.to(p.id).emit("respuesta_incorrecta", { points: 0 });
    }
  });

  emitToGame(game.code, "operation-ended");
}

function nextOperation(game) {
  game.currentOperationIndex++;
  if (game.currentOperationIndex < game.operations.length) {
    startTimer(game);
  } else {
    finishGame(game);
  }
}

function finishGame(game) {
  console.log("🏆 Juego terminado:", game.code);
  const podium = [...game.participants].sort((a, b) => b.score - a.score);
  emitToGame(game.code, "show-podium", podium);

  podium.forEach(p => {
    crearInforme({
      Tipus_partida: "Competitiva",
      Respostes_correctes: p.correctAnswers,
      Respostes_incorrectes: game.operations.length - p.correctAnswers,
      Experiencia: 0,
      alumne_id: p.alumne_id
    });
  });

  delete games[game.code]; // limpiar partida finalizada
}

/* ======================================================
   FUNCION EMIT PARA ROOM + OBSERVADORES
====================================================== */
function emitToGame(code, event, data) {
  const room = io.sockets.adapter.rooms.get(code);
  if (room) {
    // Emitir a los que están en la room (jugadores)
    io.to(code).emit(event, data);
  }
  // Emitir también a los observadores
  if (observers[code]) {
    observers[code].forEach(socketId => {
      const sock = io.sockets.sockets.get(socketId);
      if (sock) sock.emit(event, data);
    });
  }
}

/* ======================================================
   OBSERVADORES
====================================================== */
const observers = {}; // { code: [socketId, socketId...] }

/* ======================================================
   SOCKET.IO
====================================================== */
io.on("connection", socket => {
  console.log("🔌 Cliente conectado:", socket.id);
  Object.keys(games).forEach(code => {
    socket.emit("game-code", code);
  });

  // =================== JOIN GAME (Jugador) ===================
  socket.on("join-game", ({ code, name, avatar, alumne_id }) => {
    const game = games[code];
    if (!game) return socket.emit("joined-fail", "Partida no existe ❌");

    socket.join(code);
    game.participants.push({
      id: socket.id,
      name,
      avatar,
      alumne_id,
      answers: Array(10).fill(null),
      responseTime: Array(10).fill(null),
      score: 0,
      streak: 0,
      correctAnswers: 0
    });

    emitToGame(code, "update-players", game.participants);
    socket.emit("welcome", { message: `Bienvenido a la partida ${code} 🎮` });
    console.log(`✅ ${name} unido a partida ${code}`);
  });

  // =================== START GAME ===================
  socket.on("start-game", code => {
    const game = games[code];
    if (!game) return;
    if (!game.timer) {
      game.currentOperationIndex = 0;
      // Avisar a todos los jugadores y observadores que empieza la operación
      emitToGame(code, "operation-started", {
        operation: game.operations[game.currentOperationIndex].question,
        remaining: timerDuration
      });
      startTimer(game);
    }
  });


  // =================== SUBMIT ANSWER ===================
  socket.on("submit-answer", ({ code, index, answer }) => {
    const game = games[code];
    if (!game) return;
    const player = game.participants.find(p => p.id === socket.id);
    if (!player || index !== game.currentOperationIndex) return;
    player.answers[index] = Number(answer);
    player.responseTime[index] = timerDuration - game.remainingTime;
  });

  // =================== NEXT OPERATION ===================
  socket.on("next-operation", code => {
    const game = games[code];
    if (!game) return;
    // Avanzar operación
    nextOperation(game);
    // Avisar a todos que empieza la nueva operación
    if (game.currentOperationIndex < game.operations.length) {
      emitToGame(code, "next-operation-alert", {
        operation: game.operations[game.currentOperationIndex].question,
        remaining: timerDuration
      });
    }
  });

  // =================== OBSERVAR PARTIDA ===================
  socket.on("observe-game", ({ code }) => {
    if (!observers[code]) observers[code] = [];
    observers[code].push(socket.id);
    console.log(`👀 Observador conectado a partida ${code}: ${socket.id}`);

    // Enviar estado inicial
    const game = games[code];
    if (game) {
      socket.emit("update-players", game.participants);
      if (game.currentOperationIndex >= 0) {
        socket.emit("timer-start", {
          operation: game.operations[game.currentOperationIndex].question,
          remaining: game.remainingTime
        });
      }
    }
  });

  // =================== DISCONNECT ===================
  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);

    // Remover de observadores
    for (const code in observers) {
      observers[code] = observers[code].filter(id => id !== socket.id);
    }

    // Remover de participantes
    for (const code in games) {
      const game = games[code];
      game.participants = game.participants.filter(p => p.id !== socket.id);
      emitToGame(code, "update-players", game.participants);
    }
  });

  // =================== Chat ===================
  socket.on("chat-message", ({ code, name, text }) => {
    emitToGame(code, "chat-message", {
      name,
      text,
      senderId: socket.id,
      type: "player"
    });
  });

  socket.on("toggle-chat", ({ code, activo }) => {
    emitToGame(code, "chat-status", { activo })
  });
  });

/* ======================================================
   START SERVER
====================================================== */
server.listen(3000, '0.0.0.0', () => console.log("✅ Servidor corriendo en http://localhost:3000"));