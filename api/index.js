const express = require('express');
const app = express();
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");

app.get(['/', '/api/index'], async (req, res) => {
    let num = req.query.number;

    if (!num) {
        return res.send(`
            <body style="background-color:black;color:lime;font-family:monospace;text-align:center;padding-top:50px;">
                <h1>🐲 CYBER DRAGON PAIRING 🐲</h1>
                <form action="/api/index" method="GET">
                    <input type="text" name="number" placeholder="Enter 91..." style="padding:10px;width:250px;border-radius:5px;">
                    <br><br>
                    <button type="submit" style="padding:10px 20px;background:lime;font-weight:bold;cursor:pointer;">GET CODE</button>
                </form>
            </body>
        `);
    }

    const { state, saveCreds } = await useMultiFileAuthState('/tmp/auth');
    try {
        const conn = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: Browsers.macOS("Desktop")
        });

        if (!conn.authState.creds.registered) {
            await delay(1500);
            num = num.replace(/[^0-9]/g, '');
            const code = await conn.requestPairingCode(num);
            res.send(`
                <body style="background-color:black;color:lime;font-family:monospace;text-align:center;padding-top:50px;">
                    <h1 style="text-shadow: 0 0 10px lime;">🐲 CYBER DRAGON LIVE 🐲</h1>
                    <div style="font-size:60px; font-weight:bold; background:#111; display:inline-block; padding:30px; border:3px solid lime;">
                        ${code}
                    </div>
                </body>
            `);
        }
        conn.ev.on('creds.update', saveCreds);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

module.exports = app;

