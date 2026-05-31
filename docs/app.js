const state = {
  cards: [],
  sourceHeaders: [],
  premium: false,
  allowPremium: true,
  pendingFrame: 0,
};

const els = {
  form: document.getElementById("simulatorForm"),
  monthlySpend: document.getElementById("monthlySpend"),
  monthlySpendError: document.getElementById("monthlySpendError"),
  income: document.getElementById("income"),
  incomeError: document.getElementById("incomeError"),
  investment: document.getElementById("investment"),
  investmentError: document.getElementById("investmentError"),
  transferBonus: document.getElementById("transferBonus"),
  transferBonusOut: document.getElementById("transferBonusOut"),
  milePrice: document.getElementById("milePrice"),
  milePriceError: document.getElementById("milePriceError"),
  dollar: document.getElementById("dollar"),
  dollarError: document.getElementById("dollarError"),
  vipFilter: document.getElementById("vipFilter"),
  cardFilter: document.getElementById("cardFilter"),
  eligibilityFilter: document.getElementById("eligibilityFilter"),
  maxInvestmentMinimum: document.getElementById("maxInvestmentMinimum"),
  maxInvestmentMinimumError: document.getElementById("maxInvestmentMinimumError"),
  maxIncomeMinimum: document.getElementById("maxIncomeMinimum"),
  maxIncomeMinimumError: document.getElementById("maxIncomeMinimumError"),
  maxAnnualFee: document.getElementById("maxAnnualFee"),
  maxAnnualFeeError: document.getElementById("maxAnnualFeeError"),
  bankFilter: document.getElementById("bankFilter"),
  brandFilter: document.getElementById("brandFilter"),
  premiumMode: document.getElementById("premiumMode"),
  bestProfit: document.getElementById("bestProfit"),
  bestCard: document.getElementById("bestCard"),
  cardCount: document.getElementById("cardCount"),
  comparisonGain: document.getElementById("comparisonGain"),
  resultNote: document.getElementById("resultNote"),
  resultsHeader: document.getElementById("resultsHeader"),
  resultsBody: document.getElementById("resultsBody"),
};

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

function formatMoney(value) {
  return moneyFormatter.format(finite(value));
}

function formatNumber(value) {
  return numberFormatter.format(finite(value));
}

function formatPlainNumber(value) {
  const number = finite(value);
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.abs(number) >= 1000 ? 0 : 4,
  }).format(number);
}

