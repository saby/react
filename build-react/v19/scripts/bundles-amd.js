'use strict';

const bundleTypes = {
  AMD_DEV: 'AMD_DEV',
  AMD_PROD: 'AMD_PROD',
};
const {AMD_DEV, AMD_PROD} = bundleTypes;

const moduleTypes = {
  ISOMORPHIC: 'ISOMORPHIC',
  RENDERER: 'RENDERER',
  RENDERER_UTILS: 'RENDERER_UTILS',
  RECONCILER: 'RECONCILER',
};
const {ISOMORPHIC, RENDERER, RENDERER_UTILS, RECONCILER} = moduleTypes;

const bundles = [
  /******* Isomorphic *******/
  {
    bundleTypes: [
      AMD_DEV,
      AMD_PROD,
    ],
    moduleType: ISOMORPHIC,
    entry: 'react',
    global: 'React',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    externals: ['ReactNativeInternalFeatureFlags'],
  },

  /******* Isomorphic Shared Subset *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'react/src/ReactServer.js',
    name: 'react.react-server',
    condition: 'react-server',
    global: 'React',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: [],
  },

  /******* React JSX Runtime *******/
  {
    bundleTypes: [
      AMD_DEV,
      AMD_PROD,
    ],
    moduleType: ISOMORPHIC,
    entry: 'react/jsx-runtime',
    global: 'JSXRuntime',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['react', 'ReactNativeInternalFeatureFlags'],
  },

  /******* Compiler Runtime *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'react/compiler-runtime',
    global: 'CompilerRuntime',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['react'],
  },

  /******* React JSX Runtime React Server *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'react/src/jsx/ReactJSXServer.js',
    name: 'react-jsx-runtime.react-server',
    condition: 'react-server',
    global: 'JSXRuntime',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['react', 'ReactNativeInternalFeatureFlags'],
  },

  /******* React JSX DEV Runtime *******/
  {
    bundleTypes: [
      AMD_DEV,
      AMD_PROD,
    ],
    moduleType: ISOMORPHIC,
    entry: 'react/jsx-dev-runtime',
    global: 'JSXDEVRuntime',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['react', 'ReactNativeInternalFeatureFlags'],
  },

  /******* React JSX DEV Runtime React Server *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'react/src/jsx/ReactJSXServer.js',
    name: 'react-jsx-dev-runtime.react-server',
    condition: 'react-server',
    global: 'JSXDEVRuntime',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['react', 'ReactNativeInternalFeatureFlags'],
  },

  /******* React DOM *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: RENDERER,
    entry: 'react-dom',
    global: 'ReactDOM',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['react'],
  },

  /******* React DOM Client *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: RENDERER,
    entry: 'react-dom/client',
    global: 'ReactDOM',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['react', 'react-dom'],
  },

  /******* React DOM Profiling (Client) *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: RENDERER,
    entry: 'react-dom/profiling',
    global: 'ReactDOM',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['react', 'react-dom'],
  },

  /******* React DOM React Server *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: RENDERER,
    entry: 'react-dom/src/ReactDOMReactServer.js',
    name: 'react-dom.react-server',
    condition: 'react-server',
    global: 'ReactDOM',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['react'],
  },

  /******* Test Utils *******/
  {
    moduleType: RENDERER_UTILS,
    bundleTypes: [AMD_DEV, AMD_PROD],
    entry: 'react-dom/test-utils',
    global: 'ReactTestUtils',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['react', 'react-dom'],
  },

  /******* React DOM Server *******/
  {
    bundleTypes: [
      AMD_DEV,
      AMD_PROD
    ],
    moduleType: RENDERER,
    entry: 'react-dom/src/server/ReactDOMLegacyServerBrowser.js',
    name: 'react-dom-server-legacy.browser',
    global: 'ReactDOMServer',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['react', 'react-dom'],
    babel: opts =>
      Object.assign({}, opts, {
        plugins: opts.plugins.concat([
          [require.resolve('@babel/plugin-transform-classes'), {loose: true}],
        ]),
      }),
  },
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: RENDERER,
    entry: 'react-dom/src/server/ReactDOMLegacyServerNode.js',
    name: 'react-dom-server-legacy.node',
    externals: ['react', 'stream', 'react-dom'],
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    babel: opts =>
      Object.assign({}, opts, {
        plugins: opts.plugins.concat([
          [require.resolve('@babel/plugin-transform-classes'), {loose: true}],
        ]),
      }),
  },

  /******* React DOM Fizz Server *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: RENDERER,
    entry: 'react-dom/src/server/react-dom-server.browser.js',
    name: 'react-dom-server.browser',
    global: 'ReactDOMServer',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['react', 'react-dom'],
  },
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: RENDERER,
    entry: 'react-dom/src/server/react-dom-server.node.js',
    name: 'react-dom-server.node',
    global: 'ReactDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['react', 'util', 'crypto', 'async_hooks', 'react-dom'],
  },

  /******* React DOM Fizz Server Edge *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: RENDERER,
    entry: 'react-dom/src/server/react-dom-server.edge.js',
    name: 'react-dom-server.edge', // 'node_modules/react/*.js',

    global: 'ReactDOMServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['react', 'react-dom'],
  },

  /******* React ART *******/
