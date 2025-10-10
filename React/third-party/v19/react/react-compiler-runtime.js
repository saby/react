define("react/compiler-runtime", ['exports', 'react'], (function (exports, React) { 'use strict';

  const ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

  function resolveDispatcher() {
    const dispatcher = ReactSharedInternals.H;
    // Will result in a null access error if accessed outside render phase. We
    // intentionally don't throw our own error because this is in a hot path.
    // Also helps ensure this is inlined.
    return dispatcher;
  }
  function useMemoCache(size) {
    const dispatcher = resolveDispatcher();
    // $FlowFixMe[not-a-function] This is unstable, thus optional
    return dispatcher.useMemoCache(size);
  }

  exports.c = useMemoCache;

}));