function toNumber(input) {
  const normalized = normalizeNumberText(input.value);
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function normalizeNumberText(value) {
  const text = String(value || "").trim().toLowerCase();
  const multiplier = /(^|[\d\s,.])(mi|milhao|milhão|milhoes|milhões|m)\b/.test(text)
    ? 1000000
    : /(^|[\d\s,.])(mil|k)\b/.test(text)
      ? 1000
      : 1;
  const normalized = text
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const number = Number(normalized);
  if (!Number.isFinite(number)) return normalized;
  return String(number * multiplier);
}

function parseInput(input) {
  const raw = String(input.value || "").trim();
  const normalized = normalizeNumberText(raw);
  const value = Number(normalized);
  const min = Number(input.dataset.min ?? 0);
  const emptyOk = input !== els.monthlySpend && input !== els.dollar;

  if (!raw && emptyOk) return { value: 0, valid: true, message: "" };
  if (!raw) return { value: 0, valid: false, message: "Informe um valor." };
  if (!Number.isFinite(value)) return { value: 0, valid: false, message: "Use apenas números." };
  if (value < min) return { value, valid: false, message: `Valor mínimo: ${formatPlainNumber(min)}.` };
  return { value, valid: true, message: "" };
}

function formatInput(input, decimals = 0) {
  const value = toNumber(input);
  if (!value) {
    input.value = "";
    return;
  }
  input.value = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function formatWhileTyping(input, decimals = 0) {
  const raw = String(input.value || "");
  const hasDecimal = raw.includes(",");
  const normalized = normalizeNumberText(raw);
  const value = Number(normalized);
  if (!raw || !Number.isFinite(value)) return;
  if (document.activeElement === input && hasDecimal) return;
  input.value = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: hasDecimal ? decimals : 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

function setFieldValidity(input, errorEl) {
  const result = parseInput(input);
  input.classList.toggle("is-invalid", !result.valid);
  errorEl.textContent = result.message;
  return result.valid;
}

function validateForm() {
  const checks = [
    setFieldValidity(els.monthlySpend, els.monthlySpendError),
    setFieldValidity(els.income, els.incomeError),
    setFieldValidity(els.investment, els.investmentError),
    setFieldValidity(els.milePrice, els.milePriceError),
    setFieldValidity(els.dollar, els.dollarError),
    setFieldValidity(els.maxInvestmentMinimum, els.maxInvestmentMinimumError),
    setFieldValidity(els.maxIncomeMinimum, els.maxIncomeMinimumError),
    setFieldValidity(els.maxAnnualFee, els.maxAnnualFeeError),
  ];
  return checks.every(Boolean);
}

function maskName(name) {
  if (state.premium || !name) return name || "...";
  const first = name.trim().charAt(0).toUpperCase();
  return `${first}***`;
}

function textOrDash(value) {
  const text = String(value ?? "").trim();
  return text || "-";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatSourceValue(header, value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return formatPlainNumber(value);
  const text = String(value).trim();
  if (/^https?:\/\//i.test(text)) {
    const label = header === "Imagem" ? "imagem" : "abrir";
    return `<a class="table-link" href="${escapeHtml(text)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  }
  return escapeHtml(text);
}

function eligibilityText(card) {
  const items = [];
  if (card.investmentMinimum) items.push(`Investimento mínimo: ${formatMoney(card.investmentMinimum)}`);
  if (card.incomeMinimum) items.push(`Renda mínima: ${formatMoney(card.incomeMinimum)}`);
  if (card.monthlySpendMinimum) items.push(`Gasto mínimo: ${formatMoney(card.monthlySpendMinimum)}`);
  if (card.spendExemption) items.push(`Isenção por gasto: ${formatMoney(card.spendExemption)}`);
  if (card.investmentExemption) items.push(`Isenção por investimento: ${formatMoney(card.investmentExemption)}`);
  if (card.annualFeeDiscount) {
    const discount = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 }).format(card.annualFeeDiscount);
    const spend = card.annualFeeDiscountSpend ? ` com gasto de ${formatMoney(card.annualFeeDiscountSpend)}` : "";
    items.push(`Desconto anuidade: ${discount}${spend}`);
  }
  if (card.requirements) items.push(card.requirements);
  return items.join(" · ") || "-";
}

function finite(value) {
  return Number.isFinite(value) ? value : 0;
}

function bestCategoryText(card) {
  const tier = String(card?.tier || "").trim();
  if (tier) return tier;
  if (!state.premium) return "Black/Infinite";
  return "Categoria não informada";
}

function medianProfit(results) {
  if (!results.length) return 0;
  const middle = Math.floor(results.length / 2);
  if (results.length % 2) return finite(results[middle].profit);
  return (finite(results[middle - 1].profit) + finite(results[middle].profit)) / 2;
}

function getInputs() {
  return {
    monthlySpend: toNumber(els.monthlySpend),
    income: toNumber(els.income),
    investment: toNumber(els.investment),
    transferBonus: toNumber(els.transferBonus) / 100,
    milePrice: toNumber(els.milePrice),
    dollar: Math.max(toNumber(els.dollar), 1),
    vipMinimum: Number(els.vipFilter.value),
    cardId: els.cardFilter.value,
    eligibility: els.eligibilityFilter.value,
    maxInvestmentMinimum: toNumber(els.maxInvestmentMinimum),
    maxIncomeMinimum: toNumber(els.maxIncomeMinimum),
    maxAnnualFee: toNumber(els.maxAnnualFee),
    bank: els.bankFilter.value,
    brand: els.brandFilter.value,
  };
}

function isEligible(card, input) {
  if (card.incomeMinimum && input.income < card.incomeMinimum) return false;
  if (card.investmentMinimum && input.investment < card.investmentMinimum) return false;
  if (card.monthlySpendMinimum && input.monthlySpend < card.monthlySpendMinimum) return false;
  return true;
}

function effectiveAnnualFee(card, input) {
  const fee = finite(card.annualFee);
  if (!fee) return 0;

  const spendExempt = card.spendExemption && input.monthlySpend >= card.spendExemption;
  const investmentExempt = card.investmentExemption && input.investment >= card.investmentExemption;
  if (spendExempt || investmentExempt) return 0;

  const discount = Math.min(Math.max(finite(card.annualFeeDiscount), 0), 1);
  const discountSpend = finite(card.annualFeeDiscountSpend);
  const discountBySpend = discount && discountSpend > 0 && input.monthlySpend >= discountSpend;
  const discountNoSpend = discount && discountSpend === 0;

  if (discountBySpend || discountNoSpend) return fee * (1 - discount);
  return fee;
}

function evaluateCard(card, input) {
  const annualSpend = input.monthlySpend * 12;
  const milesPerReal = card.pointsPerDollar ? card.pointsPerDollar / input.dollar : finite(card.milesPerReal);
  const miles = annualSpend * milesPerReal * (1 + input.transferBonus);
  const milesValue = (miles / 1000) * input.milePrice;
  const cashbackValue = annualSpend * finite(card.cashback);
  const rewardValue = Math.max(milesValue, cashbackValue);
  const annualFee = effectiveAnnualFee(card, input);
  const profit = rewardValue - annualFee;

  return {
    ...card,
    eligible: isEligible(card, input),
    annualFee,
    miles,
    milesValue,
    cashbackValue,
    rewardValue,
    profit,
  };
}

function passesFilters(result, input) {
  if (input.cardId && String(result.id) !== input.cardId) return false;
  if (input.bank && result.bank !== input.bank) return false;
  if (input.brand && result.brand !== input.brand) return false;
  if (input.maxInvestmentMinimum && result.investmentMinimum > input.maxInvestmentMinimum) return false;
  if (input.maxIncomeMinimum && result.incomeMinimum > input.maxIncomeMinimum) return false;
  if (input.maxAnnualFee && result.annualFee > input.maxAnnualFee) return false;
  if (input.vipMinimum >= 10000 && result.vipAccess < 10000) return false;
  if (input.vipMinimum > 0 && input.vipMinimum < 10000 && result.vipAccess < input.vipMinimum) return false;
  if (!result.eligible) return false;
  return true;
}

function renderRows(results) {
  const fragment = document.createDocumentFragment();
  const limit = Math.min(results.length, 40);

  for (let i = 0; i < limit; i += 1) {
    const item = results[i];
    const row = document.createElement("tr");
    const vip = item.vipAccess >= 10000 ? "Ilimitado" : formatNumber(item.vipAccess);
    const profitClass = item.profit >= 0 ? "profit" : "profit loss";
    const premiumCells = state.sourceHeaders
      .map((header) => `<td class="premium-only detail source-col">${formatSourceValue(header, item.sourceColumns?.[header])}</td>`)
      .join("");

    row.innerHTML = `
      <td class="rank">${i + 1}</td>
      <td>
        <strong>${escapeHtml(maskName(item.name))}</strong>
        <span class="muted"> ${escapeHtml(item.bank)}</span>
      </td>
      <td class="${profitClass}">${formatMoney(item.profit)}</td>
      <td>${formatMoney(item.cashbackValue)}</td>
      <td>${formatMoney(item.milesValue)}</td>
      <td>${formatMoney(item.annualFee)}</td>
      <td><span class="pill">${vip}</span></td>
      ${premiumCells}
    `;
    fragment.appendChild(row);
  }

  els.resultsBody.replaceChildren(fragment);
}

function recalculate() {
  state.pendingFrame = 0;
  if (!validateForm()) {
    els.bestProfit.textContent = "R$ ... por ano";
    els.bestCard.textContent = "...";
    els.cardCount.textContent = "0 cartões elegíveis para seu perfil";
    els.comparisonGain.textContent = "R$ ... por ano";
    els.resultNote.textContent = "Corrija os campos destacados";
    els.resultsBody.replaceChildren();
    return;
  }
  const input = getInputs();
  els.transferBonusOut.value = `${Math.round(input.transferBonus * 100)}%`;

  const results = state.cards
    .map((card) => evaluateCard(card, input))
    .filter((result) => passesFilters(result, input))
    .sort((a, b) => b.profit - a.profit || a.annualFee - b.annualFee || a.name.localeCompare(b.name));

  const best = results[0];
  els.cardCount.textContent = formatNumber(results.length);

  if (!best) {
    els.bestProfit.textContent = "R$ ... por ano";
    els.bestCard.textContent = "...";
    els.cardCount.textContent = "0 cartões elegíveis para seu perfil";
    els.comparisonGain.textContent = "R$ ... por ano";
    els.resultNote.textContent = "Nenhum cartão encontrado";
    els.resultsBody.replaceChildren();
    return;
  }

  const gapToMedian = Math.max(finite(best.profit) - medianProfit(results), 0);

  els.bestProfit.textContent = `${formatMoney(best.profit)} por ano`;
  els.bestCard.textContent = bestCategoryText(best);
  els.cardCount.textContent = `${formatNumber(results.length)} cartão${results.length === 1 ? "" : "es"} elegíve${results.length === 1 ? "l" : "is"} para seu perfil`;
  els.comparisonGain.textContent = `${formatMoney(gapToMedian)} por ano`;
  els.resultNote.textContent = `${results.length} resultado${results.length === 1 ? "" : "s"}`;
  renderRows(results);
}

function scheduleRecalculate() {
  if (state.pendingFrame) return;
  state.pendingFrame = requestAnimationFrame(recalculate);
}

function populateCardFilter() {
  const fragment = document.createDocumentFragment();
  for (const card of state.cards) {
    const option = document.createElement("option");
    option.value = String(card.id);
    option.textContent = maskName(card.name);
    fragment.appendChild(option);
  }
  els.cardFilter.appendChild(fragment);
}

function populateOptionFilter(select, values) {
  const fragment = document.createDocumentFragment();
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    fragment.appendChild(option);
  }
  select.appendChild(fragment);
}

function renderPremiumHeaders() {
  const existing = els.resultsHeader.querySelectorAll(".premium-only");
  existing.forEach((node) => node.remove());

  const fragment = document.createDocumentFragment();
  for (const header of state.sourceHeaders) {
    const th = document.createElement("th");
    th.className = "premium-only detail source-col";
    th.textContent = header;
    fragment.appendChild(th);
  }
  els.resultsHeader.appendChild(fragment);
}

async function boot() {
  const response = await fetch("./data/cards.json");
  if (!response.ok) throw new Error("Falha ao carregar base de cartões");
  const payload = await response.json();
  state.cards = payload.cards;
  state.sourceHeaders = payload.meta.sourceHeaders || [];
  state.allowPremium = payload.meta.allowPremium !== false;
  state.premium = state.allowPremium && new URLSearchParams(location.search).get("premium") === "1";
  els.premiumMode.checked = state.premium;
  els.premiumMode.closest(".switch").hidden = !state.allowPremium;
  document.body.classList.toggle("is-premium", state.premium);
  renderPremiumHeaders();
  populateCardFilter();
  populateOptionFilter(
    els.bankFilter,
    [...new Set(state.cards.map((card) => card.bank).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  );
  populateOptionFilter(
    els.brandFilter,
    [...new Set(state.cards.map((card) => card.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  );
  recalculate();
}

els.form.addEventListener("input", scheduleRecalculate);
els.form.addEventListener("change", scheduleRecalculate);
for (const input of [els.monthlySpend, els.income, els.investment, els.maxInvestmentMinimum, els.maxIncomeMinimum, els.maxAnnualFee]) {
  input.addEventListener("input", () => {
    formatWhileTyping(input, 0);
  });
  input.addEventListener("blur", () => {
    formatInput(input, 0);
    scheduleRecalculate();
  });
}
els.milePrice.addEventListener("input", () => {
  formatWhileTyping(els.milePrice, 0);
});
els.milePrice.addEventListener("blur", () => {
  formatInput(els.milePrice, 0);
  scheduleRecalculate();
});
els.dollar.addEventListener("input", () => {
  formatWhileTyping(els.dollar, 2);
});
els.dollar.addEventListener("blur", () => {
  formatInput(els.dollar, 2);
  scheduleRecalculate();
});
els.premiumMode.addEventListener("change", () => {
  if (!state.allowPremium) return;
  state.premium = els.premiumMode.checked;
  document.body.classList.toggle("is-premium", state.premium);
  const selected = els.cardFilter.value;
  els.cardFilter.length = 1;
  populateCardFilter();
  els.cardFilter.value = selected;
  scheduleRecalculate();
});

boot().catch((error) => {
  els.resultNote.textContent = error.message;
  els.bestProfit.textContent = "R$ ... por ano";
  els.bestCard.textContent = "...";
  els.cardCount.textContent = "0 cartões elegíveis para seu perfil";
  els.comparisonGain.textContent = "R$ ... por ano";
});
