/**
 * Available building configurations for elevator simulations
 *
 * @description Each building has specific characteristics:
 * - Number of floors
 * - Number of elevators
 * - Number of passenger requests
 * - Turn limit
 * - Whether requests are clustered (more realistic with rush hours)
 */
export enum BuildingName {
  /**
   * Small building with 10 floors and 2 elevators
   * @description
   * - Floors: 10
   * - Elevators: 2
   * - Requests: 3
   * - Turns: 30
   * - Clustered: No
   */
  TINY_RANDOM = "tiny_random",

  /**
   * Medium building with 20 floors and 4 elevators
   * @description
   * - Floors: 20
   * - Elevators: 4
   * - Requests: 25
   * - Turns: 80
   * - Clustered: No
   */
  MEDIUM_RANDOM = "medium_random",

  /**
   * Large building with 25 floors and 8 elevators
   * @description
   * - Floors: 25
   * - Elevators: 8
   * - Requests: 450
   * - Turns: 500
   * - Clustered: No
   */
  BIG_RANDOM = "big_random",

  /**
   * Large building with clustered passenger requests
   * @description
   * - Floors: 25
   * - Elevators: 8
   * - Requests: 450
   * - Turns: 500
   * - Clustered: Yes (rush hours)
   */
  BIG_CLUSTERED = "big_clustered",

  /**
   * Skyscraper with 50 floors and 8 elevators
   * @description
   * - Floors: 50
   * - Elevators: 8
   * - Requests: 700
   * - Turns: 1000
   * - Clustered: Yes (rush hours)
   */
  SKY_TOWER = "85_sky_tower",
}

/**
 * Represents a command to control an elevator
 *
 * @example
 * ```typescript
 * const command: CommandJSON = {
 *   elevator_id: "elevator-1",
 *   direction: true,  // true for up, false for down
 *   action: false     // true to move, false to stop
 * };
 * ```
 */
export interface CommandJSON {
  /**
   * The ID of the elevator to control
   * @description Format is "elevator-{number}" where number starts from 0
   * @example "elevator-0" // first elevator
   * @example "elevator-1" // second elevator
   */
  elevator_id: string;
  /**
   * The direction to send the elevator
   * @description true for up, false for down
   * @example true // elevator going up
   * @example false // elevator going down
   */
  direction: boolean;
  /**
   * The action for the elevator
   * @description When stopped, passengers at that floor will only board if the elevator is heading in their direction
   * @example true // elevator is moving
   * @example false // elevator is stopped and can pick up passengers
   */
  action: boolean;
}

/**
 * Represents the current state of an elevator
 *
 * @example
 * ```typescript
 * const elevator: Elevator = {
 *   id: "elevator-0",
 *   floor: 1,
 *   buttons_pressed: [2, 3]
 * };
 * ```
 */
export interface Elevator {
  /**
   * The unique identifier of the elevator
   * @example "elevator-0"
   */
  id: string;
  /**
   * The current floor number of the elevator
   * @description Floors are numbered starting from 1
   */
  floor: number;
  /**
   * The floors requested by passengers in the elevator
   * @description Array of floor numbers that passengers want to go to
   */
  buttons_pressed: number[];
}

/**
 * Represents a passenger request for an elevator
 *
 * @example
 * ```typescript
 * const request: Request = {
 *   floor: 2,
 *   direction: true  // true for up, false for down
 * };
 * ```
 */
export interface Request {
  /**
   * The floor this request is made on
   * @description Floors are numbered starting from 1
   */
  floor: number;
  /**
   * The direction of the passenger request
   * @description true for up, false for down
   */
  direction: boolean;
}

/**
 * Represents the complete state of the simulation
 *
 * @example
 * ```typescript
 * const state: SimulationState = {
 *   cur_turn: 0,
 *   elevators: [
 *     { buttons_pressed: [2, 3], floor: 1, id: "elevator-0" },
 *     { buttons_pressed: [], floor: 6, id: "elevator-1" }
 *   ],
 *   errors: ["Unknown elevator ID: elevator-X"],
 *   num_floors: 10,
 *   num_turns: 30,
 *   requests: [{ direction: true, floor: 2 }],
 *   replay_url: "https://dianti.secondspace.dev/replay/abc123",
 *   running: true,
 *   score: 1090,
 *   token: "abc123"
 * };
 * ```
 */
