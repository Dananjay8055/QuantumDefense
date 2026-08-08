from pathlib import Path


class DatasetExporter:

    @staticmethod
    def save(df, output_path):

        output_path = Path(output_path)

        output_path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        df.to_csv(
            output_path,
            index=False
        )

        print(f"\nSaved dataset to:\n{output_path}")