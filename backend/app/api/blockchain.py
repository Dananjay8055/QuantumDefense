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


@api.route("/api/blockchain/tamper-test", methods=["POST"])
def blockchain_tamper_test():

    chain = audit_blockchain.get_chain()

    # Need Genesis Block + at least one security block
    if len(chain) < 2:
        return jsonify({
            "status": "ERROR",
            "message": "Create at least one security event first."
        }), 400

    # ========================================================
    # 1. ORIGINAL STATE
    # ========================================================

    original_valid = audit_blockchain.verify_chain()

    target_block = chain[-1]

    original_event = target_block["event"]

    if isinstance(original_event, dict):
        original_event_copy = original_event.copy()
    else:
        original_event_copy = original_event

    original_hash = target_block["hash"]

    # Calculate the original hash from block contents
    original_block_for_hash = target_block.copy()
    del original_block_for_hash["hash"]

    original_calculated_hash = (
        audit_blockchain._calculate_hash(
            original_block_for_hash
        )
    )

    # ========================================================
    # 2. TAMPER WITH BLOCK
    # ========================================================

    if isinstance(target_block["event"], dict):

        target_block["event"]["severity"] = "TAMPERED"

    else:

        target_block["event"] = "TAMPERED"

    # ========================================================
    # 3. CALCULATE NEW HASH
    # ========================================================

    tampered_block_for_hash = target_block.copy()
    del tampered_block_for_hash["hash"]

    tampered_calculated_hash = (
        audit_blockchain._calculate_hash(
            tampered_block_for_hash
        )
    )

    # Stored hash remains the ORIGINAL hash
    stored_hash_after_tampering = target_block["hash"]

    # Verify modified chain
    tampered_valid = audit_blockchain.verify_chain()

    hash_changed = (
        original_hash != tampered_calculated_hash
    )

    hash_mismatch_detected = (
        stored_hash_after_tampering
        != tampered_calculated_hash
    )

    tampering_detected = (
        original_valid
        and not tampered_valid
        and hash_mismatch_detected
    )

    # ========================================================
    # 4. RESTORE ORIGINAL EVENT
    # ========================================================

    if isinstance(original_event_copy, dict):

        target_block["event"] = original_event_copy.copy()

    else:

        target_block["event"] = original_event_copy

    # ========================================================
    # 5. VERIFY RESTORED STATE
    # ========================================================

    restored_block_for_hash = target_block.copy()
    del restored_block_for_hash["hash"]

    restored_calculated_hash = (
        audit_blockchain._calculate_hash(
            restored_block_for_hash
        )
    )

    restored_hash = target_block["hash"]

    restored_valid = audit_blockchain.verify_chain()

    hash_restored = (
        restored_hash == original_hash
        and restored_calculated_hash == original_hash
    )

    # ========================================================
    # 6. RETURN REAL HASH VALUES
    # ========================================================

    return jsonify({

        "status": "SUCCESS",

        "tamper_detection": {

            "original_chain_valid":
                original_valid,

            "after_tampering":
                tampered_valid,

            "tampering_detected":
                tampering_detected,

            "after_restoration":
                restored_valid,

            "tested_block_index":
                target_block["index"],

            "tampered_field":
                "event.severity",

            "original_value":
                (
                    original_event_copy.get("severity")
                    if isinstance(
                        original_event_copy,
                        dict
                    )
                    else original_event_copy
                ),

            "tampered_value":
                "TAMPERED",

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

            "restored_calculated_hash":
                restored_calculated_hash,

            "hash_changed":
                hash_changed,

            "hash_mismatch_detected":
                hash_mismatch_detected,

            "hash_restored":
                hash_restored
        },

        "message":
            "Blockchain tamper detection test completed."
    })