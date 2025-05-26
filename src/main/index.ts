import { createServer } from "http";
import { ExpressHttpServer } from "../infrastructure/http/ExpressHttpServer";
import { config } from "../infrastructure/config/config";
import { WsServerAdapter } from "../infrastructure/websocket/WsServerAdapter";
import { QRCodeGeneratorAdapter } from "../infrastructure/qrcode/QRCodeGeneratorAdapter";
import { InMemoryQuizRepository } from "../infrastructure/repositories/InMemoryQuizRepository";
import { InMemoryGameSessionRepository } from "../infrastructure/repositories/InMemoryGameSessionRepository";
import { InMemoryPlayerRepository } from "../infrastructure/repositories/InMemoryPlayerRepository";
import { CreateGameSessionUseCase } from "../application/usecases/CreateGameSessionUseCase";
import { JoinGameUseCase } from "../application/usecases/JoinGameUseCase";
import { StartGameUseCase } from "../application/usecases/StartGameUseCase";
import { SubmitAnswerUseCase } from "../application/usecases/SubmitAnswerUseCase";
import { NextQuestionUseCase } from "../application/usecases/NextQuestionUseCase";
import { EndGameUseCase } from "../application/usecases/EndGameUseCase";
import { QuizController } from "../presentation/controllers/QuizController";
import { GameController } from "../presentation/controllers/GameController";
import { setupSampleData } from "./sampleData";

const httpServer = new ExpressHttpServer(config.port);
const server = createServer(httpServer.expressApp);

const webSocketServer = new WsServerAdapter(server);

const quizRepository = new InMemoryQuizRepository();
const gameSessionRepository = new InMemoryGameSessionRepository();
const playerRepository = new InMemoryPlayerRepository();

const qrCodeGenerator = new QRCodeGeneratorAdapter();

const createGameSessionUseCase = new CreateGameSessionUseCase(
  gameSessionRepository,
  quizRepository,
  qrCodeGenerator
);

const joinGameUseCase = new JoinGameUseCase(
  gameSessionRepository,
  playerRepository,
  webSocketServer
);

const startGameUseCase = new StartGameUseCase(
  gameSessionRepository,
  webSocketServer
);

const nextQuestionUseCase = new NextQuestionUseCase(
  gameSessionRepository,
  webSocketServer
);

const endGameUseCase = new EndGameUseCase(
  gameSessionRepository,
  webSocketServer
);

const submitAnswerUseCase = new SubmitAnswerUseCase(
  gameSessionRepository,
  webSocketServer,
  nextQuestionUseCase,
  endGameUseCase
);

const quizController = new QuizController(
  createGameSessionUseCase,
  quizRepository
);
const gameController = new GameController(
  joinGameUseCase,
  startGameUseCase,
  submitAnswerUseCase,
  nextQuestionUseCase,
  endGameUseCase,
  gameSessionRepository
);

httpServer.registerGet("/", (req, res) => {
  console.log("Redirecting to /create");
  res.redirect("/create");
});
httpServer.registerGet(
  "/create",
  quizController.showCreateGamePage.bind(quizController)
);
httpServer.registerPost(
  "/create",
  quizController.createGame.bind(quizController)
);
httpServer.registerGet(
  "/join/:code",
  gameController.showJoinPage.bind(gameController)
);
httpServer.registerPost("/join", gameController.joinGame.bind(gameController));
httpServer.registerPost(
  "/api/start-game",
  gameController.startGame.bind(gameController)
);
httpServer.registerPost(
  "/api/submit-answer",
  gameController.submitAnswer.bind(gameController)
);
httpServer.registerPost(
  "/api/next-question",
  gameController.nextQuestion.bind(gameController)
);
httpServer.registerPost(
  "/api/end-game",
  gameController.endGame.bind(gameController)
);

httpServer.registerErrorHandlers();

webSocketServer.onConnection((clientId) => {
  console.log(`Client connected: ${clientId}`);
});

webSocketServer.onMessage("joinRoom", (clientId, payload) => {
  console.log(`Client ${clientId} joined room`, payload);
});

setupSampleData(quizRepository);

server.listen(config.port, () => {
  console.log(`Server running on ${config.baseUrl}`);
  console.log(`WebSocket available at ${config.wsUrl}`);
});
