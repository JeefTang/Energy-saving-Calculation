/* KSTS bioenergy calculators — transparent formulas, no dependencies */
(function () {
  "use strict";

  var CH4_KWH_PER_NM3 = 9.94;     // LHV of methane, kWh/Nm3 (35.8 MJ/Nm3)
  var DIESEL_KWH_PER_L = 9.94;    // LHV, kWh/L
  var DIESEL_CO2_KG_PER_L = 2.68;

  function $(id) { return document.getElementById(id); }
  function val(id, dflt) {
    var v = parseFloat($(id) && $(id).value);
    return isFinite(v) ? v : (dflt || 0);
  }
  function nf(x, d) {
    if (!isFinite(x)) return "—";
    d = d === undefined ? 0 : d;
    return x.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function money(x, cur) {
    var s = cur === "IDR" ? "Rp " : cur === "MYR" ? "RM " : "US$ ";
    return s + nf(x, 0);
  }
  function set(id, text) { var el = $(id); if (el) el.textContent = text; }
  function warn(id, text) {
    var el = $(id);
    if (!el) return;
    if (text) { el.textContent = text; el.classList.add("show"); }
    else { el.textContent = ""; el.classList.remove("show"); }
  }

  /* ---------------------------------------------------------- tool 1 */
  function tool1() {
    var flow = val("t1_flow"), ch4 = val("t1_ch4"), eff = val("t1_eff"),
        heat = val("t1_heat"), hours = val("t1_hours"), load = val("t1_load");

    var fuelKW = flow * (ch4 / 100) * CH4_KWH_PER_NM3;
    var kW = fuelKW * eff / 100;
    var heatKW = fuelKW * heat / 100;
    var total = eff + heat;
    var gasPerKWh = kW > 0 ? flow / kW : 0;
    var yearKWh = kW * hours * load / 100;
    var yearHeat = heatKW * hours * load / 100;
    var dieselL = yearKWh / (DIESEL_KWH_PER_L * 0.35);
    var co2t = dieselL * DIESEL_CO2_KG_PER_L / 1000;

    set("t1_kw", nf(kW, 0) + " kW");
    set("t1_heatkw", nf(heatKW, 0) + " kW");
    set("t1_energy", nf(fuelKW, 0) + " kW");
    set("t1_total", nf(total, 0) + "%");
    set("t1_gas_kwh", nf(gasPerKWh, 2) + " Nm³/kWh");
    set("t1_year_kwh", nf(yearKWh / 1000, 0) + " MWh");
    set("t1_year_heat", nf(yearHeat / 1000, 0) + " MWh");
    set("t1_diesel", nf(dieselL, 0) + " L/yr · " + nf(co2t, 0) + " t CO₂");

    var msgs = [];
    if (ch4 < 50) msgs.push("Methane below 50%: most gas engines will need derating or a richer gas blend.");
    if (load < 70) msgs.push("Average load below 70%: expect carbon build-up and a shorter overhaul interval. Consider a smaller unit or two units.");
    if (heat + eff > 92) msgs.push("Combined efficiency above 92% is not achievable — check the heat recovery assumption.");
    warn("t1_warn", msgs.join(" "));
  }

  /* ---------------------------------------------------------- tool 2 */
  function tool2() {
    var kW = val("t2_kw"), ch4 = val("t2_ch4"), eff = val("t2_eff"), load = val("t2_load");
    var fuelKW = kW / (eff / 100);
    var flow = ch4 > 0 ? fuelKW / (ch4 / 100) / CH4_KWH_PER_NM3 : 0;
    var flowDay = flow * 24;
    var avg = flow * load / 100;
    var ch4flow = flow * ch4 / 100;
    var year = avg * 8000;

    set("t2_flow", nf(flow, 0) + " Nm³/h");
    set("t2_day", nf(flowDay, 0) + " Nm³/day");
    set("t2_avg", nf(avg, 0) + " Nm³/h");
    set("t2_ch4flow", nf(ch4flow, 0) + " Nm³/h");
    set("t2_energy", nf(fuelKW, 0) + " kW");
    set("t2_year", nf(year / 1000000, 2) + " million Nm³/yr");

    var msgs = [];
    if (ch4 < 50) msgs.push("At this methane content the engine will be derated: check the manufacturer's derating curve.");
    if (eff > 42) msgs.push("Efficiency above 42% is at the top of the range for gas engines — verify it is not a lower-heating-value claim.");
    warn("t2_warn", msgs.join(" "));
  }

  /* ---------------------------------------------------------- tool 3 */
  function tool3() {
    var ffb = val("t3_ffb"), pome = val("t3_pome"), yield_ = val("t3_yield"),
        ch4 = val("t3_ch4"), cap = val("t3_capture"), eff = val("t3_eff");

    var pomeDay = ffb * 24 * pome;
    var gasDay = pomeDay * yield_ * cap / 100;
    var gasH = gasDay / 24;
    var ch4H = gasH * ch4 / 100;
    var fuelKW = gasH * (ch4 / 100) * CH4_KWH_PER_NM3;
    var kW = fuelKW * eff / 100;
    var mwh = kW * 8000 / 1000;

    set("t3_pome_day", nf(pomeDay, 0) + " m³/day");
    set("t3_gas_day", nf(gasDay, 0) + " Nm³/day");
    set("t3_gas_h", nf(gasH, 0) + " Nm³/h");
    set("t3_ch4_h", nf(ch4H, 0) + " Nm³/h");
    set("t3_kw", nf(kW, 0) + " kW");
    set("t3_mwh", nf(mwh, 0) + " MWh/yr");

    var msgs = [];
    if (yield_ > 30) msgs.push("Yield above 30 Nm³/m³ POME is optimistic for a covered lagoon — it assumes a well-mixed, heated digester.");
    if (cap > 90) msgs.push("Capture efficiency above 90% requires a well-sealed cover and active pressure management.");
    warn("t3_warn", msgs.join(" "));
  }

  /* ---------------------------------------------------------- tool 4 */
  function tool4() {
    var flow = val("t4_flow"), ch4 = val("t4_ch4"), rec = val("t4_rec"),
        purity = val("t4_purity"), power = val("t4_power");

    var ch4in = flow * ch4 / 100;
    var ch4out = ch4in * rec / 100;
    var product = purity > 0 ? ch4out / (purity / 100) : 0;
    var loss = ch4in - ch4out;
    var co2 = flow * (1 - ch4 / 100);
    var mw = product * CH4_KWH_PER_NM3 / 1000;
    var kW = flow * power;
    var diesel = product; // Nm3 CH4 at 9.94 kWh/Nm3 vs diesel 9.94 kWh/L

    set("t4_ch4in", nf(ch4in, 0) + " Nm³/h");
    set("t4_product", nf(product, 0) + " Nm³/h");
    set("t4_ch4out", nf(ch4out, 0) + " Nm³/h");
    set("t4_loss", nf(loss, 0) + " Nm³/h (" + nf(100 - rec, 1) + "%)");
    set("t4_co2", nf(co2, 0) + " Nm³/h");
    set("t4_mw", nf(mw, 2) + " MW (LHV)");
    set("t4_kw", nf(kW, 0) + " kW");
    set("t4_diesel", nf(diesel, 0) + " L/h equivalent");
  }

  /* ---------------------------------------------------------- tool 5 */
  function irr(capex, annual, years) {
    function npv(r) {
      var s = -capex;
      for (var t = 1; t <= years; t++) s += annual / Math.pow(1 + r, t);
      return s;
    }
    var lo = -0.99, hi = 5;
    if (npv(lo) * npv(hi) > 0) return NaN;
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2;
      if (npv(lo) * npv(mid) <= 0) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  }

  function tool5() {
    var kw = val("t5_kw"), capexPerKW = val("t5_capex");
    var cur = ($("t5_cur") || {}).value || "MYR";
    var tariff = val("t5_tariff"), fx = val("t5_fx") || 1;
    var hours = val("t5_hours"), om = val("t5_om"), omfix = val("t5_omfix"), use = val("t5_use");
    var disc = val("t5_disc") / 100;

    var capex = kw * capexPerKW;
    var tariffUSD = tariff / fx;
    var gen = kw * hours;
    var revUSD = gen * (use / 100) * tariffUSD;
    var opexUSD = gen * om + omfix;
    var netUSD = revUSD - opexUSD;
    var payback = netUSD > 0 ? capex / netUSD : Infinity;

    var npv = -capex;
    for (var t = 1; t <= 10; t++) npv += netUSD / Math.pow(1 + disc, t);
    var cum10 = netUSD * 10 - capex;
    var r = irr(capex, netUSD, 10);
    var crf = disc > 0 ? (disc * Math.pow(1 + disc, 10)) / (Math.pow(1 + disc, 10) - 1) : 0.1;
    var lcoe = gen > 0 ? (capex * crf + opexUSD) / gen : 0;

    set("t5_total_capex", "US$ " + nf(capex, 0) + " · " + money(capex * fx, cur));
    set("t5_gen", nf(gen / 1000, 0) + " MWh/yr");
    set("t5_rev", "US$ " + nf(revUSD, 0) + " · " + money(revUSD * fx, cur));
    set("t5_opex", "US$ " + nf(opexUSD, 0) + " · " + money(opexUSD * fx, cur));
    set("t5_net", "US$ " + nf(netUSD, 0) + " · " + money(netUSD * fx, cur));
    set("t5_payback", isFinite(payback) ? nf(payback, 2) + " years" : "not recovered");
    set("t5_cum10", "US$ " + nf(cum10, 0));
    set("t5_npv", "US$ " + nf(npv, 0));
    set("t5_irr", isFinite(r) ? nf(r * 100, 1) + "%" : "n/a");
    set("t5_lcoe", "US$ " + nf(lcoe, 3) + "/kWh");

    var msgs = [];
    if (use > 90) msgs.push("Assuming almost all output displaces bought power is optimistic unless the mill runs a steady 24-hour load.");
    if (capexPerKW < 600) msgs.push("Capex below US$600/kW is likely engine-only, not a complete plant — civils, gas treatment and grid connection are usually excluded.");
    if (payback < 2) msgs.push("Payback under 2 years is unusual for a complete plant — check that capex includes pond cover, gas treatment, civils and grid connection.");
    warn("t5_warn", msgs.join(" "));
  }

  /* ---------------------------------------------------------- wiring */
  var CALCS = { tool1: tool1, tool2: tool2, tool3: tool3, tool4: tool4, tool5: tool5 };

  function runAll() { Object.keys(CALCS).forEach(function (k) { CALCS[k](); }); }

  function bind() {
    document.querySelectorAll(".calc-form input, .calc-form select").forEach(function (el) {
      el.addEventListener("input", runAll);
      el.addEventListener("change", runAll);
    });

    var curSel = $("t5_cur");
    if (curSel) curSel.addEventListener("change", function () {
      var map = { MYR: ["4.2", "0.65", "RM"], IDR: ["16000", "1500", "Rp"], USD: ["1", "0.15", "US$"] };
      var v = map[curSel.value];
      $("t5_fx").value = v[0];
      $("t5_tariff").value = v[1];
      set("t5_curlabel", v[2]);
      runAll();
    });

    document.querySelectorAll(".tab-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".tab-btn").forEach(function (b) { b.classList.remove("active"); });
        document.querySelectorAll(".tab-panel").forEach(function (p) { p.classList.remove("active"); });
        btn.classList.add("active");
        var panel = $(btn.dataset.tab);
        if (panel) panel.classList.add("active");
        if (history.replaceState) history.replaceState(null, "", "#" + btn.dataset.tab);
      });
    });
  }

  window.copySummary = function (which) {
    var panel = $(which);
    if (!panel) return;
    var lines = [];
    panel.querySelectorAll(".calc-form .field").forEach(function (f) {
      var label = f.querySelector("label");
      var input = f.querySelector("input, select");
      if (label && input) lines.push(label.textContent.trim() + ": " + input.value);
    });
    lines.push("—");
    panel.querySelectorAll(".calc-out .kv").forEach(function (kv) {
      var s = kv.querySelector("span"), b = kv.querySelector("b");
      if (s && b) lines.push(s.textContent.trim() + ": " + b.textContent.trim());
    });
    lines.push("");
    lines.push("KSTS K. S. Technical Services — indicative calculation, subject to measured site data.");
    var text = lines.join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { alert("Summary copied to clipboard."); },
        function () { window.prompt("Copy the summary:", text); });
    } else {
      window.prompt("Copy the summary:", text);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    bind();
    var h = (location.hash || "").replace("#", "");
    if (h && $(h) && $(h).classList.contains("tab-panel")) {
      var btn = document.querySelector('.tab-btn[data-tab="' + h + '"]');
      if (btn) btn.click();
    }
    runAll();
  });
})();
