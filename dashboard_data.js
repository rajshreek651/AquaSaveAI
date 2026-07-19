window.AQUASAVE_DATA = {
  "project_name": "AquaSave AI",
  "monitoring_period": "2026-07-01 to 2026-07-14",
  "records_analysed": 336,
  "total_litres": 5903.65,
  "average_daily_litres": 421.69,
  "potential_waste_litres": 79.06,
  "estimated_cost_rs": 2.37,
  "estimated_energy_kwh": 0.04,
  "estimated_co2_kg": 0.028,
  "high_usage_threshold_note": "Hourly thresholds are calculated separately so normal morning peaks are not compared with overnight use.",
  "alerts": [
    {
      "type": "Possible continuous leak",
      "severity": "High",
      "rule": "At least 3 overnight readings were above 8 L/hour.",
      "period": "2026-07-06 00:00 to 2026-07-06 05:00",
      "potential_waste_litres": 62.2,
      "recommendation": "Inspect toilet flush tanks, taps, and concealed pipe connections."
    },
    {
      "type": "Unusually high one-hour use",
      "severity": "Medium",
      "rule": "Usage exceeded its normal 18:00 threshold of 109.0 L/hour.",
      "period": "2026-07-10 18:00",
      "potential_waste_litres": 16.86,
      "recommendation": "Check garden watering, washing cycles, and any tap left running."
    }
  ],
  "daily_totals": [
    {
      "date": "2026-07-01",
      "litres": 384.42
    },
    {
      "date": "2026-07-02",
      "litres": 381.38
    },
    {
      "date": "2026-07-03",
      "litres": 374.29
    },
    {
      "date": "2026-07-04",
      "litres": 419.75
    },
    {
      "date": "2026-07-05",
      "litres": 441.14
    },
    {
      "date": "2026-07-06",
      "litres": 475.07
    },
    {
      "date": "2026-07-07",
      "litres": 407.85
    },
    {
      "date": "2026-07-08",
      "litres": 371.93
    },
    {
      "date": "2026-07-09",
      "litres": 432.62
    },
    {
      "date": "2026-07-10",
      "litres": 502.93
    },
    {
      "date": "2026-07-11",
      "litres": 446.11
    },
    {
      "date": "2026-07-12",
      "litres": 435.85
    },
    {
      "date": "2026-07-13",
      "litres": 416.05
    },
    {
      "date": "2026-07-14",
      "litres": 414.26
    }
  ],
  "source_totals": [
    {
      "source": "Background use",
      "litres": 380.04
    },
    {
      "source": "Bathroom",
      "litres": 2371.72
    },
    {
      "source": "Kitchen",
      "litres": 317.99
    },
    {
      "source": "Garden",
      "litres": 496.19
    },
    {
      "source": "Kitchen/Bathroom",
      "litres": 2105.85
    },
    {
      "source": "Laundry",
      "litres": 148.66
    },
    {
      "source": "Possible tap/toilet leak",
      "litres": 83.2
    }
  ]
};
