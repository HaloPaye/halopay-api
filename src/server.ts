import http from 'http';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { PaymentWebSocketBroadcaster } from './services/websocket.service.js';
import { HorizonListenerService } from './services/horizon.service.js';
import { dbPool, initDatabase } from './utils/db.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = createApp();
const server = http.createServer(app);

// Initialize WebSocket payment broadcaster & Horizon listener
const broadcaster = new PaymentWebSocketBroadcaster();
broadcaster.initialize(server);

const horizonListener = new HorizonListenerService(broadcaster);
const MERCHANT_PUBKEY = process.env.MERCHANT_PUBLIC_KEY || 'GA7Q33B656F42D5G77XJSB62G4U74N5G3277Y88U337G3H2I2K3L4M5N';

async function startServer() {
  try {
    await initDatabase();
  } catch (err) {
    console.error('[DB] Failed to initialize database:', err);
    // Proceed anyway or process.exit(1), but we'll just log it for tests that might mock DB
  }

  horizonListener.startListening(MERCHANT_PUBKEY);

  server.listen(PORT, () => {
    console.log(`[HaloPay API] Server running on http://localhost:${PORT}`);
    console.log(`[HaloPay API] WebSocket endpoint active at ws://localhost:${PORT}/ws/payments`);
  });
}

startServer();

// Graceful shutdown hooks
const shutdown = async () => {
  console.log('[HaloPay API] Shutting down gracefully...');
  server.close(async () => {
    console.log('[HaloPay API] HTTP server closed.');
    await dbPool.end();
    console.log('[DB] Connection pool drained.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { server, broadcaster, horizonListener };
