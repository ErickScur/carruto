import { GameSession } from "../../domain/entities/GameSession";
import { IGameSessionRepository } from "../../domain/repositories/IGameSessionRepository";

export class InMemoryGameSessionRepository implements IGameSessionRepository {
  private gameSessions: Map<string, GameSession>;
  private gameCodeToId: Map<string, string>;

  constructor() {
    this.gameSessions = new Map<string, GameSession>();
    this.gameCodeToId = new Map<string, string>();
  }

  async findById(id: string): Promise<GameSession | null> {
    const gameSession = this.gameSessions.get(id);
    return gameSession || null;
  }

  async findByCode(code: string): Promise<GameSession | null> {
    const gameId = this.gameCodeToId.get(code);
    if (!gameId) {
      return null;
    }
    return this.findById(gameId);
  }

  async findAll(): Promise<GameSession[]> {
    return Array.from(this.gameSessions.values());
  }

  async save(gameSession: GameSession): Promise<void> {
    this.gameSessions.set(gameSession.id, gameSession);
  }

  setGameCode(gameId: string, code: string): void {
    this.gameCodeToId.set(code, gameId);
  }
}
