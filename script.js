// --- Config ---
const exchangeRate = 130;
let currentDay = parseInt(localStorage.getItem("currentDay")) || 1;

// --- Generate 66-Day Targets (same as weekly.js)
function generateDynamicTargets() {
  const targets = [];
  let base = 4;

  for (let week = 1; week <= 13; week++) {
    for (let day = 0; day < 5; day++) {
      targets.push(base + (day * 0.5));
    }
    base += week * 5;
  }

  return targets;
}

// --- Sync Targets with Weekly
const dailyTargets =
  JSON.parse(localStorage.getItem("dailyTargets")) || generateDynamicTargets();

if (!localStorage.getItem("dailyTargets") || dailyTargets.length !== 65) {
  const newTargets = generateDynamicTargets();
  localStorage.setItem("dailyTargets", JSON.stringify(newTargets));
}

// --- Helpers ---
function getBalance() {
  return parseFloat(localStorage.getItem("balance") || "0");
}

function setBalance(amount) {
  localStorage.setItem("balance", amount.toFixed(2));
}

function setCurrentDay(day) {
  currentDay = day;
  localStorage.setItem("currentDay", day);
}

// --- UI Update ---
function updateBalanceDisplay() {
  const usd = getBalance();
  const kes = usd * exchangeRate;

  const usdSpan = document.getElementById("usd-balance");
  const kesSpan = document.getElementById("kes-balance");

  if (usdSpan) {
    usdSpan.textContent = usd.toFixed(2);
    usdSpan.className = usd < 0 ? "negative" : "";
  }
  if (kesSpan) {
    kesSpan.textContent = `KES ${kes.toFixed(2)}`;
    kesSpan.className = usd < 0 ? "negative" : "";
  }
}

// --- Add Trade ---
const addedTrades = {};

function addTrade(index) {
  if (addedTrades[index]) {
    alert("You’ve already added this trade.");
    return;
  }

  const plInput = document.getElementById(`pl-${index}`);
  if (!plInput) return;

  const plValue = parseFloat(plInput.value);
  if (isNaN(plValue)) {
    alert("Enter a valid profit/loss value.");
    return;
  }

  const newBalance = getBalance() + plValue;
  setBalance(newBalance);
  updateBalanceDisplay();

  addedTrades[index] = true;
  alert(`✅ Trade ${index} added!`);
}

// --- Deposit ---
function depositFunds() {
  const input = document.getElementById("deposit-amount");
  if (!input) return;

  const amount = parseFloat(input.value);
  if (isNaN(amount) || amount <= 0) {
    alert("Enter a valid deposit amount.");
    return;
  }

  const newBalance = getBalance() + amount;
  setBalance(newBalance);
  updateBalanceDisplay();
  input.value = "";
  alert("✅ Deposit successful.");
}

// --- Withdraw ---
function withdrawFunds() {
  const input = document.getElementById("withdraw-amount");
  if (!input) return;

  const amount = parseFloat(input.value);
  if (isNaN(amount) || amount <= 0) {
    alert("Enter a valid withdrawal amount.");
    return;
  }

  const current = getBalance();
  if (amount > current) {
    alert("❌ Insufficient balance.");
    return;
  }

  const newBalance = current - amount;
  setBalance(newBalance);
  updateBalanceDisplay();
  input.value = "";
  alert("✅ Withdrawal successful.");
}

// --- Initialize on Load ---
window.addEventListener("DOMContentLoaded", () => {
  updateBalanceDisplay();

  const targetEl = document.getElementById("daily-target");
  const dayLabel = document.getElementById("day-label");

  if (targetEl && dailyTargets[currentDay - 1]) {
    targetEl.textContent = dailyTargets[currentDay - 1].toFixed(2);
  } else if (targetEl) {
    targetEl.textContent = "0.00";
  }

  if (dayLabel) {
    dayLabel.textContent = `Day ${currentDay}`;
  }
});
