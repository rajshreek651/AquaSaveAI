let currentData = window.AQUASAVE_DATA;
const TARIFF = 0.03;
const PUMPING_KWH_PER_1000L = 0.5;
const CO2_KG_PER_KWH = 0.7;
const money = value => `Rs ${Number(value).toFixed(2)}`;

function setText(id, text) { document.getElementById(id).textContent = text; }
function round(value) { return Math.round(value * 100) / 100; }
function mean(values) { return values.reduce((sum, value) => sum + value, 0) / values.length; }
function stdev(values) { const avg = mean(values); return Math.sqrt(mean(values.map(value => (value - avg) ** 2))); }

function recommendationFor(source) {
  const value = String(source).toLowerCase();
  if (value.includes('toilet') || value.includes('bathroom')) return 'Inspect toilet flush tanks, taps, and shower fittings for continuous flow.';
  if (value.includes('garden')) return 'Review garden-watering duration, timing, and hose shut-off practices.';
  if (value.includes('laundry')) return 'Check washing-machine cycle selection and run full loads where possible.';
  if (value.includes('kitchen')) return 'Check kitchen taps and avoid leaving water running during cleaning.';
  return 'Inspect taps, fixtures, and recent water-use activities.';
}

function analyzeRecords(records) {
  const byHour = {};
  const daily = {};
  const sources = {};
  records.forEach(record => {
    byHour[record.hour] ??= [];
    byHour[record.hour].push(record.litres_used);
    daily[record.date] = (daily[record.date] || 0) + record.litres_used;
    sources[record.primary_source] = (sources[record.primary_source] || 0) + record.litres_used;
  });
  const thresholds = Object.fromEntries(Object.entries(byHour).map(([hour, values]) => [hour, mean(values) + 3 * stdev(values)]));
  const overnight = records.filter(record => record.hour <= 5 && record.litres_used > 8);
  const alerts = [];
  if (overnight.length >= 3) {
    const waste = round(overnight.reduce((sum, record) => sum + Math.max(record.litres_used - 3.5, 0), 0));
    alerts.push({ type: 'Possible continuous leak', severity: 'High', period: `${overnight[0].timestamp} to ${overnight[overnight.length - 1].timestamp}`, potential_waste_litres: waste, rule: 'At least 3 overnight readings were above 8 L/hour.', recommendation: recommendationFor(overnight[0].primary_source) });
  }
  records.forEach(record => {
    const excess = record.litres_used - thresholds[record.hour];
    if (excess >= 10) alerts.push({ type: 'Unusually high one-hour use', severity: 'Medium', period: record.timestamp, potential_waste_litres: round(excess), rule: `Usage exceeded the normal ${String(record.hour).padStart(2, '0')}:00 range by at least 10 L.`, recommendation: recommendationFor(record.primary_source) });
  });
  const total = records.reduce((sum, record) => sum + record.litres_used, 0);
  const potentialWaste = round(alerts.reduce((sum, alert) => sum + alert.potential_waste_litres, 0));
  const dates = Object.keys(daily).sort();
  return {
    project_name: 'AquaSave AI', monitoring_period: `${dates[0]} to ${dates[dates.length - 1]}`, records_analysed: records.length,
    total_litres: round(total), average_daily_litres: round(total / dates.length), potential_waste_litres: potentialWaste,
    estimated_cost_rs: round(potentialWaste * TARIFF), estimated_energy_kwh: round(potentialWaste / 1000 * PUMPING_KWH_PER_1000L), estimated_co2_kg: round(potentialWaste / 1000 * PUMPING_KWH_PER_1000L * CO2_KG_PER_KWH),
    alerts, daily_totals: dates.map(date => ({ date, litres: round(daily[date]) })), source_totals: Object.entries(sources).map(([source, litres]) => ({ source, litres: round(litres) })),
  };
}

function renderSummary(data) {
  setText('monitoring-period', `Monitoring period: ${data.monitoring_period}`);
  setText('total-use', data.total_litres.toLocaleString());
  setText('daily-use', data.average_daily_litres.toLocaleString());
  setText('potential-waste', data.potential_waste_litres.toLocaleString());
  setText('alert-count', data.alerts.length);
  setText('cost-impact', money(data.estimated_cost_rs));
  setText('energy-impact', data.estimated_energy_kwh);
  setText('co2-impact', data.estimated_co2_kg);
}

