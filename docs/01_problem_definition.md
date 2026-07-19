# Step 1 - Problem Definition and Success Metrics

## Problem statement

Households, hostels, and small buildings can waste substantial amounts of water through leaking taps, running toilets, unusually long usage periods, and water use at unexpected hours. These issues are often detected only after costs have increased. AquaSave AI makes potential wastage visible through simulated consumption data, explainable alerts, and conservation scenarios.

## Target users

- Household residents who want to reduce water bills
- Hostel or apartment managers monitoring shared water use
- Small office or campus-facility teams

## Scope of the first prototype

The prototype uses generated hourly records rather than live sensors. This makes it realistic enough to demonstrate the decision process while keeping cost and computing requirements low.

## Success metrics

| Metric | What it measures | First-prototype target |
| --- | --- | --- |
| Potential waste detected | Litres linked to a leak or abnormal usage | Reported for every alert |
| Alert clarity | Whether a user can understand the reason | Every alert states its rule |
| Scenario savings | Litres, cost, energy and CO2 avoided | Calculated instantly |
| Data coverage | Completeness of simulated monitoring | 14 days x 24 hourly records |

## Assumptions for the simulation

- Building type: a four-person household
- Water tariff: Rs 0.03 per litre (editable in the application)
- Pumping energy: 0.5 kWh per 1,000 litres (editable project assumption)
- Electricity emission factor: 0.7 kg CO2 per kWh (editable project assumption)
- A possible leak appears as continuous overnight consumption above 8 litres/hour

> These impact factors are transparent prototype assumptions, not a formal lifecycle assessment. They can later be validated using local utility data or OpenLCA.
