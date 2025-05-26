import { GameSession } from "../entities/GameSession";

export interface IGameSessionRepository {
  findById(id: string): Promise<GameSession | null>;
  findByCode(code: string): Promise<GameSession | null>;
  findAll(): Promise<GameSession[]>;
  save(gameSession: GameSession): Promise<void>;
  setGameCode(gameId: string, code: string): void;
}
