from app.modules.ai.dataset import DatasetLoader
from app.modules.ai.preprocessing import DataPreprocessor
from app.modules.ai.label_encoder import AttackLabelEncoder

loader = DatasetLoader(
    "../datasets/raw/CICIDS2017"
)

df = loader.load_all()

df = DataPreprocessor.clean(df)

encoder = AttackLabelEncoder()
df = encoder.fit_transform(df)
df = encoder.create_binary_label(df)

print(df[["Label", "BinaryLabel"]].head())

# Remove non-feature columns
X = df.drop(columns=[
    "Label",
    "Attack",
    "BinaryLabel",
    "dataset_file"
])

y_binary = df["BinaryLabel"]
y_multiclass = df["Attack"]

from app.modules.ai.exporter import DatasetExporter

DatasetExporter.save(
    df,
    "../datasets/processed/cicids2017_clean.csv"
)
print("Feature Matrix Shape:", X.shape)
print("Binary Target Shape:", y_binary.shape)
print("Multiclass Target Shape:", y_multiclass.shape)

print("\nFirst 10 Features:")
print(X.columns[:10].tolist())
print("\nAll Feature Columns:\n")

for i, col in enumerate(X.columns):
    print(i, col)

print("\nTotal Features:", len(X.columns))  