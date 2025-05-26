import { Quiz } from "./Quiz";
import { Player } from "./Player";
import { Score } from "./Score";
import { GameStatus } from "../enums/GameStatus";
import { GameEvent } from "../events/GameEvent";
import { Choice } from "./Choice";

export class GameSession {
  private readonly _id: string;
  private readonly _quiz: Quiz;
  private readonly _players: Map<string, Player>;
  private readonly _scores: Score[];
  private readonly _events: GameEvent[];
  private _currentQuestionIndex: number;
  private _status: GameStatus;
  private _startTime?: Date;
  private _currentQuestionStartTime?: Date;

  constructor(id: string, quiz: Quiz) {
    this._id = id;
    this._quiz = quiz;
    this._players = new Map<string, Player>();
    this._scores = [];
    this._events = [];
    this._currentQuestionIndex = -1;
    this._status = GameStatus.WAITING;
  }

  get id(): string {
    return this._id;
  }

  get quiz(): Quiz {
    return this._quiz;
  }

  get players(): Player[] {
    return Array.from(this._players.values());
  }

  get scores(): Score[] {
    return [...this._scores];
  }

  get events(): GameEvent[] {
    return [...this._events];
  }

  get currentQuestionIndex(): number {
    return this._currentQuestionIndex;
  }

  get status(): GameStatus {
    return this._status;
  }

  get startTime(): Date | undefined {
    return this._startTime ? new Date(this._startTime) : undefined;
  }

  get currentQuestion() {
    if (
      this._currentQuestionIndex < 0 ||
      this._currentQuestionIndex >= this._quiz.questions.length
    ) {
      return undefined;
    }
    return this._quiz.questions[this._currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    return this._currentQuestionIndex === this._quiz.questions.length - 1;
  }

  get hasMoreQuestions(): boolean {
    return this._currentQuestionIndex < this._quiz.questions.length - 1;
  }

  addPlayer(player: Player): boolean {
    if (this._status !== GameStatus.WAITING) {
      return false;
    }

    if (this._players.has(player.id)) {
      return false;
    }

    this._players.set(player.id, player);
    this.addEvent(
      new GameEvent("playerJoined", {
        playerId: player.id,
        playerName: player.name,
      })
    );
    return true;
  }

  removePlayer(playerId: string): boolean {
    if (!this._players.has(playerId)) {
      return false;
    }

    this._players.delete(playerId);
    this.addEvent(new GameEvent("playerLeft", { playerId }));
    return true;
  }

  getPlayer(playerId: string): Player | undefined {
    return this._players.get(playerId);
  }

  start(): boolean {
    if (this._status !== GameStatus.WAITING || this._players.size === 0) {
      return false;
    }

    this._status = GameStatus.IN_PROGRESS;
    this._startTime = new Date();
    this.addEvent(
      new GameEvent("gameStarted", {
        quizId: this._quiz.id,
        timestamp: this._startTime,
      })
    );
    this.nextQuestion();
    return true;
  }

  nextQuestion(): boolean {
    if (this._status !== GameStatus.IN_PROGRESS) {
      return false;
    }

    this._currentQuestionIndex++;

    if (this._currentQuestionIndex >= this._quiz.questions.length) {
      // Não finalizar automaticamente o jogo aqui
      // Deixar para o EndGameUseCase fazer isso explicitamente
      return false;
    }

    this._currentQuestionStartTime = new Date();
    const currentQuestion = this.currentQuestion!;

  
    const questionData = {
      id: currentQuestion.id,
      text: currentQuestion.text,
      choices: currentQuestion.choices.map((c: Choice) => ({
        id: c.id,
        text: c.text,
      })),
      timeLimit: this._quiz.timePerQuestionInSeconds,
      questionNumber: this._currentQuestionIndex + 1,
      totalQuestions: this._quiz.questions.length,
    };

    this.addEvent(new GameEvent("questionStarted", questionData));
    return true;
  }

  submitAnswer(playerId: string, choiceId: string): boolean {
    if (
      this._status !== GameStatus.IN_PROGRESS ||
      !this._currentQuestionStartTime ||
      !this.currentQuestion
    ) {
      return false;
    }

    const player = this._players.get(playerId);
    if (!player) {
      return false;
    }

  
    if (
      this._scores.some(
        (s) =>
          s.playerId === playerId && s.questionId === this.currentQuestion!.id
      )
    ) {
      return false;
    }

    const currentTime = new Date();
    const timeElapsed =
      (currentTime.getTime() - this._currentQuestionStartTime.getTime()) / 1000;
    const timeLimit = this._quiz.timePerQuestionInSeconds;

  
    if (timeElapsed > timeLimit) {
      return false;
    }

    const timeRemainingPercent = Math.max(
      0,
      (timeLimit - timeElapsed) / timeLimit
    );
    const points = this.currentQuestion.calculateScore(
      choiceId,
      timeRemainingPercent
    );

    const score = new Score(
      playerId,
      this.currentQuestion.id,
      choiceId,
      points,
      currentTime
    );

    this._scores.push(score);
    player.addPoints(points);

    this.addEvent(
      new GameEvent("answerSubmitted", {
        playerId,
        questionId: this.currentQuestion.id,
        choiceId,
        points,
        isCorrect: this.currentQuestion.isCorrectChoice(choiceId),
      })
    );

    return true;
  }

  end(): void {
    if (this._status === GameStatus.ENDED) {
      return;
    }

    this._status = GameStatus.ENDED;

  
    const rankings = this.players
      .map((player) => ({
        id: player.id,
        name: player.name,
        score: player.score,
      }))
      .sort((a, b) => b.score - a.score);

    this.addEvent(new GameEvent("gameEnded", { rankings }));
  }

  private addEvent(event: GameEvent): void {
    this._events.push(event);
  }
}
