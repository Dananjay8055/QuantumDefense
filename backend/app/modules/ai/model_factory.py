from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
    HistGradientBoostingClassifier
)

try:
    from xgboost import XGBClassifier
except ImportError:
    XGBClassifier = None

try:
    from lightgbm import LGBMClassifier
except ImportError:
    LGBMClassifier = None


class ModelFactory:

    @staticmethod
    def create(model_name):

        if model_name == "random_forest":
            return RandomForestClassifier(
                n_estimators=100,
                random_state=42,
                n_jobs=-1
            )

        elif model_name == "extra_trees":
            return ExtraTreesClassifier(
                n_estimators=100,
                random_state=42,
                n_jobs=-1
            )

        elif model_name == "hist_gradient":
            return HistGradientBoostingClassifier(
                random_state=42
            )

        elif model_name == "xgboost":

            if XGBClassifier is None:
                raise ImportError("Install xgboost first.")

            return XGBClassifier(
                random_state=42,
                eval_metric="logloss"
            )

        elif model_name == "lightgbm":

            if LGBMClassifier is None:
                raise ImportError("Install lightgbm first.")

            return LGBMClassifier(
                random_state=42
            )

        raise ValueError(model_name)