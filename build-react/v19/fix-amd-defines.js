const { PREBUILD_PATH, DEFINE_FIXES_MAP } = require('./constBuildPaths');
const fs = require('fs');
const path = require('path');
const fixesMap = require(DEFINE_FIXES_MAP);

function walk(dir, cb) {
  fs.readdirSync(dir, {withFileTypes: true}).forEach(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, cb);
    }
    else if (entry.isFile() && full.endsWith('.js')) {
      cb(full);
    }
  });
}

function fixDefineInFile(filepath, amdName) {
  let code = fs.readFileSync(filepath, 'utf8');
  // Ищем define(["..."]) и вставляем имя
 code = code.replace(
    /^define\s*\(\s*(\[[^\]]*?\])\s*,/m,
    `define("${amdName}", $1,`
  );
  fs.writeFileSync(filepath, code);
  console.log('✔ define fixed:', filepath, '->', amdName);
}

function main() {
  walk(PREBUILD_PATH, file => {
    const rel = path.relative(PREBUILD_PATH, file).replace(/\\/g, '/');
    const amdName = fixesMap[rel];
    if (amdName) {
      fixDefineInFile(file, amdName);
    }
  });
}

main();
