from sklearn.feature_selection import VarianceThreshold


class FeatureSelector:

    def __init__(self, threshold=0.0):
        self.selector = VarianceThreshold(threshold)

    def fit_transform(self, X):
        return self.selector.fit_transform(X)

    def get_selected_features(self, feature_names):
        mask = self.selector.get_support()
        return feature_names[mask]