// падает сборка опять flow
//   {
//     bundleTypes: [
//       AMD_DEV,
//       AMD_PROD
//     ],
//     moduleType: RENDERER,
//     entry: 'react-art',
//     global: 'ReactART',
//     externals: ['react'],
//     minifyWithProdErrorCodes: true,
//     wrapWithModuleBoundaries: true,
//     babel: opts =>
//       Object.assign({}, opts, {
//         // Include JSX
//         presets: opts.presets.concat([
//           require.resolve('@babel/preset-react'),
//           require.resolve('@babel/preset-flow'),
//         ]),
//         plugins: opts.plugins.concat([
//           [require.resolve('@babel/plugin-transform-classes'), {loose: true}],
//         ]),
//       }),
//   },

  /******* React Test Renderer *******/
  {
    bundleTypes: [
      AMD_DEV,
      AMD_PROD
    ],
    moduleType: RENDERER,
    entry: 'react-test-renderer',
    global: 'ReactTestRenderer',
    externals: [
      'react',
      'scheduler',
      'scheduler/unstable_mock',
      'ReactNativeInternalFeatureFlags',
    ],
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    babel: opts =>
      Object.assign({}, opts, {
        plugins: opts.plugins.concat([
          [require.resolve('@babel/plugin-transform-classes'), {loose: true}],
        ]),
      }),
  },

  /******* React Noop Renderer (used for tests) *******/
//   {
//     bundleTypes: [AMD_DEV, AMD_PROD],
//     moduleType: RENDERER,
//     entry: 'react-noop-renderer',
//     global: 'ReactNoopRenderer',
//     minifyWithProdErrorCodes: false,
//     wrapWithModuleBoundaries: false,
//     externals: ['react', 'scheduler', 'scheduler/unstable_mock', 'expect'],
//   },

  /******* React Noop Persistent Renderer (used for tests) *******/
//   {
//     bundleTypes: [AMD_DEV, AMD_PROD],
//     moduleType: RENDERER,
//     entry: 'react-noop-renderer/persistent',
//     global: 'ReactNoopRendererPersistent',
//     minifyWithProdErrorCodes: false,
//     wrapWithModuleBoundaries: false,
//     externals: ['react', 'scheduler', 'expect'],
//   },

  /******* React Noop Server Renderer (used for tests) *******/
