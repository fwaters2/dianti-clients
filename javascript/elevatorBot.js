const axios = require('axios');

const DIRECTIONS = { UP: true, DOWN: false };
const ACTIONS = { MOVE: true, STOP: false };

class Command {
    constructor(elevatorId, direction, action) {
        this.elevatorId = elevatorId;
        this.direction = direction;
        this.action = action;
    }

    toJSON() {
        return {
            elevator_id: this.elevatorId,
            direction: this.direction,
            action: this.action,
        };
    }
}

class Simulation {
    constructor(event, buildingName, bot, email, sandbox = false, apiUrl = 'https://dianti.de.r.appspot.com/api') {
        this.event = event;
        this.buildingName = buildingName;
        this.bot = bot;
        this.email = email;
        this.sandbox = sandbox;
        this.apiUrl = apiUrl;
    }

    async init() {
        this.curTurn = 0;
        const response = await this.api({
            bot: this.bot,
            building_name: this.buildingName,
            email: this.email,
            event: this.event,
            sandbox: this.sandbox,
        });
        this.initialState = response;
        this.numFloors = response.num_floors;
        return response;
    }

    async send(commands) {
        this.curTurn += 1;
        console.log('Turn:', this.curTurn);
        const response = await this.api({
            token: this.initialState.token,
            commands: commands.map(command => command.toJSON()),
        });
        return response;
    }

    async api(data) {
        const response = await axios.post(this.apiUrl, data);
        const state = response.data;
        state.errors.forEach(error => console.log('Error:', error));
        return state;
    }
}

async function randomBot() {
    const simulation = new Simulation(
        'secondspace2025',
        'tiny_random',
        'random-js-bot',
        'bob@mail.com',
        true
    );
    await simulation.init();

    let currentState = simulation.initialState;
    while (currentState.running) {
        const commands = currentState.elevators.map(elevator => 
            new Command(
                elevator.id,
                Math.random() > 0.5 ? DIRECTIONS.UP : DIRECTIONS.DOWN,
                Math.random() > 0.5 ? ACTIONS.MOVE : ACTIONS.STOP
            )
        );
        currentState = await simulation.send(commands);
    }

    console.log('Score:', currentState.score);
    console.log('Replay URL:', currentState.replay_url);
}

async function updownBot() {
    const simulation = new Simulation(
        'secondspace2025',
        'tiny_random',
        'updown-js-bot',
        'bob@mail.com',
        true
    );
    await simulation.init();

    let currentState = simulation.initialState;
    const directions = {}; // current directions of elevators

    while (currentState.running) {
        const commands = [];
        for (const elevator of currentState.elevators) {
            let direction = directions[elevator.id] ?? DIRECTIONS.UP;
            if (direction === DIRECTIONS.UP && elevator.floor === simulation.numFloors) {
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
                    if (request.floor === elevator.floor && request.direction === direction) {
                        action = ACTIONS.STOP;
                        break;
                    }
                }
            }

            commands.push(new Command(elevator.id, direction, action));
        }

        currentState = await simulation.send(commands);
    }

    console.log('Score:', currentState.score);
    console.log('Replay URL:', currentState.replay_url);
}

// Uncomment the bot you want to run
//randomBot();
//updownBot();
