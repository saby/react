#!/usr/bin/env node
/* init.js — инициализация окружения для сборки React v17/v19
 * Примеры:
 *   node init.js --version=17 --ignore-scripts --skip-electron-binary
 *   node init.js -v 19
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

function parseArgs() {
  const args = process.argv.slice(2);
  let version = null;
  let sslToggle = true;
  let ignoreScripts = false;
  let skipElectronBinary = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--version=")) version = a.split("=")[1];
    else if (a === "-v") {
      version = args[i + 1];
    } else if (a === "--ignore-scripts") {
      ignoreScripts = true;
    } else if (a === "--skip-electron-binary") {
      skipElectronBinary = true;
    }
  }

  if (!version || !/^(17|19)$/.test(version)) {
    console.warn("Не указана версия реакта, будет произведена сборка 17-й версии");
    version = '17';
  }
  return {
    version: `v${version}`,
    sslToggle,
    ignoreScripts,
    skipElectronBinary,
  };
}

function run(cmd, args, cwd, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, ...extraEnv };
    const p = spawn(cmd, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
      env,
    });
    p.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(`Command failed (${cmd} ${args.join(" ")}), code=${code}`)
          )
    );
  });
}

function removeFileIfExists(filePath, label) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Удалён ${label}: ${filePath}`);
    }
  } catch (e) {
    console.warn(`Не удалось удалить ${label}: ${filePath} — ${e.message}`);
  }
}

async function main() {
  const { version, sslToggle, ignoreScripts, skipElectronBinary } = parseArgs();
  const ROOT = path.resolve(__dirname);
  const buildDir = path.join(ROOT, "build-react", version);
  const sourceDir = path.join(ROOT, "react-source", version);

  if (!fs.existsSync(buildDir)) {
    console.error(`Не найдена папка сборки: ${buildDir}`);
    process.exit(3);
  }
  if (!fs.existsSync(sourceDir)) {
    console.error(`Не найдена папка исходников: ${sourceDir}`);
    process.exit(3);
  }

  console.log(`\n Инициализация для ${version}`);
  console.log(`- build dir : ${buildDir}`);
  console.log(`- source dir: ${sourceDir}\n`);

  // 0) yarn strict-ssl false (глобально)
  let sslWasToggled = false;
  if (sslToggle) {
    console.log("2) Отключаем yarn strict-ssl (глобально)...");
    try {
      await run("yarn", ["config", "set", "strict-ssl", "false", "-g"], ROOT);
      sslWasToggled = true;
    } catch (e) {
      console.warn(
        "Не удалось выставить yarn strict-ssl=false. Продолжаем.",
        e.message
      );
    }
  }

  // 1) npm install в build-react/v**
  const yarnArgs = ["install"];
  if (ignoreScripts) {
    yarnArgs.push("--ignore-scripts");
  }
    
  console.log(
    `1) Установка зависимостей в ${buildDir} через yarn (${yarnArgs.join(
      " "
    )})...`
  );
  await run("yarn", yarnArgs, buildDir);



  try {
    // 3) yarn install в react-source/v**
    const yarnArgs = ["install"];
    if (ignoreScripts) yarnArgs.push("--ignore-scripts");

    const extraEnv = {};
    if (skipElectronBinary) {
      extraEnv.ELECTRON_SKIP_BINARY_DOWNLOAD = "1";
    }

    console.log(
      `3) Установка зависимостей в ${sourceDir} через yarn (${yarnArgs.join(
        " "
      )})${skipElectronBinary ? " [ELECTRON_SKIP_BINARY_DOWNLOAD=1]" : ""}...`
    );
    await run("yarn", yarnArgs, sourceDir, extraEnv);
  } finally {
    // 4) вернуть strict-ssl обратно
    if (sslToggle) {
      console.log("4) Возвращаем yarn strict-ssl=true (глобально)...");
      try {
        await run("yarn", ["config", "set", "strict-ssl", "true", "-g"], ROOT);
      } catch (e) {
        const hint = sslWasToggled
          ? "Внимание: strict-ssl мог остаться false, проверь: yarn config get strict-ssl"
          : "strict-ssl не менялся ранее, можно игнорировать.";
        console.warn(`Не удалось вернуть strict-ssl=true. ${hint}`);
      }
    }
  }

  console.log("\n Готово! Можно запускать сборку:");
  console.log(`- v17: node build-react/v17/build.js`);
  console.log(`- v19: node build-react/v19/build-all-amd.js\n`);
}

main().catch((e) => {
  console.error("\n Ошибка инициализации:", e.message);
  process.exit(1);
});
