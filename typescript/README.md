# Dianti Elevator Challenge

A TypeScript implementation of the Dianti elevator challenge. Two example bots are included:
- `randomBot.ts`: Makes random decisions
- `updownBot.ts`: Moves elevators up and down based on requests

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Run a bot:
```bash
npx ts-node randomBot.ts
```

Create your own bot by copying one of the example files and modifying the logic.

## Available Buildings

| Building | Floors | Elevators | Requests | Turns | Rush Hours |
|----------|---------|-----------|-----------|--------|------------|
| tiny_random | 10 | 2 | 3 | 30 | No |
| medium_random | 20 | 4 | 25 | 80 | No |
| big_random | 25 | 8 | 450 | 500 | No |
| big_clustered | 25 | 8 | 450 | 500 | Yes |
| 85_sky_tower | 50 | 8 | 700 | 1000 | Yes |

## Project Structure

- `src/elevatorBot.ts`: Main implementation file containing the bot logic
- `dist/`: Compiled JavaScript files (generated after building)
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration

## Type Definitions

The project includes proper TypeScript type definitions for all components:
- `Command`: Represents an elevator command
- `Simulation`: Manages the simulation state and API communication
- Various interfaces for API requests and responses 