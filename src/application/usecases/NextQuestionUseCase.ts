import { IGameSessionRepository } from "../../domain/repositories/IGameSessionRepository";
import { IWebSocketServer } from "../../domain/services/IWebSocketServer";

export class NextQuestionUseCase {
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
      console.log(`Game ${gameId} has already ended. No more questions to advance.`);
      return false;
    }

    if (gameSession.status !== "IN_PROGRESS") {
      throw new Error("Cannot advance question: game is not in progress");
    }

    const success = gameSession.nextQuestion();
    
    if (!success) {
      console.log(`No more questions in game ${gameId} or game has ended.`);
      return false;
    }

    await this.gameSessionRepository.save(gameSession);

    const events = gameSession.events;
    const questionStartedEvent = events
      .filter(e => e.type === "questionStarted")
      .pop();
    
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