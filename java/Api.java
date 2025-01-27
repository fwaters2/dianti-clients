import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.ArrayList;

public class Api {

    public static final boolean UP = true;
    public static final boolean DOWN = false;
    public static final boolean MOVE = true;
    public static final boolean STOP = false;

    public static class Command {
        private final String elevator_id;
        private final boolean direction;
        private final boolean action;

        public Command(String elevator_id, boolean direction, boolean action) {
            this.elevator_id = elevator_id;
            this.direction = direction;
            this.action = action;
        }

        public JsonObject toJson() {
            JsonObject json = new JsonObject();
            json.addProperty("elevator_id", this.elevator_id);
            json.addProperty("direction", this.direction);
            json.addProperty("action", this.action);
            return json;
        }
    }

    public static class Simulation {
        private final String apiUrl;
        public final JsonObject initialState;
        public final int numFloors;
        private int curTurn;

        public Simulation(String event, String buildingName, String bot, String email, boolean sandbox, String apiUrl) {
            this.apiUrl = apiUrl;
            JsonObject data = new JsonObject();
            data.addProperty("bot", bot);
            data.addProperty("building_name", buildingName);
            data.addProperty("email", email);
            data.addProperty("event", event);
            data.addProperty("sandbox", sandbox);
            this.initialState = this.api(data);
            this.numFloors = this.initialState.get("num_floors").getAsInt();
            this.curTurn = 0;
        }

        public JsonObject send(List<Command> commands) {
            this.curTurn += 1;
            System.out.println("Turn: " + this.curTurn);
            JsonObject data = new JsonObject();
            data.addProperty("token", this.initialState.get("token").getAsString());
            JsonArray commandsArray = new JsonArray();
            for (Command command : commands) {
                commandsArray.add(command.toJson());
            }
            data.add("commands", commandsArray);
            return this.api(data);
        }

        private JsonObject api(JsonObject data) {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(this.apiUrl))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(data.toString()))
                    .build();
            try {
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                JsonObject state = new Gson().fromJson(response.body(), JsonObject.class);
                JsonArray errors = state.getAsJsonArray("errors");
                for (int i = 0; i < errors.size(); i++) {
                    System.out.println("Error: " + errors.get(i).getAsString());
                }
                return state;
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
                return null;
            }
        }
    }
}
