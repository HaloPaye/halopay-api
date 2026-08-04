import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { HorizonPaymentEvent } from '../types/sep.js';

export class PaymentWebSocketBroadcaster {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  public initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws/payments' });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log('[WebSocket] Merchant POS client connected. Active clients:', this.clients.size);

      ws.send(JSON.stringify({ event: 'CONNECTED', message: 'HaloPay Horizon Payment Listener active' }));

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('[WebSocket] Merchant POS client disconnected. Remaining clients:', this.clients.size);
      });

      ws.on('error', (error) => {
        console.error('[WebSocket] Error on client connection:', error);
      });
    });
  }

  public broadcastPayment(payment: HorizonPaymentEvent): void {
    const payload = JSON.stringify({
      event: 'PAYMENT_RECEIVED',
      data: payment,
      timestamp: new Date().toISOString()
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  public getConnectedClientCount(): number {
    return this.clients.size;
  }

  public close(): void {
    if (this.wss) {
      this.wss.close();
      this.clients.clear();
    }
  }
}
