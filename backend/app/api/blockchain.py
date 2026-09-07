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

    # Need at least genesis + one security block.
    if len(chain) < 2:
        return jsonify({
            "status": "ERROR",
            "message": "Create at least one security event first."
        }), 400

    # --------------------------------------------------------
    # 1. Select block to test
    # --------------------------------------------------------

    target_block = chain[1]

    block_index = target_block["index"]

    # --------------------------------------------------------
    # 2. Verify original chain
    # --------------------------------------------------------

    original_valid = audit_blockchain.verify_chain()

    original_hash = target_block["hash"]

    original_calculated_hash = (
        audit_blockchain.calculate_block_hash(
            target_block
        )
    )

    # --------------------------------------------------------
    # 3. Save original event data
    # --------------------------------------------------------

    original_event = target_block["event"]

    if isinstance(original_event, dict):

        original_severity = original_event.get("severity")

        # Temporarily modify the event.
        original_event["severity"] = "TAMPERED"

    else:

        original_severity = None

        # Temporarily replace the event.
        target_block["event"] = "TAMPERED"

    # --------------------------------------------------------
    # 4. Calculate hash AFTER tampering
    # --------------------------------------------------------

    tampered_calculated_hash = (
        audit_blockchain.calculate_block_hash(
            target_block
        )
    )

    # The stored hash has NOT been changed.
    stored_hash_after_tampering = target_block["hash"]

    # --------------------------------------------------------
    # 5. Verify chain after tampering
    # --------------------------------------------------------

    tampered_valid = audit_blockchain.verify_chain()

    # --------------------------------------------------------
    # 6. Determine whether tampering was detected
    # --------------------------------------------------------

    hash_changed = (
        original_hash != tampered_calculated_hash
    )

    hash_mismatch = (
        stored_hash_after_tampering
        != tampered_calculated_hash
    )

    tampering_detected = (
        original_valid
        and not tampered_valid
        and hash_mismatch
    )

    # --------------------------------------------------------
    # 7. Restore original event
    # --------------------------------------------------------

    if isinstance(original_event, dict):

        original_event["severity"] = original_severity

    else:

        target_block["event"] = original_event

    # --------------------------------------------------------
    # 8. Verify restored chain
    # --------------------------------------------------------

    restored_valid = audit_blockchain.verify_chain()

    restored_hash = target_block["hash"]

    hash_restored = (
        original_hash == restored_hash
    )

    # --------------------------------------------------------
    # 9. Return detailed result
    # --------------------------------------------------------

    return jsonify({

        "status": "SUCCESS",

        "tamper_detection": {

            # Basic verification
            "original_chain_valid":
                original_valid,

            "after_tampering":
                tampered_valid,

            "tampering_detected":
                tampering_detected,

            "after_restoration":
                restored_valid,

            # Block information
            "tested_block_index":
                block_index,

            "tampered_field":
                "event.severity",

            "original_value":
                original_severity,

            "tampered_value":
                "TAMPERED",

            # Hash evidence
            "original_hash":
                original_hash,

            "original_calculated_hash":
                original_calculated_hash,

            "tampered_calculated_hash":
                tampered_calculated_hash,

            "stored_hash_after_tampering":
                stored_hash_after_tampering,

            "restored_hash":
                restored_hash,

            # Hash verification
            "hash_changed":
                hash_changed,

            "hash_mismatch_detected":
                hash_mismatch,

            "hash_restored":
                hash_restored
        },

        "message":
            "Blockchain tamper detection test completed."
    })