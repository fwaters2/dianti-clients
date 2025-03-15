import { Command, Simulation } from "./api";
import { DIRECTIONS, ACTIONS } from "./constants";
import { BuildingName } from "./types";

async function randomBot(): Promise<void> {
  const simulation = new Simulation(
    "secondspace2025",
    BuildingName.TINY_RANDOM,
    "random-ts-bot",
    "bob@mail.com",
    true
  );
  await simulation.init();

  let currentState = simulation.initialState;
  while (currentState.running) {
    const commands = currentState.elevators.map(
      (elevator) =>
        new Command(
          elevator.id,
          Math.random() > 0.5 ? DIRECTIONS.UP : DIRECTIONS.DOWN,
          Math.random() > 0.5 ? ACTIONS.MOVE : ACTIONS.STOP
        )
    );
    currentState = await simulation.send(commands);
  }

  console.log("Score:", currentState.score);
  console.log("Replay URL:", currentState.replay_url);
}

randomBot();
