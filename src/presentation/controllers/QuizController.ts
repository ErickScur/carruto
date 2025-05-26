import { Request, Response } from "express";
import { CreateGameSessionUseCase } from "../../application/usecases/CreateGameSessionUseCase";
import { InMemoryQuizRepository } from "../../infrastructure/repositories/InMemoryQuizRepository";

export class QuizController {
  constructor(
    private readonly createGameSessionUseCase: CreateGameSessionUseCase,
    private readonly quizRepository: InMemoryQuizRepository
  ) {}

  async showCreateGamePage(req: Request, res: Response): Promise<void> {
    try {
      const quizzes = await this.quizRepository.findAll();
      res.render("create-game", {
        title: "Create Quiz Game",
        quizzes: quizzes.map((quiz) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          questionCount: quiz.questions.length,
        })),
      });
    } catch (error) {
      console.error("Error rendering create game page:", error);
      res.status(500).render("error", {
        title: "Error",
        message: "An error occurred while loading quizzes.",
      });
    }
  }

  async createGame(req: Request, res: Response): Promise<void> {
    try {
      const quizId = req.body.quizId;

      if (!quizId) {
        res.status(400).render("error", {
          title: "Invalid Request",
          message: "Quiz ID is required",
        });
        return;
      }

      const result = await this.createGameSessionUseCase.execute({ quizId });

      res.render("host-game", {
        title: "Host Game",
        gameId: result.gameId,
        gameCode: result.gameCode,
        qrCodeUrl: result.qrCodeUrl,
      });
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).render("error", {
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while creating the game.",
      });
    }
  }
}
