define("use-subscription", ['exports', 'use-sync-external-store/shim'], (function (exports, shim) { 'use strict';

  // Hook used for safely managing subscriptions in concurrent mode.
  //
  // In order to avoid removing and re-adding subscriptions each time this hook is called,
  // the parameters passed to this hook should be memoized in some way–
  // either by wrapping the entire params object with useMemo()
  // or by wrapping the individual callbacks with useCallback().
  function useSubscription(_ref) {
    let getCurrentValue = _ref.getCurrentValue,
      subscribe = _ref.subscribe;
    return shim.useSyncExternalStore(subscribe, getCurrentValue);
  }

  exports.useSubscription = useSubscription;

}));
