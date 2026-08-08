import json
from pathlib import Path


class MetricsManager:

    @staticmethod
    def save(metrics, run_dir):

        path = Path(run_dir) / "metrics.json"

        with open(path, "w") as f:
            json.dump(metrics, f, indent=4)

    @staticmethod
    def load(run_dir):

        path = Path(run_dir) / "metrics.json"

        with open(path) as f:
            return json.load(f)