export interface IWebSocketServer {
  broadcast(event: string, payload: unknown): void;
  broadcastToRoom(roomId: string, event: string, payload: unknown): void;
  sendToClient(clientId: string, event: string, payload: unknown): void;
  onConnection(handler: (clientId: string, payload: unknown) => void): void;
  onMessage(
    event: string,
    handler: (clientId: string, payload: unknown) => void
  ): void;
}
