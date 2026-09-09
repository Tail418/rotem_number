const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;

app.use(express.static(require('path').join(__dirname, 'public')));

// 서버 메모리 상태
let state = {
  preparing: [], // 준비중 이름 목록
  ready: []       // 준비완료 이름 목록
};

function broadcastState() {
  io.emit('state', state);
}

io.on('connection', (socket) => {
  // 접속 즉시 현재 상태 전달
  socket.emit('state', state);

  socket.on('add-name', (name) => {
    const val = String(name).trim();
    if (!val) return;
    if (state.preparing.includes(val) || state.ready.includes(val)) return;
    state.preparing.push(val);
    broadcastState();
  });

  socket.on('mark-ready', (name) => {
    const val = String(name);
    const idx = state.preparing.indexOf(val);
    if (idx === -1) return;
    state.preparing.splice(idx, 1);
    state.ready.push(val);
    broadcastState();
    io.emit('announce', val);
  });

  socket.on('undo-ready', (name) => {
    // 완료 목록에서 다시 준비중으로 되돌리기 (실수 처리용)
    const val = String(name);
    const idx = state.ready.indexOf(val);
    if (idx === -1) return;
    state.ready.splice(idx, 1);
    state.preparing.push(val);
    broadcastState();
  });

  socket.on('remove-preparing', (name) => {
    const val = String(name);
    const idx = state.preparing.indexOf(val);
    if (idx === -1) return;
    state.preparing.splice(idx, 1);
    broadcastState();
  });

  socket.on('reset-all', () => {
    state = { preparing: [], ready: [] };
    broadcastState();
  });
});

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

server.listen(PORT, () => {
  const ip = getLocalIp();
  console.log('로뎀카페 이름 안내 시스템이 실행되었습니다.');
  console.log('');
  console.log(`  TV 화면    : http://localhost:${PORT}/tv.html`);
  console.log(`  직원 입력  : http://${ip}:${PORT}/admin.html  (갤럭시탭에서 이 주소로 접속)`);
  console.log('');
});
