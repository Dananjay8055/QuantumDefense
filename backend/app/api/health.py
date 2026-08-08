from flask import jsonify

from . import api
from app.services.health_service import HealthService


@api.route("/")
def home():

    return jsonify({
        "project": "Quantum Defense",
        "version": "0.1.0",
        "status": "Running"
    })


@api.route("/health")
def health():

    return jsonify(
        HealthService.get_status()
    )