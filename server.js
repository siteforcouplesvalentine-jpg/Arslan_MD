const express = require('express');
const app = express();
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");

app.get('/pair', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.send("Provide a number!");

    // Storage fix for Vercel
    const { state, saveCreds } = await useMultiFileAuthState('/tmp/auth');
    
    try {
        const conn = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: Browsers.macOS("Desktop")
        });

        if (!conn.authState.creds.registered) {
            await delay(2000);
            num = num.replace(/[^0-9]/g, '');
            const code = await conn.requestPairingCode(num);

            res.send(`
                <body style="background-color:black;color:lime;font-family:monospace;text-align:center;padding-top:50px;">
                    <h1 style="text-shadow: 0 0 10px lime;">🐲 CYBER DRAGON LIVE 🐲</h1>
                    <div style="font-size:50px; border:3px solid lime; display:inline-block; padding:20px; margin:20px;">
                        ${code}
                    </div>
                    <p style="color:white;">Enter this code in your WhatsApp!</p>
                </body>
            `);
        }
    } catch (err) {
        res.status(500).send("Try again in 1 minute.");
    }
});

app.listen(process.env.PORT || 3000);
