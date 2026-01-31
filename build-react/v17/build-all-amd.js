const { spawnSync } = require('child_process');
const path = require('path');
const { AMD_SCRIPTS_PATH } = require('./constBuildPaths');

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (res.status !== 0) {
    process.exit(res.status || 1);
  }
}

console.log('Build React v17 AMD');
run('node', [path.join(AMD_SCRIPTS_PATH, 'build-amd.js')], __dirname);

console.log('Inject __esModule flag');
run('node', [path.join(__dirname, 'ensure-esmodule-flag.js')], __dirname);

console.log('Finalize structure');
run('node', [path.join(__dirname, 'finalize-structure.js')], __dirname);
console.log('Done');
