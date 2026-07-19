"""Apply transparent wastage-detection rules to AquaSave AI simulation data."""

from __future__ import annotations

import csv
import json
import statistics
from collections import defaultdict
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parents[1]
INPUT_PATH = PROJECT_DIR / "data" / "water_usage_simulated.csv"
REPORT_PATH = PROJECT_DIR / "data" / "analysis_report.json"
JS_PATH = PROJECT_DIR / "web" / "dashboard_data.js"

WATER_TARIFF_RS_PER_LITRE = 0.03
PUMPING_KWH_PER_1000_LITRES = 0.5
CO2_KG_PER_KWH = 0.7


def load_records() -> list[dict]:
    with INPUT_PATH.open(encoding="utf-8") as csv_file:
        return [
            {
                **row,
                "hour": int(row["hour"]),
                "litres_used": float(row["litres_used"]),
            }
            for row in csv.DictReader(csv_file)
        ]


def build_report(records: list[dict]) -> dict:
    litres = [row["litres_used"] for row in records]
    # A 06:00 bathroom peak should not be compared with quiet night-time use.
    # Establish a separate normal range for each hour of day.
    by_hour: defaultdict[int, list[float]] = defaultdict(list)
    for row in records:
        by_hour[row["hour"]].append(row["litres_used"])
    high_threshold_by_hour = {
        hour: statistics.mean(values) + 3 * statistics.pstdev(values)
        for hour, values in by_hour.items()
    }
    alerts = []

    # Rule 1: Any overnight flow greater than 8 L/hour is suspicious.
    overnight = [r for r in records if 0 <= r["hour"] <= 5 and r["litres_used"] > 8]
    if len(overnight) >= 3:
        suspected_litres = round(sum(r["litres_used"] - 3.5 for r in overnight), 2)
        alerts.append(
            {
                "type": "Possible continuous leak",
                "severity": "High",
                "rule": "At least 3 overnight readings were above 8 L/hour.",
                "period": f"{overnight[0]['timestamp']} to {overnight[-1]['timestamp']}",
                "potential_waste_litres": suspected_litres,
                "recommendation": "Inspect toilet flush tanks, taps, and concealed pipe connections.",
            }
        )

    # Rule 2: A one-hour reading far above normal consumption needs review.
    for row in records:
        hour_threshold = high_threshold_by_hour[row["hour"]]
        excess_litres = row["litres_used"] - hour_threshold
        # Ignore tiny natural variations even if they happen to cross a boundary.
        if excess_litres >= 10:
            alerts.append(
                {
                    "type": "Unusually high one-hour use",
                    "severity": "Medium",
                    "rule": f"Usage exceeded its normal {row['hour']:02d}:00 threshold of {hour_threshold:.1f} L/hour.",
                    "period": row["timestamp"],
                    "potential_waste_litres": round(excess_litres, 2),
                    "recommendation": "Check garden watering, washing cycles, and any tap left running.",
                }
            )

    daily_totals: defaultdict[str, float] = defaultdict(float)
    source_totals: defaultdict[str, float] = defaultdict(float)
    for row in records:
        daily_totals[row["date"]] += row["litres_used"]
        source_totals[row["primary_source"]] += row["litres_used"]

    potential_waste = round(sum(alert["potential_waste_litres"] for alert in alerts), 2)
    return {
        "project_name": "AquaSave AI",
        "monitoring_period": f"{records[0]['date']} to {records[-1]['date']}",
        "records_analysed": len(records),
        "total_litres": round(sum(litres), 2),
        "average_daily_litres": round(sum(litres) / len(daily_totals), 2),
        "potential_waste_litres": potential_waste,
        "estimated_cost_rs": round(potential_waste * WATER_TARIFF_RS_PER_LITRE, 2),
        "estimated_energy_kwh": round(potential_waste / 1000 * PUMPING_KWH_PER_1000_LITRES, 3),
        "estimated_co2_kg": round(potential_waste / 1000 * PUMPING_KWH_PER_1000_LITRES * CO2_KG_PER_KWH, 3),
        "high_usage_threshold_note": "Hourly thresholds are calculated separately so normal morning peaks are not compared with overnight use.",
        "alerts": alerts,
        "daily_totals": [{"date": date, "litres": round(total, 2)} for date, total in daily_totals.items()],
        "source_totals": [{"source": source, "litres": round(total, 2)} for source, total in source_totals.items()],
    }


if __name__ == "__main__":
    report = build_report(load_records())
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    JS_PATH.write_text("window.AQUASAVE_DATA = " + json.dumps(report, indent=2) + ";\n", encoding="utf-8")
    print(f"Analysed {report['records_analysed']} records and found {len(report['alerts'])} alerts.")
    print(f"Report saved to: {REPORT_PATH}")
