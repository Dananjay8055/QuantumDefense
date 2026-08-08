from pathlib import Path


class ReportGenerator:

    @staticmethod
    def save_feature_importance(df, run_dir):

        run_dir = Path(run_dir)

        run_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        df.to_csv(
            run_dir / "feature_importance.csv",
            index=False
        )

    @staticmethod
    def save_summary(metrics, run_dir):

        run_dir = Path(run_dir)

        with open(run_dir / "summary.txt", "w") as file:

            file.write("QuantumDefense AI Report\n")
            file.write("=" * 40 + "\n\n")

            for key, value in metrics.items():
                file.write(f"{key}: {value}\n")