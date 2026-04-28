const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 4000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'dev-secret';

// Initialize WhatsApp client with LocalAuth to persist the session
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'valle-ghost-phone'
    }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isReady = false;

// Generate QR code for initial authentication
client.on('qr', (qr) => {
    console.log('📱 Scan this QR code to authenticate the Ghost Phone:');
    qrcode.generate(qr, { small: true });
});

// Client is ready
client.on('ready', () => {
    isReady = true;
    console.log('✅ Ghost Phone is ready and connected to WhatsApp!');
});

// Handle disconnects
client.on('disconnected', (reason) => {
    console.error('❌ Ghost Phone disconnected:', reason);
    isReady = false;
    // Attempt to restart if needed, though pm2/docker is better for this
});

// Express Webhook Receiver
app.post('/webhook/send', async (req, res) => {
    // Basic API Key authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized. Invalid or missing Bearer token.' });
    }

    if (!isReady) {
        return res.status(503).json({ error: 'WhatsApp client is not ready yet.' });
    }

    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: 'Missing required fields: phone, message.' });
    }

    try {
        // Format phone number to WhatsApp ID format (e.g., 51987654321@c.us)
        const formattedPhone = `${phone.replace(/\D/g, '')}@c.us`;
        
        await client.sendMessage(formattedPhone, message);
        console.log(`📩 Sent message to ${formattedPhone}`);
        
        return res.status(200).json({ success: true, status: 'Message sent successfully.' });
    } catch (error) {
        console.error('❌ Error sending message:', error);
        return res.status(500).json({ error: 'Failed to send message via WhatsApp.', details: error.message });
    }
});

// Start the Express server and the WhatsApp client
app.listen(port, () => {
    console.log(`🚀 Ghost Phone Microservice running on port ${port}`);
    console.log(`Starting WhatsApp client initialization...`);
    client.initialize();
});
