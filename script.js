
function escapeHtml(text) {
const div = document.createElement("div");
div.textContent = text;
return div.innerHTML;
}

function appendMessage(container, role, text) {
const bubble = document.createElement("div");
bubble.className = `message ${role}`;
bubble.innerHTML = `<strong>${role === "user" ? "You" : "CraigGPT"}:</strong> ${escapeHtml(text)}`;
container.appendChild(bubble);
container.scrollTop = container.scrollHeight;
}

function showTyping(container) {
const typing = document.createElement("div");
typing.className = "message bot typing";
typing.dataset.typing = "true";
typing.textContent = "CraigGPT is typing...";
container.appendChild(typing);
container.scrollTop = container.scrollHeight;
return typing;
}

function hideTyping(container) {
container.querySelector('[data-typing="true"]')?.remove();
}

async function requestReply(message) {
const response = await fetch(`${API_BASE}/api/chat`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ message }),
});

const data = await response.json();
if (!response.ok) {
throw new Error(data.error || "Something went wrong.");
}

return data.reply;
}

async function handleChat(input, messagesContainer) {
const text = input.value.trim();
if (!text) return;

appendMessage(messagesContainer, "user", text);
input.value = "";
const typing = showTyping(messagesContainer);

try {
const reply = await requestReply(text);
hideTyping(messagesContainer);
appendMessage(messagesContainer, "bot", reply);
} catch (error) {
hideTyping(messagesContainer);
const message =
error.message === "Failed to fetch"
? "Could not reach the server. Run `python server/app.py` and open http://localhost:5000"
: error.message;
appendMessage(messagesContainer, "bot", message);
}
}

async function sendMessage() {
const input = document.getElementById("userInput");
const messages = document.getElementById("messages");
if (!input || !messages) return;
await handleChat(input, messages);
}

async function sendWidgetMessage() {
const input = document.getElementById("widgetInput");
const messages = document.getElementById("widgetMessages");
if (!input || !messages) return;
await handleChat(input, messages);
}

document.getElementById("userInput")?.addEventListener("keydown", (event) => {
if (event.key === "Enter") {
event.preventDefault();
sendMessage();
}
});

document.getElementById("widgetInput")?.addEventListener("keydown", (event) => {
if (event.key === "Enter") {
event.preventDefault();
sendWidgetMessage();
}
});

document.getElementById("widgetSend")?.addEventListener("click", sendWidgetMessage);

const chatToggle = document.getElementById("chatToggle");
const chatWidget = document.getElementById("chatWidget");
const chatClose = document.getElementById("chatClose");

chatToggle?.addEventListener("click", () => {
chatWidget?.classList.toggle("open");
chatWidget?.setAttribute("aria-hidden", chatWidget.classList.contains("open") ? "false" : "true");
});

chatClose?.addEventListener("click", () => {
chatWidget?.classList.remove("open");
chatWidget?.setAttribute("aria-hidden", "true");
});
