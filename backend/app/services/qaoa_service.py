import numpy as np

from qiskit_aer.primitives import SamplerV2
from qiskit_algorithms import QAOA
from qiskit_algorithms.optimizers import COBYLA
from qiskit_optimization import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.transpiler.preset_passmanagers import (
    generate_preset_pass_manager
)
from qiskit_aer import AerSimulator


class QAOAService:

    ACTIONS = [
        "MONITOR",
        "RATE_LIMIT",
        "BLOCK_SOURCE",
        "ISOLATE_HOST"
    ]

    def __init__(self):

        self.backend = AerSimulator()

        self.sampler = SamplerV2(
            default_shots=2048
        )

        self.pass_manager = generate_preset_pass_manager(
            optimization_level=1,
            backend=self.backend
        )

    def calculate_scores(self, attack_probability, severity):

        probability = max(
            0.0,
            min(1.0, float(attack_probability))
        )

        severity = severity.upper()

        # --------------------------------------------------
        # Response security utility
        #
        # Higher value = more desirable response.
        # --------------------------------------------------

        if severity == "LOW":

            security = np.array([
                7.0,   # MONITOR
                5.0,   # RATE_LIMIT
                3.0,   # BLOCK_SOURCE
                1.0    # ISOLATE_HOST
            ])

            cost = np.array([
                0.0,
                2.0,
                4.0,
                7.0
            ])

        elif severity == "MEDIUM":

            security = np.array([
                4.0,   # MONITOR
                8.0,   # RATE_LIMIT
                6.0,   # BLOCK_SOURCE
                3.0    # ISOLATE_HOST
            ])

            cost = np.array([
                0.0,
                2.0,
                4.0,
                7.0
            ])

        elif severity == "HIGH":

            security = np.array([
                2.0,   # MONITOR
                5.0,   # RATE_LIMIT
                10.0,  # BLOCK_SOURCE
                8.0    # ISOLATE_HOST
            ])

            cost = np.array([
                0.0,
                2.0,
                4.0,
                7.0
            ])

        elif severity == "CRITICAL":

            security = np.array([
                1.0,   # MONITOR
                4.0,   # RATE_LIMIT
                9.0,   # BLOCK_SOURCE
                14.0   # ISOLATE_HOST
            ])

            cost = np.array([
                0.0,
                2.0,
                4.0,
                7.0
            ])

        else:

            raise ValueError(
                "Severity must be LOW, MEDIUM, HIGH, or CRITICAL"
            )

        # --------------------------------------------------
        # Attack probability adjustment
        #
        # Higher probability increases the value of
        # stronger defensive actions.
        # --------------------------------------------------

        probability_adjustment = probability * np.array([
            -1.0,
            1.0,
            3.0,
            4.0
        ])

        security = security + probability_adjustment

        # --------------------------------------------------
        # Security benefit minus operational cost
        # --------------------------------------------------

        scores = security - 0.5 * cost

        return scores

    def optimize(
        self,
        attack_probability=0.98,
        severity="HIGH"
    ):

        # IMPORTANT:
        # Define these here because they are also
        # returned in the final result.
        probability = max(
            0.0,
            min(1.0, float(attack_probability))
        )

        severity = severity.upper()

        scores = self.calculate_scores(
            probability,
            severity
        )

        problem = QuadraticProgram(
            "QuantumDefense_Response"
        )

        # Four binary variables:
        #
        # x0 = MONITOR
        # x1 = RATE_LIMIT
        # x2 = BLOCK_SOURCE
        # x3 = ISOLATE_HOST

        for i in range(4):

            problem.binary_var(
                name=f"x{i}"
            )

        # Qiskit minimizes.
        # Therefore negate our utility scores.
        problem.minimize(
            linear=(-scores).tolist()
        )

        # Exactly one response must be selected.
        problem.linear_constraint(
            linear={
                "x0": 1,
                "x1": 1,
                "x2": 1,
                "x3": 1
            },
            sense="==",
            rhs=1,
            name="one_response"
        )

        classical_index = int(np.argmax(scores))
        classical_action = self.ACTIONS[classical_index]
        classical_score = float(scores[classical_index])

        # Create QAOA
        qaoa = QAOA(
            sampler=self.sampler,
            optimizer=COBYLA(
                maxiter=100
            ),
            reps=2,
            transpiler=self.pass_manager
        )

        # Convert the QAOA minimum-eigenvalue
        # solution into an optimization solution.
        optimizer = MinimumEigenOptimizer(
            qaoa
        )

        result = optimizer.solve(problem)

        selected_index = int(
            np.argmax(result.x)
        )

        qaoa_action = self.ACTIONS[selected_index]
        qaoa_score = float(scores[selected_index])

        return {
            "action": qaoa_action,
            "score": qaoa_score,
            "algorithm": "QAOA",

            "variables": [
                int(round(x))
                for x in result.x
            ],

            "attack_probability": probability,
            "severity": severity,

            "response_scores": {
                self.ACTIONS[i]: float(scores[i])
                for i in range(4)
            },

            "classical_optimal_action": classical_action,
            "classical_optimal_score": classical_score,

            "qaoa_matches_classical": (
                qaoa_action == classical_action
            )
        }