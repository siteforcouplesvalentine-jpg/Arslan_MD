const express = require('express');
const app = express();
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");

// 🐲 Home and Logic together
app.get(['/', '/api/index'], async (req, res) => {
    let num = req.query.number;

    // 1. Show Input Box if no number
    if (!num) {
        return res.send(`
            <body style="background-color:black;color:lime;font-family:monospace;text-align:center;padding-top:50px;">
                <h1 style="text-shadow: 0 0 10px lime;">🐲 CYBER DRAGON PAIRING 🐲</h1>
                <form action="/api/index" method="GET">
                    <input type="text" name="number" placeholder="Enter 91..." style="padding:10px;width:250px;border-radius:5px;border:2px solid lime;background:#111;color:white;">
                    <br><br>
                    <button type="submit" style="padding:10px 20px;background:lime;font-weight:bold;cursor:pointer;border-radius:5px;border:none;">GET CODE</button>
                </form>
            </body>
        `);
    }

    // 2. Generate Code logic
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
                    <div style="font-size:60px; font-weight:bold; background:#111; display:inline-block; padding:30px; border:3px solid lime; box-shadow: 0 0 20px rgba(0,255,0,0.5); margin: 20px 0;">
                        ${code}
                    </div>
                    <p style="color:white;">Enter this code in your WhatsApp!</p>
                    <br>
                    <a href="/" style="color:yellow;">Try Another Number</a>
                </body>
            `);
        }
        conn.ev.on('creds.update', saveCreds);
    } catch (err) {
        res.status(500).send("Server Busy. Try again in 10 seconds.");
    }
});

module.exports = app;
app.listen(process.env.PORT || 3000);
