from sklearn.preprocessing import LabelEncoder


class AttackLabelEncoder:

    def __init__(self):
        self.encoder = LabelEncoder()

    def fit_transform(self, df):

        df = df.copy()

        df["Attack"] = self.encoder.fit_transform(df["Label"])

        return df

    def classes(self):

        return list(self.encoder.classes_)
    def create_binary_label(self, df):

        df = df.copy()

        df["BinaryLabel"] = (
            df["Label"] != "BENIGN"
        ).astype(int)

        return df