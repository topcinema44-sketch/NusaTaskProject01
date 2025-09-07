import { auth, db } from "./firebase.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

function resetDaily(uid) {
  const uRef = ref(db, "users/" + uid);
  get(uRef).then(snap => {
    if (!snap.exists()) return;
    const data = snap.val();
    const today = new Date();
    const resetTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6).toDateString();
    if (data.lastReset !== resetTime) {
      update(uRef, {
        earnToday: 0,
        bonus1Today: 0,
        bonus2Today: 0,
        lastReset: resetTime
      });
    }
  });
}

auth.onAuthStateChanged(user => {
  if (user) resetDaily(user.uid);
});