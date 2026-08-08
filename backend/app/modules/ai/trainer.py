from sklearn.model_selection import train_test_split


class Trainer:

    @staticmethod
    def split(X, y):

        return train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=y
        )