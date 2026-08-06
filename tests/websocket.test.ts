import { PaymentWebSocketBroadcaster } from '../src/services/websocket.service';
import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';

jest.mock('ws', () => {
  return {
    WebSocketServer: jest.fn().mockImplementation(() => {
      return {
        on: jest.fn((event, cb) => {
          if (event === 'connection') {
            const mockWs = {
              send: jest.fn(),
              on: jest.fn((e, wsCb) => {
                if (e === 'close') wsCb();
                if (e === 'error') wsCb(new Error('test error'));
              })
            };
            cb(mockWs);
          }
        }),
        close: jest.fn()
      };
    }),
    WebSocket: { OPEN: 1 }
  };
});

describe('PaymentWebSocketBroadcaster', () => {
  let broadcaster: PaymentWebSocketBroadcaster;

  beforeEach(() => {
    broadcaster = new PaymentWebSocketBroadcaster();
  });

  afterEach(() => {
    broadcaster.close();
  });

  it('should initialize and handle connections', () => {
    const mockServer = {} as Server;
    broadcaster.initialize(mockServer);
    // Because of our mock, connection event is instantly fired and close/error are triggered
    expect(WebSocketServer).toHaveBeenCalled();
  });

  it('should broadcast payment to connected clients', () => {
    const mockClient = {
      readyState: WebSocket.OPEN,
      send: jest.fn()
    } as unknown as WebSocket;

    (broadcaster as any).clients.add(mockClient);

    const payment = {
      id: 'tx_123',
      amount: '100',
      asset_code: 'USDC',
      from: 'G123',
      to: 'G456',
      created_at: new Date().toISOString()
    };

    broadcaster.broadcastPayment(payment);

    expect(mockClient.send).toHaveBeenCalled();
  });

  it('should return connected client count', () => {
    expect(broadcaster.getConnectedClientCount()).toBe(0);
  });
});