//   {
//     bundleTypes: [AMD_DEV, AMD_PROD],
//     moduleType: RENDERER,
//     entry: 'react-noop-renderer/server',
//     global: 'ReactNoopRendererServer',
//     minifyWithProdErrorCodes: false,
//     wrapWithModuleBoundaries: false,
//     externals: ['react', 'scheduler', 'expect'],
//   },

  /******* React Reconciler *******/
  // {
  //   bundleTypes: [
  //     AMD_DEV,
  //     AMD_PROD,
  //   ],
  //   moduleType: RECONCILER,
  //   entry: 'react-reconciler',
  //   global: 'ReactReconciler',
  //   minifyWithProdErrorCodes: true,
  //   wrapWithModuleBoundaries: false,
  //   externals: ['react'],
  // },

  /******* React Server *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: RECONCILER,
    entry: 'react-server',
    global: 'ReactServer',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['react'],
  },

  /******* Reconciler Reflection *******/
  {
    moduleType: RENDERER_UTILS,
    bundleTypes: [AMD_DEV, AMD_PROD],
    entry: 'react-reconciler/reflection',
    global: 'ReactFiberTreeReflection',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: [],
  },

  /******* Reconciler Constants *******/
  {
    moduleType: RENDERER_UTILS,
    bundleTypes: [
      AMD_DEV,
      AMD_PROD
    ],
    entry: 'react-reconciler/constants',
    global: 'ReactReconcilerConstants',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: [],
  },

  /******* React Is *******/
  {
    bundleTypes: [
      AMD_DEV,
      AMD_PROD
    ],
    moduleType: ISOMORPHIC,
    entry: 'react-is',
    global: 'ReactIs',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: ['ReactNativeInternalFeatureFlags'],
  },

  /******* React Debug Tools *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'react-debug-tools',
    global: 'ReactDebugTools',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [],
  },

  /******* React Cache (experimental, old) *******/
  {
    bundleTypes: [
      AMD_DEV,
      AMD_PROD
    ],
    moduleType: ISOMORPHIC,
    entry: 'react-cache',
    global: 'ReactCacheOld',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['react', 'scheduler'],
  },

  /******* Hook for managing subscriptions safely *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'use-subscription',
    global: 'useSubscription',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['react'],
  },

  /******* useSyncExternalStore *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'use-sync-external-store',
    global: 'useSyncExternalStore',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['react'],
  },

  /******* useSyncExternalStore (shim) *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'use-sync-external-store/shim',
    global: 'useSyncExternalStore',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    externals: ['react'],
  },

  /******* useSyncExternalStore (shim, native) *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'use-sync-external-store/shim/index.native',
    global: 'useSyncExternalStore',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    externals: ['react'],
  },

  /******* useSyncExternalStoreWithSelector *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'use-sync-external-store/with-selector',
    global: 'useSyncExternalStoreWithSelector',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    externals: ['react'],
  },

  /******* useSyncExternalStoreWithSelector (shim) *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'use-sync-external-store/shim/with-selector',
    global: 'useSyncExternalStoreWithSelector',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: true,
    externals: ['react', 'use-sync-external-store/shim'],
  },

  /******* React Scheduler (experimental) *******/
  {
    bundleTypes: [
      AMD_DEV,
      AMD_PROD,
    ],
    moduleType: ISOMORPHIC,
    entry: 'scheduler',
    global: 'Scheduler',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: true,
    externals: ['ReactNativeInternalFeatureFlags'],
  },

  /******* React Scheduler Mock (experimental) *******/
  {
    bundleTypes: [
      AMD_DEV,
      AMD_PROD,
    ],
    moduleType: ISOMORPHIC,
    entry: 'scheduler/unstable_mock',
    global: 'SchedulerMock',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['ReactNativeInternalFeatureFlags'],
  },

  /******* React Scheduler Native *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'scheduler/index.native',
    global: 'SchedulerNative',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['ReactNativeInternalFeatureFlags'],
  },

  /******* React Scheduler Post Task (experimental) *******/
  {
    bundleTypes: [
      AMD_DEV,
      AMD_PROD,
    ],
    moduleType: ISOMORPHIC,
    entry: 'scheduler/unstable_post_task',
    global: 'SchedulerPostTask',
    minifyWithProdErrorCodes: true,
    wrapWithModuleBoundaries: false,
    externals: [],
  },

  /******* Jest React (experimental) *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'jest-react',
    global: 'JestReact',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: ['react', 'scheduler', 'scheduler/unstable_mock'],
  },

  /******* ESLint Plugin for Hooks *******/
//   {
//     // TODO: we're building this from typescript source now, but there's really
//     // no reason to have both dev and prod for this package.  It's
//     // currently required in order for the package to be copied over correctly.
//     // So, it would be worth improving that flow.
//     name: 'eslint-plugin-react-hooks',
//     bundleTypes: [AMD_DEV, AMD_PROD],
//     moduleType: ISOMORPHIC,
//     entry: 'eslint-plugin-react-hooks/src/index.ts',
//     global: 'ESLintPluginReactHooks',
//     minifyWithProdErrorCodes: false,
//     wrapWithModuleBoundaries: false,
//     externals: [],
//     tsconfig: './packages/eslint-plugin-react-hooks/tsconfig.json',
//     prebuild: `mkdir -p ./compiler/packages/babel-plugin-react-compiler/dist && echo "module.exports = require('../src/index.ts');" > ./compiler/packages/babel-plugin-react-compiler/dist/index.js`,
//   },

  /******* React Fresh *******/
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'react-refresh/babel',
    global: 'ReactFreshBabelPlugin',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [],
  },
  {
    bundleTypes: [AMD_DEV, AMD_PROD],
    moduleType: ISOMORPHIC,
    entry: 'react-refresh/runtime',
    global: 'ReactFreshRuntime',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [],
  },
];

function deepFreeze(o) {
  Object.freeze(o);
  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (
      o[prop] !== null &&
      (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
      !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop]);
    }
  });
  return o;
}
deepFreeze(bundles);
deepFreeze(bundleTypes);
deepFreeze(moduleTypes);

function getFilename(bundle, bundleType) {
  let name = bundle.name || bundle.entry;
  name = name.replace('/index.', '.').replace(/\//g, '-');
  switch (bundleType) {
    case AMD_DEV: return `${name}.development.js`;
    case AMD_PROD: return `${name}.js`;
    default: throw new Error('Unknown bundleType: ' + bundleType);
  }
}

module.exports = {
  bundleTypes,
  moduleTypes,
  bundles,
  getFilename,
};