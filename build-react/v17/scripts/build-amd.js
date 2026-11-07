const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { BUILD_AMD_SCRIPT, REACT_ROOT } = require('../constBuildPaths');

console.log('Running React v17 AMD build:', BUILD_AMD_SCRIPT);
const res = spawnSync('node', [BUILD_AMD_SCRIPT], { cwd: REACT_ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
if (res.status !== 0) {
  process.exit(res.status || 1);
}
console.log('React v17 AMD build finished.');
