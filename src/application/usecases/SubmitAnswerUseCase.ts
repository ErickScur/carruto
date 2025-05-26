import { IGameSessionRepository } from "../../domain/repositories/IGameSessionRepository";
import { IWebSocketServer } from "../../domain/services/IWebSocketServer";
import { SubmitAnswerDto } from "../dtos/SubmitAnswerDto";
import { NextQuestionUseCase } from "./NextQuestionUseCase";
import { EndGameUseCase } from "./EndGameUseCase";

export class SubmitAnswerUseCase {
  constructor(
    private readonly gameSessionRepository: IGameSessionRepository,
    private readonly webSocketServer: IWebSocketServer,
    private readonly nextQuestionUseCase: NextQuestionUseCase,
    private readonly endGameUseCase: EndGameUseCase
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
    
    console.log(`📊 Player ${player.name} (${dto.playerId}) answered:
      - Previous score: ${previousScore}
      - Points earned: ${pointsEarned}
      - New total score: ${player.score}
      - Is correct: ${isCorrect}`);

   
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
      const isLastQuestion = gameSession.isLastQuestion;
      const currentQuestionNumber = gameSession.currentQuestionIndex + 1;
      const totalQuestions = gameSession.quiz.questions.length;
      
      console.log(`🎯 ALL PLAYERS ANSWERED! Question ${currentQuestionNumber}/${totalQuestions}, isLastQuestion: ${isLastQuestion}`);
      
      if (isLastQuestion) {
        console.log(`🏁 All players (${answeredPlayersCount}/${totalPlayersCount}) have answered the LAST question. Ending game in 3 seconds...`);
        
        setTimeout(async () => {
          try {
            console.log(`🎮 Executing endGameUseCase for game ${dto.gameId}...`);
            await this.endGameUseCase.execute(dto.gameId);
            console.log(`✅ Game ${dto.gameId} ended successfully after all players answered.`);
          } catch (error) {
            console.error(`❌ Failed to end game ${dto.gameId}:`, error);
          }
        }, 3000);
      } else {
        console.log(`➡️ All players (${answeredPlayersCount}/${totalPlayersCount}) have answered. Moving to next question in 3 seconds...`);
        
        setTimeout(async () => {
          try {
            const success = await this.nextQuestionUseCase.execute(dto.gameId);
            if (success) {
              console.log(`✅ Successfully advanced to next question in game ${dto.gameId}.`);
            } else {
              console.log(`❌ Could not advance to next question in game ${dto.gameId}.`);
            }
          } catch (error) {
            console.error(`❌ Failed to advance to next question in game ${dto.gameId}:`, error);
          }
        }, 3000);
      }
    }

    return { success: true, points: pointsEarned, isCorrect };
  }
}
