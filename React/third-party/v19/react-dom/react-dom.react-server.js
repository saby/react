define("react-dom/react-server", ['exports', 'react'], (function (exports, React) { 'use strict';

  // TODO: this is special because it gets imported during build.
  //
  // It exists as a placeholder so that DevTools can support work tag changes between releases.
  // When we next publish a release, update the matching TODO in backend/renderer.js
  // TODO: This module is used both by the release scripts and to expose a version
  // at runtime. We should instead inject the version number as part of the build
  // process, and use the ReactVersions.js module as the single source of truth.
  var ReactVersion = '19.2.3';

  function noop() {}

  // This should line up with NoEventPriority from react-reconciler/src/ReactEventPriorities
  // but we can't depend on the react-reconciler from this isomorphic code.
  const NoEventPriority = 0;
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

  {
    if (typeof Map !== 'function' ||
    // $FlowFixMe[prop-missing] Flow incorrectly thinks Map has no prototype
    Map.prototype == null || typeof Map.prototype.forEach !== 'function' || typeof Set !== 'function' ||
    // $FlowFixMe[prop-missing] Flow incorrectly thinks Set has no prototype
    Set.prototype == null || typeof Set.prototype.clear !== 'function' || typeof Set.prototype.forEach !== 'function') {
      console.error('React depends on Map and Set built-in types. Make sure that you load a ' + 'polyfill in older browsers. https://reactjs.org/link/react-polyfills');
    }
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
    {
      if (typeof href !== 'string' || !href) {
        console.error('ReactDOM.prefetchDNS(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.', getValueDescriptorExpectingObjectForWarning(href));
      } else if (arguments.length > 1) {
        const options = arguments[1];
        if (typeof options === 'object' && options.hasOwnProperty('crossOrigin')) {
          console.error('ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. It looks like the you are attempting to set a crossOrigin property for this DNS lookup hint. Browsers do not perform DNS queries using CORS and setting this attribute on the resource hint has no effect. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.', getValueDescriptorExpectingEnumForWarning(options));
        } else {
          console.error('ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.', getValueDescriptorExpectingEnumForWarning(options));
        }
      }
    }
    if (typeof href === 'string') {
      ReactDOMSharedInternals.d /* ReactDOMCurrentDispatcher */.D( /* prefetchDNS */href);
    }
    // We don't error because preconnect needs to be resilient to being called in a variety of scopes
    // and the runtime may not be capable of responding. The function is optimistic and not critical
    // so we favor silent bailout over warning or erroring.
  }
  function preconnect(href, options) {
    {
      if (typeof href !== 'string' || !href) {
        console.error('ReactDOM.preconnect(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.', getValueDescriptorExpectingObjectForWarning(href));
      } else if (options != null && typeof options !== 'object') {
        console.error('ReactDOM.preconnect(): Expected the `options` argument (second) to be an object but encountered %s instead. The only supported option at this time is `crossOrigin` which accepts a string.', getValueDescriptorExpectingEnumForWarning(options));
      } else if (options != null && typeof options.crossOrigin !== 'string') {
        console.error('ReactDOM.preconnect(): Expected the `crossOrigin` option (second argument) to be a string but encountered %s instead. Try removing this option or passing a string value instead.', getValueDescriptorExpectingObjectForWarning(options.crossOrigin));
      }
    }
    if (typeof href === 'string') {
      const crossOrigin = options ? getCrossOriginString(options.crossOrigin) : null;
      ReactDOMSharedInternals.d /* ReactDOMCurrentDispatcher */.C( /* preconnect */href, crossOrigin);
    }
    // We don't error because preconnect needs to be resilient to being called in a variety of scopes
    // and the runtime may not be capable of responding. The function is optimistic and not critical
    // so we favor silent bailout over warning or erroring.
  }
  function preload(href, options) {
    {
      let encountered = '';
      if (typeof href !== 'string' || !href) {
        encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".";
      }
      if (options == null || typeof options !== 'object') {
        encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + ".";
      } else if (typeof options.as !== 'string' || !options.as) {
        encountered += " The `as` option encountered was " + getValueDescriptorExpectingObjectForWarning(options.as) + ".";
      }
      if (encountered) {
        console.error('ReactDOM.preload(): Expected two arguments, a non-empty `href` string and an `options` object with an `as` property valid for a `<link rel="preload" as="..." />` tag.%s', encountered);
      }
    }
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
    {
      let encountered = '';
      if (typeof href !== 'string' || !href) {
        encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".";
      }
      if (options !== undefined && typeof options !== 'object') {
        encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + ".";
      } else if (options && 'as' in options && typeof options.as !== 'string') {
        encountered += " The `as` option encountered was " + getValueDescriptorExpectingObjectForWarning(options.as) + ".";
      }
      if (encountered) {
        console.error('ReactDOM.preloadModule(): Expected two arguments, a non-empty `href` string and, optionally, an `options` object with an `as` property valid for a `<link rel="modulepreload" as="..." />` tag.%s', encountered);
      }
    }
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
    {
      if (typeof href !== 'string' || !href) {
        console.error('ReactDOM.preinit(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.', getValueDescriptorExpectingObjectForWarning(href));
      } else if (options == null || typeof options !== 'object') {
        console.error('ReactDOM.preinit(): Expected the `options` argument (second) to be an object with an `as` property describing the type of resource to be preinitialized but encountered %s instead.', getValueDescriptorExpectingEnumForWarning(options));
      } else if (options.as !== 'style' && options.as !== 'script') {
        console.error('ReactDOM.preinit(): Expected the `as` property in the `options` argument (second) to contain a valid value describing the type of resource to be preinitialized but encountered %s instead. Valid values for `as` are "style" and "script".', getValueDescriptorExpectingEnumForWarning(options.as));
      }
    }
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
    {
      let encountered = '';
      if (typeof href !== 'string' || !href) {
        encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".";
      }
      if (options !== undefined && typeof options !== 'object') {
        encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + ".";
      } else if (options && 'as' in options && options.as !== 'script') {
        encountered += " The `as` option encountered was " + getValueDescriptorExpectingEnumForWarning(options.as) + ".";
      }
      if (encountered) {
        console.error('ReactDOM.preinitModule(): Expected up to two arguments, a non-empty `href` string and, optionally, an `options` object with a valid `as` property.%s', encountered);
      } else {
        const as = options && typeof options.as === 'string' ? options.as : 'script';
        switch (as) {
          case 'script':
            {
              break;
            }

          // We have an invalid as type and need to warn
          default:
            {
              const typeOfAs = getValueDescriptorExpectingEnumForWarning(as);
              console.error('ReactDOM.preinitModule(): Currently the only supported "as" type for this function is "script"' + ' but received "%s" instead. This warning was generated for `href` "%s". In the future other' + ' module types will be supported, aligning with the import-attributes proposal. Learn more here:' + ' (https://github.com/tc39/proposal-import-attributes)', typeOfAs, href);
            }
        }
      }
    }
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
  function getValueDescriptorExpectingObjectForWarning(thing) {
    return thing === null ? '`null`' : thing === undefined ? '`undefined`' : thing === '' ? 'an empty string' : "something with type \"" + typeof thing + "\"";
  }
  function getValueDescriptorExpectingEnumForWarning(thing) {
    return thing === null ? '`null`' : thing === undefined ? '`undefined`' : thing === '' ? 'an empty string' : typeof thing === 'string' ? JSON.stringify(thing) : typeof thing === 'number' ? '`' + thing + '`' : "something with type \"" + typeof thing + "\"";
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
