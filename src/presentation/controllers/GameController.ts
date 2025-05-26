import { Request, Response } from "express";
import { JoinGameUseCase } from "../../application/usecases/JoinGameUseCase";
import { StartGameUseCase } from "../../application/usecases/StartGameUseCase";
import { SubmitAnswerUseCase } from "../../application/usecases/SubmitAnswerUseCase";
import { NextQuestionUseCase } from "../../application/usecases/NextQuestionUseCase";
import { IGameSessionRepository } from "../../domain/repositories/IGameSessionRepository";

export class GameController {
  constructor(
    private readonly joinGameUseCase: JoinGameUseCase,
    private readonly startGameUseCase: StartGameUseCase,
    private readonly submitAnswerUseCase: SubmitAnswerUseCase,
    private readonly nextQuestionUseCase: NextQuestionUseCase,
    private readonly gameSessionRepository: IGameSessionRepository
  ) {}

  async showJoinPage(req: Request, res: Response): Promise<void> {
    const gameCode = req.params.code;
    res.render("join-game", {
      title: "Join Game",
      gameCode,
    });
  }

  async joinGame(req: Request, res: Response): Promise<void> {
    try {
      const { gameCode, playerName } = req.body;

      if (!gameCode || !playerName) {
        res.status(400).render("error", {
          title: "Invalid Request",
          message: "Game code and player name are required",
        });
        return;
      }

      const result = await this.joinGameUseCase.execute({
        gameCode,
        playerName,
      });

      res.render("player-game", {
        title: result.quizTitle,
        gameId: result.gameId,
        playerId: result.playerId,
        playerName,
      });
    } catch (error) {
      console.error("Error joining game:", error);
      res.status(500).render("error", {
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while joining the game.",
      });
    }
  }

  async startGame(req: Request, res: Response): Promise<void> {
    try {
      const gameId = req.body.gameId;

      if (!gameId) {
        res.status(400).json({ success: false, error: "Game ID is required" });
        return;
      }

      const success = await this.startGameUseCase.execute(gameId);

      if (success) {
        res.json({ success: true });
      } else {
        res
          .status(400)
          .json({ success: false, error: "Could not start the game" });
      }
    } catch (error) {
      console.error("Error starting game:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while starting the game.",
      });
    }
  }

  async submitAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { gameId, playerId, choiceId } = req.body;

      if (!gameId || !playerId || !choiceId) {
        res.status(400).json({
          success: false,
          error: "Game ID, player ID, and choice ID are required",
        });
        return;
      }

      const result = await this.submitAnswerUseCase.execute({
        gameId,
        playerId,
        choiceId,
      });

      res.json({
        success: result.success,
        points: result.points,
        isCorrect: result.isCorrect,
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while submitting the answer.",
      });
    }
  }

  async nextQuestion(req: Request, res: Response): Promise<void> {
    try {
      const gameId = req.body.gameId;

      if (!gameId) {
        res.status(400).json({ success: false, error: "Game ID is required" });
        return;
      }

      const success = await this.nextQuestionUseCase.execute(gameId);

      if (success) {
        res.json({ success: true });
      } else {
        const gameSession = await this.gameSessionRepository.findById(gameId);
        
        if (gameSession && gameSession.status === "ENDED") {
          res.json({ 
            success: false, 
            gameEnded: true,
            message: "O jogo já terminou. Não há mais questões."
          });
        } else {
          res.status(400).json({ 
            success: false, 
            error: "Could not advance to the next question" 
          });
        }
      }
    } catch (error) {
      console.error("Error advancing to next question:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while advancing to the next question.",
      });
    }
  }
}
