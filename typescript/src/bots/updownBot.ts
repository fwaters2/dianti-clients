import { BuildingName, Direction } from "../../types";
import { Command, Simulation } from "../api";
import { DIRECTIONS, ACTIONS } from "../constants";

async function updownBot(): Promise<void> {
  const simulation = new Simulation(
    "secondspace2025",
    BuildingName.TINY_RANDOM,
    "updown-ts-bot",
    "bob@mail.com",
    true
  );
  await simulation.init();

  let currentState = simulation.initialState;
  const directions: Record<string, Direction> = {}; // current directions of elevators

  while (currentState.running) {
    const commands: Command[] = [];
    for (const elevator of currentState.elevators) {
      let direction = directions[elevator.id] ?? DIRECTIONS.UP;
      if (
        direction === DIRECTIONS.UP &&
        elevator.floor === simulation.numFloors
      ) {
        direction = DIRECTIONS.DOWN;
      } else if (direction === DIRECTIONS.DOWN && elevator.floor === 1) {
        direction = DIRECTIONS.UP;
      }
      directions[elevator.id] = direction;

      let action = ACTIONS.MOVE;
      if (elevator.buttons_pressed.includes(elevator.floor)) {
        action = ACTIONS.STOP;
      } else {
        for (const request of currentState.requests) {
          if (
            request.floor === elevator.floor &&
            request.direction === direction
          ) {
            action = ACTIONS.STOP;
            break;
          }
        }
      }

      commands.push(new Command(elevator.id, direction, action));
    }

    currentState = await simulation.send(commands);
  }

  console.log("Score:", currentState.score);
  console.log("Replay URL:", currentState.replay_url);
}

updownBot();
