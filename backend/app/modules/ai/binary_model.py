from sklearn.ensemble import RandomForestClassifier


class BinaryModel:

    def __init__(self):

        self.model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            n_jobs=-1
        )

    def train(self, X_train, y_train):

        self.model.fit(X_train, y_train)

    def predict(self, X):

        return self.model.predict(X)