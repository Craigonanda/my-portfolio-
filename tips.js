const knobDial = document.getElementById("knobDial");
const amountSlider = document.getElementById("amountSlider");
const tipAmount = document.getElementById("tipAmount");
const phoneInput = document.getElementById("phoneInput");
const tipBtn = document.getElementById("tipBtn");
const tipStatus = document.getElementById("tipStatus");
const presets = document.querySelectorAll(".preset");

const MIN = Number(amountSlider.min);
const MAX = Number(amountSlider.max);
const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

let dragging = false;

function amountToAngle(amount) {
const ratio = (amount - MIN) / (MAX - MIN);
return MIN_ANGLE + ratio * (MAX_ANGLE - MIN_ANGLE);
}

function angleToAmount(angle) {
const clamped = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle));
const ratio = (clamped - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE);
const raw = MIN + ratio * (MAX - MIN);
return Math.round(raw / 10) * 10;
}

function updateUI(amount) {
const safeAmount = Math.max(MIN, Math.min(MAX, amount));
amountSlider.value = safeAmount;
tipAmount.textContent = safeAmount.toLocaleString();
knobDial.style.transform = `rotate(${amountToAngle(safeAmount)}deg)`;

presets.forEach((btn) => {
btn.classList.toggle("active", Number(btn.dataset.amount) === safeAmount);
});
}

function getPointerAngle(event) {
const rect = knobDial.getBoundingClientRect();
const centerX = rect.left + rect.width / 2;
const centerY = rect.top + rect.height / 2;
const clientX = event.touches ? event.touches[0].clientX : event.clientX;
const clientY = event.touches ? event.touches[0].clientY : event.clientY;
const radians = Math.atan2(clientY - centerY, clientX - centerX);
let degrees = radians * (180 / Math.PI) + 90;
if (degrees > 180) degrees -= 360;
return degrees;
}

function startDrag(event) {
dragging = true;
knobDial.setPointerCapture?.(event.pointerId);
}

function onDrag(event) {
if (!dragging) return;
event.preventDefault();
updateUI(angleToAmount(getPointerAngle(event)));
}

function endDrag() {
dragging = false;
}

knobDial.addEventListener("pointerdown", startDrag);
window.addEventListener("pointermove", onDrag);
window.addEventListener("pointerup", endDrag);

knobDial.addEventListener("wheel", (event) => {
event.preventDefault();
const delta = event.deltaY > 0 ? -50 : 50;
updateUI(Number(amountSlider.value) + delta);
});

amountSlider.addEventListener("input", () => {
updateUI(Number(amountSlider.value));
});

presets.forEach((btn) => {
btn.addEventListener("click", () => {
updateUI(Number(btn.dataset.amount));
});
});

function setStatus(message, type = "") {
tipStatus.textContent = message;
tipStatus.className = `tip-status ${type}`.trim();
}

tipBtn.addEventListener("click", async () => {
const phone = phoneInput.value.trim();
const amount = Number(amountSlider.value);

if (!phone) {
setStatus("Enter your M-Pesa phone number.", "error");
return;
}

tipBtn.disabled = true;
setStatus("Sending STK push...");

try {
const response = await fetch(`${API_BASE}/api/mpesa/stk-push`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ phone, amount }),
});

const data = await response.json();

if (!response.ok) {
const hint = data.hint ? ` ${data.hint}` : "";
throw new Error((data.error || "Payment request failed") + hint);
}

setStatus(data.message, "success");
} catch (error) {
let message = error.message;
if (error.message === "Failed to fetch") {
message = "Could not reach the server. Run `python server/app.py` and open http://localhost:5000";
}
setStatus(message, "error");
} finally {
tipBtn.disabled = false;
}
});

updateUI(Number(amountSlider.value));
