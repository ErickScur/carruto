import { Question } from "./Question";

export class Quiz {
  private readonly _id: string;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _questions: Question[];
  private _timePerQuestionInSeconds: number;

  constructor(
    id: string,
    title: string,
    description: string,
    questions: Question[] = [],
    timePerQuestionInSeconds: number = 30
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._questions = questions;
    this._timePerQuestionInSeconds = timePerQuestionInSeconds;
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get questions(): Question[] {
    return [...this._questions];
  }

  get timePerQuestionInSeconds(): number {
    return this._timePerQuestionInSeconds;
  }

  set timePerQuestionInSeconds(seconds: number) {
    if (seconds < 5)
      throw new Error("Time per question must be at least 5 seconds");
    if (seconds > 120)
      throw new Error("Time per question cannot exceed 120 seconds");
    this._timePerQuestionInSeconds = seconds;
  }

  addQuestion(question: Question): void {
    this._questions.push(question);
  }

  removeQuestion(questionId: string): void {
    const index = this._questions.findIndex((q) => q.id === questionId);
    if (index !== -1) {
      this._questions.splice(index, 1);
    }
  }

  getQuestionById(questionId: string): Question | undefined {
    return this._questions.find((q) => q.id === questionId);
  }
}
