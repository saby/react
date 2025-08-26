define("react-dom/react-server", ['exports', 'react'], (function (exports, React) { 'use strict';

  // TODO: this is special because it gets imported during build.
  //
  // It exists as a placeholder so that DevTools can support work tag changes between releases.
  // When we next publish a release, update the matching TODO in backend/renderer.js
  // TODO: This module is used both by the release scripts and to expose a version
  // at runtime. We should instead inject the version number as part of the build
  // process, and use the ReactVersions.js module as the single source of truth.
  var ReactVersion = '19.1.0';

  // This should line up with NoEventPriority from react-reconciler/src/ReactEventPriorities
  // but we can't depend on the react-reconciler from this isomorphic code.
  const NoEventPriority = 0;
  function noop() {}
  function requestFormReset(element) {
    throw new Error('Invalid form element. requestFormReset must be passed a form that was ' + 'rendered by React.');
  }
  const DefaultDispatcher = {
    f /* flushSyncWork */: noop,
    r /* requestFormReset */: requestFormReset,
    D /* prefetchDNS */: noop,
    C /* preconnect */: noop,
    L /* preload */: noop,
    m /* preloadModule */: noop,
    X /* preinitScript */: noop,
    S /* preinitStyle */: noop,
    M /* preinitModuleScript */: noop
  };
  const Internals = {
    d /* ReactDOMCurrentDispatcher */: DefaultDispatcher,
    p /* currentUpdatePriority */: NoEventPriority,
    findDOMNode: null
  };

  const ReactSharedInternalsServer =
  // $FlowFixMe: It's defined in the one we resolve to.
  React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  if (!ReactSharedInternalsServer) {
    throw new Error('The "react" package in this environment is not configured correctly. ' + 'The "react-server" condition must be enabled in any environment that ' + 'runs React Server Components.');
  }

  const ReactDOMSharedInternals = Internals;

  function getCrossOriginString(input) {
    if (typeof input === 'string') {
      return input === 'use-credentials' ? input : '';
    }
    return undefined;
  }
  function getCrossOriginStringAs(as, input) {
    if (as === 'font') {
      return '';
    }
    if (typeof input === 'string') {
      return input === 'use-credentials' ? input : '';
    }
    return undefined;
  }

  function prefetchDNS(href) {
    if (typeof href === 'string') {
      ReactDOMSharedInternals.d /* ReactDOMCurrentDispatcher */.D( /* prefetchDNS */href);
    }
    // We don't error because preconnect needs to be resilient to being called in a variety of scopes
    // and the runtime may not be capable of responding. The function is optimistic and not critical
    // so we favor silent bailout over warning or erroring.
  }
  function preconnect(href, options) {
    if (typeof href === 'string') {
      const crossOrigin = options ? getCrossOriginString(options.crossOrigin) : null;
      ReactDOMSharedInternals.d /* ReactDOMCurrentDispatcher */.C( /* preconnect */href, crossOrigin);
    }
    // We don't error because preconnect needs to be resilient to being called in a variety of scopes
    // and the runtime may not be capable of responding. The function is optimistic and not critical
    // so we favor silent bailout over warning or erroring.
  }
  function preload(href, options) {
    if (typeof href === 'string' &&
    // We check existence because we cannot enforce this function is actually called with the stated type
    typeof options === 'object' && options !== null && typeof options.as === 'string') {
      const as = options.as;
      const crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
      ReactDOMSharedInternals.d /* ReactDOMCurrentDispatcher */.L( /* preload */href, as, {
        crossOrigin,
        integrity: typeof options.integrity === 'string' ? options.integrity : undefined,
        nonce: typeof options.nonce === 'string' ? options.nonce : undefined,
        type: typeof options.type === 'string' ? options.type : undefined,
        fetchPriority: typeof options.fetchPriority === 'string' ? options.fetchPriority : undefined,
        referrerPolicy: typeof options.referrerPolicy === 'string' ? options.referrerPolicy : undefined,
        imageSrcSet: typeof options.imageSrcSet === 'string' ? options.imageSrcSet : undefined,
        imageSizes: typeof options.imageSizes === 'string' ? options.imageSizes : undefined,
        media: typeof options.media === 'string' ? options.media : undefined
      });
    }
    // We don't error because preload needs to be resilient to being called in a variety of scopes
    // and the runtime may not be capable of responding. The function is optimistic and not critical
    // so we favor silent bailout over warning or erroring.
  }
  function preloadModule(href, options) {
    if (typeof href === 'string') {
      if (options) {
        const crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
        ReactDOMSharedInternals.d /* ReactDOMCurrentDispatcher */.m( /* preloadModule */href, {
          as: typeof options.as === 'string' && options.as !== 'script' ? options.as : undefined,
          crossOrigin,
          integrity: typeof options.integrity === 'string' ? options.integrity : undefined
        });
      } else {
        ReactDOMSharedInternals.d /* ReactDOMCurrentDispatcher */.m( /* preloadModule */href);
      }
    }
    // We don't error because preload needs to be resilient to being called in a variety of scopes
    // and the runtime may not be capable of responding. The function is optimistic and not critical
    // so we favor silent bailout over warning or erroring.
  }
  function preinit(href, options) {
    if (typeof href === 'string' && options && typeof options.as === 'string') {
      const as = options.as;
      const crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
      const integrity = typeof options.integrity === 'string' ? options.integrity : undefined;
      const fetchPriority = typeof options.fetchPriority === 'string' ? options.fetchPriority : undefined;
      if (as === 'style') {
        ReactDOMSharedInternals.d /* ReactDOMCurrentDispatcher */.S( /* preinitStyle */
        href, typeof options.precedence === 'string' ? options.precedence : undefined, {
          crossOrigin,
          integrity,
          fetchPriority
        });
      } else if (as === 'script') {
        ReactDOMSharedInternals.d /* ReactDOMCurrentDispatcher */.X( /* preinitScript */href, {
          crossOrigin,
          integrity,
          fetchPriority,
          nonce: typeof options.nonce === 'string' ? options.nonce : undefined
        });
      }
    }
    // We don't error because preinit needs to be resilient to being called in a variety of scopes
    // and the runtime may not be capable of responding. The function is optimistic and not critical
    // so we favor silent bailout over warning or erroring.
  }
  function preinitModule(href, options) {
    if (typeof href === 'string') {
      if (typeof options === 'object' && options !== null) {
        if (options.as == null || options.as === 'script') {
          const crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
          ReactDOMSharedInternals.d /* ReactDOMCurrentDispatcher */.M( /* preinitModuleScript */href, {
            crossOrigin,
            integrity: typeof options.integrity === 'string' ? options.integrity : undefined,
            nonce: typeof options.nonce === 'string' ? options.nonce : undefined
          });
        }
      } else if (options == null) {
        ReactDOMSharedInternals.d /* ReactDOMCurrentDispatcher */.M( /* preinitModuleScript */href);
      }
    }
    // We don't error because preinit needs to be resilient to being called in a variety of scopes
    // and the runtime may not be capable of responding. The function is optimistic and not critical
    // so we favor silent bailout over warning or erroring.
  }

  exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
  exports.preconnect = preconnect;
  exports.prefetchDNS = prefetchDNS;
  exports.preinit = preinit;
  exports.preinitModule = preinitModule;
  exports.preload = preload;
  exports.preloadModule = preloadModule;
  exports.version = ReactVersion;

}));
