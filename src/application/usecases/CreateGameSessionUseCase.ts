import { v4 as uuidv4 } from "uuid";
import { GameSession } from "../../domain/entities/GameSession";
import { IGameSessionRepository } from "../../domain/repositories/IGameSessionRepository";
import { IQuizRepository } from "../../domain/repositories/IQuizRepository";
import { IQRCodeGenerator } from "../../domain/services/IQRCodeGenerator";
import { CreateGameSessionDto } from "../dtos/CreateGameSessionDto";
import { config as appConfig } from "../../infrastructure/config/config";

export class CreateGameSessionUseCase {
  constructor(
    private readonly gameSessionRepository: IGameSessionRepository,
    private readonly quizRepository: IQuizRepository,
    private readonly qrCodeGenerator: IQRCodeGenerator
  ) {}

  async execute(dto: CreateGameSessionDto, requestHost?: string): Promise<{
    gameId: string;
    gameCode: string;
    qrCodeUrl: string;
  }> {
    const quiz = await this.quizRepository.findById(dto.quizId);
    if (!quiz) {
      throw new Error(`Quiz with ID ${dto.quizId} not found`);
    }

    const gameId = uuidv4();
    const gameCode = this.generateGameCode();

    const gameSession = new GameSession(gameId, quiz);
    await this.gameSessionRepository.save(gameSession);

    this.gameSessionRepository.setGameCode(gameId, gameCode);

    const joinUrl = `${appConfig.baseUrl}/join/${gameCode}`;
    const qrCodeUrl = await this.qrCodeGenerator.generate(joinUrl);

    return { gameId, gameCode, qrCodeUrl };
  }

  private generateGameCode(): string {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }

    return code;
  }
}
