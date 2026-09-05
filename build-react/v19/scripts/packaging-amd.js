'use strict';

const Bundles = require('./bundles-amd');

const {
  AMD_DEV,
  AMD_PROD,
} = Bundles.bundleTypes;

function getPackageName(name) {
  if (name.indexOf('/') !== -1) {
    return name.split('/')[0];
  }
  return name;
}

function getBundleOutputPath(bundle, bundleType, filename, packageName) {
  switch (bundleType) {
    case AMD_DEV:
    case AMD_PROD:
      // Собираем всё в build/amd/<package>/<file>
      return `build/amd/${packageName}/${filename}`;
    default:
      throw new Error('Unknown bundle type for AMD build.');
  }
}

module.exports = {
  getPackageName,
  getBundleOutputPath,
};
