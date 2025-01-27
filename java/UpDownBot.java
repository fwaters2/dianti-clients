import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.JsonPrimitive;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class UpDownBot {

    public static void main(String[] args) {
        upDownBot();
    }

    public static void upDownBot() {
        Api.Simulation simulation = new Api.Simulation(
                "secondspace2025",
                "tiny_random",
                "updown-java-bot",
                "bob@mail.com",
                false,
                "https://dianti.de.r.appspot.com/api"
        );
        JsonObject currentState = simulation.initialState;
        Map<String, Boolean> directions = new HashMap<>();

        while (currentState.get("running").getAsBoolean()) {
            List<Api.Command> commands = new ArrayList<>();
            JsonArray elevators = currentState.getAsJsonArray("elevators");
            for (int i = 0; i < elevators.size(); i++) {
                JsonObject elevator = elevators.get(i).getAsJsonObject();
                String elevatorId = elevator.get("id").getAsString();
                boolean direction = directions.getOrDefault(elevatorId, Api.UP);

                if (direction == Api.UP && elevator.get("floor").getAsInt() == simulation.numFloors) {
                    direction = Api.DOWN;
                } else if (direction == Api.DOWN && elevator.get("floor").getAsInt() == 1) {
                    direction = Api.UP;
                }
                directions.put(elevatorId, direction);

                boolean action = Api.MOVE;
                JsonArray buttonsPressed = elevator.getAsJsonArray("buttons_pressed");
                if (buttonsPressed.contains(new JsonPrimitive(elevator.get("floor").getAsInt()))) {
                    action = Api.STOP;
                } else {
                    JsonArray requests = currentState.getAsJsonArray("requests");
                    for (int j = 0; j < requests.size(); j++) {
                        JsonObject request = requests.get(j).getAsJsonObject();
                        if (request.get("floor").getAsInt() == elevator.get("floor").getAsInt() &&
                                request.get("direction").getAsBoolean() == direction) {
                            action = Api.STOP;
                            break;
                        }
                    }
                }
                commands.add(new Api.Command(elevatorId, direction, action));
            }
            currentState = simulation.send(commands);
        }

        System.out.println("Score: " + currentState.get("score").getAsInt());
        System.out.println("Replay URL: " + currentState.get("replay_url").getAsString());
    }
}
