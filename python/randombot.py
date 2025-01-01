import random

from api import ElevatorSimulation, DIRECTIONS, ACTIONS


def random_bot():
    """A simple bot that will randomly move and stop"""
    simulation = ElevatorSimulation(
        event="secondspace2025",
        building_name="tiny_random",
        bot="random",
        email="bob@mail.com",
    )
    current_state = simulation.initial_state
    while current_state["running"]:
        commands = [
            {
                "elevator_id": elevator["id"],
                "direction": random.choice(DIRECTIONS),
                "action": random.choice(ACTIONS),
            }
            for elevator in current_state["elevators"]
        ]
        current_state = simulation.send(commands)
    print("Score:", current_state.get("score"))
    print("Replay URL:", current_state.get("replay_url"))


if __name__ == "__main__":
    random_bot()
