import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

from qiskit.circuit.library import zz_feature_map
from qiskit_machine_learning.kernels import FidelityQuantumKernel
from qiskit_machine_learning.algorithms import QSVC


# ============================================================
# CONFIGURATION
# ============================================================

DATASET = "../datasets/processed/cicids2017_clean.csv"

SAMPLE_SIZE = 600
TEST_SIZE = 0.25

QUANTUM_FEATURES = [
    "Average Packet Size",
    "Packet Length Variance",
    "Subflow Bwd Bytes",
    "Total Length of Fwd Packets"
]

# We are testing ONLY this parameter
REPETITIONS = [1, 2]


# ============================================================
# LOAD DATA
# ============================================================

print("Loading dataset...")

df = pd.read_csv(DATASET)

df = df[QUANTUM_FEATURES + ["BinaryLabel"]]

df = df.replace([np.inf, -np.inf], np.nan)
df = df.dropna()

print("Clean rows:", len(df))


# ============================================================
# SELECT SAME 600 FLOWS
# ============================================================

df, _ = train_test_split(
    df,
    train_size=SAMPLE_SIZE,
    stratify=df["BinaryLabel"],
    random_state=42
)

print("Experiment dataset:", df.shape)


# ============================================================
# SAME TRAIN / TEST SPLIT
# ============================================================

train_df, test_df = train_test_split(
    df,
    test_size=TEST_SIZE,
    stratify=df["BinaryLabel"],
    random_state=42
)

y_train = train_df["BinaryLabel"].values
y_test = test_df["BinaryLabel"].values


# ============================================================
# SCALE DATA
# ============================================================

X_train = train_df[QUANTUM_FEATURES].values
X_test = test_df[QUANTUM_FEATURES].values

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

print("Training shape:", X_train.shape)
print("Testing shape :", X_test.shape)


# ============================================================
# TEST DIFFERENT FEATURE-MAP DEPTHS
# ============================================================

results = {}


for reps in REPETITIONS:

    print("\n" + "=" * 60)
    print(f"QSVC - ZZ FEATURE MAP - reps={reps}")
    print("=" * 60)

    # --------------------------------------------------------
    # QUANTUM FEATURE MAP
    # --------------------------------------------------------

    feature_map = zz_feature_map(
        feature_dimension=4,
        reps=reps,
        entanglement="linear"
    )

    print("\nFeature map:")
    print(feature_map)

    # --------------------------------------------------------
    # QUANTUM KERNEL
    # --------------------------------------------------------

    kernel = FidelityQuantumKernel(
        feature_map=feature_map
    )

    # --------------------------------------------------------
    # QSVC
    # --------------------------------------------------------

    qsvc = QSVC(
        quantum_kernel=kernel
    )

    print("\nTraining QSVC...")

    qsvc.fit(
        X_train,
        y_train
    )

    print("Training complete.")

    # --------------------------------------------------------
    # PREDICTION
    # --------------------------------------------------------

    predictions = qsvc.predict(X_test)

    # --------------------------------------------------------
    # METRICS
    # --------------------------------------------------------

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )

    cm = confusion_matrix(
        y_test,
        predictions
    )

    results[reps] = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "confusion_matrix": cm
    }

    # --------------------------------------------------------
    # OUTPUT
    # --------------------------------------------------------

    print("\nResults:")
    print("Accuracy :", accuracy)
    print("Precision:", precision)
    print("Recall   :", recall)
    print("F1 Score :", f1)

    print("\nConfusion Matrix:")
    print(cm)


# ============================================================
# FINAL COMPARISON
# ============================================================

print("\n\n")
print("=" * 70)
print("QUANTUM FEATURE-MAP DEPTH COMPARISON")
print("=" * 70)

print(
    f"{'Configuration':<20}"
    f"{'Accuracy':<12}"
    f"{'Precision':<12}"
    f"{'Recall':<12}"
    f"{'F1':<12}"
)

print("-" * 70)

for reps, result in results.items():

    print(
        f"{'ZZ reps=' + str(reps):<20}"
        f"{result['accuracy']:<12.4f}"
        f"{result['precision']:<12.4f}"
        f"{result['recall']:<12.4f}"
        f"{result['f1']:<12.4f}"
    )

print("=" * 70)