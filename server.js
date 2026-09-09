const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// 서버 메모리 상태
let state = {
  ready: [] // 준비완료 번호 목록
};

function broadcastState() {
  io.emit('state', state);
}

io.on('connection', (socket) => {
  // 접속 즉시 현재 상태 전달
  socket.emit('state', state);

  socket.on('add-number', (number) => {
    // 번호를 입력하면 바로 준비완료 처리 + 음성 안내
    const num = String(number).trim();
    if (!num) return;
    if (state.ready.includes(num)) return;
    state.ready.push(num);
    broadcastState();
    io.emit('announce', num);
  });

  socket.on('delete-number', (number) => {
    const num = String(number);
    const idx = state.ready.indexOf(num);
    if (idx === -1) return;
    state.ready.splice(idx, 1);
    broadcastState();
  });

  socket.on('re-announce', (number) => {
    // 상태 변경 없이 음성 안내만 다시 재생
    const num = String(number);
    if (!state.ready.includes(num)) return;
    io.emit('announce', num);
  });

  socket.on('reset-all', () => {
    state = { ready: [] };
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
  console.log('아인카페 주문번호 시스템이 실행되었습니다.');
  console.log('');
  console.log(`  TV 화면    : http://localhost:${PORT}/tv.html`);
  console.log(`  직원 입력  : http://${ip}:${PORT}/admin.html  (갤럭시탭에서 이 주소로 접속)`);
  console.log('');
});
