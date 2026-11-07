const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..'); // repo root
const PROJECT_ROOT = path.resolve(__dirname, '..'); // build-react
const BUILD_AMD_ROOT = __dirname; // build-react/v17

const REACT_ROOT = path.join(ROOT, 'react-source', 'v17'); // react sources v17
const ROLLUP_SCRIPTS_PATH = path.join(REACT_ROOT, 'scripts-amd');
const BUILD_AMD_SCRIPT = path.join(ROLLUP_SCRIPTS_PATH, 'build.js');

// where react's internal build drops files (optional, not required here)
const REACT_BUILD_PATH = path.join(REACT_ROOT, 'build');
const REACT_BUILD_AMD_PATH = path.join(REACT_BUILD_PATH, 'amd');

// output destinations
const THIRD_PARTY_PATH = path.join(ROOT, 'React', 'third-party', 'v17'); // final
const THIRD_PARTY_PREBUILD_PATH = path.join(BUILD_AMD_ROOT, 'third-party'); 
const PREBUILD_PATH = path.join(THIRD_PARTY_PREBUILD_PATH, 'prebuild'); 

const AMD_SCRIPTS_PATH = path.join(BUILD_AMD_ROOT, 'scripts');
const DEFINE_FIXES_MAP = path.join(BUILD_AMD_ROOT, 'constFixesMap.js');
const STRUCTURE_MAP = path.join(BUILD_AMD_ROOT, 'constStructureMap.js');

module.exports = {
  ROOT,
  PROJECT_ROOT,
  BUILD_AMD_ROOT,
  REACT_ROOT,
  REACT_BUILD_PATH,
  REACT_BUILD_AMD_PATH,
  THIRD_PARTY_PATH,
  THIRD_PARTY_PREBUILD_PATH,
  PREBUILD_PATH,
  AMD_SCRIPTS_PATH,
  ROLLUP_SCRIPTS_PATH,
  DEFINE_FIXES_MAP,
  BUILD_AMD_SCRIPT,
  STRUCTURE_MAP,
};
