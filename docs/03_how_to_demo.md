# How to Run and Demonstrate AquaSave AI

## Run locally

Open PowerShell in the `AquaSaveAI` folder and run:

```powershell
python src/generate_data.py
python src/analyze_usage.py
```

Then double-click `web/index.html`. No packages, cloud account, sensor, or heavy software is needed.

## A simple two-minute demonstration script

1. **Challenge:** “Water waste is often invisible until the bill arrives.”
2. **Data:** “I simulated 14 days of hourly use for a four-person household, including realistic normal peaks.”
3. **Detection:** “The system flags sustained overnight flow as a possible leak and compares each hour with its normal pattern to identify unusual use.”
4. **Result:** “It correctly identifies the simulated overnight leak and high garden-use incident. Every alert explains why it was raised and what to inspect.”
5. **Action:** “The simulator shows how fixing a leak and reducing shower use could save water, money, pumping energy, and associated carbon emissions.”
6. **Scale-up:** “With a smart meter, the same pipeline could use real readings; with more data, the rules can be compared with an anomaly-detection model.”

## What to say about AI honestly

The current prototype is **AI-enabled in its roadmap**, but the first detection layer is rule-based and explainable. This is the correct technical decision for a small simulated dataset. The next optional phase is to train an `IsolationForest` anomaly detector on more real or Kaggle data and compare its alerts against the existing rules.
