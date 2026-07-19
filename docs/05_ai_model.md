# Step 6 - Optional AI: Lightweight Isolation Forest

## Why generated records instead of a Kaggle dataset?

The project uses a 90-day generated baseline (2,160 hourly records) because it is reproducible, private, and light enough for a low-spec laptop. This is an acceptable prototype choice when labelled local smart-meter data is unavailable.

## Model design

- **Model:** dependency-free Isolation Forest with 100 random trees
- **Features:** litres used, sine of hour, cosine of hour
- **Training data:** generated normal household-use baseline
- **Decision rule:** flag readings above the 98th percentile of baseline anomaly scores

The model isolates unusual readings through random splits. A record with a shorter average path across the trees receives a higher anomaly score.

## Evaluation method

The simulated 14-day test set contains two known cases: a sustained overnight leak and unusually high garden use. The project compares the ML alerts with the existing rule-based alerts. This measures **agreement on simulated events**, not real-world accuracy.

## Important limitation

Do not claim that the model is production-ready or highly accurate. Before deployment, collect local smart-meter data, label verified leaks/normal usage, tune the anomaly threshold, and measure precision and recall.
