# Elevator Challenge Documentation

The [Elevator Challenge](https://dianti.de.r.appspot.com/) requires you to build a bot that efficiently moves elevators to serve passenger requests. 
This is a turn based system where you send commands to an API server and then receive back the subsequent state.

## Examples

Below is a detailed description of the API, but to get started it would probably be easier to modify an existing example client.
So far we have example clients for the following languages:

- [Python](python/)

If you create a client for another language please send a [PR](https://github.com/richardpenman/dianti-clients/pulls) and I will add it!

## API

### Initial Request
To start a simulation you need to send a JSON request to `https://dianti.de.r.appspot.com/api` with the following fields:

| Field | Type | Description |
| :---- | :--- | :---------- |
| bot | string | The name of your bot |
| building\_name | string | The name of the building simulation, which can be seleted from [here](https://dianti.de.r.appspot.com/buildings) |
| email | string | Your email (this is used to generate a [Gravatar](https://gravatar.com/) image to show in the high scores) |
| event | string | The name of the event (this is so each event can have a separate high score board) |
| sandbox | boolean | If sandbox is set to true then your simulation will not be included in high scores or replays |

Here is an example initialization request:
```
{
    "bot": "myfirstbot",
    "building_name": "tiny_random",
    "email": "me@mail.com",
    "event": "secondspace2025",
    "sandbox": false,
}
```

<a name="api-response"></a> 
### API Response

If your request is valid then you will receive back a response with a subset of the following fields:

| Field | Type | Description | When Returned |
| :---- | :--- | :---------- | :------------ |
| cur\_turn | boolean | The current turn number | Every turn |
| elevators | list[[Elevator](#elevator-type)] | The current state of the elevators | Every turn |
| errors | list[string] | A list of any errors encountered | Every turn |
| num\_floors | int | The number of floors in this building | The initial turn |
| num\_turns | int | The number of turns this simulation will last. | The initial turn |
| requests | list[[Request](#request-type)] | Passenger requests for the elevator | Every turn |
| replay\_url | string | A link to a replay of this simulation | The final turn |
| running | boolean | Whether the simulation is still running | Every turn and for the final turn this will be false |
| score | int | The score for your simulation | The final turn |
| token | string | This identifies the simulation and must be sent with all future requests | The initial turn |

Here are the fields for the `Elevator` type:
<a name="elevator-type"></a> 
| Field | Type | Description |
| :---- | :--- | :---------- |
| buttons\_pressed | list[int] | The floors requested by passengers in the elevator |
| floor | int | The current floor of the elevator |
| id | string | The ID of the elevator |

And for the `Request` type:
<a name="request-type"></a> 
| Field | Type | Description |
| :---- | :--- | :---------- |
| direction | boolean | The direction of the passenger request, with true for up and false for down |
| floor | int | The floor this request is made on |

Here is an example response with every possible field:
```
{"cur_turn": 0,
 "elevators": [{"buttons_pressed": [2, 3], "floor": 1, "id": "elevator-0"},
               {"buttons_pressed": [], "floor": 6, "id": "elevator-1"}],
 "errors": ["Unknown elevator ID: elevator-X"],
 "num_floors": 10,
 "num_turns": 30,
 "requests": [{"direction": true, "floor": 2}],
 "replay_url": "https://dianti.de.r.appspot.com/replay/abc123",
 "running": true,
 "score": 1090,
 "token": "abc123"}
```

### Send Commands

Your bot should analyze the current state returned from the simulation server, decide on the next step, and then send back the following request to change the state:

| Field | Type | Description |
| :---- | :--- | :---------- |
| commands | list[[Command](#command-type)] | A list of the commands for each elevator. |
| token | string | The token received in the initial request must be sent with each command. |

Here are the fields required for each `Command`:
<a name="command-type"></a> 
| Field | Type | Description |
| :---- | :--- | :---------- |
| action | boolean | The action for the elevator, with `true` to move and `false` to stop. When stopped passengers at that floor will only board if the elevator is heading in their direction. |
| direction | boolean | The direction to send the elevator, with true for up and false for down. |
| elevator\_id | string | The ID of the elevator this command is for. |

Here is an example command request that has `elevator_1` stopped on the way up and `elevator_2` moving down:
```
{
  "commands": [{"action": False, "direction": true, "elevator_id": "elevator_1"},
               {"action": True, "direction": false, "elevator_id": "elevator_2"}],
  "token": "abc123"
}
```

Your bot will then receive back the response described in the [API Response](#api-response) section.

### Score

In the final turn you will receive a score for your simulation based on:

- The time it took each passenger to reach their destination floor.
- How many passengers did not reach their destination by the end of the simulation.
- The amount of energy used to move elevators.

The highest scoring bots will be displayed on the [high scores](https://dianti.de.r.appspot.com/highscores) page.
