from flask import jsonify

from . import api
from app.services.network_service import NetworkService


@api.route("/network/status")
def network_status():
    return jsonify({
        "queue_size": NetworkService.queue_size()
    })