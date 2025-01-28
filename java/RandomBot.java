import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import java.util.List;
import java.util.ArrayList;
import java.util.Random;

public class RandomBot {

    public static void main(String[] args) {
        randomBot();
    }

    public static void randomBot() {
        Api.Simulation simulation = new Api.Simulation(
                "secondspace2025",
                "tiny_random",
                "random-java-bot",
                "bob@mail.com",
                true
        );
        JsonObject currentState = simulation.initialState;
        Random random = new Random();

        while (currentState.get("running").getAsBoolean()) {
            List<Api.Command> commands = new ArrayList<>();
            JsonArray elevators = currentState.getAsJsonArray("elevators");
            for (int i = 0; i < elevators.size(); i++) {
                JsonObject elevator = elevators.get(i).getAsJsonObject();
                boolean direction = random.nextBoolean() ? Api.UP : Api.DOWN;
                boolean action = random.nextBoolean() ? Api.MOVE : Api.STOP;
                commands.add(new Api.Command(elevator.get("id").getAsString(), direction, action));
            }
            currentState = simulation.send(commands);
        }

        System.out.println("Score: " + currentState.get("score").getAsInt());
        System.out.println("Replay URL: " + currentState.get("replay_url").getAsString());
    }
}