export interface SimulationState {
  /**
   * The token that identifies this simulation
   * @description Must be sent with all future requests
   */
  token: string;
  /**
   * Whether the simulation is still running
   * @description Will be false on the final turn
   */
  running: boolean;
  /**
   * The current score of the simulation
   * @description Score is based on:
   * - Passenger who reaches destination: 100 - 1 × turns waiting
   * - Passenger who doesn't reach destination: -20 - 1 × turns waiting
   * - Elevator energy used: -1 × amount of movement
   */
  score: number;
  /**
   * A link to a replay of this simulation
   * @description Only available on the final turn
   */
  replay_url: string;
  /**
   * A list of any errors encountered
   * @description Errors are logged to the console
   */
  errors: string[];
  /**
   * The current state of all elevators
   * @description Array of elevator objects
   */
  elevators: Elevator[];
  /**
   * Current passenger requests for elevators
   * @description Array of request objects
   */
  requests: Request[];
  /**
   * The number of floors in the building
   * @description Floors are numbered starting from 1
   */
  num_floors: number;
  /**
   * The current turn number
   * @description Starts at 0 and increments each turn
   */
  cur_turn: number;
  /**
   * The number of turns this simulation will last
   * @description Total number of turns before simulation ends
   */
  num_turns: number;
}

/**
 * Represents the initialization request for a new simulation
 *
 * @example
 * ```typescript
 * const initRequest: InitRequest = {
 *   bot: "myfirstbot",
 *   building_name: BuildingName.TINY_RANDOM,
 *   email: "me@mail.com",
 *   event: "secondspace2025",
 *   sandbox: false
 * };
 * ```
 */
export interface InitRequest {
  /**
   * The name of your bot that will appear in the high scores
   * @example "myfirstbot"
   */
  bot: string;
  /**
   * The building configuration to simulate
   * @description Choose from available building configurations with different sizes and characteristics
   * @see {@link BuildingName} for available options
   * @example BuildingName.TINY_RANDOM // 10 floors, 2 elevators
   * @example BuildingName.SKY_TOWER // 50 floors, 8 elevators with rush hours
   */
  building_name: BuildingName;
  /**
   * Your email address
   * @description Used to generate a Gravatar image to show in the high scores
   * @see {@link https://gravatar.com/}
   * @example "me@mail.com"
   */
  email: string;
  /**
   * The name of the event
   * @description Each event has its own separate high score board
   * @example "secondspace2025"
   */
  event: string;
  /**
   * Whether to run in sandbox mode
   * @description If true, the simulation will not be included in high scores or replays
   * @example true // for testing
   * @example false // for actual competition
   */
  sandbox: boolean;
}

/**
 * Represents a request to send commands to the simulation
 *
 * @example
 * ```typescript
 * const commandRequest: CommandRequest = {
 *   token: "abc123",
 *   commands: [
 *     { elevator_id: "elevator-1", direction: true, action: false },
 *     { elevator_id: "elevator-2", direction: false, action: true }
 *   ]
 * };
 * ```
 */
export interface CommandRequest {
  /**
   * The token received in the initial request
   * @description Must be sent with each command request
   */
  token: string;
  /**
   * A list of commands for each elevator
   * @description Each command controls one elevator's direction and action
   */
  commands: CommandJSON[];
}

/**
 * Represents the direction of an elevator
 * @description true for up, false for down
 * @example
 * ```typescript
 * const goingUp: Direction = true;
 * const goingDown: Direction = false;
 * ```
 */
export type Direction = boolean;

/**
 * Represents the action of an elevator
 * @description true to move, false to stop
 * @example
 * ```typescript
 * const moving: Action = true;
 * const stopped: Action = false;
 * ```
 */
export type Action = boolean;
