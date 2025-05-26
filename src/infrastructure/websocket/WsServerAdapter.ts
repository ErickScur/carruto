import { WebSocketServer, WebSocket } from "ws";
import { IWebSocketServer } from "../../domain/services/IWebSocketServer";
import http from "http";

interface Client {
  id: string;
  socket: WebSocket;
  roomId?: string;
}

interface MessageEvent {
  event: string;
  payload: unknown;
}

export class WsServerAdapter implements IWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Client>;
  private eventHandlers: Map<
    string,
    ((clientId: string, payload: unknown) => void)[]
  >;

  constructor(server: http.Server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map();
    this.eventHandlers = new Map();
    this.initialize();
  }

  private initialize(): void {
    this.wss.on("connection", (socket: WebSocket) => {
      const clientId = this.generateClientId();

      this.clients.set(clientId, { id: clientId, socket });

      const connectionHandlers = this.eventHandlers.get("connection") || [];
      connectionHandlers.forEach((handler) => handler(clientId, {}));

      socket.on("message", (data: string) => {
        try {
          const { event, payload } = JSON.parse(data) as MessageEvent;

          if (
            event === "joinRoom" &&
            typeof payload === "object" &&
            payload !== null
          ) {
            const roomId = (payload as { roomId?: string }).roomId;
            if (roomId) {
              const client = this.clients.get(clientId);
              if (client) {
                client.roomId = roomId;
                console.log(`Client ${clientId} joined room ${roomId}`);
              }
            }
          }

          const handlers = this.eventHandlers.get(event) || [];
          handlers.forEach((handler) => handler(clientId, payload));
        } catch (error) {
          console.error("Invalid message format:", error);
        }
      });

      socket.on("close", () => {
        this.clients.delete(clientId);
      });
    });
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  broadcast(event: string, payload: unknown): void {
    const message = JSON.stringify({ event, payload });

    this.clients.forEach((client) => {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(message);
      }
    });
  }

  broadcastToRoom(roomId: string, event: string, payload: unknown): void {
    const message = JSON.stringify({ event, payload });
    console.log(`Broadcasting to room ${roomId}, event: ${event}`, payload);

    let clientsInRoom = 0;
    this.clients.forEach((client) => {
      if (
        client.roomId === roomId &&
        client.socket.readyState === WebSocket.OPEN
      ) {
        console.log(`Sending to client ${client.id} in room ${roomId}`);
        client.socket.send(message);
        clientsInRoom++;
      }
    });
    
    console.log(`Broadcast complete. Sent to ${clientsInRoom} clients in room ${roomId}`);
  }

  sendToClient(clientId: string, event: string, payload: unknown): void {
    const client = this.clients.get(clientId);
    if (client && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify({ event, payload }));
    }
  }

  onConnection(handler: (clientId: string, payload: unknown) => void): void {
    const handlers = this.eventHandlers.get("connection") || [];
    handlers.push(handler);
    this.eventHandlers.set("connection", handlers);
  }

  onMessage(
    event: string,
    handler: (clientId: string, payload: unknown) => void
  ): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
  }
}
