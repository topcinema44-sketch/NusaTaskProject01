import { auth, db } from "./firebase.js";
import { ref, get, runTransaction } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

const saldoDisplay = document.getElementById("saldoDisplay");

const btnEarn = document.getElementById("btnEarn");
const btnX1 = document.getElementById("btnX1");
const btnX2 = document.getElementById("btnX2");

const counterEarn = document.getElementById("counterEarn");
const counterX1 = document.getElementById("counterX1");
const counterX2 = document.getElementById("counterX2");

const progressEarn = document.getElementById("progressEarn");
const progressX1 = document.getElementById("progressX1");
const progressX2 = document.getElementById("progressX2");

const LIMIT_EARN = 20;
const LIMIT_X = 10;
const COOLDOWN = 3 * 60 * 1000; // 3 menit
const REWARD_EARN = 20000;
const REWARD_X = 10000;

function updateUI(data) {
  saldoDisplay.textContent = `Rp ${data.balance.toLocaleString()}`;

  counterEarn.textContent = `${data.earnToday}/${LIMIT_EARN}`;
  counterX1.textContent = `${data.bonus1Today}/${LIMIT_X}`;
  counterX2.textContent = `${data.bonus2Today}/${LIMIT_X}`;

  progressEarn.style.width = `${(data.earnToday / LIMIT_EARN) * 100}%`;
  progressX1.style.width = `${(data.bonus1Today / LIMIT_X) * 100}%`;
  progressX2.style.width = `${(data.bonus2Today / LIMIT_X) * 100}%`;

  // disable button saat cooldown
  let now = Date.now();
  toggleBtn(btnEarn, data.lastEarn + COOLDOWN > now || data.earnToday >= LIMIT_EARN);
  toggleBtn(btnX1, data.lastBonus1 + COOLDOWN > now || data.bonus1Today >= LIMIT_X);
  toggleBtn(btnX2, data.lastBonus2 + COOLDOWN > now || data.bonus2Today >= LIMIT_X);
}

function toggleBtn(btn, disabled) {
  btn.disabled = disabled;
  btn.style.background = disabled ? "#444" : "";
}

function claim(type, reward, limitField, timeField) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const uRef = ref(db, "users/" + uid);
  runTransaction(uRef, (data) => {
    if (data) {
      let now = Date.now();
      if (data[limitField] >= (type === "earn" ? LIMIT_EARN : LIMIT_X)) return; // limit habis
      if (now < data[timeField] + COOLDOWN) return; // masih cooldown
      data.balance += reward;
      data[limitField] += 1;
      data[timeField] = now;
    }
    return data;
  }).then(r => {
    if (r.committed) updateUI(r.snapshot.val());
  });
}

btnEarn.addEventListener("click", () => claim("earn", REWARD_EARN, "earnToday", "lastEarn"));
btnX1.addEventListener("click", () => claim("x1", REWARD_X, "bonus1Today", "lastBonus1"));
btnX2.addEventListener("click", () => claim("x2", REWARD_X, "bonus2Today", "lastBonus2"));

// Listen realtime
auth.onAuthStateChanged(user => {
  if (!user) return;
  const uRef = ref(db, "users/" + user.uid);
  get(uRef).then(snap => {
    if (snap.exists()) updateUI(snap.val());
  });
});