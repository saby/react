'use strict';

const {
  BUILD_AMD_ROOT,
  REACT_BUILD_PATH,
  AMD_SCRIPTS_PATH,
  ROLLUP_SCRIPTS_PATH,
  PREBUILD_PATH,
  REACT_BUILD_AMD_PATH,
  AMD_CUSTOM_FILES,
} = require("./constBuildPaths");

const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");

function runNode(scriptAbsPath, cwd, envAdd = {}) {
  const r = spawnSync(process.execPath, [scriptAbsPath], {
    cwd,
    stdio: "inherit",
    shell: false,
    env: { ...process.env, ...envAdd },
  });
  if (r.status !== 0) {
    process.exit(r.status || 1);
  }
}

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursiveSync(s, d);
    }
    else {
      fs.copyFileSync(s, d);
    }
  }
}

function removeDirSync(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removeDirSync(full);
    }
    else {
      fs.unlinkSync(full);
    }
  }
  fs.rmdirSync(dir);
}

function copyAmdScriptsToRollup() {
  console.log("Копирование кастомных amd-скриптов...");
  for (const fname of AMD_CUSTOM_FILES) {
    const src = path.join(AMD_SCRIPTS_PATH, fname);
    const dest = path.join(ROLLUP_SCRIPTS_PATH, fname);
    fs.copyFileSync(src, dest);
  }
}

function removeAmdScriptsFromRollup() {
  console.log("Удаление кастомных amd-скриптов из rollup...");
  for (const fname of AMD_CUSTOM_FILES) {
    const dest = path.join(ROLLUP_SCRIPTS_PATH, fname);
    if (fs.existsSync(dest)) {
      fs.unlinkSync(dest);
    }
  }
}

// build-react-amd.js — запускаем в каталоге build-react/v19
function buildMainReactBundles() {
  console.log("Сборка основных React-бандлов...");
  const script = path.join(AMD_SCRIPTS_PATH, "build-react-amd.js");
  runNode(script, BUILD_AMD_ROOT);
}

// scheduler собираем с node_modules из репозитория react
function buildSchedulerAmd() {
  console.log("Сборка scheduler (amd)...");
  // реактовый корень: на две директории выше от scripts/rollup → <react-root>
  const reactRoot = path.resolve(ROLLUP_SCRIPTS_PATH, "..", "..");
  const script = path.join(AMD_SCRIPTS_PATH, "build-scheduler-amd.js");
  runNode(script, reactRoot);
}

function fixDefines() {
  console.log("Исправление define...");
  const script = path.join(BUILD_AMD_ROOT, "fix-amd-defines.js");
  runNode(script, BUILD_AMD_ROOT);
}

function minifyProd() {
  console.log("Минификация prod файлов...");
  const script = path.join(BUILD_AMD_ROOT, "minify-prod-files.js");
  runNode(script, BUILD_AMD_ROOT);
}

function generateStructure() {
  console.log("Создаем финальную структуру файлов...");
  const script = path.join(BUILD_AMD_ROOT, "finalize-structure.js");
  runNode(script, BUILD_AMD_ROOT);
}

async function main() {
  // 0. Копируем кастомные amd-скрипты в react/scripts/rollup
  copyAmdScriptsToRollup();

  // 1. Сборка
  try {
    buildMainReactBundles();
    buildSchedulerAmd();
  } finally {
    // 1.1. Удаляем скопированные скрипты
    removeAmdScriptsFromRollup();
  }

  // 2. Копируем сборку в prebuild (очистив старый)
  if (fs.existsSync(PREBUILD_PATH)) {
    removeDirSync(PREBUILD_PATH);
  }
  copyRecursiveSync(REACT_BUILD_AMD_PATH, PREBUILD_PATH);

  // 3. Чистим react/build
  if (fs.existsSync(REACT_BUILD_PATH)) {
    removeDirSync(REACT_BUILD_PATH);
  }

  // 4. Фиксим define
  fixDefines();

  // 5. Минифицируем prod-файлы
  minifyProd();

  // 6. Создаем финальную структуру
  try {
    generateStructure();
  } finally {
    // 6.1. Удаляем prebuild
    if (fs.existsSync(PREBUILD_PATH)) {
      removeDirSync(PREBUILD_PATH);
    }
  }

  console.log("Процесс успешно завершен");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
