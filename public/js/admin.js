const $ = (id) => document.getElementById(id);

async function load() {
  const r = await fetch("/api/wecom/status");
  const d = await r.json();
  $("statusBox").textContent = d.status;
  if (d.config) {
    $("botName").value = d.config.botName || "";
    $("botId").value = d.config.botId || "";
    $("wsUrl").value = d.config.wsUrl || "wss://openws.work.weixin.qq.com";
    $("enabled").checked = !!d.config.enabled;
  }
  $("logs").textContent = JSON.stringify(d.stats || {}, null, 2);
}

$("saveBtn").onclick = async () => {
  const r = await fetch("/api/wecom/configure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      botName: $("botName").value,
      botId: $("botId").value,
      secret: $("secret").value,
      wsUrl: $("wsUrl").value,
      enabled: $("enabled").checked,
    }),
  });
  const d = await r.json();
  $("cfgMsg").textContent = d.ok ? "Saved. Secret masked: " + (d.secretMasked || "") : "Error";
  load();
};

$("connectBtn").onclick = async () => {
  await fetch("/api/wecom/connect", { method: "POST" });
  load();
};
$("disconnectBtn").onclick = async () => {
  await fetch("/api/wecom/disconnect", { method: "POST" });
  load();
};
$("testBtn").onclick = async () => {
  await fetch("/api/wecom/test", { method: "POST" });
  load();
};

load();
setInterval(load, 6000);
