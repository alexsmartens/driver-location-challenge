from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from plot_driver_location import *
# Plot and save truck path on the server
# Plot and save truck path on the server
is_plot_server = False


## Part 0: loading legs, stops and driver location data
f = open(".\data\legs.json")
legs = json.load(f)
f.close()

f = open(".\data\stops.json")
stops = json.load(f)
f.close()

f = open(".\data\driver_location.json")
driver_location = json.load(f)
f.close()

f = open(".\data\\bonus_driver_location.json")
bonus_driver_location = json.load(f)
f.close()


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


## Part 1: adding a REST API to retrieve the given list of stops and legs from server
# GET list of legs
@app.route("/legs", methods=["GET"])
def get_legs():
    return jsonify({
                        "legs": legs
                    })

# GET list of legs
@app.route("/stops", methods=["GET"])
def get_stops():
    return jsonify({
                        "stops": stops
                    })


## Part 3: adding a REST API to get the driver’s current position
# GET driver’s current position
@app.route("/driver", methods=["GET"])
def get_driver_location():
    return jsonify({
                        "Driver’s current position": driver_location
                    })


## Part 7: adding a REST API to update the driver’s current position
# PUT driver’s current position
@app.route("/driver", methods=["PUT"])
def put_driver_location():
    provided_driver_location = request.json["Driver’s current position"]
    globals()["driver_location"] = provided_driver_location


    if is_plot_server:
        # Data visualization
        if "stops_dict" not in globals():
            globals()["legs_dict"] = convert_list_to_dict(legs, "legID")
            globals()["stops_dict"] = convert_list_to_dict(stops, "name")
        plot_truck_data(stops, driver_location, globals()["stops_dict"])

    return jsonify({
        "Driver’s current position": driver_location
    })


## BONUS 1 (Part 2): adding a REST API to update the bonus driver’s current position
# PUT bonus driver’s current position
@app.route("/bonusdriver", methods=["PUT"])
def put_bonus_driver_location():
    provided_driver_location = request.json["Driver’s current position"]
    globals()["bonus_driver_location"] = provided_driver_location

    return jsonify({
        "Driver’s current position": bonus_driver_location
    })


## BONUS 1 (Part 3): adding a REST API to get the bonus driver’s current position
# GET bonus driver’s current position
@app.route("/bonusdriver", methods=["GET"])
def get_bonus_driver_location():
    return jsonify({
                        "Driver’s current position": bonus_driver_location
                    })





if __name__=="__main__":

    if is_plot_server:
        # Initial data visualization
        if "stops_dict" not in globals():
            legs_dict = convert_list_to_dict(legs, "legID")
            stops_dict = convert_list_to_dict(stops, "name")
        plot_truck_data(stops, driver_location, stops_dict)

    app.run(debug=True, port=8080)