from flask import jsonify

from . import api
from app.services.event_bus import event_bus


@api.route("/api/detections")
def detections():

    return jsonify({
        "count": len(event_bus.get_events()),
        "detections": event_bus.get_events()
    })