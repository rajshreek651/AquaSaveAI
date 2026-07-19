# AquaSave AI

**AquaSave AI** is a lightweight water-wastage detection and conservation application for a household, hostel, or small building. It uses simulated hourly water-use data so that the full project can run on a low-spec laptop without sensors, cloud services, or large AI models.

## The real-world challenge

Leaks, inefficient fixtures, and unusual water consumption often go unnoticed until a water bill arrives. The result is wasted water, unnecessary pumping energy, and avoidable cost.

## Project goal

Help a user identify likely wastage, understand its impact, and simulate practical conservation actions.

## Minimum viable product

- Simulated hourly consumption data for a 14-day period
- Explainable rules for possible leak and abnormal-usage alerts
- A browser dashboard to view usage and results
- A conservation simulator for leak repair and shorter showers
- Estimated water, cost, energy, and CO2 savings
- CSV upload and locally generated downloadable analysis report
- A lightweight Isolation Forest evaluation alongside explainable rules
- A Power BI-ready workbook and impact assessment report

## Laptop-friendly technology choices

| Need | Choice | Why |
| --- | --- | --- |
| Data generation | Python standard library | No package installation needed |
| Data analysis | Explainable threshold rules | Easy to explain and validate |
| Application | HTML, CSS, JavaScript | Opens in any browser and is lightweight |
| Dashboard upgrade | Power BI (optional) | Import the generated CSV if available |
| AI upgrade | Isolation Forest / Hugging Face API (future) | Add only after the basic version is validated |

## Folder structure

- `data/`: simulated water-use records and a data dictionary
- `src/generate_data.py`: repeatable simulation-data generator
- `web/`: the browser application
- `docs/`: project definition and build progress
- `portfolio/`: one-page report, demo script, and assignment-roadmap mapping
- `outputs/`: final report, Power BI workbook, and screenshots

## Run the project

1. Generate or refresh the data: `python src/generate_data.py`
2. Open `web/index.html` in a browser.

The application currently uses no external libraries. Later phases can add a Python/Streamlit version when the laptop is ready for it.

## Optional AI evaluation

Run the lightweight, dependency-free Isolation Forest evaluation:

```powershell
python src/isolation_forest.py
```

It creates `data/ml_evaluation.json` and `web/ai_analysis_data.js`. This is a prototype comparison on generated records, not evidence of production accuracy.

## Portfolio assets

- [One-page project report](portfolio/One_Page_Project_Report.md)
- [Two-minute demo script](portfolio/Two_Minute_Demo_Script.md)
- [Architecture](docs/06_architecture.md)
- [Assignment-roadmap mapping](portfolio/Assignment_Roadmap_Mapping.md)
