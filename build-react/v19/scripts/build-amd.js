"use strict";

const rollup = require("rollup");
const babel = require("@rollup/plugin-babel").babel;
const flowRemoveTypes = require("flow-remove-types");
const replace = require("@rollup/plugin-replace");
const stripBanner = require("rollup-plugin-strip-banner");
const chalk = require("chalk");
const resolve = require("@rollup/plugin-node-resolve").nodeResolve;
const Modules = require("./modules");
const Bundles = require("./bundles-amd");
const Packaging = require("./packaging-amd");
const Wrappers = require("./wrappers-amd");
const sizes = require("./plugins/sizes-plugin");
const useForks = require("./plugins/use-forks-plugin");
const dynamicImports = require("./plugins/dynamic-imports");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
const path = require("path");


const { AMD_DEV, AMD_PROD } = Bundles.bundleTypes;

const { getFilename } = Bundles;

function isProductionBundleType(bundleType) {
  return bundleType === AMD_PROD;
}

function getFormat(bundleType) {
  switch (bundleType) {
    case AMD_DEV:
    case AMD_PROD:
      return "amd";
    default:
      throw new Error(`Unknown format for bundleType: ${bundleType}`);
  }
}

function forbidFBJSImports() {
  return {
    name: "forbidFBJSImports",
    resolveId(importee, importer) {
      if (/^fbjs\//.test(importee)) {
        throw new Error(
          `Don't import ${importee} (found in ${importer}). Use the utilities in packages/shared/ instead.`
        );
      }
    },
  };
}

function getPlugins(
  entry,
  externals,
  updateBabelOptions,
  filename,
  packageName,
  bundleType,
  globalName,
  moduleType,
  pureExternalModules,
  bundle
) {
  const isProduction = isProductionBundleType(bundleType);

  // Базовый набор babel-плагинов (оставь свои, если нужно)
  const babelPlugins = [
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    "syntax-trailing-function-commas",
    [
      "@babel/plugin-proposal-object-rest-spread",
      { loose: true, useBuiltIns: true },
    ],
    ["@babel/plugin-transform-template-literals", { loose: true }],
    "@babel/plugin-transform-for-of",
    ["@babel/plugin-transform-spread", { loose: true, useBuiltIns: true }],
    "@babel/plugin-transform-parameters",
    [
      "@babel/plugin-transform-destructuring",
      { loose: true, useBuiltIns: true },
    ],
    require("../babel/transform-object-assign"),
  ];

  function getBabelConfig() {
    return {
      exclude: "/**/node_modules/**",
      babelrc: false,
      configFile: false,
      presets: [],
      plugins: [...babelPlugins],
      babelHelpers: "bundled",
      sourcemap: false,
    };
  }

  return [
    dynamicImports(),
    bundle.tsconfig != null
      ? typescript({ tsconfig: bundle.tsconfig })
      : {
          name: "rollup-plugin-flow-remove-types",
          transform(code) {
            const transformed = flowRemoveTypes(code);
            return {
              code: transformed.toString(),
              map: null,
            };
          },
        },
    bundle.tsconfig != null ? commonjs() : false,
    useForks(Modules.getForks(bundleType, entry, moduleType, bundle)),
    forbidFBJSImports(),
    resolve(),
    stripBanner({ exclude: "node_modules/**/*" }),
    babel(getBabelConfig()),
    replace({
      preventAssignment: true,
      values: {
        __DEV__: isProduction ? "false" : "true",
        __PROFILE__: !isProduction ? "true" : "false",
        "process.env.NODE_ENV": isProduction ? "'production'" : "'development'",
        __EXPERIMENTAL__: "false",
      },
    }),
    {
      name: "top-level-definitions",
      renderChunk(source) {
        return Wrappers.wrapWithTopLevelDefinitions(
          source,
          bundleType,
          globalName,
          filename,
          moduleType,
          bundle.wrapWithModuleBoundaries
        );
      },
    },
    {
      name: "license-and-signature-header",
      renderChunk(source) {
        return Wrappers.wrapWithLicenseHeader(
          source,
          bundleType,
          globalName,
          filename,
          moduleType
        );
      },
    },
    sizes({
      getSize: (size, gzip) => {},
    }),
  ].filter(Boolean);
}