function renderChart(data) {
  const chart = document.getElementById('daily-chart');
  chart.replaceChildren();
  const max = Math.max(...data.daily_totals.map(item => item.litres));
  data.daily_totals.forEach(item => { const bar = document.createElement('div'); bar.className = 'bar'; bar.style.height = `${Math.max(6, item.litres / max * 100)}%`; bar.dataset.label = `${item.date}: ${item.litres} L`; chart.appendChild(bar); });
}

function renderAlerts(data) {
  const container = document.getElementById('alerts');
  container.replaceChildren();
  if (!data.alerts.length) { container.textContent = 'No possible wastage patterns were detected using the current rules.'; return; }
  data.alerts.forEach(alert => { const card = document.createElement('div'); card.className = `alert ${alert.severity.toLowerCase()}`; card.innerHTML = `<span class="badge">${alert.severity} priority</span><h3>${alert.type}</h3><p><b>When:</b> ${alert.period}</p><p><b>Reason:</b> ${alert.rule}</p><p><b>Action:</b> ${alert.recommendation}</p>`; container.appendChild(card); });
}

function updateSimulator() {
  const leak = Number(document.getElementById('leak-slider').value); const shower = Number(document.getElementById('shower-slider').value); const total = leak + shower;
  setText('leak-value', leak); setText('shower-value', shower); setText('simulation-litres', total.toLocaleString()); setText('simulation-impact', `${money(total * TARIFF)} and ${(total / 1000 * PUMPING_KWH_PER_1000L * CO2_KG_PER_KWH).toFixed(2)} kg CO2 avoided per month (using project assumptions).`);
}

function render(data) { currentData = data; renderSummary(data); renderChart(data); renderAlerts(data); updateSimulator(); }

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean); const headers = lines.shift().split(',').map(value => value.trim());
  const required = ['timestamp', 'date', 'hour', 'litres_used', 'primary_source'];
  if (!required.every(header => headers.includes(header))) throw new Error(`CSV needs these columns: ${required.join(', ')}`);
  return lines.map(line => { const values = line.split(','); const row = Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || ''])); return { ...row, hour: Number(row.hour), litres_used: Number(row.litres_used) }; }).filter(row => Number.isFinite(row.hour) && Number.isFinite(row.litres_used));
}

document.getElementById('csv-upload').addEventListener('change', event => {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { try { const records = parseCsv(reader.result); if (!records.length) throw new Error('The CSV has no valid data rows.'); render(analyzeRecords(records)); setText('upload-status', `Analysed ${records.length} uploaded records locally in your browser.`); } catch (error) { setText('upload-status', `Upload error: ${error.message}`); } };
  reader.readAsText(file);
});

document.getElementById('download-report').addEventListener('click', () => {
  const lines = ['AquaSave AI - Water Wastage Analysis Report', `Monitoring period: ${currentData.monitoring_period}`, `Records analysed: ${currentData.records_analysed}`, `Potential waste: ${currentData.potential_waste_litres} L`, `Estimated cost impact: ${money(currentData.estimated_cost_rs)}`, `Estimated pumping energy impact: ${currentData.estimated_energy_kwh} kWh`, `Estimated CO2 impact: ${currentData.estimated_co2_kg} kg`, '', 'Alerts and recommendations:'];
  currentData.alerts.forEach((alert, index) => lines.push(`${index + 1}. ${alert.type} (${alert.severity}) | ${alert.period} | ${alert.potential_waste_litres} L | ${alert.recommendation}`));
  lines.push('', 'Note: This report uses transparent simulation assumptions and is not a formal lifecycle assessment.');
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'aquasave_analysis_report.txt'; link.click(); URL.revokeObjectURL(url);
});

function renderAiStatus() {
  const ai = window.AQUASAVE_AI_DATA; if (!ai) { setText('ai-status', 'AI evaluation will appear after the model script is run.'); return; }
  setText('ai-status', `${ai.model_name}: ${ai.records_evaluated} records evaluated`);
  setText('ai-summary', `The model flagged ${ai.ml_alert_count} records. It matched ${ai.rule_alert_matches} of ${ai.rule_alert_count} rule-based alerts; agreement is reported for evaluation only, because this is simulated data.`);
}

document.addEventListener('pointerdown', event => {
  if (event.target.closest('button, input, label, a')) return;
  const ripple = document.createElement('span');
  ripple.className = 'click-ripple';
  ripple.style.left = `${event.clientX}px`;
  ripple.style.top = `${event.clientY}px`;
  document.body.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

render(currentData); renderAiStatus(); document.querySelectorAll('.simulator input').forEach(input => input.addEventListener('input', updateSimulator));
