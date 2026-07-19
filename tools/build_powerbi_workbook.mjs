import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(__dirname, "..");
const report = JSON.parse(await fs.readFile(path.join(project, "data", "analysis_report.json"), "utf8"));
const rawCsv = await fs.readFile(path.join(project, "data", "water_usage_simulated.csv"), "utf8");
const outputDir = path.join(project, "outputs");
await fs.mkdir(outputDir, { recursive: true });

const parseCsv = (csv) => csv.trim().split(/\r?\n/).map((line) => line.split(","));
const rawRows = parseCsv(rawCsv);
const rawData = rawRows.slice(1).map((row) => [row[0], row[1], Number(row[2]), Number(row[3]), row[4], row[5], Number(row[6])]);
const monthlyWaste = report.potential_waste_litres / 14 * 30;
const tariff = 0.03;
const pumpingEnergy = 0.5;
const emissionFactor = 0.7;

const wb = Workbook.create();
const dashboard = wb.worksheets.add("Dashboard");
const usage = wb.worksheets.add("Water Usage");
const daily = wb.worksheets.add("Daily Summary");
const sources = wb.worksheets.add("Source Summary");
const alerts = wb.worksheets.add("Alerts");
const impact = wb.worksheets.add("Impact Calculations");
const guide = wb.worksheets.add("Power BI Guide");

const titleStyle = { fill: "#063B49", font: { bold: true, color: "#FFFFFF", size: 16 }, horizontalAlignment: "left", verticalAlignment: "center" };
const headerStyle = { fill: "#0D9488", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center" };
const cardStyle = { fill: "#D9F5ED", font: { bold: true, color: "#063B49", size: 15 }, horizontalAlignment: "center", verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: "#91CFC0" } };
const subStyle = { fill: "#F2F7F6", font: { color: "#60767B" }, horizontalAlignment: "center", verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: "#D9E9E5" } };
for (const sheet of [dashboard, usage, daily, sources, alerts, impact, guide]) sheet.showGridLines = false;

// Raw water-use data for Power BI import.
usage.getRange("A1:G1").values = [["Timestamp", "Date", "Hour", "Litres Used", "Primary Source", "Event Label", "Occupants"]];
usage.getRange(`A2:G${rawData.length + 1}`).values = rawData;
usage.getRange("A1:G1").format = headerStyle;
usage.getRange(`A2:G${rawData.length + 1}`).format.wrapText = false;
usage.getRange(`B2:B${rawData.length + 1}`).format.numberFormat = "yyyy-mm-dd";
usage.getRange(`D2:D${rawData.length + 1}`).format.numberFormat = "#,##0.00";
usage.getRange("A:G").format.autofitColumns();
usage.getRange("A1:G1").format.rowHeight = 24;
usage.freezePanes.freezeRows(1);

// Aggregated tables help build charts immediately in Power BI or Excel.
daily.getRange("A1:B1").values = [["Date", "Total Litres"]];
daily.getRange(`A2:B${report.daily_totals.length + 1}`).values = report.daily_totals.map((item) => [item.date, item.litres]);
daily.getRange("A1:B1").format = headerStyle;
daily.getRange(`A2:A${report.daily_totals.length + 1}`).format.numberFormat = "yyyy-mm-dd";
daily.getRange(`B2:B${report.daily_totals.length + 1}`).format.numberFormat = "#,##0.00";
daily.getRange("A:B").format.autofitColumns();

sources.getRange("A1:B1").values = [["Primary Source", "Total Litres"]];
sources.getRange(`A2:B${report.source_totals.length + 1}`).values = report.source_totals.map((item) => [item.source, item.litres]);
sources.getRange("A1:B1").format = headerStyle;
sources.getRange(`B2:B${report.source_totals.length + 1}`).format.numberFormat = "#,##0.00";
sources.getRange("A:B").format.autofitColumns();

alerts.getRange("A1:F1").values = [["Alert Type", "Severity", "Period", "Potential Waste (L)", "Detection Rule", "Recommended Action"]];
alerts.getRange(`A2:F${report.alerts.length + 1}`).values = report.alerts.map((item) => [item.type, item.severity, item.period, item.potential_waste_litres, item.rule, item.recommendation]);
alerts.getRange("A1:F1").format = headerStyle;
alerts.getRange(`D2:D${report.alerts.length + 1}`).format.numberFormat = "#,##0.00";
alerts.getRange("A:F").format.autofitColumns();
alerts.getRange("E:F").format.columnWidth = 36;
alerts.getRange(`A2:F${report.alerts.length + 1}`).format.wrapText = true;

