const express = require('express');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Параметры майнинга
const taskData = 'mining_task_1';
const difficulty = 4;
const prefix = '0'.repeat(difficulty);

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Приём результата майнинга
app.post('/submit', (req, res) => {
  const { nonce, hash } = req.body;

  const expectedHash = sha256(taskData + nonce);

  if (expectedHash === hash && hash.startsWith(prefix)) {
    console.log('Успешный майнинг! Хэш:', hash);
    return res.json({ success: true, message: 'Hash is valid!' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid hash' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});