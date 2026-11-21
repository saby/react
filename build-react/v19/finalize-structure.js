const { STRUCTURE_MAP, PREBUILD_PATH, THIRD_PARTY_PATH } = require('./constBuildPaths');
const fs = require('fs');
const path = require('path');
const structureMap = require(STRUCTURE_MAP);


function copyFileSafe(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function finalizeStructure() {
    for (const [from, to] of Object.entries(structureMap)) {
    const absSrc = path.join(PREBUILD_PATH, from);
    const absDest = path.join(THIRD_PARTY_PATH, to);
    if (!fs.existsSync(absSrc)) {
      console.warn('[skip] не найдено:', absSrc);
      continue;
    }
    copyFileSafe(absSrc, absDest);
    console.log('[ok]', absDest);
  }
}

finalizeStructure();
