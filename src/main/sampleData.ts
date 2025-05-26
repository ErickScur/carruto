import { v4 as uuidv4 } from "uuid";
import { Quiz } from "../domain/entities/Quiz";
import { Question } from "../domain/entities/Question";
import { Choice } from "../domain/entities/Choice";
import { InMemoryQuizRepository } from "../infrastructure/repositories/InMemoryQuizRepository";

export function setupSampleData(quizRepository: InMemoryQuizRepository): void {
  const tsHistoryQuiz = new Quiz(
    "quiz_ts",
    "TypeScript: Da Origem à Aplicação Moderna",
    "Teste seus conhecimentos sobre a história, características e aplicações do TypeScript"
  );

  const q1 = new Question(
    "q1",
    "Quando começou o desenvolvimento do TypeScript?",
    [
      new Choice("c1", "2008"),
      new Choice("c2", "2010"),
      new Choice("c3", "2012"),
      new Choice("c4", "2015"),
    ],
    "c2",
    100
  );
  tsHistoryQuiz.addQuestion(q1);

  const q2 = new Question(
    "q2",
    "Qual foi o marco da versão 1.0 do TypeScript?",
    [
      new Choice("c1", "Inclusão de decorators"),
      new Choice("c2", "Compilador em Go"),
      new Choice("c3", "Tornar-se open source no GitHub"),
      new Choice("c4", "Adoção pelo React"),
    ],
    "c3",
    100
  );
  tsHistoryQuiz.addQuestion(q2);

  const q3 = new Question(
    "q3",
    "Qual dessas linguagens é considerada o 'superset' da outra?",
    [
      new Choice("c1", "JavaScript é superset do TypeScript"),
      new Choice("c2", "TypeScript é superset do JavaScript"),
      new Choice("c3", "Ambos são equivalentes"),
      new Choice("c4", "TypeScript substitui o JavaScript"),
    ],
    "c2",
    100
  );
  tsHistoryQuiz.addQuestion(q3);

  const q4 = new Question(
    "q4",
    "Uma das principais vantagens do TypeScript é:",
    [
      new Choice("c1", "Menor performance comparado ao JS"),
      new Choice("c2", "Reduz bugs e facilita refatoração"),
      new Choice("c3", "Substitui completamente o JavaScript"),
      new Choice("c4", "Funciona apenas com Angular"),
    ],
    "c2",
    100
  );
  tsHistoryQuiz.addQuestion(q4);

  const q5 = new Question(
    "q5",
    "Qual desses frameworks **não** é frequentemente usado com TypeScript?",
    [
      new Choice("c1", "NestJS"),
      new Choice("c2", "Angular"),
      new Choice("c3", "React"),
      new Choice("c4", "Laravel"),
    ],
    "c4",
    100
  );
  tsHistoryQuiz.addQuestion(q5);

  const q6 = new Question(
    "q6",
    "O que a versão 5.0 do TypeScript trouxe como novidade importante?",
    [
      new Choice("c1", "Tipagem dinâmica"),
      new Choice("c2", "Decorators nativos"),
      new Choice("c3", "Suporte à linguagem C#"),
      new Choice("c4", "Fim da compatibilidade com JavaScript"),
    ],
    "c2",
    100
  );
  tsHistoryQuiz.addQuestion(q6);

  const q7 = new Question(
    "q7",
    "Um dos benefícios da orientação a objetos no TypeScript é:",
    [
      new Choice("c1", "Código mais lento"),
      new Choice("c2", "Código mais acoplado"),
      new Choice("c3", "Facilita testes e modularização"),
      new Choice("c4", "Redução do uso de classes"),
    ],
    "c3",
    100
  );
  tsHistoryQuiz.addQuestion(q7);

  const q8 = new Question(
    "q8",
    "Qual dessas ferramentas **não** é usada para testes em TypeScript?",
    [
      new Choice("c1", "Jest"),
      new Choice("c2", "Cypress"),
      new Choice("c3", "Mocha"),
      new Choice("c4", "Laravel Dusk"),
    ],
    "c4",
    100
  );
  tsHistoryQuiz.addQuestion(q8);

  quizRepository.save(tsHistoryQuiz);

  console.log("TypeScript quiz data loaded successfully!");
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
