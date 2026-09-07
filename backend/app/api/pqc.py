from flask import jsonify

from . import api
from app.services.pqc_service import pqc_service


@api.route("/api/pqc/status", methods=["GET"])
def pqc_status():

    try:

        result = pqc_service.key_exchange()

        return jsonify({
            "status": "PQC operational",
            "result": result
        })

    except Exception as e:

        return jsonify({
            "status": "PQC error",
            "error": str(e)
        }), 500