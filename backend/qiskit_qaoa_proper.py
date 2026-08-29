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


# ============================================================
# QUANTUM DEFENSE - QAOA RESPONSE OPTIMIZER
# ============================================================

print("=" * 70)
print("QUANTUM DEFENSE - QAOA RESPONSE OPTIMIZER")
print("=" * 70)


# ============================================================
# CYBERSECURITY RESPONSE OPTIONS
# ============================================================

actions = [
    "MONITOR",
    "RATE_LIMIT",
    "BLOCK_SOURCE",
    "ISOLATE_HOST"
]

print("\nAvailable response actions:")

for i, action in enumerate(actions):
    print(f"{i}: {action}")


# ============================================================
# SECURITY MODEL
# ============================================================

security_benefit = np.array([
    2.0,    # MONITOR
    6.0,    # RATE_LIMIT
    9.0,    # BLOCK_SOURCE
    10.0    # ISOLATE_HOST
])

operational_cost = np.array([
    0.0,    # MONITOR
    2.0,    # RATE_LIMIT
    4.0,    # BLOCK_SOURCE
    7.0     # ISOLATE_HOST
])


SECURITY_WEIGHT = 1.0
COST_WEIGHT = 0.8


# ============================================================
# RESPONSE SCORE
# ============================================================

scores = (
    SECURITY_WEIGHT * security_benefit
    - COST_WEIGHT * operational_cost
)


print("\nResponse scores:")

for i, action in enumerate(actions):

    print(
        f"{action:<15}"
        f"Security={security_benefit[i]:>5.1f} "
        f"Cost={operational_cost[i]:>5.1f} "
        f"Score={scores[i]:>5.2f}"
    )


# ============================================================
# CLASSICAL REFERENCE
# ============================================================

classical_best = int(np.argmax(scores))

print("\nClassical reference solution:")
print("Best response:", actions[classical_best])
print("Best score:", scores[classical_best])


# ============================================================
# BUILD BINARY OPTIMIZATION PROBLEM
# ============================================================
#
# x0 = MONITOR
# x1 = RATE_LIMIT
# x2 = BLOCK_SOURCE
# x3 = ISOLATE_HOST
#
# Exactly one action must be selected.
#
# ============================================================

problem = QuadraticProgram(
    "QuantumDefense_Response"
)

for i in range(4):

    problem.binary_var(
        name=f"x{i}"
    )


# Qiskit Optimization minimizes.
#
# We want to maximize the score.
#
# Therefore minimize negative score.

problem.minimize(
    linear=(-scores).tolist()
)


# ============================================================
# EXACTLY ONE RESPONSE
# ============================================================

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


print("\nOptimization problem:")
print(problem)


# ============================================================
# AER BACKEND
# ============================================================

print("\nCreating Aer simulator...")

backend = AerSimulator()


# ============================================================
# AER SAMPLER
# ============================================================

print("Creating Aer Sampler...")

sampler = SamplerV2(
    default_shots=512
)


# ============================================================
# PROPER QISKIT TRANSPILER
# ============================================================
#
# IMPORTANT:
#
# QAOA 0.4.0 expects an OBJECT with:
#
#     transpiler.run(...)
#
# generate_preset_pass_manager() returns exactly that.
#
# ============================================================

print("Creating transpiler...")

pass_manager = generate_preset_pass_manager(
    optimization_level=1,
    backend=backend
)


# ============================================================
# QAOA
# ============================================================

print("Creating QAOA...")

qaoa = QAOA(
    sampler=sampler,
    optimizer=COBYLA(
        maxiter=30
    ),
    reps=1,
    transpiler=pass_manager
)


# ============================================================
# MINIMUM EIGEN OPTIMIZER
# ============================================================

optimizer = MinimumEigenOptimizer(
    qaoa
)


# ============================================================
# RUN QAOA
# ============================================================

print("\nRunning QAOA...")

result = optimizer.solve(
    problem
)


# ============================================================
# RESULTS
# ============================================================

print("\n" + "=" * 70)
print("QAOA RESULT")
print("=" * 70)


print("\nSelected variables:")

for i, action in enumerate(actions):

    print(
        f"{action:<15}: "
        f"{result.x[i]:.0f}"
    )


# ============================================================
# SELECT RESPONSE
# ============================================================

selected_index = int(
    np.argmax(result.x)
)


print(
    "\nQAOA recommended response:",
    actions[selected_index]
)

print(
    "Optimization score:",
    scores[selected_index]
)


# ============================================================
# CLASSICAL COMPARISON
# ============================================================

print(
    "\nClassical reference:",
    actions[classical_best]
)


if selected_index == classical_best:

    print(
        "\n✓ QAOA found the same optimal response "
        "as the classical reference."
    )

else:

    print(
        "\n⚠ QAOA selected a different response."
    )


print("=" * 70)