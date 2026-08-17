const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 3000;
const MAX_PLAYERS = 8;
const COLORS = ['#ff5252', '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#ffeb3b', '#e91e63'];
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const ROOMS = new Map();

function genCode() {
  let code = '';
  for (let i = 0; i < 4; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  if (ROOMS.has(code)) return genCode();
  return code;
}

function send(ws, msg) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
}

function pub(p) {
  return { id: p.id, name: p.name, color: p.color };
}

function roomPlayers(room) {
  const arr = [];
  room.players.forEach((p) => {
    arr.push({
      id: p.id, name: p.name, color: p.color,
      x: p.x, y: p.y, angle: p.angle, speed: p.speed,
      lap: p.lap, cp: p.cp, finished: p.finished, finishTime: p.finishTime
    });
  });
  return arr;
}

function addPlayer(room, ws, name) {
  const id = 'p' + Math.random().toString(36).slice(2, 9);
  const color = COLORS[room.players.size % COLORS.length];
  const player = {
    id, ws,
    name: String(name || 'Player').slice(0, 14),
    color,
    x: 0, y: 0, angle: 0, speed: 0, lap: 0, cp: 0,
    finished: false, finishTime: null
  };
  room.players.set(id, player);
  return player;
}

function broadcast(room, msg) {
  room.players.forEach((p) => send(p.ws, msg));
}

function maybeEnd(room) {
  if (!room.started || room.ended) return;
  const all = [...room.players.values()];
  if (all.every((p) => p.finished)) {
    room.ended = true;
    const standings = all
      .sort((a, b) => a.finishTime - b.finishTime)
      .map((p) => ({ id: p.id, name: p.name, color: p.color, time: p.finishTime }));
    broadcast(room, { type: 'race_end', standings });
    setTimeout(() => ROOMS.delete(room.code), 60000);
  }
}

/* ---- Broadcast player states to their room at ~30fps ---- */
setInterval(() => {
  ROOMS.forEach((room) => {
    if (!room.started || room.ended) return;
    const msg = { type: 'state', players: roomPlayers(room) };
    room.players.forEach((p) => send(p.ws, msg));
  });
}, 33);

wss.on('connection', (ws) => {
  ws.roomCode = null;
  ws.player = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }

    switch (msg.type) {
      case 'create': {
        const code = genCode();
        const room = {
          code, players: new Map(), host: null,
          started: false, ended: false, startTime: 0
        };
        const player = addPlayer(room, ws, msg.name);
        room.host = player.id;
        ROOMS.set(code, room);
        ws.roomCode = code;
        ws.player = player;
        send(ws, {
          type: 'joined', id: player.id, room: code, host: true,
          players: roomPlayers(room).map(pub), color: player.color
        });
        break;
      }

      case 'join': {
        const code = String(msg.room || '').toUpperCase().trim();
        const room = ROOMS.get(code);
        if (!room) return send(ws, { type: 'error', message: 'Room nahi mili. Code dobara check karo.' });
        if (room.started) return send(ws, { type: 'error', message: 'Race shuru ho chuki hai. Naya room banao ya dobara karo.' });
        if (room.players.size >= MAX_PLAYERS) return send(ws, { type: 'error', message: 'Room full hai (max ' + MAX_PLAYERS + ').' });
        const player = addPlayer(room, ws, msg.name);
        ws.roomCode = code;
        ws.player = player;
        send(ws, {
          type: 'joined', id: player.id, room: code, host: false,
          players: roomPlayers(room).map(pub), color: player.color
        });
        broadcast(room, { type: 'player_join', player: pub(player) });
        break;
      }

      case 'start': {
        const room = ROOMS.get(ws.roomCode);
        if (!room || !ws.player || room.host !== ws.player.id || room.started) return;
        room.started = true;
        room.startTime = Date.now();
        broadcast(room, { type: 'race_start', startTime: room.startTime });
        break;
      }

      case 'state': {
        const room = ROOMS.get(ws.roomCode);
        const p = ws.player;
        if (!room || !p || !room.started) return;
        p.x = msg.x; p.y = msg.y; p.angle = msg.angle; p.speed = msg.speed;
        p.lap = msg.lap; p.cp = msg.cp;
        break;
      }

      case 'finish': {
        const room = ROOMS.get(ws.roomCode);
        const p = ws.player;
        if (!room || !p || p.finished || !room.started) return;
        p.finished = true;
        p.finishTime = Number(msg.time) || 0;
        broadcast(room, { type: 'player_finish', id: p.id, name: p.name, color: p.color, time: p.finishTime });
        maybeEnd(room);
        break;
      }
    }
  });

  ws.on('close', () => {
    const room = ROOMS.get(ws.roomCode);
    if (!room || !ws.player) return;
    room.players.delete(ws.player.id);
    broadcast(room, { type: 'player_leave', id: ws.player.id });
    if (room.players.size === 0) { ROOMS.delete(room.code); return; }
    if (room.host === ws.player.id) {
      const first = room.players.keys().next().value;
      room.host = first;
      broadcast(room, { type: 'new_host', id: first });
    }
    if (room.started && !room.ended) maybeEnd(room);
  });
});

server.listen(PORT, () => {
  console.log('Racing game running at http://localhost:' + PORT);
});
