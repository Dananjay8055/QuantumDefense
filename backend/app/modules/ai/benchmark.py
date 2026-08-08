import time
import pandas as pd

from app.modules.ai.model_factory import ModelFactory
from app.modules.ai.evaluator import Evaluator
from app.modules.ai.model_registry import ModelRegistry
from app.modules.ai.experiment_logger import ExperimentLogger
from app.modules.ai.report_generator import ReportGenerator
from app.modules.ai.feature_analysis import FeatureAnalyzer
from app.modules.ai.trainer import Trainer


class Benchmark:

    def __init__(self, dataframe):
        self.df = dataframe

    def run(self, models):

        X = self.df.drop(
            columns=[
                "Label",
                "Attack",
                "BinaryLabel",
                "dataset_file"
            ]
        )

        y = self.df["BinaryLabel"]

        X_train, X_test, y_train, y_test = Trainer.split(X, y)

        results = []

        for model_name in models:

            print("\n" + "=" * 60)
            print(f"Training {model_name}")
            print("=" * 60)

            model = ModelFactory.create(model_name)

            start = time.time()

            model.fit(X_train, y_train)

            train_time = time.time() - start

            start = time.time()

            predictions = model.predict(X_test)

            prediction_time = time.time() - start

            metrics = Evaluator.evaluate(
                y_test,
                predictions
            )

            metrics["Model"] = model_name
            metrics["Train Time (s)"] = round(train_time, 2)
            metrics["Prediction Time (s)"] = round(prediction_time, 4)

            run_dir = ExperimentLogger.save_metrics(
                model_name,
                metrics
            )

            importance = FeatureAnalyzer.feature_importance(
                model,
                X.columns
            )

            ReportGenerator.save_feature_importance(
                importance,
                run_dir
            )

            ReportGenerator.save_summary(
                metrics,
                run_dir
            )

            ModelRegistry.save(
                model,
                f"{model_name}.joblib"
            )

            print("\nTop 15 Features\n")
            print(importance.head(15))

            results.append(metrics)

        return pd.DataFrame(results)