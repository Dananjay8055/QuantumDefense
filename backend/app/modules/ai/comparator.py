import pandas as pd


class ModelComparator:

    @staticmethod
    def compare(results):

        df = pd.DataFrame(results)

        print("\n")
        print("=" * 70)
        print(df)
        print("=" * 70)

        return df