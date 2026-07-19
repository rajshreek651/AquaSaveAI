# AquaSave AI - One-Page Project Report

## Challenge

Water wastage from leaks, overwatering, and abnormal household consumption often remains invisible until the water bill rises. AquaSave AI helps a household, hostel, or small building identify potential waste early and decide what to inspect.

## Solution

AquaSave AI is a lightweight browser application that analyses hourly water-use data. It provides a trend view, explainable wastage alerts, source-based recommendations, a water-saving simulator, downloadable text report, and a Power BI-ready data workbook.

## Data and method

The prototype uses 336 simulated hourly records across 14 days for a four-person household. The simulation contains a six-hour overnight leak and a high garden-use event. The rule engine flags: (1) three or more overnight readings above 8 L/hour, and (2) readings at least 10 litres above the normal range for the same hour. The optional AI layer trains a lightweight 100-tree Isolation Forest on 2,160 generated baseline records and compares its anomalies with rule-based results.

## Key results

- 5,903.65 litres of total water use monitored
- 79.06 litres of potential wastage identified in 14 days
- 169.41 litres projected monthly water saving if the identified waste is prevented consistently
- Rs 5.08 projected monthly cost saving, using an editable Rs 0.03/litre assumption
- 0.085 kWh pumping energy and 0.059 kg CO2 projected monthly reduction
- The Isolation Forest matched both known simulated rule-based event types; its extra alerts show why real-data validation is still necessary

## Impact and scale-up

The project supports SDG 6: Clean Water and Sanitation. Its results are simulation-based projections, not verified utility savings or a formal lifecycle assessment. A future deployment can connect a smart meter or IoT flow sensor, replace assumptions with local tariff and electricity data, and validate the model against labelled real leaks.

## Technology

Python standard library, HTML/CSS/JavaScript, a dependency-free Isolation Forest, CSV, and Power BI-ready Excel data.
