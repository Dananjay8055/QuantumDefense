from qiskit.circuit.library import ZZFeatureMap


FEATURES = [
    "Average Packet Size",
    "Packet Length Variance",
    "Subflow Bwd Bytes",
    "Total Length of Fwd Packets"
]


def generate_circuit(reps):
    return ZZFeatureMap(
        feature_dimension=4,
        reps=reps,
        entanglement="linear"
    )


print("=" * 80)
print("QUANTUMDEFENSE - QSVC QUANTUM CIRCUITS")
print("=" * 80)

print("\nFEATURES ENCODED INTO THE QUANTUM CIRCUIT:")
for i, feature in enumerate(FEATURES):
    print(f"q{i} -> {feature}")

print("\n" + "=" * 80)
print("REPS = 1")
print("=" * 80)

circuit_1 = generate_circuit(1)

print(circuit_1.decompose())

print("\nCircuit Information:")
print(f"Qubits       : {circuit_1.num_qubits}")
print(f"Repetitions  : 1")
print(f"Entanglement : linear")
print(f"Depth        : {circuit_1.decompose().depth()}")
print(f"Operations   : {circuit_1.decompose().count_ops()}")


print("\n" + "=" * 80)
print("REPS = 2")
print("=" * 80)

circuit_2 = generate_circuit(2)

print(circuit_2.decompose())

print("\nCircuit Information:")
print(f"Qubits       : {circuit_2.num_qubits}")
print(f"Repetitions  : 2")
print(f"Entanglement : linear")
print(f"Depth        : {circuit_2.decompose().depth()}")
print(f"Operations   : {circuit_2.decompose().count_ops()}")


print("\n" + "=" * 80)
print("CIRCUIT GENERATION COMPLETE")
print("=" * 80)