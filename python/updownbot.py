from api import Command, Simulation, UP, DOWN, MOVE, STOP


def updown_bot():
    """An example bot that sends elevators up and down and stops at floors if there are passengers waiting to get on or off"""
    simulation = Simulation(
        event="secondspace2025",
        building_name="tiny_random",
        bot="updown",
        email="bob@mail.com",
        sandbox=True,
    )
    current_state = simulation.initial_state
    directions = {}  # current directions of elevators
    while current_state["running"]:
        commands = []
        for elevator in current_state["elevators"]:
            # determine which direction to go
            direction = directions.get(elevator["id"], UP)
            if direction == UP and elevator["floor"] == simulation.num_floors:
                # have reached the top floor so go down
                direction = DOWN
            elif direction == DOWN and elevator["floor"] == 1:
                # have reached the bottom floor so go up
                direction = UP
            directions[elevator["id"]] = direction

            action = MOVE
            if elevator["floor"] in elevator["buttons_pressed"]:
                # let passengers off at this floor
                action = STOP
            else:
                for request in current_state["requests"]:
                    if (
                        request["floor"] == elevator["floor"]
                        and request["direction"] == direction
                    ):
                        # someone requested the current floor
                        action = STOP
            commands.append(
                Command(elevator_id=elevator["id"], direction=direction, action=action)
            )

        current_state = simulation.send(commands)

    print("Score:", current_state.get("score"))
    print("Replay URL:", current_state.get("replay_url"))


if __name__ == "__main__":
    updown_bot()
