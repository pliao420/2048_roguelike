const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'leaderboard.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.json());

// Serve static files (game.html, etc.)
app.use(express.static(__dirname));

// GET /api/leaderboard — return top 10
app.get('/api/leaderboard', (req, res) => {
  const lb = readLeaderboard();
  res.json({ leaderboard: lb.slice(0, 10) });
});

// POST /api/leaderboard — add a new entry
app.post('/api/leaderboard', (req, res) => {
  const { name, score, moves, board } = req.body;

  // Validate
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: '名字不能为空' });
  }
  if (!Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: '分数无效' });
  }

  const entry = {
    name: name.trim().substring(0, 8),
    score,
    moves: moves || 0,
    board: board || '?×?',
    date: new Date().toLocaleDateString('zh-CN'),
    time: Date.now(),
  };

  const lb = readLeaderboard();
  lb.push(entry);
  lb.sort((a, b) => b.score - a.score);
  writeLeaderboard(lb.slice(0, 50)); // keep top 50

  // Return the updated top 10
  res.json({ success: true, leaderboard: lb.slice(0, 10) });
});

function readLeaderboard() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read leaderboard:', e.message);
    return [];
  }
}

function writeLeaderboard(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write leaderboard:', e.message);
  }
}

app.listen(PORT, () => {
  console.log(`2048 Roguelike server running at http://localhost:${PORT}`);
  console.log(`Game: http://localhost:${PORT}/game.html`);
  console.log(`API:  http://localhost:${PORT}/api/leaderboard`);
});
