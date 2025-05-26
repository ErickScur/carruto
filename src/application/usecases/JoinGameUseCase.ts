import { v4 as uuidv4 } from "uuid";
import { Player } from "../../domain/entities/Player";
import { IGameSessionRepository } from "../../domain/repositories/IGameSessionRepository";
import { IPlayerRepository } from "../../domain/repositories/IPlayerRepository";
import { IWebSocketServer } from "../../domain/services/IWebSocketServer";
import { JoinGameDto } from "../dtos/JoinGameDto";

export class JoinGameUseCase {
  constructor(
    private readonly gameSessionRepository: IGameSessionRepository,
    private readonly playerRepository: IPlayerRepository,
    private readonly webSocketServer: IWebSocketServer
  ) {}

  async execute(dto: JoinGameDto): Promise<{
    gameId: string;
    playerId: string;
    quizTitle: string;
  }> {
    const gameSession = await this.gameSessionRepository.findByCode(
      dto.gameCode
    );
    if (!gameSession) {
      throw new Error(`Game session with code ${dto.gameCode} not found`);
    }

    if (gameSession.status !== "WAITING") {
      throw new Error("Cannot join a game that has already started or ended");
    }

    const playerId = uuidv4();
    const player = new Player(playerId, dto.playerName);

    const success = gameSession.addPlayer(player);
    if (!success) {
      throw new Error("Failed to add player to game session");
    }

    await this.playerRepository.save(player);
    await this.gameSessionRepository.save(gameSession);

    this.webSocketServer.broadcastToRoom(gameSession.id, "playerJoined", {
      playerId: player.id,
      playerName: player.name
    });

    return {
      gameId: gameSession.id,
      playerId: player.id,
      quizTitle: gameSession.quiz.title,
    };
  }
}
