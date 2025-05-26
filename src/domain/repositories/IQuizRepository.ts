import { Quiz } from "../entities/Quiz";

export interface IQuizRepository {
  findById(id: string): Promise<Quiz | null>;
  findAll(): Promise<Quiz[]>;
  save(quiz: Quiz): Promise<void>;
}
