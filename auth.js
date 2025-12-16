const DAILY_LIMIT = 10;

function getTodayKey() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function isActivated() {
  return localStorage.getItem("pdcs_active") === "yes";
}

function activate(code) {
  // کدهای مجاز (فعلاً دستی)
  const validCodes = ["A1-1234", "FRED-A1", "PDCS-A1"];
  if (validCodes.includes(code)) {
    localStorage.setItem("pdcs_active", "yes");
    alert("✅ Activated successfully");
    return true;
  }
  alert("❌ Invalid code");
  return false;
}

function checkGuestLimit() {
  if (isActivated()) return true;

  const today = getTodayKey();
  const key = "guest_" + today;
  let count = parseInt(localStorage.getItem(key) || "0");

  if (count >= DAILY_LIMIT) {
    alert(
      "🙏 Today’s free limit is over.\n" +
      "To get full access, contact:\n" +
      "📱 WhatsApp / Call: 09017708544"
    );
    return false;
  }

  localStorage.setItem(key, count + 1);
  return true;
}
