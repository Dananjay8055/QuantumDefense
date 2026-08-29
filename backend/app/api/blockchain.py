from flask import jsonify

from . import api
from app.modules.blockchain.audit_chain import audit_blockchain


@api.route("/api/blockchain")
def blockchain():

    return jsonify({
        "valid": audit_blockchain.verify_chain(),
        "length": len(audit_blockchain.get_chain()),
        "chain": audit_blockchain.get_chain()
    })


# ============================================================
# BLOCKCHAIN TAMPER DETECTION DEMO
# ============================================================

@api.route("/api/blockchain/tamper-test", methods=["POST"])
def blockchain_tamper_test():

    chain = audit_blockchain.get_chain()

    # Need at least genesis + one security block
    if len(chain) < 2:
        return jsonify({
            "status": "ERROR",
            "message": "Create at least one security event first."
        }), 400

    # --------------------------------------------------------
    # 1. Verify original chain
    # --------------------------------------------------------

    original_valid = audit_blockchain.verify_chain()

    # --------------------------------------------------------
    # 2. Temporarily modify a block
    # --------------------------------------------------------

    target_block = chain[1]
    original_event = target_block["event"]

    if isinstance(original_event, dict):

        original_severity = original_event.get("severity")
        original_event["severity"] = "TAMPERED"

    else:

        original_severity = None
        target_block["event"] = "TAMPERED"

    # --------------------------------------------------------
    # 3. Verify after tampering
    # --------------------------------------------------------

    tampered_valid = audit_blockchain.verify_chain()

    # --------------------------------------------------------
    # 4. Restore original block
    # --------------------------------------------------------

    if isinstance(original_event, dict):

        original_event["severity"] = original_severity

    else:

        target_block["event"] = original_event

    # --------------------------------------------------------
    # 5. Verify restored chain
    # --------------------------------------------------------

    restored_valid = audit_blockchain.verify_chain()

    # --------------------------------------------------------
    # Result
    # --------------------------------------------------------

    return jsonify({

        "status": "SUCCESS",

        "tamper_detection": {

            "original_chain_valid":
                original_valid,

            "after_tampering":
                tampered_valid,

            "tampering_detected":
                original_valid and not tampered_valid,

            "after_restoration":
                restored_valid
        },

        "message":
            "Blockchain tamper detection test completed."
    })