import pandas as pd


class DataInspector:

    @staticmethod
    def summary(df):

        print("=" * 80)
        print("Shape")
        print(df.shape)

        print("\n" + "=" * 80)
        print("Missing Values")
        print(df.isnull().sum())

        print("\n" + "=" * 80)
        print("Data Types")
        print(df.dtypes)

        print("\n" + "=" * 80)
        print("Label Distribution")
        print(df[" Label"].value_counts())

        print("\n" + "=" * 80)
        print("Duplicate Rows")
        print(df.duplicated().sum())