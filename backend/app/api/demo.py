from flask import request

from . import api

from app.services.event_bus import event_bus
from app.services.qaoa_service import QAOAService
from app.services.response_service import response_service
from app.modules.blockchain.audit_chain import audit_blockchain
from app.services.pqc_service import PQCService

qaoa_service = QAOAService()
pqc_service = PQCService()

# ============================================================
# DEMO ATTACK PROFILES
# ============================================================

ATTACK_PROFILES = {

    "LOW": {
        "probability_attack": 0.55,
        "severity": "LOW"
    },

    "MEDIUM": {
        "probability_attack": 0.70,
        "severity": "MEDIUM"
    },

    "HIGH": {
        "probability_attack": 0.85,
        "severity": "HIGH"
    },

    "CRITICAL": {
        "probability_attack": 0.98,
        "severity": "CRITICAL"
    }
}


# ============================================================
# SIMULATE ATTACK
# ============================================================

@api.route("/api/demo/attack", methods=["POST"])
def simulate_attack():

    # --------------------------------------------------------
    # Read severity
    # --------------------------------------------------------

    severity = request.args.get(
        "severity",
        "CRITICAL"
    ).upper()

    if severity not in ATTACK_PROFILES:

        return {
            "error": (
                "Invalid severity. "
                "Use LOW, MEDIUM, HIGH, or CRITICAL."
            )
        }, 400

    profile = ATTACK_PROFILES[severity]

    probability_attack = profile["probability_attack"]


    # --------------------------------------------------------
    # STEP 1: QAOA RESPONSE OPTIMIZATION
    # --------------------------------------------------------

    response = qaoa_service.optimize(
        attack_probability=probability_attack,
        severity=severity
    )


    # --------------------------------------------------------
    # STEP 2: EXECUTE SIMULATED RESPONSE
    # --------------------------------------------------------

    mitigation = response_service.execute(
        action=response["action"],
        source="DEMO-SOURCE",
        destination="DEMO-TARGET"
    )

    # --------------------------------------------------------
    # STEP 3: POST-QUANTUM SECURITY VERIFICATION
    # --------------------------------------------------------

    pqc_result = pqc_service.key_exchange()

    # --------------------------------------------------------
    # STEP 4: CREATE SECURITY EVENT
    # --------------------------------------------------------

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

            "probability_benign": round(
                1.0 - probability_attack,
                2
            ),

            "probability_attack":
                probability_attack
        },

        "severity": severity,

        "response": response,

        "mitigation": mitigation,

        "pqc": pqc_result,

        "type": "SIMULATED_ATTACK"
    }


    # --------------------------------------------------------
    # STEP 5: BLOCKCHAIN AUDIT
    # --------------------------------------------------------

    blockchain_event = {

        "type": "SECURITY_EVENT",

        "source": "DEMO-SOURCE",

        "destination": "DEMO-TARGET",

        "protocol": "TCP",

        "severity": severity,

        "attack_probability":
            probability_attack,

        "prediction": 1,

        # QAOA
        "qaoa_action":
            response["action"],

        "qaoa_score":
            response["score"],

        "algorithm":
            response["algorithm"],

        "classical_optimal_action":
            response["classical_optimal_action"],

        "qaoa_matches_classical":
            response["qaoa_matches_classical"],

        # Simulated mitigation
        "mitigation_action":
            mitigation["action"],

        "mitigation_status":
            mitigation["status"],

        "mitigation_message":
            mitigation["message"],

        # Post-quantum security
        "pqc_algorithm":
            pqc_result["algorithm"],

        "pqc_status":
            pqc_result["status"],

        "pqc_shared_secret_match":
            pqc_result["shared_secret_match"],

        "pqc_nist_level":
            pqc_result["claimed_nist_level"]
    }


    blockchain_block = (
        audit_blockchain.add_security_event(
            blockchain_event
        )
    )


    # --------------------------------------------------------
    # Add blockchain information to event
    # --------------------------------------------------------

    event["blockchain"] = {

        "block_index":
            blockchain_block["index"],

        "previous_hash":
            blockchain_block["previous_hash"],

        "hash":
            blockchain_block["hash"],

        "chain_valid":
            audit_blockchain.verify_chain()
    }


    # --------------------------------------------------------
    # STEP 6: PUBLISH EVENT
    # --------------------------------------------------------

    event_bus.publish(event)


    # --------------------------------------------------------
    # CONSOLE LOG
    # --------------------------------------------------------

    print(
        "\n=========================================="
    )

    print("DEMO ATTACK")

    print(
        "=========================================="
    )

    print(
        "Severity:",
        severity
    )

    print(
        "Attack probability:",
        probability_attack
    )

    print(
        "QAOA response:",
        response["action"]
    )

    print(
        "QAOA score:",
        response["score"]
    )

    print(
        "Simulated mitigation:",
        mitigation["message"]
    )

    print(
        "Mitigation status:",
        mitigation["status"]
    )

    print(
        "Classical optimum:",
        response["classical_optimal_action"]
    )

    print(
        "QAOA matches classical:",
        response["qaoa_matches_classical"]
    )

    print(
        "Blockchain block:",
        blockchain_block["index"]
    )

    print(
        "Blockchain hash:",
        blockchain_block["hash"]
    )

    print(
        "Blockchain valid:",
        audit_blockchain.verify_chain()
    )

    print(
        "==========================================\n"
    )


    # --------------------------------------------------------
    # API RESPONSE
    # --------------------------------------------------------

    return {

        "message":
            "Simulated attack generated",

        "event":
            event
    }