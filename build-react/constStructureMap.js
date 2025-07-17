const MAP = {
  // REACT CORE
  "react/react.development.js": "react/react.development.js",
  "react/react.development.min.js": "react/react.development.min.js",
  "react/react.js": "react/react.js",
  "react/react.min.js": "react/react.min.js",

  "react/react-compiler-runtime.development.js": "react/react-compiler-runtime.development.js",
  "react/react-compiler-runtime.development.min.js": "react/react-compiler-runtime.development.min.js",
  "react/react-compiler-runtime.js": "react/react-compiler-runtime.js",
  "react/react-compiler-runtime.min.js": "react/react-compiler-runtime.min.js",

  "react/react.react-server.development.js": "react/react.react-server.development.js",
  "react/react.react-server.development.min.js": "react/react.react-server.development.min.js",
  "react/react.react-server.js": "react/react.react-server.js",
  "react/react.react-server.min.js": "react/react.react-server.min.js",

  // JSX RUNTIME
  "react/react-jsx-runtime.development.js": "react/jsx-runtime/react-jsx-runtime.development.js",
  "react/react-jsx-runtime.development.min.js": "react/jsx-runtime/react-jsx-runtime.development.min.js",
  "react/react-jsx-runtime.js": "react/jsx-runtime/react-jsx-runtime.js",
  "react/react-jsx-runtime.min.js": "react/jsx-runtime/react-jsx-runtime.min.js",

  "react/react-jsx-runtime.react-server.development.js": "react/jsx-runtime/react-jsx-runtime.react-server.development.js",
  "react/react-jsx-runtime.react-server.development.min.js": "react/jsx-runtime/react-jsx-runtime.react-server.development.min.js",
  "react/react-jsx-runtime.react-server.js": "react/jsx-runtime/react-jsx-runtime.react-server.js",
  "react/react-jsx-runtime.react-server.min.js": "react/jsx-runtime/react-jsx-runtime.react-server.min.js",

  "react/react-jsx-dev-runtime.development.js": "react/jsx-dev-runtime/react-jsx-dev-runtime.development.js",
  "react/react-jsx-dev-runtime.development.min.js": "react/jsx-dev-runtime/react-jsx-dev-runtime.development.min.js",
  "react/react-jsx-dev-runtime.js": "react/jsx-dev-runtime/react-jsx-dev-runtime.js",
  "react/react-jsx-dev-runtime.min.js": "react/jsx-dev-runtime/react-jsx-dev-runtime.min.js",

  "react/react-jsx-dev-runtime.react-server.development.js": "react/jsx-dev-runtime/react-jsx-dev-runtime.react-server.development.js",
  "react/react-jsx-dev-runtime.react-server.development.min.js": "react/jsx-dev-runtime/react-jsx-dev-runtime.react-server.development.min.js",
  "react/react-jsx-dev-runtime.react-server.js": "react/jsx-dev-runtime/react-jsx-dev-runtime.react-server.js",
  "react/react-jsx-dev-runtime.react-server.min.js": "react/jsx-dev-runtime/react-jsx-dev-runtime.react-server.min.js",

  // REACT DOM 
  "react-dom/react-dom.development.js": "react-dom/react-dom.development.js",
  "react-dom/react-dom.development.min.js": "react-dom/react-dom.development.min.js",
  "react-dom/react-dom.js": "react-dom/react-dom.js",
  "react-dom/react-dom.min.js": "react-dom/react-dom.min.js",

  "react-dom/react-dom-client.development.js": "react-dom/client/react-dom-client.development.js",
  "react-dom/react-dom-client.development.min.js": "react-dom/client/react-dom-client.development.min.js",
  "react-dom/react-dom-client.js": "react-dom/client/react-dom-client.js",
  "react-dom/react-dom-client.min.js": "react-dom/client/react-dom-client.min.js",

  "react-dom/react-dom-test-utils.development.js": "react-dom/test-utils/react-dom-test-utils.development.js",
  "react-dom/react-dom-test-utils.development.min.js": "react-dom/test-utils/react-dom-test-utils.development.min.js",
  "react-dom/react-dom-test-utils.js": "react-dom/test-utils/react-dom-test-utils.js",
  "react-dom/react-dom-test-utils.min.js": "react-dom/test-utils/react-dom-test-utils.min.js",

  "react-dom/react-dom-server.browser.development.js": "react-dom/server/react-dom-server.browser.development.js",
  "react-dom/react-dom-server.browser.development.min.js": "react-dom/server/react-dom-server.browser.development.min.js",
  "react-dom/react-dom-server.browser.js": "react-dom/server/react-dom-server.browser.js",
  "react-dom/react-dom-server.browser.min.js": "react-dom/server/react-dom-server.browser.min.js",

  "react-dom/react-dom-server-legacy.browser.development.js": "react-dom/server/react-dom-server-legacy.browser.development.js",
  "react-dom/react-dom-server-legacy.browser.development.min.js": "react-dom/server/react-dom-server-legacy.browser.development.min.js",
  "react-dom/react-dom-server-legacy.browser.js": "react-dom/server/react-dom-server-legacy.browser.js",
  "react-dom/react-dom-server-legacy.browser.min.js": "react-dom/server/react-dom-server-legacy.browser.min.js",

  "react-dom/react-dom-server-legacy.node.development.js": "react-dom/server/react-dom-server-legacy.node.development.js",
  "react-dom/react-dom-server-legacy.node.development.min.js": "react-dom/server/react-dom-server-legacy.node.development.min.js",
  "react-dom/react-dom-server-legacy.node.js": "react-dom/server/react-dom-server-legacy.node.js",
  "react-dom/react-dom-server-legacy.node.min.js": "react-dom/server/react-dom-server-legacy.node.min.js",

  "react-dom/react-dom-server.edge.development.js": "react-dom/server/react-dom-server.edge.development.js",
  "react-dom/react-dom-server.edge.development.min.js": "react-dom/server/react-dom-server.edge.development.min.js",
  "react-dom/react-dom-server.edge.js": "react-dom/server/react-dom-server.edge.js",
  "react-dom/react-dom-server.edge.min.js": "react-dom/server/react-dom-server.edge.min.js",

  "react-dom/react-dom-server.node.development.js": "react-dom/server/react-dom-server.node.development.js",
  "react-dom/react-dom-server.node.development.min.js": "react-dom/server/react-dom-server.node.development.min.js",
  "react-dom/react-dom-server.node.js": "react-dom/server/react-dom-server.node.js",
  "react-dom/react-dom-server.node.min.js": "react-dom/server/react-dom-server.node.min.js",

  "react-dom/react-dom-profiling.development.js": "react-dom/react-dom-profiling.development.js",
  "react-dom/react-dom-profiling.development.min.js": "react-dom/react-dom-profiling.development.min.js",
  "react-dom/react-dom-profiling.js": "react-dom/react-dom-profiling.js",
  "react-dom/react-dom-profiling.min.js": "react-dom/react-dom-profiling.min.js",

  "react-dom/react-dom.react-server.development.js": "react-dom/react-dom.react-server.development.js",
  "react-dom/react-dom.react-server.development.min.js": "react-dom/react-dom.react-server.development.min.js",
  "react-dom/react-dom.react-server.js": "react-dom/react-dom.react-server.js",
  "react-dom/react-dom.react-server.min.js": "react-dom/react-dom.react-server.min.js",

  // react-is
  "react-is/react-is.development.js": "react-is/react-is.development.js",
  "react-is/react-is.development.min.js": "react-is/react-is.development.min.js",
  "react-is/react-is.js": "react-is/react-is.js",
  "react-is/react-is.min.js": "react-is/react-is.min.js",

  // react-cache
  "react-cache/react-cache.development.js": "react-cache/react-cache.development.js",
  "react-cache/react-cache.development.min.js": "react-cache/react-cache.development.min.js",
  "react-cache/react-cache.js": "react-cache/react-cache.js",
  "react-cache/react-cache.min.js": "react-cache/react-cache.min.js",

  // react-refresh
  "react-refresh/react-refresh-babel.development.js": "react-refresh/react-refresh-babel.development.js",
  "react-refresh/react-refresh-babel.development.min.js": "react-refresh/react-refresh-babel.development.min.js",
  "react-refresh/react-refresh-babel.js": "react-refresh/react-refresh-babel.js",
  "react-refresh/react-refresh-babel.min.js": "react-refresh/react-refresh-babel.min.js",
  "react-refresh/react-refresh-runtime.development.js": "react-refresh/react-refresh-runtime.development.js",
  "react-refresh/react-refresh-runtime.development.min.js": "react-refresh/react-refresh-runtime.development.min.js",
  "react-refresh/react-refresh-runtime.js": "react-refresh/react-refresh-runtime.js",
  "react-refresh/react-refresh-runtime.min.js": "react-refresh/react-refresh-runtime.min.js",

  // react-server
  "react-server/react-server.development.js": "react-server/react-server.development.js",
  "react-server/react-server.development.min.js": "react-server/react-server.development.min.js",
  "react-server/react-server.js": "react-server/react-server.js",
  "react-server/react-server.min.js": "react-server/react-server.min.js",

  // scheduler
  "scheduler/scheduler.development.js": "scheduler/scheduler.development.js",
  "scheduler/scheduler.development.min.js": "scheduler/scheduler.development.min.js",
  "scheduler/scheduler.js": "scheduler/scheduler.js",
  "scheduler/scheduler.min.js": "scheduler/scheduler.min.js",
  "scheduler/scheduler-unstable_mock.development.js": "scheduler/scheduler-unstable_mock.development.js",
  "scheduler/scheduler-unstable_mock.development.min.js": "scheduler/scheduler-unstable_mock.development.min.js",
  "scheduler/scheduler-unstable_mock.js": "scheduler/scheduler-unstable_mock.js",
  "scheduler/scheduler-unstable_mock.min.js": "scheduler/scheduler-unstable_mock.min.js",
  "scheduler/scheduler-unstable_post_task.development.js": "scheduler/scheduler-unstable_post_task.development.js",
  "scheduler/scheduler-unstable_post_task.development.min.js": "scheduler/scheduler-unstable_post_task.development.min.js",
  "scheduler/scheduler-unstable_post_task.js": "scheduler/scheduler-unstable_post_task.js",
  "scheduler/scheduler-unstable_post_task.min.js": "scheduler/scheduler-unstable_post_task.min.js",
  "scheduler/scheduler.native.development.js": "scheduler/scheduler.native.development.js",
  "scheduler/scheduler.native.development.min.js": "scheduler/scheduler.native.development.min.js",
  "scheduler/scheduler.native.js": "scheduler/scheduler.native.js",
  "scheduler/scheduler.native.min.js": "scheduler/scheduler.native.min.js",

  // use-subscription
  "use-subscription/use-subscription.development.js": "use-subscription/use-subscription.development.js",
  "use-subscription/use-subscription.development.min.js": "use-subscription/use-subscription.development.min.js",
  "use-subscription/use-subscription.js": "use-subscription/use-subscription.js",
  "use-subscription/use-subscription.min.js": "use-subscription/use-subscription.min.js",

  // use-sync-external-store
  "use-sync-external-store/use-sync-external-store.development.js": "use-sync-external-store/use-sync-external-store.development.js",
  "use-sync-external-store/use-sync-external-store.development.min.js": "use-sync-external-store/use-sync-external-store.development.min.js",
  "use-sync-external-store/use-sync-external-store.js": "use-sync-external-store/use-sync-external-store.js",
  "use-sync-external-store/use-sync-external-store.min.js": "use-sync-external-store/use-sync-external-store.min.js",
  "use-sync-external-store/use-sync-external-store-shim.development.js": "use-sync-external-store/use-sync-external-store-shim.development.js",
  "use-sync-external-store/use-sync-external-store-shim.development.min.js": "use-sync-external-store/use-sync-external-store-shim.development.min.js",
  "use-sync-external-store/use-sync-external-store-shim.js": "use-sync-external-store/use-sync-external-store-shim.js",
  "use-sync-external-store/use-sync-external-store-shim.min.js": "use-sync-external-store/use-sync-external-store-shim.min.js",
  "use-sync-external-store/use-sync-external-store-shim.native.development.js": "use-sync-external-store/use-sync-external-store-shim.native.development.js",
  "use-sync-external-store/use-sync-external-store-shim.native.development.min.js": "use-sync-external-store/use-sync-external-store-shim.native.development.min.js",
  "use-sync-external-store/use-sync-external-store-shim.native.js": "use-sync-external-store/use-sync-external-store-shim.native.js",
  "use-sync-external-store/use-sync-external-store-shim.native.min.js": "use-sync-external-store/use-sync-external-store-shim.native.min.js",
  "use-sync-external-store/use-sync-external-store-shim-with-selector.development.js": "use-sync-external-store/use-sync-external-store-shim-with-selector.development.js",
  "use-sync-external-store/use-sync-external-store-shim-with-selector.development.min.js": "use-sync-external-store/use-sync-external-store-shim-with-selector.development.min.js",
  "use-sync-external-store/use-sync-external-store-shim-with-selector.js": "use-sync-external-store/use-sync-external-store-shim-with-selector.js",
  "use-sync-external-store/use-sync-external-store-shim-with-selector.min.js": "use-sync-external-store/use-sync-external-store-shim-with-selector.min.js",
  "use-sync-external-store/use-sync-external-store-with-selector.development.js": "use-sync-external-store/use-sync-external-store-with-selector.development.js",
  "use-sync-external-store/use-sync-external-store-with-selector.development.min.js": "use-sync-external-store/use-sync-external-store-with-selector.development.min.js",
  "use-sync-external-store/use-sync-external-store-with-selector.js": "use-sync-external-store/use-sync-external-store-with-selector.js",
  "use-sync-external-store/use-sync-external-store-with-selector.min.js": "use-sync-external-store/use-sync-external-store-with-selector.min.js",
};

module.exports = MAP;
