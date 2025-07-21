
// --- Config ---
const exchangeRate = 130;
let currentDay = parseInt(localStorage.getItem("currentDay")) || 1;
let currentWeek = Math.ceil(currentDay / 5);
localStorage.setItem("currentWeek", currentWeek);

const dailyTargets = [
  1.96, 2.16, 2.38, 2.63, 2.9,
  2.68, 2.96, 3.26, 3.6, 3.97,
  3.86, 4.26, 4.7, 5.18, 5.71,
  5.79, 6.38, 7.04, 7.77, 8.57,
  8.93, 9.85, 10.87, 11.99, 13.22,
  14.07, 15.52, 17.12, 18.88, 20.82,
  22.45, 24.77, 27.32, 30.13, 33.24,
  36.14, 39.87, 43.97, 48.5, 53.5,
  58.49, 64.52, 71.16, 78.49, 86.58,
  94.98, 104.76, 115.56, 127.46, 140.59,
  154.55, 170.47, 188.03, 207.4, 228.76,
  251.8, 277.74, 306.35, 337.9, 372.71,
  410.68, 451.75, 496.93, 546.62, 601.28,
  661.41, 727.55
];

if (!localStorage.getItem("dailyTargets")) {
  localStorage.setItem("dailyTargets", JSON.stringify(dailyTargets));
}
if (!localStorage.getItem("dailyProfits")) {
  localStorage.setItem("dailyProfits", JSON.stringify(Array(66).fill(0)));
}
if (!localStorage.getItem("savedTrades")) {
  localStorage.setItem("savedTrades", JSON.stringify({}));
}

// --- Helpers ---
function getBalance() {
  return parseFloat(localStorage.getItem("balance") || "0");
}
function setBalance(amount) {
  localStorage.setItem("balance", amount.toFixed(2));
}
function updateBalanceDisplay() {
  const usd = getBalance();
  const kes = usd * exchangeRate;
  const usdSpan = document.getElementById("usd-balance");
  const kesSpan = document.getElementById("kes-balance");
  if (usdSpan) usdSpan.textContent = usd.toFixed(2);
  if (kesSpan) kesSpan.textContent = `KES ${kes.toFixed(2)}`;
}
function updateDayAndWeekLabels() {
  const dayLabel = document.getElementById("day-label");
  const targetEl = document.getElementById("daily-target");
  if (dayLabel) dayLabel.textContent = `Day ${currentDay}`;
  const targets = JSON.parse(localStorage.getItem("dailyTargets"));
  if (targetEl) targetEl.textContent = `$${(targets[currentDay - 1] || 0).toFixed(2)}`;
}

// --- Trades Logic ---
function loadSavedTrades() {
  const trades = JSON.parse(localStorage.getItem("savedTrades")) || {};
  Object.keys(trades).forEach(index => {
    const data = trades[index];
    document.getElementById(`symbol-${index}`).value = data.symbol;
    document.getElementById(`type-${index}`).value = data.type;
    document.getElementById(`pl-${index}`).value = data.pl;
    document.getElementById(`reason-${index}`).value = data.reason;
    lockFields(index);
    updateButton(index, "Edit");
  });
}

function addTrade(index) {
  const symbol = document.getElementById(`symbol-${index}`);
  const type = document.getElementById(`type-${index}`);
  const pl = document.getElementById(`pl-${index}`);
  const reason = document.getElementById(`reason-${index}`);
  const btn = document.getElementById(`btn-${index}`);

  if (!symbol.value || !type.value || !pl.value || !reason.value) {
    alert("Fill all fields.");
    return;
  }

  const plValue = parseFloat(pl.value);
  const dailyProfits = JSON.parse(localStorage.getItem("dailyProfits"));
  const savedTrades = JSON.parse(localStorage.getItem("savedTrades"));

  if (savedTrades[index]) {
    const oldPL = parseFloat(savedTrades[index].pl);
    dailyProfits[currentDay - 1] -= oldPL;
    setBalance(getBalance() - oldPL);
  }

  dailyProfits[currentDay - 1] += plValue;
  setBalance(getBalance() + plValue);
  savedTrades[index] = {
    symbol: symbol.value,
    type: type.value,
    pl: pl.value,
    reason: reason.value
  };

  localStorage.setItem("dailyProfits", JSON.stringify(dailyProfits));
  localStorage.setItem("savedTrades", JSON.stringify(savedTrades));

  lockFields(index);
  updateButton(index, "Edit");
  updateBalanceDisplay();
}

function editTrade(index) {
  const btn = document.getElementById(`btn-${index}`);
  if (btn.textContent === "Edit") {
    unlockFields(index);
    btn.textContent = "Save";
  } else {
    addTrade(index);
  }
}

function lockFields(index) {
  document.getElementById(`symbol-${index}`).disabled = true;
  document.getElementById(`type-${index}`).disabled = true;
  document.getElementById(`pl-${index}`).disabled = true;
  document.getElementById(`reason-${index}`).disabled = true;
}
function unlockFields(index) {
  document.getElementById(`symbol-${index}`).disabled = false;
  document.getElementById(`type-${index}`).disabled = false;
  document.getElementById(`pl-${index}`).disabled = false;
  document.getElementById(`reason-${index}`).disabled = false;
}
function updateButton(index, label) {
  const btn = document.getElementById(`btn-${index}`);
  btn.textContent = label;
  btn.onclick = () => editTrade(index);
}

// --- Weekly Logic ---
function renderWeek(weekNum) {
  const container = document.getElementById("weekly-table-body");
  if (!container) return;

  container.innerHTML = "";
  const targets = JSON.parse(localStorage.getItem("dailyTargets"));
  const profits = JSON.parse(localStorage.getItem("dailyProfits"));

  let totalTarget = 0;
  let totalProfit = 0;

  for (let i = 0; i < 5; i++) {
    const dayIndex = (weekNum - 1) * 5 + i;
    const target = targets[dayIndex] || 0;
    const actual = profits[dayIndex] || 0;

    totalTarget += target;
    totalProfit += actual;

    container.innerHTML += `
      <div class="day-box">
        <h3>Day ${dayIndex + 1}</h3>
        <p>🎯 Target: <strong>$${target.toFixed(2)}</strong></p>
        <p>💰 Profit: <strong>$${actual.toFixed(2)}</strong></p>
      </div>
    `;
  }

  document.getElementById("weekly-target-total").textContent = `$${totalTarget.toFixed(2)}`;
  document.getElementById("weekly-actual-total").textContent = `$${totalProfit.toFixed(2)}`;
}

// --- Init ---
window.addEventListener("DOMContentLoaded", () => {
  updateBalanceDisplay();
  updateDayAndWeekLabels();
  loadSavedTrades();

  const weekSelect = document.getElementById("week-select");
  if (weekSelect) {
    weekSelect.value = currentWeek;
    weekSelect.addEventListener("change", (e) => {
      const w = parseInt(e.target.value);
      localStorage.setItem("currentWeek", w);
      renderWeek(w);
    });
    renderWeek(currentWeek);
  }
});
