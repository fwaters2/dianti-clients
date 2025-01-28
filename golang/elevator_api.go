package main

import (
    "bytes"
	"encoding/json"
    "flag"
	"fmt"
	"math/rand"
	"net/http"
	"time"
)

const (
	UP   = true
	DOWN = false
	MOVE = true
	STOP = false
)

type Command struct {
	ElevatorID string `json:"elevator_id"`
	Direction  bool   `json:"direction"`
	Action     bool   `json:"action"`
}

type Simulation struct {
	apiURL       string
	initialState map[string]interface{}
	numFloors    int
	curTurn      int
}

func NewSimulation(event, buildingName, bot, email string, sandbox bool) *Simulation {
	sim := &Simulation{
		apiURL: "https://dianti.secondspace.dev/api",
	}
	sim.initialState = sim.api(map[string]interface{}{
		"bot":          bot,
		"building_name": buildingName,
		"email":        email,
		"event":        event,
		"sandbox":      sandbox,
	})
	sim.numFloors = int(sim.initialState["num_floors"].(float64))
	sim.curTurn = 0
	return sim
}

func (sim *Simulation) send(commands []Command) map[string]interface{} {
	sim.curTurn++
	fmt.Println("Turn:", sim.curTurn)
	commandMaps := make([]map[string]interface{}, len(commands))
	for i, cmd := range commands {
		commandMaps[i] = map[string]interface{}{
			"elevator_id": cmd.ElevatorID,
			"direction":   cmd.Direction,
			"action":      cmd.Action,
		}
	}
	return sim.api(map[string]interface{}{
		"token":    sim.initialState["token"],
		"commands": commandMaps,
	})
}

func (sim *Simulation) api(data map[string]interface{}) map[string]interface{} {
	jsonData, err := json.Marshal(data)
	if err != nil {
		panic(err)
	}
	resp, err := http.Post(sim.apiURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var state map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&state); err != nil {
		panic(err)
	}

	for _, errMsg := range state["errors"].([]interface{}) {
		fmt.Println("Error:", errMsg)
	}
	return state
}

func randomBot() {
	rand.Seed(time.Now().UnixNano())
	sim := NewSimulation("secondspace2025", "tiny_random", "random-go-bot", "bob@mail.com", true)
	currentState := sim.initialState

	for currentState["running"].(bool) {
		elevators := currentState["elevators"].([]interface{})
		commands := make([]Command, len(elevators))
		for i, elevator := range elevators {
			elevatorMap := elevator.(map[string]interface{})
			commands[i] = Command{
				ElevatorID: elevatorMap["id"].(string),
				Direction:  rand.Intn(2) == 0,
				Action:     rand.Intn(2) == 0,
			}
		}
		currentState = sim.send(commands)
	}
	fmt.Println("Score:", currentState["score"])
	fmt.Println("Replay URL:", currentState["replay_url"])
}

func updownBot() {
	sim := NewSimulation("secondspace2025", "tiny_random", "updown-go-bot", "bob@mail.com", true)
	currentState := sim.initialState
	directions := make(map[string]bool)

	for currentState["running"].(bool) {
		elevators := currentState["elevators"].([]interface{})
		commands := make([]Command, len(elevators))
		for i, elevator := range elevators {
			elevatorMap := elevator.(map[string]interface{})
			elevatorID := elevatorMap["id"].(string)
			direction := directions[elevatorID]
			if direction == UP && int(elevatorMap["floor"].(float64)) == sim.numFloors {
				direction = DOWN
			} else if direction == DOWN && int(elevatorMap["floor"].(float64)) == 1 {
				direction = UP
			}
			directions[elevatorID] = direction

			action := MOVE
			buttonsPressed := elevatorMap["buttons_pressed"].([]interface{})
			for _, floor := range buttonsPressed {
				if int(floor.(float64)) == int(elevatorMap["floor"].(float64)) {
					action = STOP
					break
				}
			}
			if action == MOVE {
				requests := currentState["requests"].([]interface{})
				for _, request := range requests {
					requestMap := request.(map[string]interface{})
					if int(requestMap["floor"].(float64)) == int(elevatorMap["floor"].(float64)) && requestMap["direction"].(bool) == direction {
						action = STOP
						break
					}
				}
			}
			commands[i] = Command{
				ElevatorID: elevatorID,
				Direction:  direction,
				Action:     action,
			}
		}
		currentState = sim.send(commands)
	}
	fmt.Println("Score:", currentState["score"])
	fmt.Println("Replay URL:", currentState["replay_url"])
}

func main() {
	run_random_bot := flag.Bool("random", false, "run the random bot")
	run_updown_bot := flag.Bool("updown", false, "run the updown bot")
	flag.Parse()

    if *run_random_bot {
	    randomBot()
    }
    if *run_updown_bot {
        updownBot()
    }
}
