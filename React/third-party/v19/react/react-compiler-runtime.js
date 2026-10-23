define("react/compiler-runtime", ['exports', 'react'], (function (exports, React) { 'use strict';

  const ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

  function resolveDispatcher() {
    const dispatcher = ReactSharedInternals.H;
    {
      if (dispatcher === null) {
        console.error('Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' + ' one of the following reasons:\n' + '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' + '2. You might be breaking the Rules of Hooks\n' + '3. You might have more than one copy of React in the same app\n' + 'See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.');
      }
    }
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
