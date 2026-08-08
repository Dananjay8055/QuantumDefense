import numpy as np


class DataPreprocessor:

    @staticmethod
    def clean(df):

        # Work on a copy
        df = df.copy()

        # Remove leading/trailing spaces
        df.columns = df.columns.str.strip()

        # Remove duplicate rows
        df = df.drop_duplicates()

        # Replace infinite values
        df = df.replace([np.inf, -np.inf], np.nan)

        # Remove missing values
        df = df.dropna()

        return df