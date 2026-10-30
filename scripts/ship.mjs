#!/usr/bin/env node
/**
 * Publica automaticamente: Git commit → push GitHub → Vercel (produção).
 * Uso: npm run ship
 *      npm run ship -- "mensagem do commit"
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

const SKIP = [
  ".env",
  ".env.local",
  ".env.production",
  "content/data/metrics.json",
  "content/data/contact-messages.json",
  "mota-bushcraft-flyer.png",
  "mota-bushcraft-flyer-v1.png",
];

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  return execSync(cmd, {
    stdio: opts.silent ? "pipe" : "inherit",
    encoding: "utf8",
    ...opts,
  });
}

function tryRun(cmd, opts = {}) {
  try {
    run(cmd, opts);
    return true;
  } catch {
    return false;
  }
}

const msg =
  process.argv.slice(2).join(" ").trim() ||
  `chore: publish site ${new Date().toISOString().slice(0, 16).replace("T", " ")}`;

console.log("=== EQUILÍBRIO INTEGRAL — ship automático ===");

run("git add -A");

// Never commit secrets / noisy runtime files
for (const f of SKIP) {
  tryRun(`git restore --staged -- "${f}"`, { silent: true });
}

let status = "";
try {
  status = run("git status --porcelain", { silent: true }) || "";
} catch {
  status = "";
}

if (!String(status).trim()) {
  console.log("Nenhuma alteração local para commit. Seguindo para deploy…");
} else {
  const safeMsg = msg.replace(/"/g, "'");
  if (!tryRun(`git commit -m "${safeMsg}"`)) {
    console.log("Commit não criado (talvez sem mudanças staged). Continuando…");
  }
}

let pushed = false;
if (tryRun("git push -u origin HEAD")) {
  pushed = true;
  console.log("✓ Push no GitHub concluído → Vercel deve iniciar deploy automático.");
} else {
  console.warn("⚠ Push no GitHub falhou (faça: gh auth login). Publicando direto na Vercel…");
}

// Sempre garante produção atualizada
if (!tryRun("vercel --prod --yes")) {
  console.error("✗ Deploy Vercel falhou.");
  process.exit(1);
}

console.log("\n✓ Site publicado em produção.");
if (!pushed) {
  console.log("Dica: rode `gh auth login` uma vez para o push GitHub ficar automático também.");
}
console.log("URL: https://equilibrio-one-nu.vercel.app");