function shouldSkipBundle(bundle, bundleType) {
  return bundle.bundleTypes.indexOf(bundleType) === -1;
}

async function createBundle(bundle, bundleType) {
  const filename = getFilename(bundle, bundleType);
  const logKey =
    chalk.white.bold(filename) + chalk.dim(` (${bundleType.toLowerCase()})`);
  const format = getFormat(bundleType);
  const packageName = Packaging.getPackageName(bundle.entry);

  const ROOT = path.resolve(__dirname, "..", "..");
  let entryPath;

  if (bundle.entry === "react") {
    // для dev — на dev-энтри из исходников (даёт React.act)
    if (!isProductionBundleType(bundleType)) {
      entryPath = path.resolve(
        ROOT,
        "packages/react/index.stable.development.js"
      );
    } else {
      entryPath = require.resolve("react");
    }
  } else {
    entryPath = bundle.entry.startsWith("packages/")
      ? path.resolve(ROOT, bundle.entry)
      : require.resolve(bundle.entry);
  }

  const peerGlobals = Modules.getPeerGlobals(
    bundle.externals || [],
    bundleType
  );
  let externals = Object.keys(peerGlobals);

  const deps = Modules.getDependencies(bundleType, bundle.entry);
  externals = externals.concat(deps);

  const importSideEffects = Modules.getImportSideEffects();
  const pureExternalModules = Object.keys(importSideEffects).filter(
    (module) => !importSideEffects[module]
  );

  const rollupConfig = {
    input: require.resolve(entryPath),
    treeshake: {
      moduleSideEffects: (id, external) =>
        !(external && pureExternalModules.includes(id)),
      propertyReadSideEffects: false,
    },
    external(id) {
      const containsThisModule = (pkg) =>
        id === pkg || id.startsWith(pkg + "/");
      const isProvidedByDependency = externals.some(containsThisModule);
      if (isProvidedByDependency) {
        if (id.includes("/src/")) {
          throw Error(
            "You are trying to import " +
              id +
              " but " +
              externals.find(containsThisModule) +
              " is one of npm dependencies, " +
              "so it will not contain that source file. You probably want " +
              "to create a new bundle entry point for it instead."
          );
        }
        return true;
      }
      return !!peerGlobals[id];
    },
    plugins: getPlugins(
      bundle.entry,
      externals,
      bundle.babel,
      filename,
      packageName,
      bundleType,
      bundle.global,
      bundle.moduleType,
      pureExternalModules,
      bundle
    ),
    output: {
      file: Packaging.getBundleOutputPath(
        bundle,
        bundleType,
        filename,
        packageName
      ),
      format: format,
      freeze: !isProductionBundleType(bundleType),
      interop: "esModule",
      name: bundle.global,
      sourcemap: false,
      esModule: false,
      exports: "auto",
    },
    onwarn(warning) {
      if (warning.code === "CIRCULAR_DEPENDENCY") {
        return;
      }
      console.warn(warning.message || warning);
    },
  };

  console.log(`${chalk.bgYellow.black(" BUILDING ")} ${logKey}`);
  try {
    const result = await rollup.rollup(rollupConfig);
    await result.write(rollupConfig.output);
  } catch (error) {
    console.log(`${chalk.bgRed.black(" OH NOES! ")} ${logKey}\n`);
    throw error;
  }
  console.log(`${chalk.bgGreen.black(" COMPLETE ")} ${logKey}\n`);
}

async function buildEverything() {
  let bundles = [];
  for (const bundle of Bundles.bundles) {
    bundles.push([bundle, AMD_DEV], [bundle, AMD_PROD]);
  }
  bundles = bundles.filter(
    ([bundle, bundleType]) => !shouldSkipBundle(bundle, bundleType)
  );
  for (const [bundle, bundleType] of bundles) {
    if (bundle.prebuild) {
      // prebuild не используем
    }
    await createBundle(bundle, bundleType);
  }
}

buildEverything();
