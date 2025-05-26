import { Player } from "../entities/Player";

export interface IPlayerRepository {
  findById(id: string): Promise<Player | null>;
  findByName(name: string): Promise<Player | null>;
  save(player: Player): Promise<void>;
}
