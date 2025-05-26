import { Choice } from "./Choice";

export class Question {
  private readonly _id: string;
  private readonly _text: string;
  private readonly _choices: Choice[];
  private readonly _correctChoiceId: string;
  private readonly _points: number;

  constructor(
    id: string,
    text: string,
    choices: Choice[],
    correctChoiceId: string,
    points: number = 100
  ) {
    if (choices.length < 2) {
      throw new Error("A question must have at least 2 choices");
    }

    if (!choices.some((choice) => choice.id === correctChoiceId)) {
      throw new Error(
        "The correct choice ID must match one of the provided choices"
      );
    }

    this._id = id;
    this._text = text;
    this._choices = choices;
    this._correctChoiceId = correctChoiceId;
    this._points = points;
  }

  get id(): string {
    return this._id;
  }

  get text(): string {
    return this._text;
  }

  get choices(): Choice[] {
    return [...this._choices];
  }

  get correctChoiceId(): string {
    return this._correctChoiceId;
  }

  get points(): number {
    return this._points;
  }

  isCorrectChoice(choiceId: string): boolean {
    return choiceId === this._correctChoiceId;
  }

  calculateScore(choiceId: string, timeRemainingPercent: number): number {
    if (this.isCorrectChoice(choiceId)) {
      return Math.floor(this._points * (0.5 + 0.5 * timeRemainingPercent));
    }
    return 0;
  }
}
