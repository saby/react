'use strict';

function wrapWithTopLevelDefinitions(
  source,
  bundleType,
  globalName,
  filename,
  moduleType,
  wrapWithModuleBoundaries
) {
  return source;
}

function wrapWithLicenseHeader(
  source,
  bundleType,
  globalName,
  filename,
  moduleType
) {
  return source;
}

module.exports = {
  wrapWithTopLevelDefinitions,
  wrapWithLicenseHeader,
};
