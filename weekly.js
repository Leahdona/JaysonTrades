// --- Config ---
let currentDay = parseInt(localStorage.getItem("currentDay")) || 1;
let currentWeek = parseInt(localStorage.getItem("currentWeek")) || Math.ceil(currentDay / 5);
localStorage.setItem("currentWeek", currentWeek);

// --- Target Generator ---
function generateDynamicTargets() {
  const targets = [];
  let base = 4; // Start from $4.00 for Week 1 Day 1

  for (let week = 1; week <= 13; week++) {
    for (let day = 0; day < 5; day++) {
      targets.push(base + (day * 0.5));
    }
    base += week * 5; // Increase Day 1 base for next week
  }

  return targets;
}

// --- Init Storage ---
const newTargets = generateDynamicTargets();

if (
  !localStorage.getItem("dailyTargets") ||
  JSON.parse(localStorage.getItem("dailyTargets")).length !== 65
) {
  localStorage.setItem("dailyTargets", JSON.stringify(newTargets));
}

if (!localStorage.getItem("dailyProfits")) {
  localStorage.setItem("dailyProfits", JSON.stringify(Array(65).fill(0)));
}

// --- Render Week ---
function renderWeek(weekNum) {
  const container = document.getElementById("weekly-table-body");
  if (!container) return;

  const targets = JSON.parse(localStorage.getItem("dailyTargets"));
  const profits = JSON.parse(localStorage.getItem("dailyProfits"));

  container.innerHTML = "";

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
  document.getElementById("weekly-withdraw").textContent = `$${((weekNum - 1) * 5).toFixed(2)}`;
}

// --- Init ---
window.addEventListener("DOMContentLoaded", () => {
  const weekSelect = document.getElementById("week-select");
  if (weekSelect) {
    weekSelect.value = currentWeek;
    weekSelect.addEventListener("change", (e) => {
      const w = parseInt(e.target.value);
      localStorage.setItem("currentWeek", w);
      renderWeek(w);
    });
  }

  renderWeek(currentWeek);
});
const usdEl = document.getElementById("usd-balance");
usdEl.textContent = usd.toFixed(2);
usdEl.className = usd < 0 ? "negative" : "";

const kesEl = document.getElementById("kes-balance");
kesEl.textContent = `KES ${kes.toFixed(2)}`;
kesEl.className = usd < 0 ? "negative" : "";
