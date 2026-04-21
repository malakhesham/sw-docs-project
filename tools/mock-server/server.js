const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dataFile = path.join(__dirname, 'data', 'transactions.json');

function readData() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Failed to write data', e);
    return false;
  }
}

app.get('/api/transactions', (req, res) => {
  const data = readData();
  res.json(data);
});

// Replace whole collection
app.put('/api/transactions', (req, res) => {
  const list = Array.isArray(req.body) ? req.body : [];
  const ok = writeData(list);
  if (ok) return res.status(200).json({ status: 'ok' });
  return res.status(500).json({ status: 'error' });
});

// simple health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`Mock backend running at http://localhost:${port}`));
