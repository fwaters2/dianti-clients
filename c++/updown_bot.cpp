#include <iostream>
#include <string>
#include <vector>
#include <map>
#include "api.hpp"

void updown_bot() {
    Simulation sim("secondspace2025", "tiny_random", "updown-cpp-bot", "bob@mail.com", true);
    json current_state = sim.get_initial_state();
    std::map<std::string, bool> directions;

    while (current_state["running"]) {
        std::vector<Command> commands;
        for (const auto& elevator : current_state["elevators"]) {
            std::string elevator_id = elevator["id"];
            bool direction = directions[elevator_id];
            if (direction == UP && elevator["floor"] == sim.get_num_floors()) {
                direction = DOWN;
            } else if (direction == DOWN && elevator["floor"] == 1) {
                direction = UP;
            }
            directions[elevator_id] = direction;

            bool action = MOVE;
            for (const auto& floor : elevator["buttons_pressed"]) {
                if (floor == elevator["floor"]) {
                    action = STOP;
                    break;
                }
            }
            if (action == MOVE) {
                for (const auto& request : current_state["requests"]) {
                    if (request["floor"] == elevator["floor"] && request["direction"] == direction) {
                        action = STOP;
                        break;
                    }
                }
            }

            commands.push_back({elevator_id, direction, action});
        }
        current_state = sim.send(commands);
    }

    std::cout << "Score: " << current_state["score"] << std::endl;
    std::cout << "Replay URL: " << current_state["replay_url"] << std::endl;
}

int main() {
    updown_bot();
    return 0;
}
