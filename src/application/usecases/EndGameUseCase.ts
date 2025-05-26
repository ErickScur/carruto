import { IGameSessionRepository } from "../../domain/repositories/IGameSessionRepository";
import { IWebSocketServer } from "../../domain/services/IWebSocketServer";

export class EndGameUseCase {
  constructor(
    private readonly gameSessionRepository: IGameSessionRepository,
    private readonly webSocketServer: IWebSocketServer
  ) {}

  async execute(gameId: string): Promise<boolean> {
    const gameSession = await this.gameSessionRepository.findById(gameId);
    if (!gameSession) {
      throw new Error(`Game session with ID ${gameId} not found`);
    }

    if (gameSession.status === "ENDED") {
      console.log(`Game ${gameId} has already ended. Broadcasting final results again.`);
      
      // Mesmo que o jogo já tenha terminado, garantir que o evento gameEnded seja enviado
      const events = gameSession.events;
      const gameEndedEvent = events
        .filter(e => e.type === "gameEnded")
        .pop();
      
      if (gameEndedEvent) {
        this.webSocketServer.broadcastToRoom(
          gameId,
          "gameEnded",
          gameEndedEvent.payload
        );
      }
      
      return true; // Retornar sucesso mesmo que já tenha terminado
    }

    if (gameSession.status !== "IN_PROGRESS") {
      throw new Error("Cannot end game: game is not in progress");
    }

    // Finalizar o jogo
    gameSession.end();
    
    await this.gameSessionRepository.save(gameSession);

    // Enviar evento gameEnded
    const events = gameSession.events;
    const gameEndedEvent = events
      .filter(e => e.type === "gameEnded")
      .pop();
    
    if (gameEndedEvent) {
      console.log(`Game ${gameId} has ended. Broadcasting final results.`);
      this.webSocketServer.broadcastToRoom(
        gameId,
        "gameEnded",
        gameEndedEvent.payload
      );
    }

    return true;
  }
} 