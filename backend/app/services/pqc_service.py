import time
import oqs


class PQCService:

    ALGORITHM = "ML-KEM-768"

    def __init__(self):
        self.algorithm = self.ALGORITHM

        enabled = oqs.get_enabled_kem_mechanisms()

        if self.algorithm not in enabled:
            raise RuntimeError(
                f"{self.algorithm} is not enabled in liboqs"
            )

    def key_exchange(self):

        start = time.perf_counter()

        with oqs.KeyEncapsulation(self.algorithm) as kem:

            public_key = kem.generate_keypair()

            ciphertext, encapsulated_secret = (
                kem.encap_secret(public_key)
            )

            decapsulated_secret = (
                kem.decap_secret(ciphertext)
            )

            shared_secret_match = (
                encapsulated_secret ==
                decapsulated_secret
            )

            elapsed_ms = (
                time.perf_counter() - start
            ) * 1000

            return {
                "algorithm": self.algorithm,

                "status": (
                    "SUCCESS"
                    if shared_secret_match
                    else "FAILED"
                ),

                "shared_secret_match": (
                    shared_secret_match
                ),

                "public_key_bytes": (
                    kem.length_public_key
                ),

                "secret_key_bytes": (
                    kem.length_secret_key
                ),

                "ciphertext_bytes": (
                    kem.length_ciphertext
                ),

                "shared_secret_bytes": (
                    kem.length_shared_secret
                ),

                "claimed_nist_level": (
                    kem.claimed_nist_level
                ),

                "execution_time_ms": round(
                    elapsed_ms,
                    3
                )
            }


pqc_service = PQCService()