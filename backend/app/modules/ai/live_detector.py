import joblib
import pandas as pd

from app.modules.ai.feature_schema import FEATURE_COLUMNS
from app.modules.network.features import extract_flow_features


class LiveDetector:

    def __init__(self, model_path):
        self.model = joblib.load(model_path)

    def predict(self, flow, destination_port=0):

        features = extract_flow_features(
            flow,
            destination_port
        )

        data = pd.DataFrame(
            [[features[column] for column in FEATURE_COLUMNS]],
            columns=FEATURE_COLUMNS
        )

        prediction = int(
            self.model.predict(data)[0]
        )

        probability = self.model.predict_proba(data)[0]

        return {
            "prediction": prediction,
            "probability_benign": float(probability[0]),
            "probability_attack": float(probability[1])
        }