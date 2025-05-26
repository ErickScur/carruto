import { Quiz } from "../../domain/entities/Quiz";
import { IQuizRepository } from "../../domain/repositories/IQuizRepository";

export class InMemoryQuizRepository implements IQuizRepository {
  private quizzes: Map<string, Quiz>;

  constructor() {
    this.quizzes = new Map<string, Quiz>();
  }

  async findById(id: string): Promise<Quiz | null> {
    const quiz = this.quizzes.get(id);
    return quiz || null;
  }

  async findAll(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }

  async save(quiz: Quiz): Promise<void> {
    this.quizzes.set(quiz.id, quiz);
  }
}
