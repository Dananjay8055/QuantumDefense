from pathlib import Path
import pandas as pd


class DatasetLoader:

    def __init__(self, dataset_dir: str):
        self.dataset_dir = Path(dataset_dir)

    def get_csv_files(self):
        return sorted(self.dataset_dir.glob("*.csv"))

    def load_all(self):

        frames = []

        for csv_file in self.get_csv_files():

            print(f"Loading {csv_file.name}")

            df = pd.read_csv(csv_file)

            df["dataset_file"] = csv_file.name

            frames.append(df)

        merged = pd.concat(
            frames,
            ignore_index=True
        )

        return merged