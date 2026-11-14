import express from "express";
import { config } from "./config.js";
import { chatRouter } from "./routes/chat.js";
import { wecomRouter } from "./routes/wecom.js";
import { adminRouter } from "./routes/admin.js";
import { startWeCom } from "./wecom/connection.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/", adminRouter);
app.use("/api", chatRouter);
app.use("/api", wecomRouter);

app.listen(config.port, () => {
  console.log(`FlyTripVisa WeCom AI running on :${config.port}`);

  if (config.wecom.botId && config.wecom.secret) {
    startWeCom();
  }
});
