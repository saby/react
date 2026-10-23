// Добавляет флаг __esModule:
//  - для *.min.js: Object.defineProperty(d,"__esModule",{value:!0})
//  - для прочих:   Object.defineProperty(exports, '__esModule', { value: true });
// Вставка — ПЕРЕД последней закрывающей скобкой } файла.

const fs = require("fs");
const path = require("path");
const { PREBUILD_PATH } = require("./constBuildPaths");

// собрать все .js рекурсивно
function collectJs(root) {
  const res = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) {
        stack.push(full);
      } else if (st.isFile() && name.endsWith(".js")) {
        res.push(full);
      }
    }
  }
  return res;
}

// вытащить идентификатор параметра exports из AMD-обёртки
function guessExportsIdent(content) {
  // define(['exports', ...], function (exp, ...) { ... })
  const re =
    /define\(\s*(?:['"][^'"]+['"]\s*,\s*)?\[(.*?)\]\s*,\s*function\s*\((.*?)\)\s*\{/s;
  const m = content.match(re);
  if (!m) {
    return "exports";
  }

  const deps = (m[1] || "")
    .split(",")
    .map((s) => s.replace(/['"\s]/g, "").trim())
    .filter(Boolean);
  const params = (m[2] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const idx = deps.indexOf("exports");
  if (idx >= 0 && params[idx]) {
    return params[idx];
  }

  // fallback: возьмём первый параметр, если не нашли
  return params[0] || "exports";
}

function alreadyHasFlag(content) {
  return /__esModule/.test(content);
}

// compact=true  → формат для .min.js (без \n, двойные кавычки, !0)
// compact=false → красивый формат для не-минифицированных
function injectBeforeLastBrace(content, exportsIdent, compact) {
  const last = content.lastIndexOf("}");
  if (last === -1) {
    return null;
  }

  const inj = compact
    ? `;Object.defineProperty(${exportsIdent},"__esModule",{value:!0})`
    : `Object.defineProperty(${exportsIdent}, '__esModule', { value: true });\n\n`;

  return content.slice(0, last) + inj + content.slice(last);
}

function processFile(file) {
  const src = fs.readFileSync(file, "utf8");
  if (alreadyHasFlag(src)) {
    return false;
  }

  const exp = guessExportsIdent(src);
  const isMin = file.endsWith(".min.js"); // критерий минификации
  const out = injectBeforeLastBrace(src, exp, isMin);
  if (out == null) {
    console.warn("[warn] no closing brace found, skip:", file);
    return false;
  }
  fs.writeFileSync(file, out);
  return true;
}

function main() {
  if (!fs.existsSync(PREBUILD_PATH)) {
    console.error("No prebuild folder:", PREBUILD_PATH);
    process.exit(2);
  }
  const files = collectJs(PREBUILD_PATH);
  let patched = 0;
  for (const f of files) {
    try {
      if (processFile(f)) {
        patched++;
      }
    } catch (e) {
      console.warn("[warn] failed to patch", f, e && e.message);
    }
  }
  console.log(`ensure-esmodule-flag: patched ${patched}/${files.length} files`);
}

main();
