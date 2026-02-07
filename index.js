const express = require('express');
const app = express();
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");

app.get('/pair', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.send("Provide a number! (e.g., ?number=91...)");

    // 🚀 VERCEL FIX: State storage /tmp/ folder-ilekku maatti
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

            // ✨ THE MAGIC: Hacker Style Browser UI
            res.send(`
                <body style="background-color:black;color:lime;font-family:monospace;text-align:center;padding-top:50px;">
                    <h1 style="text-shadow: 0 0 10px lime;">🐲 CYBER DRAGON PAIRING 🐲</h1>
                    <hr style="border: 1px solid #333; width: 80%;">
                    <h2 style="color:white;">Your 8-Digit Code is:</h2>
                    <div style="font-size:60px; font-weight:bold; background:#111; display:inline-block; padding:30px; border-radius:15px; border:3px solid lime; box-shadow: 0 0 20px rgba(0,255,0,0.5); margin: 20px 0;">
                        ${code}
                    </div>
                    <p style="color:yellow; font-size:18px;">Commander, enter this code in WhatsApp > Linked Devices!</p>
                    <p style="color:gray;">Session ID will be sent to your WhatsApp after linking.</p>
                </body>
            `);
        }
        
        conn.ev.on('creds.update', saveCreds);

    } catch (err) {
        console.log(err);
        res.status(500).send("Error: " + err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started on port " + PORT));

