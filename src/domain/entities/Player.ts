export class Player {
  private readonly _id: string;
  private readonly _name: string;
  private _score: number;

  constructor(id: string, name: string) {
    this._id = id;
    this._name = name;
    this._score = 0;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get score(): number {
    return this._score;
  }

  addPoints(points: number): void {
    if (points < 0) {
      throw new Error("Cannot add negative points");
    }
    this._score += points;
  }

  resetScore(): void {
    this._score = 0;
  }
}
