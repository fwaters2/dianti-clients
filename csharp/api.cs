using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace ElevatorChallenge
{
    class Program
    {
        const bool UP = true;
        const bool DOWN = false;
        const bool MOVE = true;
        const bool STOP = false;

        class Command
        {
            public string ElevatorId { get; set; }
            public bool Direction { get; set; }
            public bool Action { get; set; }

            public Command(string elevatorId, bool direction, bool action)
            {
                ElevatorId = elevatorId;
                Direction = direction;
                Action = action;
            }
        }

        class Simulation
        {
            private static readonly HttpClient client = new HttpClient();
            private readonly string apiUrl = "https://dianti.secondspace.dev/api";
            private JObject initialState;
            private int numFloors;
            private int curTurn;
            private string token;

            public Simulation(string eventName, string buildingName, string bot, string email, bool sandbox = false)
            {
                // Initialize the simulation
                var request = new JObject
                {
                    ["bot"] = bot,
                    ["building_name"] = buildingName,
                    ["email"] = email,
                    ["event"] = eventName,
                    ["sandbox"] = sandbox
                };

                var response = PostAsync(apiUrl, request).Result;
                initialState = JObject.Parse(response);
                numFloors = initialState["num_floors"].ToObject<int>();
                token = initialState["token"].ToString();
                curTurn = 0;
            }

            public async Task<JObject> SendAsync(List<Command> commands)
            {
                curTurn++;
                Console.WriteLine($"Turn: {curTurn}");

                var commandsJson = new JArray();
                foreach (var cmd in commands)
                {
                    commandsJson.Add(new JObject
                    {
                        ["elevator_id"] = cmd.ElevatorId,
                        ["direction"] = cmd.Direction,
                        ["action"] = cmd.Action
                    });
                }

                var request = new JObject
                {
                    ["token"] = token,
                    ["commands"] = commandsJson
                };

                var response = await PostAsync(apiUrl, request);
                return JObject.Parse(response);
            }

            private async Task<string> PostAsync(string url, JObject data)
            {
                var content = new StringContent(data.ToString(), Encoding.UTF8, "application/json");
                var response = await client.PostAsync(url, content);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsStringAsync();
            }

            public JObject GetInitialState() => initialState;
            public int GetNumFloors() => numFloors;
        }

        // Random Bot
        static async Task RandomBotAsync()
        {
            var random = new Random();
            var sim = new Simulation("secondspace2025", "tiny_random", "random-csharp-bot", "bob@mail.com", true);
            var currentState = sim.GetInitialState();

            while (currentState["running"].ToObject<bool>())
            {
                var commands = new List<Command>();
                foreach (var elevator in currentState["elevators"])
                {
                    commands.Add(new Command(
                        elevator["id"].ToString(),
                        random.Next(2) == 0,
                        random.Next(2) == 0
                    ));
                }

                currentState = await sim.SendAsync(commands);
            }

            Console.WriteLine($"Score: {currentState["score"]}");
            Console.WriteLine($"Replay URL: {currentState["replay_url"]}");
        }

        // Updown Bot
        static async Task UpdownBotAsync()
        {
            var sim = new Simulation("secondspace2025", "tiny_random", "updown-csharp-bot", "bob@mail.com", true);
            var currentState = sim.GetInitialState();
            var directions = new Dictionary<string, bool>();

            while (currentState["running"].ToObject<bool>())
            {
                var commands = new List<Command>();
                foreach (var elevator in currentState["elevators"])
                {
                    var elevatorId = elevator["id"].ToString();
                    var floor = elevator["floor"].ToObject<int>();

                    // Determine direction
                    if (!directions.ContainsKey(elevatorId))
                        directions[elevatorId] = UP;

                    if (directions[elevatorId] == UP && floor == sim.GetNumFloors())
                        directions[elevatorId] = DOWN;
                    else if (directions[elevatorId] == DOWN && floor == 1)
                        directions[elevatorId] = UP;

                    // Determine action
                    var action = MOVE;
                    foreach (var floorPressed in elevator["buttons_pressed"])
                    {
                        if (floorPressed.ToObject<int>() == floor)
                        {
                            action = STOP;
                            break;
                        }
                    }

                    if (action == MOVE)
                    {
                        foreach (var request in currentState["requests"])
                        {
                            if (request["floor"].ToObject<int>() == floor && request["direction"].ToObject<bool>() == directions[elevatorId])
                            {
                                action = STOP;
                                break;
                            }
                        }
                    }

                    commands.Add(new Command(elevatorId, directions[elevatorId], action));
                }

                currentState = await sim.SendAsync(commands);
            }

            Console.WriteLine($"Score: {currentState["score"]}");
            Console.WriteLine($"Replay URL: {currentState["replay_url"]}");
        }

        static async Task Main(string[] args)
        {
            foreach (string arg in args) {
                if (arg == "--random") {
                    await RandomBotAsync();
                }
                if (arg == "--updown") {
                    await UpdownBotAsync();
                }
            }
        }
    }
}
