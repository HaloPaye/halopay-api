import http from 'http';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { PaymentWebSocketBroadcaster } from './services/websocket.service.js';
import { HorizonListenerService } from './services/horizon.service.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = createApp();
const server = http.createServer(app);

// Initialize WebSocket payment broadcaster & Horizon listener
const broadcaster = new PaymentWebSocketBroadcaster();
broadcaster.initialize(server);

const horizonListener = new HorizonListenerService(broadcaster);
const MERCHANT_PUBKEY = process.env.MERCHANT_PUBLIC_KEY || 'GA7Q33B656F42D5G77XJSB62G4U74N5G3277Y88U337G3H2I2K3L4M5N';
horizonListener.startListening(MERCHANT_PUBKEY);

server.listen(PORT, () => {
  console.log(`[HaloPay API] Server running on http://localhost:${PORT}`);
  console.log(`[HaloPay API] WebSocket endpoint active at ws://localhost:${PORT}/ws/payments`);
});

export { server, broadcaster, horizonListener };
