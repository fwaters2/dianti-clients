#include <iostream>
#include <string>
#include <vector>
#include <curl/curl.h>
#include "json.hpp"

using json = nlohmann::json;

// Constants
const bool UP = true;
const bool DOWN = false;
const bool MOVE = true;
const bool STOP = false;

// Struct for Command
struct Command {
    std::string elevator_id;
    bool direction;
    bool action;

    json to_json() const {
        return {
            {"elevator_id", elevator_id},
            {"direction", direction},
            {"action", action}
        };
    }
};

// Struct for Simulation
class Simulation {
public:
    Simulation(const std::string& event, const std::string& building_name, const std::string& bot, const std::string& email, bool sandbox = false)
        : api_url("https://dianti.secondspace.dev/api"), sandbox(sandbox) {
        json request = {
            {"bot", bot},
            {"building_name", building_name},
            {"email", email},
            {"event", event},
            {"sandbox", sandbox}
        };
        initial_state = api(request);
        num_floors = initial_state["num_floors"];
        cur_turn = 0;
    }

    json send(const std::vector<Command>& commands) {
        cur_turn++;
        std::cout << "Turn: " << cur_turn << std::endl;

        json commands_json = json::array();
        for (const auto& cmd : commands) {
            commands_json.push_back(cmd.to_json());
        }

        json request = {
            {"token", initial_state["token"]},
            {"commands", commands_json}
        };

        return api(request);
    }

    json get_initial_state() {
        return initial_state;
    }

    int get_num_floors() {
        return num_floors;
    }

private:
    std::string api_url;
    json initial_state;
    int num_floors;
    int cur_turn;
    bool sandbox;

    static size_t write_callback(void* contents, size_t size, size_t nmemb, std::string* s) {
        size_t new_length = size * nmemb;
        try {
            s->append((char*)contents, new_length);
        } catch (std::bad_alloc& e) {
            return 0;
        }
        return new_length;
    }

    json api(const json& data) {
        CURL* curl;
        CURLcode res;
        std::string read_buffer;

        curl = curl_easy_init();
        if (curl) {
            std::string json_data = data.dump();
            curl_easy_setopt(curl, CURLOPT_URL, api_url.c_str());
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_data.c_str());
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &read_buffer);

            struct curl_slist* headers = nullptr;
            headers = curl_slist_append(headers, "Content-Type: application/json");
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

            res = curl_easy_perform(curl);
            if (res != CURLE_OK) {
                std::cerr << "CURL error: " << curl_easy_strerror(res) << std::endl;
            }

            curl_easy_cleanup(curl);
            curl_slist_free_all(headers);
        }

        json response = json::parse(read_buffer);
        for (const auto& error : response["errors"]) {
            std::cerr << "Error: " << error << std::endl;
        }

        return response;
    }
};