impact.getRange("A1:B1").values = [["Assumption", "Value"]];
impact.getRange("A2:B7").values = [
  ["Monitoring period (days)", 14],
  ["Water tariff (Rs per litre)", tariff],
  ["Pumping energy (kWh per 1,000 L)", pumpingEnergy],
  ["Electricity emission factor (kg CO2 per kWh)", emissionFactor],
  ["Detected potential waste in monitoring period (L)", report.potential_waste_litres],
  ["Total monitored water use in period (L)", report.total_litres],
];
impact.getRange("A8:B8").values = [["Projection", "Result"]];
impact.getRange("A9:A12").values = [["Projected monthly water saving (L)"], ["Projected monthly cost saving (Rs)"], ["Projected monthly pumping energy avoided (kWh)"], ["Projected monthly CO2 avoided (kg)"]];
impact.getRange("B9:B12").formulas = [["=B6/B2*30"], ["=B9*B3"], ["=B9/1000*B4"], ["=B11*B5"]];
impact.getRange("A1:B1").format = headerStyle;
impact.getRange("A8:B8").format = headerStyle;
impact.getRange("B3:B3").format.numberFormat = "Rs #,##0.00";
impact.getRange("B4:B7").format.numberFormat = "#,##0.000";
impact.getRange("B9:B12").format.numberFormat = "#,##0.000";
impact.getRange("A:B").format.autofitColumns();
impact.getRange("A:A").format.columnWidth = 44;

// Excel dashboard mirrors the intended Power BI page and validates the model.
dashboard.mergeCells("A1:L1");
dashboard.getRange("A1").values = [["AquaSave AI | Water Wastage Dashboard"]];
dashboard.getRange("A1:L1").format = titleStyle;
dashboard.getRange("A1:L1").format.rowHeight = 30;
dashboard.mergeCells("A2:L2");
dashboard.getRange("A2").values = [["Simulation-based monitoring for a four-person household | SDG 6: Clean Water and Sanitation"]];
dashboard.getRange("A2:L2").format = { font: { italic: true, color: "#60767B" }, horizontalAlignment: "left" };
const kpis = [
  ["Total monitored use", "='Impact Calculations'!B7"],
  ["Potential waste detected", "='Impact Calculations'!B6"],
  ["Projected monthly saving (L)", "='Impact Calculations'!B9"],
  ["Projected monthly CO2 avoided (kg)", "='Impact Calculations'!B12"],
];
const kpiCells = ["A4:C5", "D4:F5", "G4:I5", "J4:L5"];
const labels = ["A6:C6", "D6:F6", "G6:I6", "J6:L6"];
kpis.forEach(([label, formula], index) => {
  dashboard.mergeCells(kpiCells[index]); dashboard.mergeCells(labels[index]);
  dashboard.getRange(kpiCells[index].split(":")[0]).formulas = [[formula]];
  dashboard.getRange(kpiCells[index]).format = cardStyle;
  dashboard.getRange(labels[index].split(":")[0]).values = [[label]];
  dashboard.getRange(labels[index]).format = subStyle;
});
dashboard.getRange("A4:L6").format.numberFormat = "#,##0.00";
dashboard.getRange("A4:C5").format.numberFormat = "#,##0.00";
dashboard.getRange("D4:F5").format.numberFormat = "#,##0.00";
dashboard.getRange("G4:I5").format.numberFormat = "#,##0.00";
dashboard.getRange("J4:L5").format.numberFormat = "#,##0.000";
dashboard.getRange("A:L").format.columnWidth = 13;

const dailyChart = dashboard.charts.add("line", daily.getRange(`A1:B${report.daily_totals.length + 1}`));
dailyChart.title = "Daily Water Use (Litres)";
dailyChart.hasLegend = false;
dailyChart.setPosition("A8", "F22");
const sourceChart = dashboard.charts.add("doughnut", sources.getRange(`A1:B${report.source_totals.length + 1}`));
sourceChart.title = "Water Use by Source";
sourceChart.hasLegend = true;
sourceChart.setPosition("G8", "L22");

guide.getRange("A1:B1").values = [["Power BI build step", "Instruction"]];
guide.getRange("A2:B8").values = [
  ["1. Import", "Open Power BI Desktop > Get Data > Excel workbook > select this file."],
  ["2. Load tables", "Load Water Usage, Daily Summary, Source Summary, Alerts, and Impact Calculations."],
  ["3. KPI cards", "Use Sum of Total Litres, Sum of Potential Waste (L), and the projected values from Impact Calculations."],
  ["4. Trend visual", "Line chart: Daily Summary[Date] on X-axis; Daily Summary[Total Litres] on Y-axis."],
  ["5. Source visual", "Donut chart: Source Summary[Primary Source] as legend; Sum of Total Litres as values."],
  ["6. Alert table", "Table: Alert Type, Severity, Period, Potential Waste (L), Recommended Action. Apply conditional colour to Severity."],
  ["7. Story", "Add a text box: '79.06 L potential waste detected in 14 days. Repairing the leak and reviewing garden use can prevent repeat waste.'"],
];
guide.getRange("A1:B1").format = headerStyle;
guide.getRange("A:B").format.wrapText = true;
guide.getRange("A:A").format.columnWidth = 20;
guide.getRange("B:B").format.columnWidth = 80;
guide.getRange("A2:B8").format.rowHeight = 30;

const dashboardPreview = await wb.render({ sheetName: "Dashboard", range: "A1:L22", autoCrop: "all", scale: 1.5, format: "png" });
await fs.writeFile(path.join(outputDir, "AquaSaveAI_dashboard_preview.png"), new Uint8Array(await dashboardPreview.arrayBuffer()));
const xlsx = await SpreadsheetFile.exportXlsx(wb);
await xlsx.save(path.join(outputDir, "AquaSaveAI_PowerBI_Ready_Data.xlsx"));
console.log("Workbook created.");
