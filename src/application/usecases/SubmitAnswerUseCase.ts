import { IGameSessionRepository } from "../../domain/repositories/IGameSessionRepository";
import { IWebSocketServer } from "../../domain/services/IWebSocketServer";
import { SubmitAnswerDto } from "../dtos/SubmitAnswerDto";

export class SubmitAnswerUseCase {
  constructor(
    private readonly gameSessionRepository: IGameSessionRepository,
    private readonly webSocketServer: IWebSocketServer
  ) {}

  async execute(dto: SubmitAnswerDto): Promise<{
    success: boolean;
    points: number;
    isCorrect: boolean;
  }> {
    const gameSession = await this.gameSessionRepository.findById(dto.gameId);
    if (!gameSession) {
      throw new Error(`Game session with ID ${dto.gameId} not found`);
    }

    if (!gameSession.currentQuestion) {
      throw new Error("No active question in this game session");
    }

    const player = gameSession.getPlayer(dto.playerId);
    if (!player) {
      throw new Error(
        `Player with ID ${dto.playerId} not found in this game session`
      );
    }

    const previousScore = player.score;
    const success = gameSession.submitAnswer(dto.playerId, dto.choiceId);

    if (!success) {
      return { success: false, points: 0, isCorrect: false };
    }

    await this.gameSessionRepository.save(gameSession);

    const pointsEarned = player.score - previousScore;
    const isCorrect = gameSession.currentQuestion.isCorrectChoice(dto.choiceId);

   
    this.webSocketServer.sendToClient(dto.playerId, "answerResult", {
      gameId: dto.gameId,
      points: pointsEarned,
      isCorrect,
      newTotalScore: player.score,
    });

   
    this.webSocketServer.broadcastToRoom(dto.gameId, "scoresUpdated", {
      players: gameSession.players
        .map((p) => ({
          id: p.id,
          name: p.name,
          score: p.score,
        }))
        .sort((a, b) => b.score - a.score),
    });

   
    this.webSocketServer.broadcastToRoom(dto.gameId, "answerSubmitted", {
      playerId: dto.playerId,
      questionId: gameSession.currentQuestion.id,
      choiceId: dto.choiceId,
      points: pointsEarned,
      isCorrect: isCorrect
    });

   
    const currentQuestionId = gameSession.currentQuestion.id;
    const answeredPlayersCount = gameSession.scores.filter(
      score => score.questionId === currentQuestionId
    ).length;
    const totalPlayersCount = gameSession.players.length;

   
    if (answeredPlayersCount === totalPlayersCount) {
      console.log(`All players (${answeredPlayersCount}/${totalPlayersCount}) have answered. Moving to next question in 3 seconds...`);
      
      setTimeout(async () => {
        const updatedGameSession = await this.gameSessionRepository.findById(dto.gameId);
        if (updatedGameSession && updatedGameSession.status === "IN_PROGRESS") {
          const nextSuccess = updatedGameSession.nextQuestion();
          if (nextSuccess) {
            await this.gameSessionRepository.save(updatedGameSession);
            
           
            const events = updatedGameSession.events;
            const questionStartedEvent = events
              .filter(e => e.type === "questionStarted")
              .pop();
            
            if (questionStartedEvent) {
              this.webSocketServer.broadcastToRoom(
                dto.gameId,
                "questionStarted",
                questionStartedEvent.payload
              );
            }
          }
        }
      }, 3000);
    }

    return { success: true, points: pointsEarned, isCorrect };
  }
}
