const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BUILD_AMD_ROOT = __dirname;
const REACT_ROOT = path.join(PROJECT_ROOT, 'react');
const REACT_BUILD_PATH = path.join(PROJECT_ROOT, 'build');

const REACT_SCHEDULER_SOURCE_PATH = path.join(REACT_ROOT, 'packages', 'scheduler');
const REACT_BUILD_AMD_PATH = path.join(REACT_ROOT, 'build', 'amd');
const REACT_SCHEDULER_OUT_PATH = path.join(REACT_BUILD_AMD_PATH, 'scheduler');
const ROLLUP_SCRIPTS_PATH = path.join(REACT_ROOT, 'scripts', 'rollup');
const BUILD_AMD_SCRIPT = path.join(ROLLUP_SCRIPTS_PATH, 'build-amd.js');

const THIRD_PARTY_PATH = path.join(BUILD_AMD_ROOT, 'third-party');
const PREBUILD_PATH = path.join(THIRD_PARTY_PATH, 'prebuild');
const AMD_SCRIPTS_PATH = path.join(BUILD_AMD_ROOT, 'scripts');
const DEFINE_FIXES_MAP = path.join(BUILD_AMD_ROOT, 'constFixesMap.js');
const STRUCTURE_MAP = path.join(BUILD_AMD_ROOT, 'constStructureMap.js');


const AMD_CUSTOM_FILES = [
  "build-amd.js",
  "bundles-amd.js",
  "packaging-amd.js",
  "wrappers-amd.js",
];

module.exports = {
  PROJECT_ROOT,
  BUILD_AMD_ROOT,
  REACT_ROOT,
  PREBUILD_PATH,
  THIRD_PARTY_PATH,
  AMD_SCRIPTS_PATH,
  ROLLUP_SCRIPTS_PATH,
  DEFINE_FIXES_MAP,
  BUILD_AMD_SCRIPT,
  REACT_SCHEDULER_SOURCE_PATH,
  REACT_SCHEDULER_OUT_PATH,
  REACT_BUILD_PATH,
  REACT_BUILD_AMD_PATH,
  AMD_CUSTOM_FILES,
  STRUCTURE_MAP
};
