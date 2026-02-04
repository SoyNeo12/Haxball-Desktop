require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/open-external', (req, res) => {
  const { url } = req.body;
  console.log('URL a abrir:', url);

  res.json({ success: true, url });
});

app.get('/open-external', (req, res) => {
  const { url } = req.query;
  res.json({ success: true, url });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
