import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

const appUI = document.getElementById("app");
const loading = document.getElementById("loading");
const emailDisplay = document.getElementById("emailDisplay");

async function initUser(uid, email) {
  const uRef = ref(db, "users/" + uid);
  const snap = await get(uRef);
  if (!snap.exists()) {
    await set(uRef, {
      email,
      balance: 0,
      earnToday: 0, bonus1Today: 0, bonus2Today: 0,
      lastEarn: 0, lastBonus1: 0, lastBonus2: 0,
      banned: false,
      lastReset: new Date().toDateString()
    });
  }
}

// Auto-login
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await initUser(user.uid, user.email);
    emailDisplay.textContent = user.email;
    appUI.style.display = "block";
    loading.style.display = "none";
  } else {
    // login default pakai akun demo kalau belum ada
    const email = "demo@nusa.com", pass = "123456";
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch {
      await createUserWithEmailAndPassword(auth, email, pass);
    }
  }
});