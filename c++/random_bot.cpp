#include <iostream>
#include <vector>
#include <random>
#include "api.hpp"

void random_bot() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dir_dist(0, 1);
    std::uniform_int_distribution<> action_dist(0, 1);

    Simulation sim("secondspace2025", "tiny_random", "random-cpp-bot", "bob@mail.com", true);
    json current_state = sim.get_initial_state();

    while (current_state["running"]) {
        std::vector<Command> commands;
        for (const auto& elevator : current_state["elevators"]) {
            commands.push_back({
                elevator["id"],
                dir_dist(gen) == 0,
                action_dist(gen) == 0
            });
        }
        current_state = sim.send(commands);
    }

    std::cout << "Score: " << current_state["score"] << std::endl;
    std::cout << "Replay URL: " << current_state["replay_url"] << std::endl;
}

int main() {
    random_bot();
    return 0;
}
