from . import api
from app.services.event_bus import event_bus


@api.route("/api/demo/attack", methods=["POST"])
def simulate_attack():

    event = {
        "flow": [
            "DEMO-SOURCE",
            "DEMO-TARGET",
            4444,
            8080,
            "TCP"
        ],
        "result": {
            "prediction": 1,
            "probability_benign": 0.02,
            "probability_attack": 0.98
        },
        "type": "SIMULATED_ATTACK"
    }

    event_bus.publish(event)

    return {
        "message": "Simulated attack generated",
        "event": event
    }