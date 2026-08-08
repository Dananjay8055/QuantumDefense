import json
from pathlib import Path
from datetime import datetime


class ExperimentLogger:

    BASE_DIR = Path("../experiments")

    @classmethod
    def save_metrics(cls, model_name, metrics):

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        run_dir = cls.BASE_DIR / f"{model_name}_{timestamp}"

        run_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        with open(run_dir / "metrics.json", "w") as f:
            json.dump(metrics, f, indent=4)

        return run_dir