import hashlib
import json
import time


class AuditBlockchain:

    def __init__(self):
        self.chain = []

        # Create the first block.
        self._create_genesis_block()

    def _calculate_hash(self, block):
        block_string = json.dumps(
            block,
            sort_keys=True
        ).encode()

        return hashlib.sha256(
            block_string
        ).hexdigest()

    def _create_genesis_block(self):

        genesis = {
            "index": 0,
            "timestamp": time.time(),
            "event": "GENESIS",
            "previous_hash": "0"
        }

        genesis["hash"] = self._calculate_hash(
            genesis
        )

        self.chain.append(genesis)

    def add_security_event(
        self,
        event
    ):

        previous_block = self.chain[-1]

        block = {
            "index": len(self.chain),
            "timestamp": time.time(),
            "event": event,
            "previous_hash": previous_block["hash"]
        }

        block["hash"] = self._calculate_hash(
            block
        )

        self.chain.append(block)

        return block

    def get_chain(self):

        return self.chain

    def verify_chain(self):

        for i in range(1, len(self.chain)):

            current = self.chain[i]
            previous = self.chain[i - 1]

            # Verify link to previous block.
            if current["previous_hash"] != previous["hash"]:
                return False

            # Recalculate current block hash.
            stored_hash = current["hash"]

            block_copy = current.copy()

            del block_copy["hash"]

            calculated_hash = self._calculate_hash(
                block_copy
            )

            if stored_hash != calculated_hash:
                return False

        return True


audit_blockchain = AuditBlockchain()