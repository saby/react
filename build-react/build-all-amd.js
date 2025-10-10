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
const { execSync } = require("child_process");


function copyAmdScriptsToRollup() {
  console.log("==> Копирование кастомных amd-скриптов...");
  for (const fname of AMD_CUSTOM_FILES) {
    const src = path.join(AMD_SCRIPTS_PATH, fname);
    const dest = path.join(ROLLUP_SCRIPTS_PATH, fname);
    fs.copyFileSync(src, dest);
  }
}

function removeAmdScriptsFromRollup() {
  console.log("==> Удаление кастомных amd-скриптов из rollup...");
  for (const fname of AMD_CUSTOM_FILES) {
    const dest = path.join(ROLLUP_SCRIPTS_PATH, fname);
    if (fs.existsSync(dest)) { 
        fs.unlinkSync(dest);
    }
  }
}

// !!! build-react-amd.js должен запускать react/scripts/rollup/build-amd.js
function buildMainReactBundles() {
  console.log("==> Сборка основных React-бандлов...");
  execSync("node build-react-amd.js", { stdio: "inherit", cwd: path.resolve(BUILD_AMD_ROOT) });
}

// !!! build-scheduler-amd.js должен запускать с node-modules из react
function buildSchedulerAmd() {
  console.log("==> Сборка scheduler (amd)...");
  execSync("node ../build-amd/build-scheduler-amd.js", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, "../react"),
    env: process.env,
  });
}

function fixDefines() {
  console.log("==> Исправление define...");
  execSync("node fix-amd-defines.js", {
    stdio: "inherit",
    cwd: BUILD_AMD_ROOT,
  });
}

function minifyProd() {
  console.log("==> Минифицация prod файлов...");
  execSync("node minify-prod-files.js", {
    stdio: "inherit",
    cwd: BUILD_AMD_ROOT,
  });
}

function generateStructure() {
  console.log("==> Создаем финальную структуру файлов...");
  execSync("node finalize-structure.js", {
    stdio: "inherit",
    cwd: BUILD_AMD_ROOT,
  });
}

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function removeDirSync(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
        removeDirSync(fullPath);
    }
    else {
        fs.unlinkSync(fullPath);
    }
  }
  fs.rmdirSync(dir);
}

async function main() {
  // 0. Копируем скрипты для сборки
  copyAmdScriptsToRollup();
  // 1. Сборка
  try {
    buildMainReactBundles();
    buildSchedulerAmd();
  } finally {
    // 1.1. Удаляем скопирвоанные скрипты из директории реакта
    removeAmdScriptsFromRollup();
  }
  // 2. Копируем сборку в third-party (очистив third-party, если надо)
  if (fs.existsSync(PREBUILD_PATH)) {
    removeDirSync(PREBUILD_PATH);
  }
  copyRecursiveSync(REACT_BUILD_AMD_PATH, PREBUILD_PATH);

  // 3. Удаляем build/react/build
  if (fs.existsSync(REACT_BUILD_PATH)) {
    removeDirSync(REACT_BUILD_PATH);
  }

  // 4. Применяем фиксы define
  fixDefines();

  // 5. Минификация продакшен файлов
  minifyProd();

  // 6. Создаем стуруктуру каталогов
  try {   
    generateStructure();
  } finally {
    // 6.1. Удаляем скопирвоанные скрипты из директории реакта
    removeDirSync(PREBUILD_PATH);
  }  

  console.log("Процесс успешно завершен");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
