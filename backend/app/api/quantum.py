from flask import jsonify
from pathlib import Path
import json

from . import api

from qiskit.circuit.library import zz_feature_map


# ============================================================
# CONFIGURATION
# ============================================================

QSVC_FEATURES = [
    "Average Packet Size",
    "Packet Length Variance",
    "Subflow Bwd Bytes",
    "Total Length of Fwd Packets"
]

# backend/
#   app/
#     api/
#       quantum.py
#   quantum_results/
#       qsvc_results.json
#
# parents[2] -> backend/

QSVC_RESULTS_FILE = (
    Path(__file__).resolve().parents[2]
    / "quantum_results"
    / "qsvc_results.json"
)


# ============================================================
# QSVC RESULTS ENDPOINT
# ============================================================

@api.route("/api/quantum/qsvc", methods=["GET"])
def qsvc_results():

    if not QSVC_RESULTS_FILE.exists():

        return jsonify({
            "algorithm": "QSVC",
            "status": "NOT_AVAILABLE",
            "message": "QSVC results file not found.",
            "results_file": str(QSVC_RESULTS_FILE)
        }), 404

    try:

        with open(
            QSVC_RESULTS_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            results = json.load(file)

        return jsonify(results)

    except Exception as exc:

        return jsonify({
            "algorithm": "QSVC",
            "status": "ERROR",
            "message": str(exc)
        }), 500


# ============================================================
# QSVC CIRCUIT ENDPOINT
# ============================================================

@api.route("/api/quantum/qsvc/circuit", methods=["GET"])
def qsvc_circuit():

    circuits = []

    for reps in [1, 2]:

        feature_map = zz_feature_map(
            feature_dimension=4,
            reps=reps,
            entanglement="linear"
        )

        circuits.append({
            "reps": reps,
            "qubits": feature_map.num_qubits,
            "width": feature_map.width(),
            "depth": feature_map.depth(),
            "entanglement": "linear",

            "operations": {
                str(key): int(value)
                for key, value in feature_map.count_ops().items()
            },

            "circuit": str(
                feature_map.draw(
                    output="text"
                )
            )
        })

    return jsonify({
        "algorithm": "QSVC",
        "classifier": "QSVC",
        "feature_map": "ZZFeatureMap",
        "kernel": "FidelityQuantumKernel",
        "qubits": 4,
        "features": QSVC_FEATURES,
        "experiments": circuits
    })