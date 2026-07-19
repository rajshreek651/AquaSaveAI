"""A small dependency-free Isolation Forest for AquaSave AI.

This implementation is intentionally lightweight: it uses generated historical
records rather than a large Kaggle download, so it can run on a low-spec laptop.
It applies the Isolation Forest idea of repeatedly making random feature splits;
shorter average paths receive higher anomaly scores.
"""

from __future__ import annotations

import csv
import json
import math
import random
from datetime import datetime, timedelta
from pathlib import Path


PROJECT = Path(__file__).resolve().parents[1]
INPUT = PROJECT / "data" / "water_usage_simulated.csv"
OUTPUT = PROJECT / "data" / "ml_evaluation.json"
WEB_OUTPUT = PROJECT / "web" / "ai_analysis_data.js"
RANDOM_SEED = 19


class Node:
    def __init__(self, size: int, feature: int | None = None, split: float | None = None, left=None, right=None):
        self.size, self.feature, self.split, self.left, self.right = size, feature, split, left, right


def c_factor(n: int) -> float:
    if n <= 1:
        return 0.0
    if n == 2:
        return 1.0
    return 2 * (math.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n)


def build_tree(rows: list[list[float]], height: int, height_limit: int, rng: random.Random) -> Node:
    if height >= height_limit or len(rows) <= 1:
        return Node(len(rows))
    usable = [index for index in range(len(rows[0])) if min(row[index] for row in rows) < max(row[index] for row in rows)]
    if not usable:
        return Node(len(rows))
    feature = rng.choice(usable)
    low, high = min(row[feature] for row in rows), max(row[feature] for row in rows)
    split = rng.uniform(low, high)
    left, right = [row for row in rows if row[feature] < split], [row for row in rows if row[feature] >= split]
    if not left or not right:
        return Node(len(rows))
    return Node(len(rows), feature, split, build_tree(left, height + 1, height_limit, rng), build_tree(right, height + 1, height_limit, rng))


def path_length(row: list[float], node: Node, depth: int = 0) -> float:
    if node.feature is None:
        return depth + c_factor(node.size)
    branch = node.left if row[node.feature] < node.split else node.right
    return path_length(row, branch, depth + 1)


def features(litres: float, hour: int, hourly_baseline: dict[int, float]) -> list[float]:
    # The deviation from the hour-specific baseline prevents normal morning
    # peaks being treated the same way as unusual overnight flow.
    angle = hour / 24 * 2 * math.pi
    return [litres - hourly_baseline[hour], math.sin(angle), math.cos(angle)]


def normal_litres(hour: int, weekday: int, rng: random.Random) -> float:
    if 6 <= hour <= 8:
        return rng.uniform(42, 68)
    if 19 <= hour <= 21:
        return rng.uniform(38, 62)
    if hour == 13:
        return rng.uniform(15, 28)
    if hour == 10 and weekday >= 5:
        return rng.uniform(30, 55)
    if 17 <= hour <= 18:
        return rng.uniform(8, 20)
    return rng.uniform(0.3, 3.5)


def generated_history() -> list[tuple[float, int]]:
    rng = random.Random(RANDOM_SEED)
    start = datetime(2026, 1, 1)
    return [(normal_litres((start + timedelta(hours=i)).hour, (start + timedelta(hours=i)).weekday(), rng), (start + timedelta(hours=i)).hour) for i in range(90 * 24)]


def load_current_records() -> list[dict]:
    with INPUT.open(encoding="utf-8") as source:
        return [{**row, "hour": int(row["hour"]), "litres_used": float(row["litres_used"])} for row in csv.DictReader(source)]


def percentile(values: list[float], fraction: float) -> float:
    ordered = sorted(values)
    index = max(0, min(len(ordered) - 1, math.ceil(fraction * len(ordered)) - 1))
    return ordered[index]


def run() -> dict:
    rng = random.Random(RANDOM_SEED)
    historical = generated_history()
    hourly_baseline = {hour: sum(litres for litres, record_hour in historical if record_hour == hour) / 90 for hour in range(24)}
    training = [features(litres, hour, hourly_baseline) for litres, hour in historical]
    sample_size, tree_count = 256, 100
    height_limit = math.ceil(math.log2(sample_size))
    trees = [build_tree(rng.sample(training, sample_size), 0, height_limit, rng) for _ in range(tree_count)]

    def score(row: list[float]) -> float:
        average_path = sum(path_length(row, tree) for tree in trees) / len(trees)
        return 2 ** (-average_path / c_factor(sample_size))

    threshold = percentile([score(row) for row in training], 0.98)
    current = load_current_records()
    results = [{"timestamp": item["timestamp"], "score": round(score(features(item["litres_used"], item["hour"], hourly_baseline)), 4), "litres_used": item["litres_used"]} for item in current]
    anomalies = [item for item in results if item["score"] >= threshold]
    known_rule_windows = [
        lambda stamp: stamp.startswith("2026-07-06 0"),
        lambda stamp: stamp == "2026-07-10 18:00",
    ]
    matches = sum(any(window(item["timestamp"]) for item in anomalies) for window in known_rule_windows)
    return {
        "model_name": "Lightweight Isolation Forest (100 random trees)",
        "training_records": len(training),
        "records_evaluated": len(current),
        "threshold": round(threshold, 4),
        "ml_alert_count": len(anomalies),
        "rule_alert_count": 2,
        "rule_alert_matches": matches,
        "ml_alerts": anomalies,
        "limitation": "The model is trained on generated baseline records. It demonstrates the workflow but must be retrained and validated with real meter data before operational use.",
    }


if __name__ == "__main__":
    report = run()
    OUTPUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    WEB_OUTPUT.write_text("window.AQUASAVE_AI_DATA = " + json.dumps(report, indent=2) + ";\n", encoding="utf-8")
    print(f"AI evaluation complete: {report['ml_alert_count']} ML alerts; {report['rule_alert_matches']}/{report['rule_alert_count']} rule patterns matched.")
