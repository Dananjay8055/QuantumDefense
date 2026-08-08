import pandas as pd

from app.modules.ai.benchmark import Benchmark

MODELS = [
    "random_forest",
    "extra_trees"
]

print("Loading dataset...")

df = pd.read_csv(
    "../datasets/processed/cicids2017_clean.csv"
)

# Development sample
df = df.sample(
    n=100000,
    random_state=42
)

benchmark = Benchmark(df)

results = benchmark.run(MODELS)

print("\n")
print("=" * 70)
print("FINAL RESULTS")
print("=" * 70)

print(results)

results.to_csv(
    "../experiments/model_comparison.csv",
    index=False
)

print("\nComparison saved successfully.")