import { IGameSessionRepository } from "../../domain/repositories/IGameSessionRepository";
import { IWebSocketServer } from "../../domain/services/IWebSocketServer";

export class StartGameUseCase {
  constructor(
    private readonly gameSessionRepository: IGameSessionRepository,
    private readonly webSocketServer: IWebSocketServer
  ) {}

  async execute(gameId: string): Promise<boolean> {
    const gameSession = await this.gameSessionRepository.findById(gameId);
    if (!gameSession) {
      throw new Error(`Game session with ID ${gameId} not found`);
    }

    if (gameSession.players.length === 0) {
      throw new Error("Cannot start a game with no players");
    }

    const success = gameSession.start();
    if (!success) {
      return false;
    }

    await this.gameSessionRepository.save(gameSession);

    this.webSocketServer.broadcastToRoom(gameId, "gameStarted", {
      gameId,
      quizTitle: gameSession.quiz.title,
      totalQuestions: gameSession.quiz.questions.length,
    });

    const events = gameSession.events;
    const questionStartedEvent = events.find(e => e.type === "questionStarted");
    
    if (questionStartedEvent) {
      this.webSocketServer.broadcastToRoom(
        gameId, 
        "questionStarted", 
        questionStartedEvent.payload
      );
    }

    return true;
  }
}
