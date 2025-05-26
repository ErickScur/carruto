# QuizMaster

A simplified Kahoot clone built with TypeScript and Object-Oriented Programming principles.

## Overview

QuizMaster is a real-time quiz application where:

1. Professors/presenters can create a quiz session
2. Students/participants join using a code or QR code
3. Questions are presented one at a time with multiple-choice answers
4. Players receive immediate feedback and earn points based on correctness and speed
5. A final leaderboard displays at the end of the game

The application showcases TypeScript's strengths and OOP concepts including:

- SOLID principles
- Domain-Driven Design (light)
- Design patterns (Factory, Repository, Observer, etc.)
- Clean architecture with proper separation of concerns

## Architecture

The application follows a layered architecture:

| Layer          | Purpose                                                       |
| -------------- | ------------------------------------------------------------- |
| Domain         | Core business entities and rules                              |
| Application    | Use cases and services                                        |
| Infrastructure | External dependencies (WebSocket, QR codes, data persistence) |
| Presentation   | Controllers and views (Handlebars)                            |
| Bootstrap      | Application entry point and dependency setup                  |

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the application in development mode with hot reloading.

### Production Mode

First, build the application:

```bash
npm run build
```

Then start the server:

```bash
npm start
```

## Usage

1. Open a browser and navigate to `http://localhost:3000`
2. Create a new quiz game and select one of the pre-loaded quizzes
3. Share the displayed game code or QR code with participants
4. Participants join by navigating to the URL or scanning the QR code
5. Start the game when all participants have joined
6. Questions will be displayed on all screens, and participants can submit answers
7. After all questions are answered, a final leaderboard is displayed

## Technical Features

- TypeScript with strict type checking
- Express for the HTTP server
- WebSockets for real-time communication
- In-memory repositories
- Object-oriented domain model
- Handlebars for server-side rendering
- RESTful API endpoints for game actions

## Project Structure

```
├── src/
│   ├── domain/          # Domain entities and business rules
│   ├── application/     # Use cases and application services
│   ├── infrastructure/  # External dependencies implementations
│   ├── presentation/    # Controllers and view models
│   └── main/            # Application bootstrap and configuration
├── public/
│   └── templates/       # Handlebars templates
├── package.json
├── tsconfig.json
└── README.md
```
