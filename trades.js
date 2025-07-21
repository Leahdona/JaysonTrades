// --- Date-Based Day and Week Calculation ---
const dayOneStartDate = new Date("2025-07-20");

if (!localStorage.getItem("startDate")) {
  localStorage.setItem("startDate", dayOneStartDate.toISOString());
}
const today = new Date();
const startDate = new Date(localStorage.getItem("startDate"));
const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

const currentDay = diffDays + 1;
const currentWeek = Math.ceil(currentDay / 5);

localStorage.setItem("currentDay", currentDay);
localStorage.setItem("currentWeek", currentWeek);

// --- Config ---
const exchangeRate = 130;
const todayKey = `day${currentDay}`;

// --- Init Storage ---
if (!localStorage.getItem("balance")) localStorage.setItem("balance", "0");
if (!localStorage.getItem("dailyTargets")) {
  localStorage.setItem("dailyTargets", JSON.stringify(Array(66).fill(0)));
}
if (!localStorage.getItem("dailyProfits")) {
  localStorage.setItem("dailyProfits", JSON.stringify(Array(66).fill(0)));
}
if (!localStorage.getItem("savedTradesByDay")) {
  localStorage.setItem("savedTradesByDay", JSON.stringify({}));
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
  const usdElement = document.getElementById("usd-balance");
  const kesElement = document.getElementById("kes-balance");

  if (usdElement && kesElement) {
    usdElement.textContent = usd.toFixed(2);
    kesElement.textContent = `KES ${kes.toFixed(2)}`;

    if (usd < 0) {
      usdElement.classList.add("negative");
      kesElement.classList.add("negative");
    } else {
      usdElement.classList.remove("negative");
      kesElement.classList.remove("negative");
    }
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

function showEditButton(index) {
  document.getElementById(`add-btn-${index}`).style.display = "none";
  document.getElementById(`edit-btn-${index}`).style.display = "inline-block";
}

function showAddButton(index) {
  document.getElementById(`add-btn-${index}`).style.display = "inline-block";
  document.getElementById(`edit-btn-${index}`).style.display = "none";
}

function clearTradeFields(index) {
  document.getElementById(`symbol-${index}`).value = "";
  document.getElementById(`type-${index}`).value = "";
  document.getElementById(`pl-${index}`).value = "";
  document.getElementById(`reason-${index}`).value = "";
  unlockFields(index);
  showAddButton(index);
}

// --- Trade Functions ---
function addTrade(index) {
  const symbol = document.getElementById(`symbol-${index}`).value;
  const type = document.getElementById(`type-${index}`).value;
  const pl = parseFloat(document.getElementById(`pl-${index}`).value);
  const reason = document.getElementById(`reason-${index}`).value;

  if (!symbol || !type || isNaN(pl) || !reason) {
    alert("Fill all fields correctly.");
    return;
  }

  let savedTradesByDay = JSON.parse(localStorage.getItem("savedTradesByDay")) || {};
  let dailyProfits = JSON.parse(localStorage.getItem("dailyProfits"));

  if (!savedTradesByDay[todayKey]) savedTradesByDay[todayKey] = {};
  const oldTrade = savedTradesByDay[todayKey][index];

  if (oldTrade) {
    dailyProfits[currentDay - 1] -= parseFloat(oldTrade.pl);
    setBalance(getBalance() - parseFloat(oldTrade.pl));
  }

  savedTradesByDay[todayKey][index] = { symbol, type, pl, reason };
  dailyProfits[currentDay - 1] += pl;
  setBalance(getBalance() + pl);

  localStorage.setItem("savedTradesByDay", JSON.stringify(savedTradesByDay));
  localStorage.setItem("dailyProfits", JSON.stringify(dailyProfits));

  lockFields(index);
  showEditButton(index);
  updateBalanceDisplay();
}

function editTrade(index) {
  const editBtn = document.getElementById(`edit-btn-${index}`);
  if (editBtn.textContent === "Edit") {
    unlockFields(index);
    editBtn.textContent = "Save";
  } else {
    editBtn.textContent = "Edit";
    addTrade(index);
  }
}

// --- Init ---
window.addEventListener("DOMContentLoaded", () => {
  updateBalanceDisplay();

  const savedTradesByDay = JSON.parse(localStorage.getItem("savedTradesByDay")) || {};
  const todayTrades = savedTradesByDay[todayKey] || {};

  for (let i = 1; i <= 5; i++) {
    const data = todayTrades[i];
    if (data) {
      document.getElementById(`symbol-${i}`).value = data.symbol;
      document.getElementById(`type-${i}`).value = data.type;
      document.getElementById(`pl-${i}`).value = data.pl;
      document.getElementById(`reason-${i}`).value = data.reason;
      lockFields(i);
      showEditButton(i);
    } else {
      clearTradeFields(i);
    }
  }
});
