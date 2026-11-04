# KSTS — Biogas & Bioenergy (Sabah, Malaysia)

Static marketing + engineering-tools site for **KSTS K. S. Technical Services** (MPS: R14722/2009, Telupid, Sabah), covering POME biogas power, biomethane upgrading and bio-CNG. Technology partner: **ZERO CARBON ASSISTANT** (Shanghai).

Live: https://jeeftang.github.io/Energy-saving-Calculation/

## Pages
| File | Content |
|---|---|
| `index.html` | Positioning, delivery model, design basis, local credentials |
| `biogas-to-power.html` | Process chain, engine sizing table, gas spec, O&M cost, commercial models |
| `biomethane.html` | Upgrading to ≥97% CH₄, PSA vs water scrubber vs membrane, bio-CNG |
| `equipment.html` | Gas engines 300 kW–2 MW, balance of plant, scope matrix |
| `calculator.html` | Five engineering calculators (gas→power, sizing, mill→biogas, upgrading, economics) |
| `about.html` | KSTS company, Alvin Leong profile, technology partner split |
| `contact.html` | Enquiry form, KSTS contact details |

## Calculators
Pure front-end (`assets/js/calc.js`), no dependencies, no tracking. Constants: CH₄ LHV 35.8 MJ/Nm³ = 9.94 kWh/Nm³; diesel 9.94 kWh/L (LHV), 2.68 kg CO₂/L.

## Build
```bash
python3 build.py   # regenerates all HTML, sitemap.xml, robots.txt
```

## Deploy
GitHub Pages, branch `main`, root. Content is pushed through the GitHub Contents API (see workspace notes).
