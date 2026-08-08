from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)


class Evaluator:

    @staticmethod
    def evaluate(y_true, y_pred):

        metrics = {

            "Accuracy": accuracy_score(y_true, y_pred),

            "Precision": precision_score(y_true, y_pred),

            "Recall": recall_score(y_true, y_pred),

            "F1": f1_score(y_true, y_pred),

            "ROC_AUC": roc_auc_score(y_true, y_pred)

        }

        print()

        for key, value in metrics.items():

            print(f"{key:<12}: {value:.4f}")

        print()

        print(confusion_matrix(
            y_true,
            y_pred
        ))

        return metrics