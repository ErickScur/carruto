import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import { engine } from "express-handlebars";
import { IHttpServer } from "./IHttpServer";

export class ExpressHttpServer implements IHttpServer {
  private app: Express;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupViewEngine();
  }

  get expressApp(): Express {
    return this.app;
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(path.join(process.cwd(), "public")));
  }

  private setupViewEngine(): void {
    this.app.engine(
      "handlebars",
      engine({
        defaultLayout: "main",
        layoutsDir: path.join(process.cwd(), "public/templates/layouts"),
        partialsDir: path.join(process.cwd(), "public/templates/partials"),
      })
    );
    this.app.set("view engine", "handlebars");
    this.app.set("views", path.join(process.cwd(), "public/templates/views"));
  }

  private setupErrorHandling(): void {
    this.app.use((req: Request, res: Response) => {
      res.status(404).render("error", {
        layout: "main",
        title: "Page Not Found",
        message: "The page you requested does not exist.",
      });
    });

    this.app.use(
      (err: Error, req: Request, res: Response, _next: NextFunction) => {
        console.error(err.stack);
        res.status(500).render("error", {
          layout: "main",
          title: "Server Error",
          message: "Something went wrong. Please try again later.",
        });
      }
    );
  }

  registerGet(
    path: string,
    handler: (req: Request, res: Response) => void
  ): void {
    this.app.get(path, handler);
  }

  registerPost(
    path: string,
    handler: (req: Request, res: Response) => void
  ): void {
    this.app.post(path, handler);
  }

  registerErrorHandlers(): void {
    this.setupErrorHandling();
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
    });
  }
}
