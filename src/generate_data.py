"""Generate a small, reproducible household water-use simulation for AquaSave AI.

The data includes normal use, an overnight leak, and one high garden-use event.
It deliberately uses only Python's standard library so it can run on low-spec laptops.
"""

from __future__ import annotations

import csv
import random
from datetime import datetime, timedelta
from pathlib import Path


RANDOM_SEED = 42
START_TIME = datetime(2026, 7, 1)
DAYS = 14
OUTPUT_PATH = Path(__file__).resolve().parents[1] / "data" / "water_usage_simulated.csv"


def normal_usage_for_hour(hour: int, weekday: int) -> tuple[float, str]:
    """Return typical litres used during an hour and the most likely source."""
    if 6 <= hour <= 8:
        return random.uniform(42, 68), "Bathroom"
    if 19 <= hour <= 21:
        return random.uniform(38, 62), "Kitchen/Bathroom"
    if hour == 13:
        return random.uniform(15, 28), "Kitchen"
    if hour == 10 and weekday >= 5:
        return random.uniform(30, 55), "Laundry"
    if 17 <= hour <= 18:
        return random.uniform(8, 20), "Garden"
    return random.uniform(0.3, 3.5), "Background use"


def create_records() -> list[dict[str, str | float | int]]:
    random.seed(RANDOM_SEED)
    rows: list[dict[str, str | float | int]] = []

    # Leak: 12 L/hour from 00:00 through 05:00 on 6 July.
    leak_start = datetime(2026, 7, 6, 0)
    leak_end = datetime(2026, 7, 6, 6)
    # High garden consumption: 18:00 on 10 July.
    garden_event = datetime(2026, 7, 10, 18)

    for offset in range(DAYS * 24):
        timestamp = START_TIME + timedelta(hours=offset)
        litres, source = normal_usage_for_hour(timestamp.hour, timestamp.weekday())
        event = "Normal"

        if leak_start <= timestamp < leak_end:
            litres += 12.0
            source = "Possible tap/toilet leak"
            event = "Simulated overnight leak"
        elif timestamp == garden_event:
            litres += 115.0
            source = "Garden"
            event = "Simulated high garden use"

        rows.append(
            {
                "timestamp": timestamp.strftime("%Y-%m-%d %H:%M"),
                "date": timestamp.strftime("%Y-%m-%d"),
                "hour": timestamp.hour,
                "litres_used": round(litres, 2),
                "primary_source": source,
                "event_label": event,
                "occupants": 4,
            }
        )
    return rows


def write_csv(rows: list[dict[str, str | float | int]]) -> None:
    OUTPUT_PATH.parent.mkdir(exist_ok=True)
    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    records = create_records()
    write_csv(records)
    print(f"Created {len(records)} hourly records at: {OUTPUT_PATH}")
