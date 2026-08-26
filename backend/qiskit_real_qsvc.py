import pandas as pd
import numpy as np
import joblib

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


# ============================================================
# QUANTUM FEATURE SETS
# ============================================================

QUANTUM_FEATURE_SETS = {

    4: [
        "Average Packet Size",
        "Packet Length Variance",
        "Subflow Bwd Bytes",
        "Total Length of Fwd Packets"
    ],

    6: [
        "Average Packet Size",
        "Packet Length Variance",
        "Subflow Bwd Bytes",
        "Total Length of Fwd Packets",
        "Bwd Packet Length Mean",
        "Max Packet Length"
    ],

    8: [
        "Average Packet Size",
        "Packet Length Variance",
        "Subflow Bwd Bytes",
        "Total Length of Fwd Packets",
        "Bwd Packet Length Mean",
        "Max Packet Length",
        "Packet Length Mean",
        "Avg Bwd Segment Size"
    ]
}


# ============================================================
# ALL 78 FEATURES USED BY RANDOM FOREST
# ============================================================

ALL_FEATURES = [
    "Destination Port",
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Total Length of Fwd Packets",
    "Total Length of Bwd Packets",
    "Fwd Packet Length Max",
    "Fwd Packet Length Min",
    "Fwd Packet Length Mean",
    "Fwd Packet Length Std",
    "Bwd Packet Length Max",
    "Bwd Packet Length Min",
    "Bwd Packet Length Mean",
    "Bwd Packet Length Std",
    "Flow Bytes/s",
    "Flow Packets/s",
    "Flow IAT Mean",
    "Flow IAT Std",
    "Flow IAT Max",
    "Flow IAT Min",
    "Fwd IAT Total",
    "Fwd IAT Mean",
    "Fwd IAT Std",
    "Fwd IAT Max",
    "Fwd IAT Min",
    "Bwd IAT Total",
    "Bwd IAT Mean",
    "Bwd IAT Std",
    "Bwd IAT Max",
    "Bwd IAT Min",
    "Fwd PSH Flags",
    "Bwd PSH Flags",
    "Fwd URG Flags",
    "Bwd URG Flags",
    "Fwd Header Length",
    "Bwd Header Length",
    "Fwd Packets/s",
    "Bwd Packets/s",
    "Min Packet Length",
    "Max Packet Length",
    "Packet Length Mean",
    "Packet Length Std",
    "Packet Length Variance",
    "FIN Flag Count",
    "SYN Flag Count",
    "RST Flag Count",
    "PSH Flag Count",
    "ACK Flag Count",
    "URG Flag Count",
    "CWE Flag Count",
    "ECE Flag Count",
    "Down/Up Ratio",
    "Average Packet Size",
    "Avg Fwd Segment Size",
    "Avg Bwd Segment Size",
    "Fwd Header Length.1",
    "Fwd Avg Bytes/Bulk",
    "Fwd Avg Packets/Bulk",
    "Fwd Avg Bulk Rate",
    "Bwd Avg Bytes/Bulk",
    "Bwd Avg Packets/Bulk",
    "Bwd Avg Bulk Rate",
    "Subflow Fwd Packets",
    "Subflow Fwd Bytes",
    "Subflow Bwd Packets",
    "Subflow Bwd Bytes",
    "Init_Win_bytes_forward",
    "Init_Win_bytes_backward",
    "act_data_pkt_fwd",
    "min_seg_size_forward",
    "Active Mean",
    "Active Std",
    "Active Max",
    "Active Min",
    "Idle Mean",
    "Idle Std",
    "Idle Max",
    "Idle Min"
]


# ============================================================
# LOAD DATASET
# ============================================================

print("Loading dataset...")

df = pd.read_csv(DATASET)

# Keep only the 78 features + binary target
df = df[ALL_FEATURES + ["BinaryLabel"]]

# Remove invalid values
df = df.replace([np.inf, -np.inf], np.nan)
df = df.dropna()

print("Clean rows:", len(df))


# ============================================================
# SELECT 600 FLOWS
# ============================================================

