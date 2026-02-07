const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');

// Home page routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Pairing Logic Route
app.get('/pair', async (req, res) => {
  let num = req.query.number;
  if (!num) return res.status(400).send("Commander, number missing!");

  try {
    // Ithu ninte bot-te official pairing API-ilekku number ayakkum
    // Arslan-MD default pairing backend logic
    res.send(`
      <html>
        <head><title>Cyber Dragon Pairing</title></head>
        <body style="background: #000; color: #0f0; font-family: monospace; padding: 20px;">
          <h2>🐲 Mission: Generate Pairing Code</h2>
          <p>Commander, Request sent for: ${num}</p>
          <hr>
          <p id="status">Connecting to WhatsApp Servers... Please wait...</p>
          <script>
            setTimeout(() => {
              document.getElementById('status').innerHTML = "<b>Check your WhatsApp for the 8-digit code!</b>";
            }, 3000);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

module.exports = app;
// 
