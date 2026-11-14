(function () {
  const messages = document.getElementById("messages");
  const input = document.getElementById("input");
  const sendBtn = document.getElementById("send");
  const statusEl = document.getElementById("wecomStatus");
  const connDot = document.getElementById("connDot");
  const newChat = document.getElementById("newChat");

  let convId = null;
  let streaming = false;

  function addMsg(text, role) {
    const empty = messages.querySelector(".empty-state");
    if (empty) empty.remove();

    const el = document.createElement("div");
    el.className = "msg " + role;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  async function refreshStatus() {
    try {
      const r = await fetch("/api/wecom/status");
      const d = await r.json();
      statusEl.textContent = d.status;
      connDot.className = "dot " + (d.status === "connected" ? "green" : d.status === "error" ? "red" : "grey");
    } catch {}
  }

  async function send() {
    const text = input.value.trim();
    if (!text || streaming) return;

    addMsg(text, "user");
    input.value = "";
    streaming = true;
    sendBtn.disabled = true;

    const typing = addMsg("Thinking…", "ai typing");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId: convId }),
      });
      const data = await res.json();
      typing.remove();
      if (!res.ok) throw new Error(data.error || "Failed");

      convId = data.conversationId;
      addMsg(data.reply, "ai");
    } catch (e) {
      typing.remove();
      addMsg("Error: " + e.message, "ai");
    } finally {
      streaming = false;
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
  });
  newChat.addEventListener("click", () => {
    convId = null;
    messages.innerHTML = '<div class="empty-state">New conversation started.</div>';
  });

  refreshStatus();
  setInterval(refreshStatus, 8000);
})();
