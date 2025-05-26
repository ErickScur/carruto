export type GameEventType =
  | "playerJoined"
  | "playerLeft"
  | "gameStarted"
  | "questionStarted"
  | "answerSubmitted"
  | "gameEnded";

export class GameEvent {
  private readonly _type: GameEventType;
  private readonly _payload: Record<string, any>;
  private readonly _timestamp: Date;

  constructor(
    type: GameEventType,
    payload: Record<string, any>,
    timestamp: Date = new Date()
  ) {
    this._type = type;
    this._payload = payload;
    this._timestamp = timestamp;
  }

  get type(): GameEventType {
    return this._type;
  }

  get payload(): Record<string, any> {
    return { ...this._payload };
  }

  get timestamp(): Date {
    return new Date(this._timestamp);
  }
}
