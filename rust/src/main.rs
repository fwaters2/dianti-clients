use rand::Rng;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

const API_URL: &str = "https://dianti.secondspace.dev/api";

#[derive(Serialize, Deserialize, Debug)]
struct Command {
    elevator_id: String,
    direction: bool,
    action: bool,
}

#[derive(Serialize, Deserialize, Debug)]
struct Simulation {
    api_url: String,
    initial_state: State,
    num_floors: i32,
    cur_turn: i32,
    token: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct State {
    running: bool,
    elevators: Vec<Elevator>,
    requests: Vec<Request>,
    score: Option<i32>,
    replay_url: Option<String>,
    errors: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Elevator {
    id: String,
    floor: i32,
    buttons_pressed: Vec<i32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Request {
    floor: i32,
    direction: bool,
}

impl Simulation {
    async fn new(event: &str, building_name: &str, bot: &str, email: &str, sandbox: bool) -> Result<Self, Box<dyn std::error::Error>> {
        let client = Client::new();
        let response = client
            .post(API_URL)
            .json(&serde_json::json!({
                "bot": bot,
                "building_name": building_name,
                "email": email,
                "event": event,
                "sandbox": sandbox,
            }))
            .send()
            .await?;

        // Parse the JSON response
        let response_text = response.text().await?;

        // Deserialize the initial response into a temporary struct to extract the token and num_floors
        #[derive(Deserialize)]
        struct InitialResponse {
            token: String,
            num_floors: i32,
            running: bool,
            elevators: Vec<Elevator>,
            requests: Vec<Request>,
            score: Option<i32>,
            replay_url: Option<String>,
            errors: Vec<String>,
        }

        let initial_response: InitialResponse = serde_json::from_str(&response_text)?;

        // Create the State struct without the token and num_floors
        let initial_state = State {
            running: initial_response.running,
            elevators: initial_response.elevators,
            requests: initial_response.requests,
            score: initial_response.score,
            replay_url: initial_response.replay_url,
            errors: initial_response.errors,
        };

        Ok(Simulation {
            api_url: API_URL.to_string(),
            initial_state,
            num_floors: initial_response.num_floors, // Store num_floors
            cur_turn: 0,
            token: initial_response.token, // Store the token
        })
    }

    async fn send(&mut self, commands: Vec<Command>) -> Result<State, Box<dyn std::error::Error>> {
        self.cur_turn += 1;
        println!("Turn: {}", self.cur_turn);

        let client = Client::new();
        let response = client
            .post(&self.api_url)
            .json(&serde_json::json!({
                "token": self.token, // Include the token in the request
                "commands": commands,
            }))
            .send()
            .await?;

        // Parse the JSON response
        let response_text = response.text().await?;
        let state: State = serde_json::from_str(&response_text)?;

        for error in &state.errors {
            println!("Error: {}", error);
        }

        Ok(state)
    }
}

#[tokio::main]
async fn random_bot() -> Result<(), Box<dyn std::error::Error>> {
    let mut simulation = Simulation::new(
        "secondspace2025",
        "tiny_random",
        "random-rust-bot",
        "bob@mail.com",
        true,
    )
    .await?;

    let mut current_state = simulation.initial_state.clone();
    while current_state.running {
        let commands: Vec<Command> = current_state
            .elevators
            .iter()
            .map(|elevator| Command {
                elevator_id: elevator.id.clone(),
                direction: rand::thread_rng().gen(),
                action: rand::thread_rng().gen(),
            })
            .collect();

        current_state = simulation.send(commands).await?;
    }

    println!("Score: {:?}", current_state.score);
    println!("Replay URL: {:?}", current_state.replay_url);

    Ok(())
}

#[tokio::main]
async fn updown_bot() -> Result<(), Box<dyn std::error::Error>> {
    let mut simulation = Simulation::new(
        "secondspace2025",
        "tiny_random",
        "updown-rust-bot",
        "bob@mail.com",
        true,
    )
    .await?;

    let mut current_state = simulation.initial_state.clone();
    let mut directions: HashMap<String, bool> = HashMap::new();

    while current_state.running {
        let mut commands: Vec<Command> = Vec::new();

        for elevator in &current_state.elevators {
            let mut direction = *directions.get(&elevator.id).unwrap_or(&true);
            if direction && elevator.floor == simulation.num_floors {
                direction = false;
            } else if !direction && elevator.floor == 1 {
                direction = true;
            }
            directions.insert(elevator.id.clone(), direction);

            let mut action = true;
            if elevator.buttons_pressed.contains(&elevator.floor) {
                action = false;
            } else {
                for request in &current_state.requests {
                    if request.floor == elevator.floor && request.direction == direction {
                        action = false;
                        break;
                    }
                }
            }

            commands.push(Command {
                elevator_id: elevator.id.clone(),
                direction,
                action,
            });
        }

        current_state = simulation.send(commands).await?;
    }

    println!("Score: {:?}", current_state.score);
    println!("Replay URL: {:?}", current_state.replay_url);

    Ok(())
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() > 1 && args[1] == "updown" {
        if let Err(e) = updown_bot() {
            eprintln!("Error: {}", e);
        }
    } else {
        if let Err(e) = random_bot() {
            eprintln!("Error: {}", e);
        }
    }
}
