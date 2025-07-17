define("react/react-server", ['exports'], (function (exports) { 'use strict';

  // -----------------------------------------------------------------------------
  // Land or remove (zero effort)
  //
  // Flags that can likely be deleted or landed without consequences
  // -----------------------------------------------------------------------------

  const ownerStackLimit = 1e4;

  const ReactSharedInternals = {
    H: null,
    A: null
  };
  {
    // Stack implementation injected by the current renderer.
    ReactSharedInternals.getCurrentStack = null;
    ReactSharedInternals.recentlyCreatedOwnerStacks = 0;
  }

  const isArrayImpl = Array.isArray;
  function isArray(a) {
    return isArrayImpl(a);
  }

  const REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element') ;
  const REACT_PORTAL_TYPE = Symbol.for('react.portal');
  const REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
  const REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
  const REACT_PROFILER_TYPE = Symbol.for('react.profiler');
  const REACT_PROVIDER_TYPE = Symbol.for('react.provider'); // TODO: Delete with enableRenderableContext
  const REACT_CONSUMER_TYPE = Symbol.for('react.consumer');
  const REACT_CONTEXT_TYPE = Symbol.for('react.context');
  const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
  const REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
  const REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
  const REACT_MEMO_TYPE = Symbol.for('react.memo');
  const REACT_LAZY_TYPE = Symbol.for('react.lazy');
  const REACT_ACTIVITY_TYPE = Symbol.for('react.activity');
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

  /*
   * The `'' + value` pattern (used in perf-sensitive code) throws for Symbol
   * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
   *
   * The functions in this module will throw an easier-to-understand,
   * easier-to-debug exception with a clear errors message message explaining the
   * problem. (Instead of a confusing exception thrown inside the implementation
   * of the `value` object).
   */

  // $FlowFixMe[incompatible-return] only called in DEV, so void return is not possible.
  function typeName(value) {
    {
      // toStringTag is needed for namespaced types like Temporal.Instant
      const hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
      const type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
      // $FlowFixMe[incompatible-return]
      return type;
    }
  }

  // $FlowFixMe[incompatible-return] only called in DEV, so void return is not possible.
  function willCoercionThrow(value) {
    {
      try {
        testStringCoercion(value);
        return false;
      } catch (e) {
        return true;
      }
    }
  }

  /** @noinline */
  function testStringCoercion(value) {
    // If you ended up here by following an exception call stack, here's what's
    // happened: you supplied an object or symbol value to React (as a prop, key,
    // DOM attribute, CSS property, string ref, etc.) and when React tried to
    // coerce it to a string using `'' + value`, an exception was thrown.
    //
    // The most common types that will cause this exception are `Symbol` instances
    // and Temporal objects like `Temporal.Instant`. But any object that has a
    // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
    // exception. (Library authors do this to prevent users from using built-in
    // numeric operators like `+` or comparison operators like `>=` because custom
    // methods are needed to perform accurate arithmetic or comparison.)
    //
    // To fix the problem, coerce this object or symbol value to a string before
    // passing it to React. The most reliable way is usually `String(value)`.
    //
    // To find which value is throwing, check the browser or debugger console.
    // Before this exception was thrown, there should be `console.error` output
    // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
    // problem and how that type was used: key, atrribute, input value prop, etc.
    // In most cases, this console output also shows the component and its
    // ancestor components where the exception happened.
    //
    // eslint-disable-next-line react-internal/safe-string-coercion
    return '' + value;
  }
  function checkKeyStringCoercion(value) {
    {
      if (willCoercionThrow(value)) {
        console.error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before using it here.', typeName(value));
        return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
      }
    }
  }

  // Keep in sync with react-reconciler/getComponentNameFromFiber
  function getWrappedName(outerType, innerType, wrapperName) {
    const displayName = outerType.displayName;
    if (displayName) {
      return displayName;
    }
    const functionName = innerType.displayName || innerType.name || '';
    return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
  }

  // Keep in sync with react-reconciler/getComponentNameFromFiber
  function getContextName(type) {
    return type.displayName || 'Context';
  }
  const REACT_CLIENT_REFERENCE = Symbol.for('react.client.reference');

  // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.
  function getComponentNameFromType(type) {
    if (type == null) {
      // Host root, text node or just invalid type.
      return null;
    }
    if (typeof type === 'function') {
      if (type.$$typeof === REACT_CLIENT_REFERENCE) {
        // TODO: Create a convention for naming client references with debug info.
        return null;
      }
      return type.displayName || type.name || null;
    }
    if (typeof type === 'string') {
      return type;
    }
    switch (type) {
      case REACT_FRAGMENT_TYPE:
        return 'Fragment';
      case REACT_PROFILER_TYPE:
        return 'Profiler';
      case REACT_STRICT_MODE_TYPE:
        return 'StrictMode';
      case REACT_SUSPENSE_TYPE:
        return 'Suspense';
      case REACT_SUSPENSE_LIST_TYPE:
        return 'SuspenseList';
      case REACT_ACTIVITY_TYPE:
        return 'Activity';
    }
    if (typeof type === 'object') {
      {
        if (typeof type.tag === 'number') {
          console.error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
        }
      }
      switch (type.$$typeof) {
        case REACT_PORTAL_TYPE:
          return 'Portal';
        case REACT_PROVIDER_TYPE:
          {
            return null;
          }
        case REACT_CONTEXT_TYPE:
          const context = type;
          {
            return getContextName(context) + '.Provider';
          }
        case REACT_CONSUMER_TYPE:
          {
            const consumer = type;
            return getContextName(consumer._context) + '.Consumer';
          }
        case REACT_FORWARD_REF_TYPE:
          return getWrappedName(type, type.render, 'ForwardRef');
        case REACT_MEMO_TYPE:
          const outerName = type.displayName || null;
          if (outerName !== null) {
            return outerName;
          }
          return getComponentNameFromType(type.type) || 'Memo';
        case REACT_LAZY_TYPE:
          {
            const lazyComponent = type;
            const payload = lazyComponent._payload;
            const init = lazyComponent._init;
            try {
              return getComponentNameFromType(init(payload));
            } catch (x) {
              return null;
            }
          }
      }
    }
    return null;
  }

  // $FlowFixMe[method-unbinding]
  const hasOwnProperty = Object.prototype.hasOwnProperty;

  const assign = Object.assign;

  const createTask =
  // eslint-disable-next-line react-internal/no-production-logging
  console.createTask ?
  // eslint-disable-next-line react-internal/no-production-logging
  console.createTask : () => null;
  function getTaskName(type) {
    if (type === REACT_FRAGMENT_TYPE) {
      return '<>';
    }
    if (typeof type === 'object' && type !== null && type.$$typeof === REACT_LAZY_TYPE) {
      // We don't want to eagerly initialize the initializer in DEV mode so we can't
      // call it to extract the type so we don't know the type of this component.
      return '<...>';
    }
    try {
      const name = getComponentNameFromType(type);
      return name ? '<' + name + '>' : '<...>';
    } catch (x) {
      return '<...>';
    }
  }
  function getOwner() {
    {
      const dispatcher = ReactSharedInternals.A;
      if (dispatcher === null) {
        return null;
      }
      return dispatcher.getOwner();
    }
  }

  /** @noinline */
  function UnknownOwner() {
    /** @noinline */
    return (() => Error('react-stack-top-frame'))();
  }
  const createFakeCallStack = {
    'react-stack-bottom-frame': function (callStackForError) {
      return callStackForError();
    }
  };
  let specialPropKeyWarningShown;
  let didWarnAboutElementRef;
  let didWarnAboutOldJSXRuntime;
  let unknownOwnerDebugStack;
  let unknownOwnerDebugTask;
  {
    didWarnAboutElementRef = {};

    // We use this technique to trick minifiers to preserve the function name.
    unknownOwnerDebugStack = createFakeCallStack['react-stack-bottom-frame'].bind(createFakeCallStack, UnknownOwner)();
    unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
  }
  function hasValidRef(config) {
    {
      if (hasOwnProperty.call(config, 'ref')) {
        const getter = Object.getOwnPropertyDescriptor(config, 'ref').get;
        if (getter && getter.isReactWarning) {
          return false;
        }
      }
    }
    return config.ref !== undefined;
  }
  function hasValidKey(config) {
    {
      if (hasOwnProperty.call(config, 'key')) {
        const getter = Object.getOwnPropertyDescriptor(config, 'key').get;
        if (getter && getter.isReactWarning) {
          return false;
        }
      }
    }
    return config.key !== undefined;
  }
  function defineKeyPropWarningGetter(props, displayName) {
    {
      const warnAboutAccessingKey = function () {
        if (!specialPropKeyWarningShown) {
          specialPropKeyWarningShown = true;
          console.error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://react.dev/link/special-props)', displayName);
        }
      };
      warnAboutAccessingKey.isReactWarning = true;
      Object.defineProperty(props, 'key', {
        get: warnAboutAccessingKey,
        configurable: true
      });
    }
  }
  function elementRefGetterWithDeprecationWarning() {
    {
      const componentName = getComponentNameFromType(this.type);
      if (!didWarnAboutElementRef[componentName]) {
        didWarnAboutElementRef[componentName] = true;
        console.error('Accessing element.ref was removed in React 19. ref is now a ' + 'regular prop. It will be removed from the JSX Element ' + 'type in a future release.');
      }

      // An undefined `element.ref` is coerced to `null` for
      // backwards compatibility.
      const refProp = this.props.ref;
      return refProp !== undefined ? refProp : null;
    }
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
      // In dev, make `ref` a non-enumerable property with a warning. It's non-
      // enumerable so that test matchers and serializers don't access it and
      // trigger the warning.
      //
      // `ref` will be removed from the element completely in a future release.
      element = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: REACT_ELEMENT_TYPE,
        // Built-in properties that belong on the element
        type,
        key,
        props,
        // Record the component responsible for creating this element.
        _owner: owner
      };
      if (ref !== null) {
        Object.defineProperty(element, 'ref', {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        });
      } else {
        // Don't warn on access if a ref is not given. This reduces false
        // positives in cases where a test serializer uses
        // getOwnPropertyDescriptors to compare objects, like Jest does, which is
        // a problem because it bypasses non-enumerability.
        //
        // So unfortunately this will trigger a false positive warning in Jest
        // when the diff is printed:
        //
        //   expect(<div ref={ref} />).toEqual(<span ref={ref} />);
        //
        // A bit sketchy, but this is what we've done for the `props.key` and
        // `props.ref` accessors for years, which implies it will be good enough
        // for `element.ref`, too. Let's see if anyone complains.
        Object.defineProperty(element, 'ref', {
          enumerable: false,
          value: null
        });
      }
    }
    {
      // The validation flag is currently mutative. We put it on
      // an external backing store so that we can freeze the whole object.
      // This can be replaced with a WeakMap once they are implemented in
      // commonly used development environments.
      element._store = {};

      // To make comparing ReactElements easier for testing purposes, we make
      // the validation flag non-enumerable (where possible, which should
      // include every environment we run tests in), so the test framework
      // ignores it.
      Object.defineProperty(element._store, 'validated', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: 0
      });
      // debugInfo contains Server Component debug information.
      Object.defineProperty(element, '_debugInfo', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      });
      Object.defineProperty(element, '_debugStack', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: debugStack
      });
      Object.defineProperty(element, '_debugTask', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: debugTask
      });
      if (Object.freeze) {
        Object.freeze(element.props);
        Object.freeze(element);
      }
    }
    return element;
  }

  /**
   * Create and return a new ReactElement of the given type.
   * See https://reactjs.org/docs/react-api.html#createelement
   */
  function createElement(type, config, children) {
    {
      // We don't warn for invalid element type here because with owner stacks,
      // we error in the renderer. The renderer is the only one that knows what
      // types are valid for this particular renderer so we let it error there.

      // Skip key warning if the type isn't valid since our key validation logic
      // doesn't expect a non-string/function type and can throw confusing
      // errors. We don't want exception behavior to differ between dev and
      // prod. (Rendering will throw with a helpful message and as soon as the
      // type is fixed, the key warnings will appear.)
      for (let i = 2; i < arguments.length; i++) {
        validateChildKeys(arguments[i]);
      }

      // Unlike the jsx() runtime, createElement() doesn't warn about key spread.
    }
    let propName;

    // Reserved names are extracted
    const props = {};
    let key = null;
    if (config != null) {
      {
        if (!didWarnAboutOldJSXRuntime && '__self' in config &&
        // Do not assume this is the result of an oudated JSX transform if key
        // is present, because the modern JSX transform sometimes outputs
        // createElement to preserve precedence between a static key and a
        // spread key. To avoid false positive warnings, we never warn if
        // there's a key.
        !('key' in config)) {
          didWarnAboutOldJSXRuntime = true;
          console.warn('Your app (or one of its dependencies) is using an outdated JSX ' + 'transform. Update to the modern JSX transform for ' + 'faster performance: https://react.dev/link/new-jsx-transform');
        }
      }
      if (hasValidKey(config)) {
        {
          checkKeyStringCoercion(config.key);
        }
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
      {
        if (Object.freeze) {
          Object.freeze(childArray);
        }
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
    {
      if (key) {
        const displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
        defineKeyPropWarningGetter(props, displayName);
      }
    }
    const trackActualOwner = ReactSharedInternals.recentlyCreatedOwnerStacks++ < ownerStackLimit;
    return ReactElement(type, key, undefined, undefined, getOwner(), props, (trackActualOwner ? Error('react-stack-top-frame') : unknownOwnerDebugStack), (trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask));
  }
  function cloneAndReplaceKey(oldElement, newKey) {
    const clonedElement = ReactElement(oldElement.type, newKey, undefined, undefined, oldElement._owner, oldElement.props, oldElement._debugStack, oldElement._debugTask);
    {
      // The cloned element should inherit the original element's key validation.
      if (oldElement._store) {
        clonedElement._store.validated = oldElement._store.validated;
      }
    }
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
    let owner = element._owner;
    if (config != null) {
      if (hasValidRef(config)) {
        owner = getOwner() ;
      }
      if (hasValidKey(config)) {
        {
          checkKeyStringCoercion(config.key);
        }
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
    const clonedElement = ReactElement(element.type, key, undefined, undefined, owner, props, element._debugStack, element._debugTask);
    for (let i = 2; i < arguments.length; i++) {
      validateChildKeys(arguments[i]);
    }
    return clonedElement;
  }

  /**
   * Ensure that every element either is passed in a static location, in an
   * array with an explicit keys property defined, or in an object literal
   * with valid key property.
   *
   * @internal
   * @param {ReactNode} node Statically passed child of any type.
   * @param {*} parentType node's parent's type.
   */
  function validateChildKeys(node, parentType) {
    {
      // With owner stacks is, no warnings happens. All we do is
      // mark elements as being in a valid static child position so they
      // don't need keys.
      if (isValidElement(node)) {
        if (node._store) {
          node._store.validated = 1;
        }
      }
    }
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

  /**
   * TODO: Test that a single child and an array with one item have the same key
   * pattern.
   */

  let didWarnAboutMaps = false;
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
      // Explicit key
      {
        checkKeyStringCoercion(element.key);
      }
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
          {
            // The `if` statement here prevents auto-disabling of the safe
            // coercion ESLint rule, so we must manually disable it below.
            // $FlowFixMe[incompatible-type] Flow incorrectly thinks React.Portal doesn't have a key
            if (mappedChild.key != null) {
              if (!child || child.key !== mappedChild.key) {
                checkKeyStringCoercion(mappedChild.key);
              }
            }
          }
          const newChild = cloneAndReplaceKey(mappedChild,
          // Keep both the (mapped) and old keys if they differ, just as
          // traverseAllChildren used to do for objects as children
          escapedPrefix + (
          // $FlowFixMe[incompatible-type] Flow incorrectly thinks React.Portal doesn't have a key
          mappedChild.key != null && (!child || child.key !== mappedChild.key) ? escapeUserProvidedKey(
          // $FlowFixMe[unsafe-addition]
          '' + mappedChild.key // eslint-disable-line react-internal/safe-string-coercion
          ) + '/' : '') + childKey);
          {
            // If `child` was an element without a `key`, we need to validate if
            // it should have had a `key`, before assigning one to `mappedChild`.
            // $FlowFixMe[incompatible-type] Flow incorrectly thinks React.Portal doesn't have a key
            if (nameSoFar !== '' && child != null && isValidElement(child) && child.key == null) {
              // We check truthiness of `child._store.validated` instead of being
              // inequal to `1` to provide a bit of backward compatibility for any
              // libraries (like `fbt`) which may be hacking this property.
              if (child._store && !child._store.validated) {
                // Mark this child as having failed validation, but let the actual
                // renderer print the warning later.
                newChild._store.validated = 2;
              }
            }
          }
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
        {
          // Warn about using Maps as children
          if (iteratorFn === iterableChildren.entries) {
            if (!didWarnAboutMaps) {
              console.warn('Using Maps as children is not supported. ' + 'Use an array of keyed ReactElements instead.');
            }
            didWarnAboutMaps = true;
          }
        }
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
    {
      Object.seal(refObject);
    }
    return refObject;
  }

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
  function useCallback(callback, deps) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useCallback(callback, deps);
  }
  function useMemo(create, deps) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useMemo(create, deps);
  }
  function useDebugValue(value, formatterFn) {
    {
      const dispatcher = resolveDispatcher();
      return dispatcher.useDebugValue(value, formatterFn);
    }
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
    {
      if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
        console.error('forwardRef requires a render function but received a `memo` ' + 'component. Instead of forwardRef(memo(...)), use ' + 'memo(forwardRef(...)).');
      } else if (typeof render !== 'function') {
        console.error('forwardRef requires a render function but was given %s.', render === null ? 'null' : typeof render);
      } else {
        if (render.length !== 0 && render.length !== 2) {
          console.error('forwardRef render functions accept exactly two parameters: props and ref. %s', render.length === 1 ? 'Did you forget to use the ref parameter?' : 'Any additional parameter will be undefined.');
        }
      }
      if (render != null) {
        if (render.defaultProps != null) {
          console.error('forwardRef render functions do not support defaultProps. ' + 'Did you accidentally pass a React component?');
        }
      }
    }
    const elementType = {
      $$typeof: REACT_FORWARD_REF_TYPE,
      render
    };
    {
      let ownName;
      Object.defineProperty(elementType, 'displayName', {
        enumerable: false,
        configurable: true,
        get: function () {
          return ownName;
        },
        set: function (name) {
          ownName = name;

          // The inner component shouldn't inherit this display name in most cases,
          // because the component may be used elsewhere.
          // But it's nice for anonymous functions to inherit the name,
          // so that our component-stack generation logic will display their frames.
          // An anonymous function generally suggests a pattern like:
          //   React.forwardRef((props, ref) => {...});
          // This kind of inner function is not used elsewhere so the side effect is okay.
          if (!render.name && !render.displayName) {
            Object.defineProperty(render, 'name', {
              value: name
            });
            render.displayName = name;
          }
        }
      });
    }
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
      {
        if (moduleObject === undefined) {
          console.error('lazy: Expected the result of a dynamic imp' + 'ort() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' +
          // Break up imports to avoid accidentally parsing them as dependencies.
          'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))\n\n" + 'Did you accidentally put curly braces around the import?', moduleObject);
        }
      }
      {
        if (!('default' in moduleObject)) {
          console.error('lazy: Expected the result of a dynamic imp' + 'ort() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' +
          // Break up imports to avoid accidentally parsing them as dependencies.
          'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))", moduleObject);
        }
      }
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
    {
      if (type == null) {
        console.error('memo: The first argument must be a component. Instead ' + 'received: %s', type === null ? 'null' : typeof type);
      }
    }
    const elementType = {
      $$typeof: REACT_MEMO_TYPE,
      type,
      compare: compare === undefined ? null : compare
    };
    {
      let ownName;
      Object.defineProperty(elementType, 'displayName', {
        enumerable: false,
        configurable: true,
        get: function () {
          return ownName;
        },
        set: function (name) {
          ownName = name;

          // The inner component shouldn't inherit this display name in most cases,
          // because the component may be used elsewhere.
          // But it's nice for anonymous functions to inherit the name,
          // so that our component-stack generation logic will display their frames.
          // An anonymous function generally suggests a pattern like:
          //   React.memo((props) => {...});
          // This kind of inner function is not used elsewhere so the side effect is okay.
          if (!type.name && !type.displayName) {
            Object.defineProperty(type, 'name', {
              value: name
            });
            type.displayName = name;
          }
        }
      });
    }
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
    {
      const getCurrentStack = ReactSharedInternals.getCurrentStack;
      if (getCurrentStack === null) {
        return null;
      }
      // The current stack will be the owner stack which it is always here.
      return getCurrentStack();
    }
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
