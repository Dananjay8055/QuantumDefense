import pandas as pd

from app.modules.ai.trainer import Trainer
from app.modules.ai.model_factory import ModelFactory
from app.modules.ai.evaluator import Evaluator
from app.modules.ai.model_registry import ModelRegistry
from app.modules.ai.experiment_logger import ExperimentLogger

print("Loading dataset...")

df = pd.read_csv(
    "../datasets/processed/cicids2017_clean.csv"
)

# ---------- Development Sample ----------
df = df.sample(
    n=100000,
    random_state=42
)

X = df.drop(
    columns=[
        "Label",
        "Attack",
        "BinaryLabel",
        "dataset_file"
    ]
)

y = df["BinaryLabel"]

X_train, X_test, y_train, y_test = Trainer.split(X, y)

print("\nTraining Random Forest...\n")

model = ModelFactory.create("random_forest")

model.fit(
    X_train,
    y_train
)

predictions = model.predict(X_test)

metrics = Evaluator.evaluate(
    y_test,
    predictions
)

ModelRegistry.save(
    model,
    "binary_detector.joblib"
)

run_dir = ExperimentLogger.save_metrics(
    "random_forest",
    metrics
)

print(f"\nExperiment saved in:\n{run_dir}")