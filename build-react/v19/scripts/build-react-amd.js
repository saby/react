const { BUILD_AMD_SCRIPT, REACT_ROOT } = require('../constBuildPaths');
const {spawnSync} = require('child_process');

const result = spawnSync(
  process.execPath,
  [
    BUILD_AMD_SCRIPT,
    '--type=amd_dev,amd_prod'
  ],
  { cwd: REACT_ROOT, stdio: 'inherit' }
);

process.exit(result.status);
