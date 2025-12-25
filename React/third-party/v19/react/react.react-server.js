define("react/react-server", ['exports'], (function (exports) { 'use strict';

  const ReactSharedInternals = {
    H: null,
    A: null
  };

  const isArrayImpl = Array.isArray;
  function isArray(a) {
    return isArrayImpl(a);
  }

  const REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element') ;
  const REACT_PORTAL_TYPE = Symbol.for('react.portal');
  const REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
  const REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
  const REACT_PROFILER_TYPE = Symbol.for('react.profiler');
  const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
  const REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
  const REACT_MEMO_TYPE = Symbol.for('react.memo');
  const REACT_LAZY_TYPE = Symbol.for('react.lazy');
  const MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  const FAUX_ITERATOR_SYMBOL = '@@iterator';
  function getIteratorFn(maybeIterable) {
    if (maybeIterable === null || typeof maybeIterable !== 'object') {
      return null;
    }
    const maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
    if (typeof maybeIterator === 'function') {
      return maybeIterator;
    }
    return null;
  }

  // $FlowFixMe[method-unbinding]
  const hasOwnProperty = Object.prototype.hasOwnProperty;

  const assign = Object.assign;

  function getOwner() {
    return null;
  }
  function hasValidRef(config) {
    return config.ref !== undefined;
  }
  function hasValidKey(config) {
    return config.key !== undefined;
  }

  /**
   * Factory method to create a new React element. This no longer adheres to
   * the class pattern, so do not use new to call it. Also, instanceof check
   * will not work. Instead test $$typeof field against Symbol.for('react.transitional.element') to check
   * if something is a React Element.
   *
   * @param {*} type
   * @param {*} props
   * @param {*} key
   * @param {string|object} ref
   * @param {*} owner
   * @param {*} self A *temporary* helper to detect places where `this` is
   * different from the `owner` when React.createElement is called, so that we
   * can warn. We want to get rid of owner and replace string `ref`s with arrow
   * functions, and as long as `this` and owner are the same, there will be no
   * change in behavior.
   * @param {*} source An annotation object (added by a transpiler or otherwise)
   * indicating filename, line number, and/or other information.
   * @internal
   */
  function ReactElement(type, key, self, source, owner, props, debugStack, debugTask) {
    // Ignore whatever was passed as the ref argument and treat `props.ref` as
    // the source of truth. The only thing we use this for is `element.ref`,
    // which will log a deprecation warning on access. In the next release, we
    // can remove `element.ref` as well as the `ref` argument.
    const refProp = props.ref;

    // An undefined `element.ref` is coerced to `null` for
    // backwards compatibility.
    const ref = refProp !== undefined ? refProp : null;
    let element;
    {
      // In prod, `ref` is a regular property and _owner doesn't exist.
      element = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: REACT_ELEMENT_TYPE,
        // Built-in properties that belong on the element
        type,
        key,
        ref,
        props
      };
    }
    return element;
  }

  /**
   * Create and return a new ReactElement of the given type.
   * See https://reactjs.org/docs/react-api.html#createelement
   */
  function createElement(type, config, children) {
    let propName;

    // Reserved names are extracted
    const props = {};
    let key = null;
    if (config != null) {
      if (hasValidKey(config)) {
        key = '' + config.key;
      }

      // Remaining properties are added to a new props object
      for (propName in config) {
        if (hasOwnProperty.call(config, propName) &&
        // Skip over reserved prop names
        propName !== 'key' &&
        // Even though we don't use these anymore in the runtime, we don't want
        // them to appear as props, so in createElement we filter them out.
        // We don't have to do this in the jsx() runtime because the jsx()
        // transform never passed these as props; it used separate arguments.
        propName !== '__self' && propName !== '__source') {
          props[propName] = config[propName];
        }
      }
    }

    // Children can be more than one argument, and those are transferred onto
    // the newly allocated props object.
    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      const childArray = Array(childrenLength);
      for (let i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      props.children = childArray;
    }

    // Resolve default props
    if (type && type.defaultProps) {
      const defaultProps = type.defaultProps;
      for (propName in defaultProps) {
        if (props[propName] === undefined) {
          props[propName] = defaultProps[propName];
        }
      }
    }
    return ReactElement(type, key, undefined, undefined, getOwner(), props);
  }
  function cloneAndReplaceKey(oldElement, newKey) {
    const clonedElement = ReactElement(oldElement.type, newKey, undefined, undefined, undefined , oldElement.props);
    return clonedElement;
  }

  /**
   * Clone and return a new ReactElement using element as the starting point.
   * See https://reactjs.org/docs/react-api.html#cloneelement
   */
  function cloneElement(element, config, children) {
    if (element === null || element === undefined) {
      throw new Error("The argument must be a React element, but you passed " + element + ".");
    }
    let propName;

    // Original props are copied
    const props = assign({}, element.props);

    // Reserved names are extracted
    let key = element.key;

    // Owner will be preserved, unless ref is overridden
    let owner = undefined ;
    if (config != null) {
      if (hasValidRef(config)) {
        owner = undefined;
      }
      if (hasValidKey(config)) {
        key = '' + config.key;
      }
      for (propName in config) {
        if (hasOwnProperty.call(config, propName) &&
        // Skip over reserved prop names
        propName !== 'key' &&
        // ...and maybe these, too, though we currently rely on them for
        // warnings and debug information in dev. Need to decide if we're OK
        // with dropping them. In the jsx() runtime it's not an issue because
        // the data gets passed as separate arguments instead of props, but
        // it would be nice to stop relying on them entirely so we can drop
        // them from the internal Fiber field.
        propName !== '__self' && propName !== '__source' &&
        // Undefined `ref` is ignored by cloneElement. We treat it the same as
        // if the property were missing. This is mostly for
        // backwards compatibility.
        !(propName === 'ref' && config.ref === undefined)) {
          {
            props[propName] = config[propName];
          }
        }
      }
    }

    // Children can be more than one argument, and those are transferred onto
    // the newly allocated props object.
    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      const childArray = Array(childrenLength);
      for (let i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      props.children = childArray;
    }
    const clonedElement = ReactElement(element.type, key, undefined, undefined, owner, props);
    return clonedElement;
  }

  /**
   * Verifies the object is a ReactElement.
   * See https://reactjs.org/docs/react-api.html#isvalidelement
   * @param {?object} object
   * @return {boolean} True if `object` is a ReactElement.
   * @final
   */
  function isValidElement(object) {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  }

  const SEPARATOR = '.';
  const SUBSEPARATOR = ':';

  /**
   * Escape and wrap key so it is safe to use as a reactid
   *
   * @param {string} key to be escaped.
   * @return {string} the escaped key.
   */
  function escape(key) {
    const escapeRegex = /[=:]/g;
    const escaperLookup = {
      '=': '=0',
      ':': '=2'
    };
    const escapedString = key.replace(escapeRegex, function (match) {
      // $FlowFixMe[invalid-computed-prop]
      return escaperLookup[match];
    });
    return '$' + escapedString;
  }
  const userProvidedKeyEscapeRegex = /\/+/g;
  function escapeUserProvidedKey(text) {
    return text.replace(userProvidedKeyEscapeRegex, '$&/');
  }

  /**
   * Generate a key string that identifies a element within a set.
   *
   * @param {*} element A element that could contain a manual key.
   * @param {number} index Index that is used if a manual key is not provided.
   * @return {string}
   */
  function getElementKey(element, index) {
    // Do some typechecking here since we call this blindly. We want to ensure
    // that we don't block potential future ES APIs.
    if (typeof element === 'object' && element !== null && element.key != null) {
      return escape('' + element.key);
    }
    // Implicit key determined by the index in the set
    return index.toString(36);
  }
  function noop() {}
  function resolveThenable(thenable) {
    switch (thenable.status) {
      case 'fulfilled':
        {
          const fulfilledValue = thenable.value;
          return fulfilledValue;
        }
      case 'rejected':
        {
          const rejectedError = thenable.reason;
          throw rejectedError;
        }
      default:
        {
          if (typeof thenable.status === 'string') {
            // Only instrument the thenable if the status if not defined. If
            // it's defined, but an unknown value, assume it's been instrumented by
            // some custom userspace implementation. We treat it as "pending".
            // Attach a dummy listener, to ensure that any lazy initialization can
            // happen. Flight lazily parses JSON when the value is actually awaited.
            thenable.then(noop, noop);
          } else {
            // This is an uncached thenable that we haven't seen before.

            // TODO: Detect infinite ping loops caused by uncached promises.

            const pendingThenable = thenable;
            pendingThenable.status = 'pending';
            pendingThenable.then(fulfilledValue => {
              if (thenable.status === 'pending') {
                const fulfilledThenable = thenable;
                fulfilledThenable.status = 'fulfilled';
                fulfilledThenable.value = fulfilledValue;
              }
            }, error => {
              if (thenable.status === 'pending') {
                const rejectedThenable = thenable;
                rejectedThenable.status = 'rejected';
                rejectedThenable.reason = error;
              }
            });
          }

          // Check one more time in case the thenable resolved synchronously.
          switch (thenable.status) {
            case 'fulfilled':
              {
                const fulfilledThenable = thenable;
                return fulfilledThenable.value;
              }
            case 'rejected':
              {
                const rejectedThenable = thenable;
                const rejectedError = rejectedThenable.reason;
                throw rejectedError;
              }
          }
        }
    }
    throw thenable;
  }
  function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
    const type = typeof children;
    if (type === 'undefined' || type === 'boolean') {
      // All of the above are perceived as null.
      children = null;
    }
    let invokeCallback = false;
    if (children === null) {
      invokeCallback = true;
    } else {
      switch (type) {
        case 'bigint':
        case 'string':
        case 'number':
          invokeCallback = true;
          break;
        case 'object':
          switch (children.$$typeof) {
            case REACT_ELEMENT_TYPE:
            case REACT_PORTAL_TYPE:
              invokeCallback = true;
              break;
            case REACT_LAZY_TYPE:
              const payload = children._payload;
              const init = children._init;
              return mapIntoArray(init(payload), array, escapedPrefix, nameSoFar, callback);
          }
      }
    }
    if (invokeCallback) {
      const child = children;
      let mappedChild = callback(child);
      // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows:
      const childKey = nameSoFar === '' ? SEPARATOR + getElementKey(child, 0) : nameSoFar;
      if (isArray(mappedChild)) {
        let escapedChildKey = '';
        if (childKey != null) {
          escapedChildKey = escapeUserProvidedKey(childKey) + '/';
        }
        mapIntoArray(mappedChild, array, escapedChildKey, '', c => c);
      } else if (mappedChild != null) {
        if (isValidElement(mappedChild)) {
          const newChild = cloneAndReplaceKey(mappedChild,
          // Keep both the (mapped) and old keys if they differ, just as
          // traverseAllChildren used to do for objects as children
          escapedPrefix + (
          // $FlowFixMe[incompatible-type] Flow incorrectly thinks React.Portal doesn't have a key
          mappedChild.key != null && (!child || child.key !== mappedChild.key) ? escapeUserProvidedKey(
          // $FlowFixMe[unsafe-addition]
          '' + mappedChild.key // eslint-disable-line react-internal/safe-string-coercion
          ) + '/' : '') + childKey);
          mappedChild = newChild;
        }
        array.push(mappedChild);
      }
      return 1;
    }
    let child;
    let nextName;
    let subtreeCount = 0; // Count of children found in the current subtree.
    const nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;
    if (isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        child = children[i];
        nextName = nextNamePrefix + getElementKey(child, i);
        subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
      }
    } else {
      const iteratorFn = getIteratorFn(children);
      if (typeof iteratorFn === 'function') {
        const iterableChildren = children;
        const iterator = iteratorFn.call(iterableChildren);
        let step;
        let ii = 0;
        // $FlowFixMe[incompatible-use] `iteratorFn` might return null according to typing.
        while (!(step = iterator.next()).done) {
          child = step.value;
          nextName = nextNamePrefix + getElementKey(child, ii++);
          subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
        }
      } else if (type === 'object') {
        if (typeof children.then === 'function') {
          return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
        }

        // eslint-disable-next-line react-internal/safe-string-coercion
        const childrenString = String(children);
        throw new Error("Objects are not valid as a React child (found: " + (childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString) + "). " + 'If you meant to render a collection of children, use an array ' + 'instead.');
      }
    }
    return subtreeCount;
  }

  /**
   * Maps children that are typically specified as `props.children`.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrenmap
   *
   * The provided mapFunction(child, index) will be called for each
   * leaf child.
   *
   * @param {?*} children Children tree container.
   * @param {function(*, int)} func The map function.
   * @param {*} context Context for mapFunction.
   * @return {object} Object containing the ordered map of results.
   */
  function mapChildren(children, func, context) {
    if (children == null) {
      // $FlowFixMe limitation refining abstract types in Flow
      return children;
    }
    const result = [];
    let count = 0;
    mapIntoArray(children, result, '', '', function (child) {
      return func.call(context, child, count++);
    });
    return result;
  }

  /**
   * Count the number of children that are typically specified as
   * `props.children`.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrencount
   *
   * @param {?*} children Children tree container.
   * @return {number} The number of children.
   */
  function countChildren(children) {
    let n = 0;
    mapChildren(children, () => {
      n++;
      // Don't return anything
    });
    return n;
  }

  /**
   * Iterates through children that are typically specified as `props.children`.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
   *
   * The provided forEachFunc(child, index) will be called for each
   * leaf child.
   *
   * @param {?*} children Children tree container.
   * @param {function(*, int)} forEachFunc
   * @param {*} forEachContext Context for forEachContext.
   */
  function forEachChildren(children, forEachFunc, forEachContext) {
    mapChildren(children,
    // $FlowFixMe[missing-this-annot]
    function () {
      forEachFunc.apply(this, arguments);
      // Don't return anything.
    }, forEachContext);
  }

  /**
   * Flatten a children object (typically specified as `props.children`) and
   * return an array with appropriately re-keyed children.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
   */
  function toArray(children) {
    return mapChildren(children, child => child) || [];
  }

  /**
   * Returns the first child in a collection of children and verifies that there
   * is only one child in the collection.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrenonly
   *
   * The current implementation of this function assumes that a single child gets
   * passed without a wrapper, but the purpose of this helper function is to
   * abstract away the particular structure of children.
   *
   * @param {?object} children Child collection structure.
   * @return {ReactElement} The first and only `ReactElement` contained in the
   * structure.
   */
  function onlyChild(children) {
    if (!isValidElement(children)) {
      throw new Error('React.Children.only expected to receive a single React element child.');
    }
    return children;
  }

  // an immutable object with a single mutable value
  function createRef() {
    const refObject = {
      current: null
    };
    return refObject;
  }

  function resolveDispatcher() {
    const dispatcher = ReactSharedInternals.H;
    // Will result in a null access error if accessed outside render phase. We
    // intentionally don't throw our own error because this is in a hot path.
    // Also helps ensure this is inlined.
    return dispatcher;
  }
  function useCallback(callback, deps) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useCallback(callback, deps);
  }
  function useMemo(create, deps) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useMemo(create, deps);
  }
  function useDebugValue(value, formatterFn) {
  }
  function useId() {
    const dispatcher = resolveDispatcher();
    return dispatcher.useId();
  }
  function use(usable) {
    const dispatcher = resolveDispatcher();
    return dispatcher.use(usable);
  }

  function forwardRef(render) {
    const elementType = {
      $$typeof: REACT_FORWARD_REF_TYPE,
      render
    };
    return elementType;
  }

  const Uninitialized = -1;
  const Pending = 0;
  const Resolved = 1;
  const Rejected = 2;
  function lazyInitializer(payload) {
    if (payload._status === Uninitialized) {
      const ctor = payload._result;
      const thenable = ctor();
      // Transition to the next state.
      // This might throw either because it's missing or throws. If so, we treat it
      // as still uninitialized and try again next time. Which is the same as what
      // happens if the ctor or any wrappers processing the ctor throws. This might
      // end up fixing it if the resolution was a concurrency bug.
      thenable.then(moduleObject => {
        if (payload._status === Pending || payload._status === Uninitialized) {
          // Transition to the next state.
          const resolved = payload;
          resolved._status = Resolved;
          resolved._result = moduleObject;
        }
      }, error => {
        if (payload._status === Pending || payload._status === Uninitialized) {
          // Transition to the next state.
          const rejected = payload;
          rejected._status = Rejected;
          rejected._result = error;
        }
      });
      if (payload._status === Uninitialized) {
        // In case, we're still uninitialized, then we're waiting for the thenable
        // to resolve. Set it as pending in the meantime.
        const pending = payload;
        pending._status = Pending;
        pending._result = thenable;
      }
    }
    if (payload._status === Resolved) {
      const moduleObject = payload._result;
      return moduleObject.default;
    } else {
      throw payload._result;
    }
  }
  function lazy(ctor) {
    const payload = {
      // We use these fields to store the result.
      _status: Uninitialized,
      _result: ctor
    };
    const lazyType = {
      $$typeof: REACT_LAZY_TYPE,
      _payload: payload,
      _init: lazyInitializer
    };
    return lazyType;
  }

  function memo(type, compare) {
    const elementType = {
      $$typeof: REACT_MEMO_TYPE,
      type,
      compare: compare === undefined ? null : compare
    };
    return elementType;
  }

  const UNTERMINATED = 0;
  const TERMINATED = 1;
  const ERRORED = 2;
  function createCacheRoot() {
    return new WeakMap();
  }
  function createCacheNode() {
    return {
      s: UNTERMINATED,
      // status, represents whether the cached computation returned a value or threw an error
      v: undefined,
      // value, either the cached result or an error, depending on s
      o: null,
      // object cache, a WeakMap where non-primitive arguments are stored
      p: null // primitive cache, a regular Map where primitive arguments are stored.
    };
  }
  function cache(fn) {
    return function () {
      const dispatcher = ReactSharedInternals.A;
      if (!dispatcher) {
        // If there is no dispatcher, then we treat this as not being cached.
        // $FlowFixMe[incompatible-call]: We don't want to use rest arguments since we transpile the code.
        return fn.apply(null, arguments);
      }
      const fnMap = dispatcher.getCacheForType(createCacheRoot);
      const fnNode = fnMap.get(fn);
      let cacheNode;
      if (fnNode === undefined) {
        cacheNode = createCacheNode();
        fnMap.set(fn, cacheNode);
      } else {
        cacheNode = fnNode;
      }
      for (let i = 0, l = arguments.length; i < l; i++) {
        const arg = arguments[i];
        if (typeof arg === 'function' || typeof arg === 'object' && arg !== null) {
          // Objects go into a WeakMap
          let objectCache = cacheNode.o;
          if (objectCache === null) {
            cacheNode.o = objectCache = new WeakMap();
          }
          const objectNode = objectCache.get(arg);
          if (objectNode === undefined) {
            cacheNode = createCacheNode();
            objectCache.set(arg, cacheNode);
          } else {
            cacheNode = objectNode;
          }
        } else {
          // Primitives go into a regular Map
          let primitiveCache = cacheNode.p;
          if (primitiveCache === null) {
            cacheNode.p = primitiveCache = new Map();
          }
          const primitiveNode = primitiveCache.get(arg);
          if (primitiveNode === undefined) {
            cacheNode = createCacheNode();
            primitiveCache.set(arg, cacheNode);
          } else {
            cacheNode = primitiveNode;
          }
        }
      }
      if (cacheNode.s === TERMINATED) {
        return cacheNode.v;
      }
      if (cacheNode.s === ERRORED) {
        throw cacheNode.v;
      }
      try {
        // $FlowFixMe[incompatible-call]: We don't want to use rest arguments since we transpile the code.
        const result = fn.apply(null, arguments);
        const terminatedNode = cacheNode;
        terminatedNode.s = TERMINATED;
        terminatedNode.v = result;
        return result;
      } catch (error) {
        // We store the first error that's thrown and rethrow it.
        const erroredNode = cacheNode;
        erroredNode.s = ERRORED;
        erroredNode.v = error;
        throw error;
      }
    };
  }

  // TODO: this is special because it gets imported during build.
  //
  // It exists as a placeholder so that DevTools can support work tag changes between releases.
  // When we next publish a release, update the matching TODO in backend/renderer.js
  // TODO: This module is used both by the release scripts and to expose a version
  // at runtime. We should instead inject the version number as part of the build
  // process, and use the ReactVersions.js module as the single source of truth.
  var ReactVersion = '19.1.0';

  function captureOwnerStack() {
    return null;
  }

  const Children = {
    map: mapChildren,
    forEach: forEachChildren,
    count: countChildren,
    toArray,
    only: onlyChild
  };

  exports.Children = Children;
  exports.Fragment = REACT_FRAGMENT_TYPE;
  exports.Profiler = REACT_PROFILER_TYPE;
  exports.StrictMode = REACT_STRICT_MODE_TYPE;
  exports.Suspense = REACT_SUSPENSE_TYPE;
  exports.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
  exports.cache = cache;
  exports.captureOwnerStack = captureOwnerStack;
  exports.cloneElement = cloneElement;
  exports.createElement = createElement;
  exports.createRef = createRef;
  exports.forwardRef = forwardRef;
  exports.isValidElement = isValidElement;
  exports.lazy = lazy;
  exports.memo = memo;
  exports.use = use;
  exports.useCallback = useCallback;
  exports.useDebugValue = useDebugValue;
  exports.useId = useId;
  exports.useMemo = useMemo;
  exports.version = ReactVersion;

}));