df, _ = train_test_split(
    df,
    train_size=SAMPLE_SIZE,
    stratify=df["BinaryLabel"],
    random_state=42
)

print("Comparison dataset:", df.shape)


# ============================================================
# SAME TRAIN / TEST SPLIT FOR BOTH MODELS
# ============================================================

train_df, test_df = train_test_split(
    df,
    test_size=TEST_SIZE,
    stratify=df["BinaryLabel"],
    random_state=42
)

y_train = train_df["BinaryLabel"].values
y_test = test_df["BinaryLabel"].values

print("Training samples:", len(train_df))
print("Testing samples :", len(test_df))


# ============================================================
# RANDOM FOREST
# ============================================================

print("\n" + "=" * 60)
print("RANDOM FOREST")
print("=" * 60)

# Keep DataFrame format because the Random Forest was
# trained with feature names.
X_rf_test = test_df[ALL_FEATURES]

rf = joblib.load("../models/random_forest.joblib")

rf_predictions = rf.predict(X_rf_test)

rf_accuracy = accuracy_score(y_test, rf_predictions)
rf_precision = precision_score(y_test, rf_predictions, zero_division=0)
rf_recall = recall_score(y_test, rf_predictions, zero_division=0)
rf_f1 = f1_score(y_test, rf_predictions, zero_division=0)

print("Accuracy :", rf_accuracy)
print("Precision:", rf_precision)
print("Recall   :", rf_recall)
print("F1 Score :", rf_f1)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, rf_predictions))


# ============================================================
# QUANTUM EXPERIMENT
# 4 FEATURES vs 6 FEATURES vs 8 FEATURES
# ============================================================

quantum_results = {}

for feature_count, quantum_features in QUANTUM_FEATURE_SETS.items():

    print("\n" + "=" * 60)
    print(f"QSVC WITH {feature_count} FEATURES")
    print("=" * 60)

    print("Features:")

    for feature in quantum_features:
        print(" -", feature)

    # --------------------------------------------------------
    # SELECT QUANTUM FEATURES
    # --------------------------------------------------------

    X_q_train = train_df[quantum_features].values
    X_q_test = test_df[quantum_features].values

    # --------------------------------------------------------
    # SCALE FEATURES
    # --------------------------------------------------------

    scaler = StandardScaler()

    X_q_train = scaler.fit_transform(X_q_train)
    X_q_test = scaler.transform(X_q_test)

    print("\nTraining shape:", X_q_train.shape)
    print("Testing shape :", X_q_test.shape)

    # --------------------------------------------------------
    # QUANTUM FEATURE MAP
    # --------------------------------------------------------

    feature_map = zz_feature_map(
        feature_dimension=feature_count,
        reps=1,
        entanglement="linear"
    )

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
        X_q_train,
        y_train
    )

    print("Training complete.")

    # --------------------------------------------------------
    # PREDICTION
    # --------------------------------------------------------

    predictions = qsvc.predict(X_q_test)

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

    # --------------------------------------------------------
    # STORE RESULTS
    # --------------------------------------------------------

    quantum_results[feature_count] = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "confusion_matrix": cm
    }

    # --------------------------------------------------------
    # PRINT RESULTS
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
print("FINAL CLASSICAL vs QUANTUM COMPARISON")
print("=" * 70)

print(
    f"{'Model':<18}"
    f"{'Features':<12}"
    f"{'Accuracy':<12}"
    f"{'Precision':<12}"
    f"{'Recall':<12}"
    f"{'F1':<12}"
)

print("-" * 70)

print(
    f"{'Random Forest':<18}"
    f"{78:<12}"
    f"{rf_accuracy:<12.4f}"
    f"{rf_precision:<12.4f}"
    f"{rf_recall:<12.4f}"
    f"{rf_f1:<12.4f}"
)

for feature_count, result in quantum_results.items():

    print(
        f"{'QSVC':<18}"
        f"{feature_count:<12}"
        f"{result['accuracy']:<12.4f}"
        f"{result['precision']:<12.4f}"
        f"{result['recall']:<12.4f}"
        f"{result['f1']:<12.4f}"
    )

print("=" * 70)