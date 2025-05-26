import { v4 as uuidv4 } from "uuid";
import { Quiz } from "../domain/entities/Quiz";
import { Question } from "../domain/entities/Question";
import { Choice } from "../domain/entities/Choice";
import { InMemoryQuizRepository } from "../infrastructure/repositories/InMemoryQuizRepository";

export function setupSampleData(quizRepository: InMemoryQuizRepository): void {
  const programmingQuiz = new Quiz(
    "quiz1",
    "Programming Basics",
    "Test your knowledge of programming fundamentals"
  );

  const q1 = new Question(
    "q1",
    "What does HTML stand for?",
    [
      new Choice("c1", "Hyper Text Markup Language"),
      new Choice("c2", "High Tech Modern Language"),
      new Choice("c3", "Hyper Transfer Markup Language"),
      new Choice("c4", "Home Tool Markup Language"),
    ],
    "c1",
    100
  );
  programmingQuiz.addQuestion(q1);

  const q2 = new Question(
    "q2",
    "Which of the following is not a JavaScript data type?",
    [
      new Choice("c1", "String"),
      new Choice("c2", "Boolean"),
      new Choice("c3", "Character"),
      new Choice("c4", "Number"),
    ],
    "c3",
    150
  );
  programmingQuiz.addQuestion(q2);

  const q3 = new Question(
    "q3",
    "What does CSS stand for?",
    [
      new Choice("c1", "Computer Style Sheets"),
      new Choice("c2", "Creative Style Sheets"),
      new Choice("c3", "Cascading Style Sheets"),
      new Choice("c4", "Colorful Style Sheets"),
    ],
    "c3",
    100
  );
  programmingQuiz.addQuestion(q3);

  const generalKnowledgeQuiz = new Quiz(
    "quiz2",
    "General Knowledge",
    "Test your general knowledge with these questions"
  );

  const gq1 = new Question(
    "gq1",
    "What is the capital of France?",
    [
      new Choice("c1", "London"),
      new Choice("c2", "Paris"),
      new Choice("c3", "Berlin"),
      new Choice("c4", "Madrid"),
    ],
    "c2",
    100
  );
  generalKnowledgeQuiz.addQuestion(gq1);

  const gq2 = new Question(
    "gq2",
    "Which planet is known as the Red Planet?",
    [
      new Choice("c1", "Earth"),
      new Choice("c2", "Mars"),
      new Choice("c3", "Jupiter"),
      new Choice("c4", "Venus"),
    ],
    "c2",
    150
  );
  generalKnowledgeQuiz.addQuestion(gq2);

  quizRepository.save(programmingQuiz);
  quizRepository.save(generalKnowledgeQuiz);

  console.log("Sample data loaded successfully!");
}

function createQuestion(
  text: string,
  choices: Choice[],
  correctChoiceIndex: number
): Question {
  const questionId = uuidv4();
  return new Question(
    questionId,
    text,
    choices,
    choices[correctChoiceIndex].id
  );
}
