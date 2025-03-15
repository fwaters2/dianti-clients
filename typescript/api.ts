import axios, { AxiosResponse } from "axios";
import {
  CommandJSON,
  SimulationState,
  InitRequest,
  CommandRequest,
  Direction,
  Action,
  BuildingName,
} from "./types";

export class Command {
  constructor(
    public readonly elevatorId: string,
    public readonly direction: Direction,
    public readonly action: Action
  ) {}

  toJSON(): CommandJSON {
    return {
      elevator_id: this.elevatorId,
      direction: this.direction,
      action: this.action,
    };
  }
}

export class Simulation {
  private curTurn: number = 0;
  private _initialState!: SimulationState;
  private _numFloors: number = 0;

  constructor(
    private readonly event: string,
    private readonly buildingName: string,
    private readonly bot: string,
    private readonly email: string,
    private readonly sandbox: boolean = false,
    private readonly apiUrl: string = "https://dianti.secondspace.dev/api"
  ) {}

  get initialState(): SimulationState {
    return this._initialState;
  }

  get numFloors(): number {
    return this._numFloors;
  }

  async init(): Promise<SimulationState> {
    this.curTurn = 0;
    const response = await this.api<SimulationState>({
      bot: this.bot,
      building_name: this.buildingName as BuildingName,
      email: this.email,
      event: this.event,
      sandbox: this.sandbox,
    });
    this._initialState = response;
    this._numFloors = response.num_floors;
    return response;
  }

  async send(commands: Command[]): Promise<SimulationState> {
    this.curTurn += 1;
    console.log("Turn:", this.curTurn);
    return await this.api<SimulationState>({
      token: this._initialState.token,
      commands: commands.map((command) => command.toJSON()),
    });
  }

  private async api<T>(data: InitRequest | CommandRequest): Promise<T> {
    const response: AxiosResponse<T> = await axios.post(this.apiUrl, data);
    const state = response.data as SimulationState;
    state.errors.forEach((error) => console.log("Error:", error));
    return response.data;
  }
}
