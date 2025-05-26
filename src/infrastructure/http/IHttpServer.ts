import { Request, Response } from "express";

export interface IHttpServer {
  registerGet(
    path: string,
    handler: (req: Request, res: Response) => void
  ): void;
  registerPost(
    path: string,
    handler: (req: Request, res: Response) => void
  ): void;
  registerErrorHandlers(): void;
  start(): void;
}
