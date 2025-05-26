export class Score {
  private readonly _playerId: string;
  private readonly _questionId: string;
  private readonly _choiceId: string;
  private readonly _points: number;
  private readonly _timestamp: Date;

  constructor(
    playerId: string,
    questionId: string,
    choiceId: string,
    points: number,
    timestamp: Date = new Date()
  ) {
    this._playerId = playerId;
    this._questionId = questionId;
    this._choiceId = choiceId;
    this._points = points;
    this._timestamp = timestamp;
  }

  get playerId(): string {
    return this._playerId;
  }

  get questionId(): string {
    return this._questionId;
  }

  get choiceId(): string {
    return this._choiceId;
  }

  get points(): number {
    return this._points;
  }

  get timestamp(): Date {
    return new Date(this._timestamp);
  }
}
