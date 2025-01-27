import requests
from dataclasses import dataclass


DIRECTIONS = UP, DOWN = True, False
ACTIONS = MOVE, STOP = True, False


@dataclass
class Command:
    elevator_id: str
    direction: bool
    action: bool

    def json(self):
        return {
            "elevator_id": self.elevator_id,
            "direction": self.direction,
            "action": self.action,
        }


class Simulation:
    """An interface to the elevator simulator."""

    def __init__(
        self,
        event: str,
        building_name: str,
        bot: str,
        email: str,
        sandbox: bool = False,
        api_url: str = "https://dianti.secondspace.dev/api",
    ):
        self.api_url: str = api_url
        self.initial_state: dict = self.api(
            {
                "bot": bot,
                "building_name": building_name,
                "email": email,
                "event": event,
                "sandbox": sandbox,
            }
        )
        self.num_floors: int = self.initial_state["num_floors"]
        self.cur_turn: int = 0

    def send(self, commands: list[Command]) -> dict:
        """Send commands and returns the new state of the elevator system"""
        self.cur_turn += 1
        print("Turn:", self.cur_turn)
        return self.api(
            {
                "token": self.initial_state["token"],
                "commands": [command.json() for command in commands],
            }
        )

    def api(self, data) -> dict:
        """Send JSON data to API and return the resulting state"""
        state = requests.post(self.api_url, json=data).json()
        for error in state["errors"]:
            print("Error:", error)
        return state
