import { execSync } from "node:child_process";
import fs from "node:fs";

const dir = "flytripvisa-wecom-ai";
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });

execSync(`cp -r public src tests *.json *.md Dockerfile .env.example .gitignore ${dir}/`, {
  stdio: "inherit",
});

execSync(`cd ${dir} && rm -rf node_modules dist data`);
execSync(`cd ${dir}/.. && zip -r flytripvisa-wecom-ai.zip ${dir}`);

console.log("Created flytripvisa-wecom-ai.zip");