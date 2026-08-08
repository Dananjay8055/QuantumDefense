import joblib
from pathlib import Path


class ModelRegistry:

    MODEL_DIR = Path("../models")

    @classmethod
    def save(cls, model, filename):

        cls.MODEL_DIR.mkdir(
            parents=True,
            exist_ok=True
        )

        model_path = cls.MODEL_DIR / filename

        joblib.dump(
            model,
            model_path
        )

        print(f"\nModel saved:\n{model_path}")