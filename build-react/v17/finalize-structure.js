const fs = require("fs");
const path = require("path");
const {
  PREBUILD_PATH,
  THIRD_PARTY_PATH,
  THIRD_PARTY_PREBUILD_PATH,
} = require("./constBuildPaths");
const STRUCTURE_MAP = require("./constStructureMap");

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function copyMapped() {
  for (const [srcRel, dstRel] of Object.entries(STRUCTURE_MAP)) {
    const src = path.join(PREBUILD_PATH, srcRel);
    const dst = path.join(THIRD_PARTY_PATH, dstRel);
    if (!fs.existsSync(src)) {
      console.warn("[warn] missing prebuild file:", srcRel);
      continue;
    }
    ensureDir(dst);
    fs.copyFileSync(src, dst);
    console.log("copied", srcRel, "->", dstRel);
  }
}

function cleanProfiling() {
  // подчистим мусор: *.profiling.min.js и лишние *.development*.js, если вдруг остались
  const removeRoots = [PREBUILD_PATH, THIRD_PARTY_PATH];
  for (const root of removeRoots) {
    if (!fs.existsSync(root)) {
      continue;
    }

    const stack = [root];
    while (stack.length) {
      const dir = stack.pop();
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const st = fs.statSync(full);
        if (st.isDirectory()) {
          stack.push(full);
          continue;
        }
        if (
          /\.profiling\.min\.js$/.test(entry) ||
          /\.development(\.min)?\.js$/.test(entry)
        ) {
          try {
            fs.unlinkSync(full);
          } catch {}
        }
      }
    }
  }
}

function removePrebuild() {
  try {
    if (fs.existsSync(THIRD_PARTY_PREBUILD_PATH)) {
      fs.rmSync(THIRD_PARTY_PREBUILD_PATH, { recursive: true, force: true });
      console.log("removed prebuild folder");
    }
  } catch (e) {
    console.warn("[warn] cannot remove prebuild folder:", e && e.message);
  }
}

copyMapped();
cleanProfiling();
removePrebuild();
console.log("finalize-structure: done");
