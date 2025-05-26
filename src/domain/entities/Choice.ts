export class Choice {
  private readonly _id: string;
  private readonly _text: string;

  constructor(id: string, text: string) {
    this._id = id;
    this._text = text;
  }

  get id(): string {
    return this._id;
  }

  get text(): string {
    return this._text;
  }
}
