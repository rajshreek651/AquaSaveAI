# Step 3 - Data Analysis and Wastage Detection

The first prototype deliberately uses rules that can be explained to a non-technical user.

| Rule | Reason | Result shown to user |
| --- | --- | --- |
| Three or more overnight readings above 8 L/hour | Normal household use should be low at night; persistent flow can indicate a leak | High-severity possible leak alert |
| An hourly reading at least 10 L above its hour-of-day mean + three standard deviations | It is statistically unusual relative to the simulated household pattern, while small natural variation is ignored | Medium-severity high-use alert |

## Why rules before machine learning?

This dataset is small and simulated. An explainable baseline is more trustworthy than claiming complex AI without enough real training data. In a future phase, an Isolation Forest model can be compared against these rules using real smart-meter data.

## How to refresh the analysis

From the `AquaSaveAI` folder, run:

```powershell
python src/generate_data.py
python src/analyze_usage.py
```

The second command produces `data/analysis_report.json` and `web/dashboard_data.js`, which the browser dashboard reads.
