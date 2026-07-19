# Simulated Water-Use Data Dictionary

| Column | Meaning | Example |
| --- | --- | --- |
| `timestamp` | Start of the hourly observation | `2026-07-06 02:00` |
| `date` | Calendar date for grouping | `2026-07-06` |
| `hour` | Hour of day, 0-23 | `2` |
| `litres_used` | Simulated water consumed that hour | `13.42` |
| `primary_source` | Main simulated consumption source | `Bathroom` |
| `event_label` | Ground-truth simulation label; not used by detection rules | `Simulated overnight leak` |
| `occupants` | Number of household residents | `4` |

## Important academic note

`event_label` exists only to test whether the detection rules can find known simulated events. A real deployment would not have this label; it would instead use meter or sensor observations.
