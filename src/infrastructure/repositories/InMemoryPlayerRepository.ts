import { Player } from "../../domain/entities/Player";
import { IPlayerRepository } from "../../domain/repositories/IPlayerRepository";

export class InMemoryPlayerRepository implements IPlayerRepository {
  private players: Map<string, Player>;
  private playerNameToId: Map<string, string>;

  constructor() {
    this.players = new Map<string, Player>();
    this.playerNameToId = new Map<string, string>();
  }

  async findById(id: string): Promise<Player | null> {
    const player = this.players.get(id);
    return player || null;
  }

  async findByName(name: string): Promise<Player | null> {
    const playerId = this.playerNameToId.get(name);
    if (!playerId) {
      return null;
    }
    return this.findById(playerId);
  }

  async save(player: Player): Promise<void> {
    this.players.set(player.id, player);
    this.playerNameToId.set(player.name, player.id);
  }
}
