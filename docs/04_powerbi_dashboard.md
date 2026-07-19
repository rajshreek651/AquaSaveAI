# Step 5 - Power BI Dashboard

## What has been prepared

`AquaSaveAI_PowerBI_Ready_Data.xlsx` contains cleaned data and summary tables for direct Power BI import:

- **Water Usage**: 336 hourly records, the main fact table
- **Daily Summary**: daily litres used for the trend visual
- **Source Summary**: total use by primary source
- **Alerts**: each detected risk, its rule, and recommended action
- **Impact Calculations**: editable assumptions and monthly projection formulas
- **Dashboard**: an Excel preview of the intended Power BI layout
- **Power BI Guide**: concise visual-building instructions

## Recommended Power BI page layout

1. Four KPI cards: total monitored use, potential waste, projected monthly water saving, and projected CO2 avoided.
2. A line chart for daily water use.
3. A doughnut chart for water use by source.
4. An alert table with conditional colours for High and Medium severity.
5. A short text insight explaining the detected leak and garden-use event.

## Important project statement

The monthly impact is a projection from a 14-day simulation; it is not a real water bill or verified lifecycle assessment. This limitation should appear on your presentation's methodology slide.
