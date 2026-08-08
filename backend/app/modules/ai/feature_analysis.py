import pandas as pd


class FeatureAnalyzer:

    @staticmethod
    def feature_importance(model, feature_names):

        if not hasattr(model, "feature_importances_"):
            print("Model does not support feature importance.")
            return

        importance = pd.DataFrame({
            "Feature": feature_names,
            "Importance": model.feature_importances_
        })

        importance = importance.sort_values(
            by="Importance",
            ascending=False
        )

        return importance