define("react-server", ['exports', 'react'], (function (exports, React) { 'use strict';

  // -----------------------------------------------------------------------------
  // Land or remove (zero effort)
  //
  // Flags that can likely be deleted or landed without consequences
  // -----------------------------------------------------------------------------

  const enableFizzBlockingRender = false; // rel="expect"

  const REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element') ;
  const REACT_PORTAL_TYPE = Symbol.for('react.portal');
  const REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
  const REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
  const REACT_PROFILER_TYPE = Symbol.for('react.profiler');
  const REACT_CONSUMER_TYPE = Symbol.for('react.consumer');
  const REACT_CONTEXT_TYPE = Symbol.for('react.context');
  const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
  const REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
  const REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
  const REACT_MEMO_TYPE = Symbol.for('react.memo');
  const REACT_LAZY_TYPE = Symbol.for('react.lazy');
  const REACT_SCOPE_TYPE = Symbol.for('react.scope');
  const REACT_ACTIVITY_TYPE = Symbol.for('react.activity');
  const REACT_LEGACY_HIDDEN_TYPE = Symbol.for('react.legacy_hidden');
  const REACT_MEMO_CACHE_SENTINEL = Symbol.for('react.memo_cache_sentinel');
  const REACT_VIEW_TRANSITION_TYPE = Symbol.for('react.view_transition');
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

  const isArrayImpl = Array.isArray;
  function isArray(a) {
    return isArrayImpl(a);
  }

  // Used for DEV messages to keep track of which parent rendered some props,
  // in case they error.
  const jsxPropsParents = new WeakMap();
  const jsxChildrenParents = new WeakMap();
  function objectName(object) {
    // $FlowFixMe[method-unbinding]
    const name = Object.prototype.toString.call(object);
    // Extract 'Object' from '[object Object]':
    return name.slice(8, name.length - 1);
  }
  function describeKeyForErrorMessage(key) {
    const encodedKey = JSON.stringify(key);
    return '"' + key + '"' === encodedKey ? key : encodedKey;
  }
  function describeValueForErrorMessage(value) {
    switch (typeof value) {
      case 'string':
        {
          return JSON.stringify(value.length <= 10 ? value : value.slice(0, 10) + '...');
        }
      case 'object':
        {
          if (isArray(value)) {
            return '[...]';
          }
          if (value !== null && value.$$typeof === CLIENT_REFERENCE_TAG) {
            return describeClientReference();
          }
          const name = objectName(value);
          if (name === 'Object') {
            return '{...}';
          }
          return name;
        }
      case 'function':
        {
          if (value.$$typeof === CLIENT_REFERENCE_TAG) {
            return describeClientReference();
          }
          const name = value.displayName || value.name;
          return name ? 'function ' + name : 'function';
        }
      default:
        // eslint-disable-next-line react-internal/safe-string-coercion
        return String(value);
    }
  }
  function describeElementType(type) {
    if (typeof type === 'string') {
      return type;
    }
    switch (type) {
      case REACT_SUSPENSE_TYPE:
        return 'Suspense';
      case REACT_SUSPENSE_LIST_TYPE:
        return 'SuspenseList';
    }
    if (typeof type === 'object') {
      switch (type.$$typeof) {
        case REACT_FORWARD_REF_TYPE:
          return describeElementType(type.render);
        case REACT_MEMO_TYPE:
          return describeElementType(type.type);
        case REACT_LAZY_TYPE:
          {
            const lazyComponent = type;
            const payload = lazyComponent._payload;
            const init = lazyComponent._init;
            try {
              // Lazy may contain any component type so we recursively resolve it.
              return describeElementType(init(payload));
            } catch (x) {}
          }
      }
    }
    return '';
  }
  const CLIENT_REFERENCE_TAG = Symbol.for('react.client.reference');
  function describeClientReference(ref) {
    return 'client';
  }
  function describeObjectForErrorMessage(objectOrArray, expandedName) {
    const objKind = objectName(objectOrArray);
    if (objKind !== 'Object' && objKind !== 'Array') {
      return objKind;
    }
    let str = '';
    let start = -1;
    let length = 0;
    if (isArray(objectOrArray)) {
      if (jsxChildrenParents.has(objectOrArray)) {
        // Print JSX Children
        const type = jsxChildrenParents.get(objectOrArray);
        str = '<' + describeElementType(type) + '>';
        const array = objectOrArray;
        for (let i = 0; i < array.length; i++) {
          const value = array[i];
          let substr;
          if (typeof value === 'string') {
            substr = value;
          } else if (typeof value === 'object' && value !== null) {
            substr = '{' + describeObjectForErrorMessage(value) + '}';
          } else {
            substr = '{' + describeValueForErrorMessage(value) + '}';
          }
          if ('' + i === expandedName) {
            start = str.length;
            length = substr.length;
            str += substr;
          } else if (substr.length < 15 && str.length + substr.length < 40) {
            str += substr;
          } else {
            str += '{...}';
          }
        }
        str += '</' + describeElementType(type) + '>';
      } else {
        // Print Array
        str = '[';
        const array = objectOrArray;
        for (let i = 0; i < array.length; i++) {
          if (i > 0) {
            str += ', ';
          }
          const value = array[i];
          let substr;
          if (typeof value === 'object' && value !== null) {
            substr = describeObjectForErrorMessage(value);
          } else {
            substr = describeValueForErrorMessage(value);
          }
          if ('' + i === expandedName) {
            start = str.length;
            length = substr.length;
            str += substr;
          } else if (substr.length < 10 && str.length + substr.length < 40) {
            str += substr;
          } else {
            str += '...';
          }
        }
        str += ']';
      }
    } else {
      if (objectOrArray.$$typeof === REACT_ELEMENT_TYPE) {
        str = '<' + describeElementType(objectOrArray.type) + '/>';
      } else if (objectOrArray.$$typeof === CLIENT_REFERENCE_TAG) {
        return describeClientReference();
      } else if (jsxPropsParents.has(objectOrArray)) {
        // Print JSX
        const type = jsxPropsParents.get(objectOrArray);
        str = '<' + (describeElementType(type) || '...');
        const object = objectOrArray;
        const names = Object.keys(object);
        for (let i = 0; i < names.length; i++) {
          str += ' ';
          const name = names[i];
          str += describeKeyForErrorMessage(name) + '=';
          const value = object[name];
          let substr;
          if (name === expandedName && typeof value === 'object' && value !== null) {
            substr = describeObjectForErrorMessage(value);
          } else {
            substr = describeValueForErrorMessage(value);
          }
          if (typeof value !== 'string') {
            substr = '{' + substr + '}';
          }
          if (name === expandedName) {
            start = str.length;
            length = substr.length;
            str += substr;
          } else if (substr.length < 10 && str.length + substr.length < 40) {
            str += substr;
          } else {
            str += '...';
          }
        }
        str += '>';
      } else {
        // Print Object
        str = '{';
        const object = objectOrArray;
        const names = Object.keys(object);
        for (let i = 0; i < names.length; i++) {
          if (i > 0) {
            str += ', ';
          }
          const name = names[i];
          str += describeKeyForErrorMessage(name) + ': ';
          const value = object[name];
          let substr;
          if (typeof value === 'object' && value !== null) {
            substr = describeObjectForErrorMessage(value);
          } else {
            substr = describeValueForErrorMessage(value);
          }
          if (name === expandedName) {
            start = str.length;
            length = substr.length;
            str += substr;
          } else if (substr.length < 10 && str.length + substr.length < 40) {
            str += substr;
          } else {
            str += '...';
          }
        }
        str += '}';
      }
    }
    if (expandedName === undefined) {
      return str;
    }
    if (start > -1 && length > 0) {
      const highlight = ' '.repeat(start) + '^'.repeat(length);
      return '\n  ' + str + '\n  ' + highlight;
    }
    return '\n  ' + str;
  }

  // This is a host config that's used for the `react-server` package on npm.
  // It is only used by third-party renderers.
  //
  // Its API lets you pass the host config as an argument.
  // However, inside the `react-server` we treat host config as a module.
  // This file is a shim between two worlds.
  //
  // It works because the `react-server` bundle is wrapped in something like:
  //
  // module.exports = function ($$$config) {
  //   /* renderer code */
  // }
  //
  // So `$$$config` looks like a global variable, but it's
  // really an argument to a top-level wrapping function.

  const scheduleWork = $$$config.scheduleWork;
  const scheduleMicrotask = $$$config.scheduleMicrotask;
  const beginWriting = $$$config.beginWriting;
  const writeChunk = $$$config.writeChunk;
  const writeChunkAndReturn = $$$config.writeChunkAndReturn;
  const completeWriting = $$$config.completeWriting;
  const flushBuffered = $$$config.flushBuffered;
  const close = $$$config.close;
  const closeWithError = $$$config.closeWithError;
  $$$config.stringToChunk;
  $$$config.stringToPrecomputedChunk;
  $$$config.typedArrayToBinaryChunk;
  const byteLengthOfChunk = $$$config.byteLengthOfChunk;
  $$$config.byteLengthOfBinaryChunk;
  const createFastHash = $$$config.createFastHash;
  $$$config.readAsDataURL;

  // This is a host config that's used for the `react-server` package on npm.
  // It is only used by third-party renderers.
  //
  // Its API lets you pass the host config as an argument.
  // However, inside the `react-server` we treat host config as a module.
  // This file is a shim between two worlds.
  //
  // It works because the `react-server` bundle is wrapped in something like:
  //
  // module.exports = function ($$$config) {
  //   /* renderer code */
  // }
  //
  // So `$$$config` looks like a global variable, but it's
  // really an argument to a top-level wrapping function.

  const bindToConsole = $$$config.bindToConsole;
  const resetResumableState = $$$config.resetResumableState;
  const completeResumableState = $$$config.completeResumableState;
  const getChildFormatContext = $$$config.getChildFormatContext;
  const getSuspenseFallbackFormatContext = $$$config.getSuspenseFallbackFormatContext;
  const getSuspenseContentFormatContext = $$$config.getSuspenseContentFormatContext;
  $$$config.getViewTransitionFormatContext;
  const makeId = $$$config.makeId;
  const pushTextInstance = $$$config.pushTextInstance;
  const pushStartInstance = $$$config.pushStartInstance;
  const pushEndInstance = $$$config.pushEndInstance;
  const pushSegmentFinale = $$$config.pushSegmentFinale;
  const pushFormStateMarkerIsMatching = $$$config.pushFormStateMarkerIsMatching;
  const pushFormStateMarkerIsNotMatching = $$$config.pushFormStateMarkerIsNotMatching;
  const writeCompletedRoot = $$$config.writeCompletedRoot;
  const writePlaceholder = $$$config.writePlaceholder;
  const pushStartActivityBoundary = $$$config.pushStartActivityBoundary;
  const pushEndActivityBoundary = $$$config.pushEndActivityBoundary;
  const writeStartCompletedSuspenseBoundary = $$$config.writeStartCompletedSuspenseBoundary;
  const writeStartPendingSuspenseBoundary = $$$config.writeStartPendingSuspenseBoundary;
  const writeStartClientRenderedSuspenseBoundary = $$$config.writeStartClientRenderedSuspenseBoundary;
  const writeEndCompletedSuspenseBoundary = $$$config.writeEndCompletedSuspenseBoundary;
  const writeEndPendingSuspenseBoundary = $$$config.writeEndPendingSuspenseBoundary;
  const writeEndClientRenderedSuspenseBoundary = $$$config.writeEndClientRenderedSuspenseBoundary;
  const writeStartSegment = $$$config.writeStartSegment;
  const writeEndSegment = $$$config.writeEndSegment;
  const writeCompletedSegmentInstruction = $$$config.writeCompletedSegmentInstruction;
  const writeCompletedBoundaryInstruction = $$$config.writeCompletedBoundaryInstruction;
  const writeClientRenderBoundaryInstruction = $$$config.writeClientRenderBoundaryInstruction;
  const NotPendingTransition = $$$config.NotPendingTransition;
  const createPreambleState = $$$config.createPreambleState;
  const canHavePreamble = $$$config.canHavePreamble;
  const isPreambleContext = $$$config.isPreambleContext;
  const isPreambleReady = $$$config.isPreambleReady;
  const hoistPreambleState = $$$config.hoistPreambleState;

  // -------------------------
  //     Resources
  // -------------------------
  const writePreambleStart = $$$config.writePreambleStart;
  const writePreambleEnd = $$$config.writePreambleEnd;
  const writeHoistables = $$$config.writeHoistables;
  const writeHoistablesForBoundary = $$$config.writeHoistablesForBoundary;
  const writePostamble = $$$config.writePostamble;
  const hoistHoistables = $$$config.hoistHoistables;
  const createHoistableState = $$$config.createHoistableState;
  const hasSuspenseyContent = $$$config.hasSuspenseyContent;
  const emitEarlyPreloads = $$$config.emitEarlyPreloads;

  const assign = Object.assign;

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
        case REACT_CONTEXT_TYPE:
          const context = type;
          return getContextName(context);
        case REACT_CONSUMER_TYPE:
          const consumer = type;
          return getContextName(consumer._context) + '.Consumer';
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

  const emptyContextObject = {};
  {
    Object.freeze(emptyContextObject);
  }

  let rendererSigil;
  {
    // Use this to detect multiple renderers using the same context
    rendererSigil = {};
  }

  // Used to store the parent path of all context overrides in a shared linked list.
  // Forming a reverse tree.

  // The structure of a context snapshot is an implementation of this file.
  // Currently, it's implemented as tracking the current active node.

  const rootContextSnapshot = null;

  // We assume that this runtime owns the "current" field on all ReactContext instances.
  // This global (actually thread local) state represents what state all those "current",
  // fields are currently in.
  let currentActiveSnapshot = null;
  function popNode(prev) {
    {
      prev.context._currentValue2 = prev.parentValue;
    }
  }
  function pushNode(next) {
    {
      next.context._currentValue2 = next.value;
    }
  }
  function popToNearestCommonAncestor(prev, next) {
    if (prev === next) ; else {
      popNode(prev);
      const parentPrev = prev.parent;
      const parentNext = next.parent;
      if (parentPrev === null) {
        if (parentNext !== null) {
          throw new Error('The stacks must reach the root at the same time. This is a bug in React.');
        }
      } else {
        if (parentNext === null) {
          throw new Error('The stacks must reach the root at the same time. This is a bug in React.');
        }
        popToNearestCommonAncestor(parentPrev, parentNext);
      }

      // On the way back, we push the new ones that weren't common.
      pushNode(next);
    }
  }
  function popAllPrevious(prev) {
    popNode(prev);
    const parentPrev = prev.parent;
    if (parentPrev !== null) {
      popAllPrevious(parentPrev);
    }
  }
  function pushAllNext(next) {
    const parentNext = next.parent;
    if (parentNext !== null) {
      pushAllNext(parentNext);
    }
    pushNode(next);
  }
  function popPreviousToCommonLevel(prev, next) {
    popNode(prev);
    const parentPrev = prev.parent;
    if (parentPrev === null) {
      throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');
    }
    if (parentPrev.depth === next.depth) {
      // We found the same level. Now we just need to find a shared ancestor.
      popToNearestCommonAncestor(parentPrev, next);
    } else {
      // We must still be deeper.
      popPreviousToCommonLevel(parentPrev, next);
    }
  }
  function popNextToCommonLevel(prev, next) {
    const parentNext = next.parent;
    if (parentNext === null) {
      throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');
    }
    if (prev.depth === parentNext.depth) {
      // We found the same level. Now we just need to find a shared ancestor.
      popToNearestCommonAncestor(prev, parentNext);
    } else {
      // We must still be deeper.
      popNextToCommonLevel(prev, parentNext);
    }
    pushNode(next);
  }

  // Perform context switching to the new snapshot.
  // To make it cheap to read many contexts, while not suspending, we make the switch eagerly by
  // updating all the context's current values. That way reads, always just read the current value.
  // At the cost of updating contexts even if they're never read by this subtree.
  function switchContext(newSnapshot) {
    // The basic algorithm we need to do is to pop back any contexts that are no longer on the stack.
    // We also need to update any new contexts that are now on the stack with the deepest value.
    // The easiest way to update new contexts is to just reapply them in reverse order from the
    // perspective of the backpointers. To avoid allocating a lot when switching, we use the stack
    // for that. Therefore this algorithm is recursive.
    // 1) First we pop which ever snapshot tree was deepest. Popping old contexts as we go.
    // 2) Then we find the nearest common ancestor from there. Popping old contexts as we go.
    // 3) Then we reapply new contexts on the way back up the stack.
    const prev = currentActiveSnapshot;
    const next = newSnapshot;
    if (prev !== next) {
      if (prev === null) {
        // $FlowFixMe[incompatible-call]: This has to be non-null since it's not equal to prev.
        pushAllNext(next);
      } else if (next === null) {
        popAllPrevious(prev);
      } else if (prev.depth === next.depth) {
        popToNearestCommonAncestor(prev, next);
      } else if (prev.depth > next.depth) {
        popPreviousToCommonLevel(prev, next);
      } else {
        popNextToCommonLevel(prev, next);
      }
      currentActiveSnapshot = next;
    }
  }
  function pushProvider(context, nextValue) {
    let prevValue;
    {
      prevValue = context._currentValue2;
      context._currentValue2 = nextValue;
      {
        if (context._currentRenderer2 !== undefined && context._currentRenderer2 !== null && context._currentRenderer2 !== rendererSigil) {
          console.error('Detected multiple renderers concurrently rendering the ' + 'same context provider. This is currently unsupported.');
        }
        context._currentRenderer2 = rendererSigil;
      }
    }
    const prevNode = currentActiveSnapshot;
    const newNode = {
      parent: prevNode,
      depth: prevNode === null ? 0 : prevNode.depth + 1,
      context: context,
      parentValue: prevValue,
      value: nextValue
    };
    currentActiveSnapshot = newNode;
    return newNode;
  }
  function popProvider(context) {
    const prevSnapshot = currentActiveSnapshot;
    if (prevSnapshot === null) {
      throw new Error('Tried to pop a Context at the root of the app. This is a bug in React.');
    }
    {
      if (prevSnapshot.context !== context) {
        console.error('The parent context is not the expected context. This is probably a bug in React.');
      }
    }
    {
      const value = prevSnapshot.parentValue;
      prevSnapshot.context._currentValue2 = value;
      {
        if (context._currentRenderer2 !== undefined && context._currentRenderer2 !== null && context._currentRenderer2 !== rendererSigil) {
          console.error('Detected multiple renderers concurrently rendering the ' + 'same context provider. This is currently unsupported.');
        }
        context._currentRenderer2 = rendererSigil;
      }
    }
    return currentActiveSnapshot = prevSnapshot.parent;
  }
  function getActiveContext() {
    return currentActiveSnapshot;
  }
  function readContext$1(context) {
    const value = context._currentValue2;
    return value;
  }

  /**
   * `ReactInstanceMap` maintains a mapping from a public facing stateful
   * instance (key) and the internal representation (value). This allows public
   * methods to accept the user facing instance as an argument and map them back
   * to internal methods.
   *
   * Note that this module is currently shared and assumed to be stateless.
   * If this becomes an actual Map, that will break.
   */

  function get(key) {
    return key._reactInternals;
  }
  function set(key, value) {
    key._reactInternals = value;
  }

  const didWarnAboutNoopUpdateForComponent = {};
  const didWarnAboutDeprecatedWillMount = {};
  let didWarnAboutUninitializedState;
  let didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate;
  let didWarnAboutLegacyLifecyclesAndDerivedState;
  let didWarnAboutUndefinedDerivedState;
  let didWarnAboutDirectlyAssigningPropsToState;
  let didWarnAboutContextTypes$1;
  let didWarnAboutChildContextTypes;
  let didWarnAboutInvalidateContextType;
  let didWarnOnInvalidCallback;
  {
    didWarnAboutUninitializedState = new Set();
    didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate = new Set();
    didWarnAboutLegacyLifecyclesAndDerivedState = new Set();
    didWarnAboutDirectlyAssigningPropsToState = new Set();
    didWarnAboutUndefinedDerivedState = new Set();
    didWarnAboutContextTypes$1 = new Set();
    didWarnAboutChildContextTypes = new Set();
    didWarnAboutInvalidateContextType = new Set();
    didWarnOnInvalidCallback = new Set();
  }
  function warnOnInvalidCallback(callback) {
    {
      if (callback === null || typeof callback === 'function') {
        return;
      }
      // eslint-disable-next-line react-internal/safe-string-coercion
      const key = String(callback);
      if (!didWarnOnInvalidCallback.has(key)) {
        didWarnOnInvalidCallback.add(key);
        console.error('Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callback);
      }
    }
  }
  function warnOnUndefinedDerivedState(type, partialState) {
    {
      if (partialState === undefined) {
        const componentName = getComponentNameFromType(type) || 'Component';
        if (!didWarnAboutUndefinedDerivedState.has(componentName)) {
          didWarnAboutUndefinedDerivedState.add(componentName);
          console.error('%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. ' + 'You have returned undefined.', componentName);
        }
      }
    }
  }
  function warnNoop(publicInstance, callerName) {
    {
      const constructor = publicInstance.constructor;
      const componentName = constructor && getComponentNameFromType(constructor) || 'ReactClass';
      const warningKey = componentName + '.' + callerName;
      if (didWarnAboutNoopUpdateForComponent[warningKey]) {
        return;
      }
      console.error('Can only update a mounting component. ' + 'This usually means you called %s() outside componentWillMount() on the server. ' + 'This is a no-op.\n\nPlease check the code for the %s component.', callerName, componentName);
      didWarnAboutNoopUpdateForComponent[warningKey] = true;
    }
  }
  const classComponentUpdater = {
    // $FlowFixMe[missing-local-annot]
    enqueueSetState(inst, payload, callback) {
      const internals = get(inst);
      if (internals.queue === null) {
        warnNoop(inst, 'setState');
      } else {
        internals.queue.push(payload);
        {
          if (callback !== undefined && callback !== null) {
            warnOnInvalidCallback(callback);
          }
        }
      }
    },
    enqueueReplaceState(inst, payload, callback) {
      const internals = get(inst);
      internals.replace = true;
      internals.queue = [payload];
      {
        if (callback !== undefined && callback !== null) {
          warnOnInvalidCallback(callback);
        }
      }
    },
    // $FlowFixMe[missing-local-annot]
    enqueueForceUpdate(inst, callback) {
      const internals = get(inst);
      if (internals.queue === null) {
        warnNoop(inst, 'forceUpdate');
      } else {
        {
          if (callback !== undefined && callback !== null) {
            warnOnInvalidCallback(callback);
          }
        }
      }
    }
  };
  function applyDerivedStateFromProps(instance, ctor, getDerivedStateFromProps, prevState, nextProps) {
    const partialState = getDerivedStateFromProps(nextProps, prevState);
    {
      warnOnUndefinedDerivedState(ctor, partialState);
    }
    // Merge the partial state and the previous state.
    const newState = partialState === null || partialState === undefined ? prevState : assign({}, prevState, partialState);
    return newState;
  }
  function constructClassInstance(ctor, props, maskedLegacyContext) {
    let context = emptyContextObject;
    const contextType = ctor.contextType;
    {
      if ('contextType' in ctor) {
        const isValid =
        // Allow null for conditional declaration
        contextType === null || contextType !== undefined && contextType.$$typeof === REACT_CONTEXT_TYPE;
        if (!isValid && !didWarnAboutInvalidateContextType.has(ctor)) {
          didWarnAboutInvalidateContextType.add(ctor);
          let addendum = '';
          if (contextType === undefined) {
            addendum = ' However, it is set to undefined. ' + 'This can be caused by a typo or by mixing up named and default imports. ' + 'This can also happen due to a circular dependency, so ' + 'try moving the createContext() call to a separate file.';
          } else if (typeof contextType !== 'object') {
            addendum = ' However, it is set to a ' + typeof contextType + '.';
          } else if (contextType.$$typeof === REACT_CONSUMER_TYPE) {
            addendum = ' Did you accidentally pass the Context.Consumer instead?';
          } else {
            addendum = ' However, it is set to an object with keys {' + Object.keys(contextType).join(', ') + '}.';
          }
          console.error('%s defines an invalid contextType. ' + 'contextType should point to the Context object returned by React.createContext().%s', getComponentNameFromType(ctor) || 'Component', addendum);
        }
      }
    }
    if (typeof contextType === 'object' && contextType !== null) {
      context = readContext$1(contextType);
    }
    const instance = new ctor(props, context);
    {
      if (typeof ctor.getDerivedStateFromProps === 'function' && (instance.state === null || instance.state === undefined)) {
        const componentName = getComponentNameFromType(ctor) || 'Component';
        if (!didWarnAboutUninitializedState.has(componentName)) {
          didWarnAboutUninitializedState.add(componentName);
          console.error('`%s` uses `getDerivedStateFromProps` but its initial state is ' + '%s. This is not recommended. Instead, define the initial state by ' + 'assigning an object to `this.state` in the constructor of `%s`. ' + 'This ensures that `getDerivedStateFromProps` arguments have a consistent shape.', componentName, instance.state === null ? 'null' : 'undefined', componentName);
        }
      }

      // If new component APIs are defined, "unsafe" lifecycles won't be called.
      // Warn about these lifecycles if they are present.
      // Don't warn about react-lifecycles-compat polyfilled methods though.
      if (typeof ctor.getDerivedStateFromProps === 'function' || typeof instance.getSnapshotBeforeUpdate === 'function') {
        let foundWillMountName = null;
        let foundWillReceivePropsName = null;
        let foundWillUpdateName = null;
        if (typeof instance.componentWillMount === 'function' && instance.componentWillMount.__suppressDeprecationWarning !== true) {
          foundWillMountName = 'componentWillMount';
        } else if (typeof instance.UNSAFE_componentWillMount === 'function') {
          foundWillMountName = 'UNSAFE_componentWillMount';
        }
        if (typeof instance.componentWillReceiveProps === 'function' && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
          foundWillReceivePropsName = 'componentWillReceiveProps';
        } else if (typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
          foundWillReceivePropsName = 'UNSAFE_componentWillReceiveProps';
        }
        if (typeof instance.componentWillUpdate === 'function' && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
          foundWillUpdateName = 'componentWillUpdate';
        } else if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
          foundWillUpdateName = 'UNSAFE_componentWillUpdate';
        }
        if (foundWillMountName !== null || foundWillReceivePropsName !== null || foundWillUpdateName !== null) {
          const componentName = getComponentNameFromType(ctor) || 'Component';
          const newApiName = typeof ctor.getDerivedStateFromProps === 'function' ? 'getDerivedStateFromProps()' : 'getSnapshotBeforeUpdate()';
          if (!didWarnAboutLegacyLifecyclesAndDerivedState.has(componentName)) {
            didWarnAboutLegacyLifecyclesAndDerivedState.add(componentName);
            console.error('Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n' + '%s uses %s but also contains the following legacy lifecycles:%s%s%s\n\n' + 'The above lifecycles should be removed. Learn more about this warning here:\n' + 'https://react.dev/link/unsafe-component-lifecycles', componentName, newApiName, foundWillMountName !== null ? "\n  " + foundWillMountName : '', foundWillReceivePropsName !== null ? "\n  " + foundWillReceivePropsName : '', foundWillUpdateName !== null ? "\n  " + foundWillUpdateName : '');
          }
        }
      }
    }
    return instance;
  }
  function checkClassInstance(instance, ctor, newProps) {
    {
      const name = getComponentNameFromType(ctor) || 'Component';
      const renderPresent = instance.render;
      if (!renderPresent) {
        if (ctor.prototype && typeof ctor.prototype.render === 'function') {
          console.error('No `render` method found on the %s ' + 'instance: did you accidentally return an object from the constructor?', name);
        } else {
          console.error('No `render` method found on the %s ' + 'instance: you may have forgotten to define `render`.', name);
        }
      }
      if (instance.getInitialState && !instance.getInitialState.isReactClassApproved && !instance.state) {
        console.error('getInitialState was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Did you mean to define a state property instead?', name);
      }
      if (instance.getDefaultProps && !instance.getDefaultProps.isReactClassApproved) {
        console.error('getDefaultProps was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Use a static property to define defaultProps instead.', name);
      }
      if (instance.contextType) {
        console.error('contextType was defined as an instance property on %s. Use a static ' + 'property to define contextType instead.', name);
      }
      {
        if (ctor.childContextTypes && !didWarnAboutChildContextTypes.has(ctor)) {
          didWarnAboutChildContextTypes.add(ctor);
          console.error('%s uses the legacy childContextTypes API which was removed in React 19. ' + 'Use React.createContext() instead. (https://react.dev/link/legacy-context)', name);
        }
        if (ctor.contextTypes && !didWarnAboutContextTypes$1.has(ctor)) {
          didWarnAboutContextTypes$1.add(ctor);
          console.error('%s uses the legacy contextTypes API which was removed in React 19. ' + 'Use React.createContext() with static contextType instead. ' + '(https://react.dev/link/legacy-context)', name);
        }
      }
      if (typeof instance.componentShouldUpdate === 'function') {
        console.error('%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', name);
      }
      if (ctor.prototype && ctor.prototype.isPureReactComponent && typeof instance.shouldComponentUpdate !== 'undefined') {
        console.error('%s has a method called shouldComponentUpdate(). ' + 'shouldComponentUpdate should not be used when extending React.PureComponent. ' + 'Please extend React.Component if shouldComponentUpdate is used.', getComponentNameFromType(ctor) || 'A pure component');
      }
      if (typeof instance.componentDidUnmount === 'function') {
        console.error('%s has a method called ' + 'componentDidUnmount(). But there is no such lifecycle method. ' + 'Did you mean componentWillUnmount()?', name);
      }
      if (typeof instance.componentDidReceiveProps === 'function') {
        console.error('%s has a method called ' + 'componentDidReceiveProps(). But there is no such lifecycle method. ' + 'If you meant to update the state in response to changing props, ' + 'use componentWillReceiveProps(). If you meant to fetch data or ' + 'run side-effects or mutations after React has updated the UI, use componentDidUpdate().', name);
      }
      if (typeof instance.componentWillRecieveProps === 'function') {
        console.error('%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', name);
      }
      if (typeof instance.UNSAFE_componentWillRecieveProps === 'function') {
        console.error('%s has a method called ' + 'UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?', name);
      }
      const hasMutatedProps = instance.props !== newProps;
      if (instance.props !== undefined && hasMutatedProps) {
        console.error('When calling super() in `%s`, make sure to pass ' + "up the same props that your component's constructor was passed.", name);
      }
      if (instance.defaultProps) {
        console.error('Setting defaultProps as an instance property on %s is not supported and will be ignored.' + ' Instead, define defaultProps as a static property on %s.', name, name);
      }
      if (typeof instance.getSnapshotBeforeUpdate === 'function' && typeof instance.componentDidUpdate !== 'function' && !didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.has(ctor)) {
        didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.add(ctor);
        console.error('%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). ' + 'This component defines getSnapshotBeforeUpdate() only.', getComponentNameFromType(ctor));
      }
      if (typeof instance.getDerivedStateFromProps === 'function') {
        console.error('%s: getDerivedStateFromProps() is defined as an instance method ' + 'and will be ignored. Instead, declare it as a static method.', name);
      }
      if (typeof instance.getDerivedStateFromError === 'function') {
        console.error('%s: getDerivedStateFromError() is defined as an instance method ' + 'and will be ignored. Instead, declare it as a static method.', name);
      }
      if (typeof ctor.getSnapshotBeforeUpdate === 'function') {
        console.error('%s: getSnapshotBeforeUpdate() is defined as a static method ' + 'and will be ignored. Instead, declare it as an instance method.', name);
      }
      const state = instance.state;
      if (state && (typeof state !== 'object' || isArray(state))) {
        console.error('%s.state: must be set to an object or null', name);
      }
      if (typeof instance.getChildContext === 'function' && typeof ctor.childContextTypes !== 'object') {
        console.error('%s.getChildContext(): childContextTypes must be defined in order to ' + 'use getChildContext().', name);
      }
    }
  }
  function callComponentWillMount(type, instance) {
    const oldState = instance.state;
    if (typeof instance.componentWillMount === 'function') {
      {
        if (instance.componentWillMount.__suppressDeprecationWarning !== true) {
          const componentName = getComponentNameFromType(type) || 'Unknown';
          if (!didWarnAboutDeprecatedWillMount[componentName]) {
            console.warn(
            // keep this warning in sync with ReactStrictModeWarning.js
            'componentWillMount has been renamed, and is not recommended for use. ' + 'See https://react.dev/link/unsafe-component-lifecycles for details.\n\n' + '* Move code from componentWillMount to componentDidMount (preferred in most cases) ' + 'or the constructor.\n' + '\nPlease update the following components: %s', componentName);
            didWarnAboutDeprecatedWillMount[componentName] = true;
          }
        }
      }
      instance.componentWillMount();
    }
    if (typeof instance.UNSAFE_componentWillMount === 'function') {
      instance.UNSAFE_componentWillMount();
    }
    if (oldState !== instance.state) {
      {
        console.error('%s.componentWillMount(): Assigning directly to this.state is ' + "deprecated (except inside a component's " + 'constructor). Use setState instead.', getComponentNameFromType(type) || 'Component');
      }
      classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
    }
  }
  function processUpdateQueue(internalInstance, inst, props, maskedLegacyContext) {
    if (internalInstance.queue !== null && internalInstance.queue.length > 0) {
      const oldQueue = internalInstance.queue;
      const oldReplace = internalInstance.replace;
      internalInstance.queue = null;
      internalInstance.replace = false;
      if (oldReplace && oldQueue.length === 1) {
        inst.state = oldQueue[0];
      } else {
        let nextState = oldReplace ? oldQueue[0] : inst.state;
        let dontMutate = true;
        for (let i = oldReplace ? 1 : 0; i < oldQueue.length; i++) {
          const partial = oldQueue[i];
          const partialState = typeof partial === 'function' ? partial.call(inst, nextState, props, maskedLegacyContext) : partial;
          if (partialState != null) {
            if (dontMutate) {
              dontMutate = false;
              nextState = assign({}, nextState, partialState);
            } else {
              assign(nextState, partialState);
            }
          }
        }
        inst.state = nextState;
      }
    } else {
      internalInstance.queue = null;
    }
  }

  // Invokes the mount life-cycles on a previously never rendered instance.
  function mountClassInstance(instance, ctor, newProps, maskedLegacyContext) {
    {
      checkClassInstance(instance, ctor, newProps);
    }
    const initialState = instance.state !== undefined ? instance.state : null;
    instance.updater = classComponentUpdater;
    instance.props = newProps;
    instance.state = initialState;
    // We don't bother initializing the refs object on the server, since we're not going to resolve them anyway.

    // The internal instance will be used to manage updates that happen during this mount.
    const internalInstance = {
      queue: [],
      replace: false
    };
    set(instance, internalInstance);
    const contextType = ctor.contextType;
    if (typeof contextType === 'object' && contextType !== null) {
      instance.context = readContext$1(contextType);
    } else {
      instance.context = emptyContextObject;
    }
    {
      if (instance.state === newProps) {
        const componentName = getComponentNameFromType(ctor) || 'Component';
        if (!didWarnAboutDirectlyAssigningPropsToState.has(componentName)) {
          didWarnAboutDirectlyAssigningPropsToState.add(componentName);
          console.error('%s: It is not recommended to assign props directly to state ' + "because updates to props won't be reflected in state. " + 'In most cases, it is better to use props directly.', componentName);
        }
      }
    }
    const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
    if (typeof getDerivedStateFromProps === 'function') {
      instance.state = applyDerivedStateFromProps(instance, ctor, getDerivedStateFromProps, initialState, newProps);
    }

    // In order to support react-lifecycles-compat polyfilled components,
    // Unsafe lifecycles should not be invoked for components using the new APIs.
    if (typeof ctor.getDerivedStateFromProps !== 'function' && typeof instance.getSnapshotBeforeUpdate !== 'function' && (typeof instance.UNSAFE_componentWillMount === 'function' || typeof instance.componentWillMount === 'function')) {
      callComponentWillMount(ctor, instance);
      // If we had additional state updates during this life-cycle, let's
      // process them now.
      processUpdateQueue(internalInstance, instance, newProps, maskedLegacyContext);
    }
  }

  // Ids are base 32 strings whose binary representation corresponds to the
  // position of a node in a tree.

  // Every time the tree forks into multiple children, we add additional bits to
  // the left of the sequence that represent the position of the child within the
  // current level of children.
  //
  //      00101       00010001011010101
  //      ╰─┬─╯       ╰───────┬───────╯
  //   Fork 5 of 20       Parent id
  //
  // The leading 0s are important. In the above example, you only need 3 bits to
  // represent slot 5. However, you need 5 bits to represent all the forks at
  // the current level, so we must account for the empty bits at the end.
  //
  // For this same reason, slots are 1-indexed instead of 0-indexed. Otherwise,
  // the zeroth id at a level would be indistinguishable from its parent.
  //
  // If a node has only one child, and does not materialize an id (i.e. does not
  // contain a useId hook), then we don't need to allocate any space in the
  // sequence. It's treated as a transparent indirection. For example, these two
  // trees produce the same ids:
  //
  // <>                          <>
  //   <Indirection>               <A />
  //     <A />                     <B />
  //   </Indirection>            </>
  //   <B />
  // </>
  //
  // However, we cannot skip any node that materializes an id. Otherwise, a parent
  // id that does not fork would be indistinguishable from its child id. For
  // example, this tree does not fork, but the parent and child must have
  // different ids.
  //
  // <Parent>
  //   <Child />
  // </Parent>
  //
  // To handle this scenario, every time we materialize an id, we allocate a
  // new level with a single slot. You can think of this as a fork with only one
  // prong, or an array of children with length 1.
  //
  // It's possible for the size of the sequence to exceed 32 bits, the max
  // size for bitwise operations. When this happens, we make more room by
  // converting the right part of the id to a string and storing it in an overflow
  // variable. We use a base 32 string representation, because 32 is the largest
  // power of 2 that is supported by toString(). We want the base to be large so
  // that the resulting ids are compact, and we want the base to be a power of 2
  // because every log2(base) bits corresponds to a single character, i.e. every
  // log2(32) = 5 bits. That means we can lop bits off the end 5 at a time without
  // affecting the final result.

  const emptyTreeContext = {
    id: 1,
    overflow: ''
  };
  function getTreeId(context) {
    const overflow = context.overflow;
    const idWithLeadingBit = context.id;
    const id = idWithLeadingBit & ~getLeadingBit(idWithLeadingBit);
    return id.toString(32) + overflow;
  }
  function pushTreeContext(baseContext, totalChildren, index) {
    const baseIdWithLeadingBit = baseContext.id;
    const baseOverflow = baseContext.overflow;

    // The leftmost 1 marks the end of the sequence, non-inclusive. It's not part
    // of the id; we use it to account for leading 0s.
    const baseLength = getBitLength(baseIdWithLeadingBit) - 1;
    const baseId = baseIdWithLeadingBit & ~(1 << baseLength);
    const slot = index + 1;
    const length = getBitLength(totalChildren) + baseLength;

    // 30 is the max length we can store without overflowing, taking into
    // consideration the leading 1 we use to mark the end of the sequence.
    if (length > 30) {
      // We overflowed the bitwise-safe range. Fall back to slower algorithm.
      // This branch assumes the length of the base id is greater than 5; it won't
      // work for smaller ids, because you need 5 bits per character.
      //
      // We encode the id in multiple steps: first the base id, then the
      // remaining digits.
      //
      // Each 5 bit sequence corresponds to a single base 32 character. So for
      // example, if the current id is 23 bits long, we can convert 20 of those
      // bits into a string of 4 characters, with 3 bits left over.
      //
      // First calculate how many bits in the base id represent a complete
      // sequence of characters.
      const numberOfOverflowBits = baseLength - baseLength % 5;

      // Then create a bitmask that selects only those bits.
      const newOverflowBits = (1 << numberOfOverflowBits) - 1;

      // Select the bits, and convert them to a base 32 string.
      const newOverflow = (baseId & newOverflowBits).toString(32);

      // Now we can remove those bits from the base id.
      const restOfBaseId = baseId >> numberOfOverflowBits;
      const restOfBaseLength = baseLength - numberOfOverflowBits;

      // Finally, encode the rest of the bits using the normal algorithm. Because
      // we made more room, this time it won't overflow.
      const restOfLength = getBitLength(totalChildren) + restOfBaseLength;
      const restOfNewBits = slot << restOfBaseLength;
      const id = restOfNewBits | restOfBaseId;
      const overflow = newOverflow + baseOverflow;
      return {
        id: 1 << restOfLength | id,
        overflow
      };
    } else {
      // Normal path
      const newBits = slot << baseLength;
      const id = newBits | baseId;
      const overflow = baseOverflow;
      return {
        id: 1 << length | id,
        overflow
      };
    }
  }
  function getBitLength(number) {
    return 32 - clz32(number);
  }
  function getLeadingBit(id) {
    return 1 << getBitLength(id) - 1;
  }

  // TODO: Math.clz32 is supported in Node 12+. Maybe we can drop the fallback.
  const clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;

  // Count leading zeros.
  // Based on:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32
  const log = Math.log;
  const LN2 = Math.LN2;
  function clz32Fallback(x) {
    const asUint = x >>> 0;
    if (asUint === 0) {
      return 32;
    }
    return 31 - (log(asUint) / LN2 | 0) | 0;
  }

  function noop() {}

  // Corresponds to ReactFiberWakeable and ReactFlightWakeable modules. Generally,
  // changes to one module should be reflected in the others.


  // An error that is thrown (e.g. by `use`) to trigger Suspense. If we
  // detect this is caught by userspace, we'll log a warning in development.
  const SuspenseException = new Error("Suspense Exception: This is not a real error! It's an implementation " + 'detail of `use` to interrupt the current render. You must either ' + 'rethrow it immediately, or move the `use` call outside of the ' + '`try/catch` block. Capturing without rethrowing will lead to ' + 'unexpected behavior.\n\n' + 'To handle async errors, wrap your component in an error boundary, or ' + "call the promise's `.catch` method and pass the result to `use`.");
  function createThenableState() {
    // The ThenableState is created the first time a component suspends. If it
    // suspends again, we'll reuse the same state.
    return [];
  }
  function trackUsedThenable(thenableState, thenable, index) {
    const previous = thenableState[index];
    if (previous === undefined) {
      thenableState.push(thenable);
    } else {
      if (previous !== thenable) {
        // Reuse the previous thenable, and drop the new one. We can assume
        // they represent the same value, because components are idempotent.

        // Avoid an unhandled rejection errors for the Promises that we'll
        // intentionally ignore.
        thenable.then(noop, noop);
        thenable = previous;
      }
    }

    // We use an expando to track the status and result of a thenable so that we
    // can synchronously unwrap the value. Think of this as an extension of the
    // Promise API, or a custom interface that is a superset of Thenable.
    //
    // If the thenable doesn't have a status, set it to "pending" and attach
    // a listener that will update its status and result when it resolves.
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

          // Check one more time in case the thenable resolved synchronously
          switch (thenable.status) {
            case 'fulfilled':
              {
                const fulfilledThenable = thenable;
                return fulfilledThenable.value;
              }
            case 'rejected':
              {
                const rejectedThenable = thenable;
                throw rejectedThenable.reason;
              }
          }

          // Suspend.
          //
          // Throwing here is an implementation detail that allows us to unwind the
          // call stack. But we shouldn't allow it to leak into userspace. Throw an
          // opaque placeholder value instead of the actual thenable. If it doesn't
          // get captured by the work loop, log a warning, because that means
          // something in userspace must have caught it.
          suspendedThenable = thenable;
          throw SuspenseException;
        }
    }
  }

  // This is used to track the actual thenable that suspended so it can be
  // passed to the rest of the Suspense implementation — which, for historical
  // reasons, expects to receive a thenable.
  let suspendedThenable = null;
  function getSuspendedThenable() {
    // This is called right after `use` suspends by throwing an exception. `use`
    // throws an opaque value instead of the thenable itself so that it can't be
    // caught in userspace. Then the work loop accesses the actual thenable using
    // this function.
    if (suspendedThenable === null) {
      throw new Error('Expected a suspended thenable. This is a bug in React. Please file ' + 'an issue.');
    }
    const thenable = suspendedThenable;
    suspendedThenable = null;
    return thenable;
  }

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  function is(x, y) {
    return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y // eslint-disable-line no-self-compare
    ;
  }
  const objectIs =
  // $FlowFixMe[method-unbinding]
  typeof Object.is === 'function' ? Object.is : is;

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
  function checkAttributeStringCoercion(value, attributeName) {
    {
      if (willCoercionThrow(value)) {
        console.error('The provided `%s` attribute is an unsupported type %s.' + ' This value must be coerced to a string before using it here.', attributeName, typeName(value));
        return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
      }
    }
  }

  let currentlyRenderingComponent = null;
  let currentlyRenderingTask = null;
  let currentlyRenderingRequest = null;
  let currentlyRenderingKeyPath = null;
  let firstWorkInProgressHook = null;
  let workInProgressHook = null;
  // Whether the work-in-progress hook is a re-rendered hook
  let isReRender = false;
  // Whether an update was scheduled during the currently executing render pass.
  let didScheduleRenderPhaseUpdate = false;
  // Counts the number of useId hooks in this component
  let localIdCounter = 0;
  // Chunks that should be pushed to the stream once the component
  // finishes rendering.
  // Counts the number of useActionState calls in this component
  let actionStateCounter = 0;
  // The index of the useActionState hook that matches the one passed in at the
  // root during an MPA navigation, if any.
  let actionStateMatchingIndex = -1;
  // Counts the number of use(thenable) calls in this component
  let thenableIndexCounter = 0;
  let thenableState = null;
  // Lazily created map of render-phase updates
  let renderPhaseUpdates = null;
  // Counter to prevent infinite loops.
  let numberOfReRenders = 0;
  const RE_RENDER_LIMIT = 25;
  let isInHookUserCodeInDev = false;

  // In DEV, this is the name of the currently executing primitive hook
  let currentHookNameInDev;
  function resolveCurrentlyRenderingComponent() {
    if (currentlyRenderingComponent === null) {
      throw new Error('Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' + ' one of the following reasons:\n' + '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' + '2. You might be breaking the Rules of Hooks\n' + '3. You might have more than one copy of React in the same app\n' + 'See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.');
    }
    {
      if (isInHookUserCodeInDev) {
        console.error('Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. ' + 'You can only call Hooks at the top level of your React function. ' + 'For more information, see ' + 'https://react.dev/link/rules-of-hooks');
      }
    }
    return currentlyRenderingComponent;
  }
  function areHookInputsEqual(nextDeps, prevDeps) {
    if (prevDeps === null) {
      {
        console.error('%s received a final argument during this render, but not during ' + 'the previous render. Even though the final argument is optional, ' + 'its type cannot change between renders.', currentHookNameInDev);
      }
      return false;
    }
    {
      // Don't bother comparing lengths in prod because these arrays should be
      // passed inline.
      if (nextDeps.length !== prevDeps.length) {
        console.error('The final argument passed to %s changed size between renders. The ' + 'order and size of this array must remain constant.\n\n' + 'Previous: %s\n' + 'Incoming: %s', currentHookNameInDev, "[" + nextDeps.join(', ') + "]", "[" + prevDeps.join(', ') + "]");
      }
    }
    // $FlowFixMe[incompatible-use] found when upgrading Flow
    for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
      // $FlowFixMe[incompatible-use] found when upgrading Flow
      if (objectIs(nextDeps[i], prevDeps[i])) {
        continue;
      }
      return false;
    }
    return true;
  }
  function createHook() {
    if (numberOfReRenders > 0) {
      throw new Error('Rendered more hooks than during the previous render');
    }
    return {
      memoizedState: null,
      queue: null,
      next: null
    };
  }
  function createWorkInProgressHook() {
    if (workInProgressHook === null) {
      // This is the first hook in the list
      if (firstWorkInProgressHook === null) {
        isReRender = false;
        firstWorkInProgressHook = workInProgressHook = createHook();
      } else {
        // There's already a work-in-progress. Reuse it.
        isReRender = true;
        workInProgressHook = firstWorkInProgressHook;
      }
    } else {
      if (workInProgressHook.next === null) {
        isReRender = false;
        // Append to the end of the list
        workInProgressHook = workInProgressHook.next = createHook();
      } else {
        // There's already a work-in-progress. Reuse it.
        isReRender = true;
        workInProgressHook = workInProgressHook.next;
      }
    }
    return workInProgressHook;
  }
  function prepareToUseHooks(request, task, keyPath, componentIdentity, prevThenableState) {
    currentlyRenderingComponent = componentIdentity;
    currentlyRenderingTask = task;
    currentlyRenderingRequest = request;
    currentlyRenderingKeyPath = keyPath;
    {
      isInHookUserCodeInDev = false;
    }

    // The following should have already been reset
    // didScheduleRenderPhaseUpdate = false;
    // firstWorkInProgressHook = null;
    // numberOfReRenders = 0;
    // renderPhaseUpdates = null;
    // workInProgressHook = null;

    localIdCounter = 0;
    actionStateCounter = 0;
    actionStateMatchingIndex = -1;
    thenableIndexCounter = 0;
    thenableState = prevThenableState;
  }
  function finishHooks(Component, props, children, refOrContext) {
    // This must be called after every function component to prevent hooks from
    // being used in classes.

    while (didScheduleRenderPhaseUpdate) {
      // Updates were scheduled during the render phase. They are stored in
      // the `renderPhaseUpdates` map. Call the component again, reusing the
      // work-in-progress hooks and applying the additional updates on top. Keep
      // restarting until no more updates are scheduled.
      didScheduleRenderPhaseUpdate = false;
      localIdCounter = 0;
      actionStateCounter = 0;
      actionStateMatchingIndex = -1;
      thenableIndexCounter = 0;
      numberOfReRenders += 1;

      // Start over from the beginning of the list
      workInProgressHook = null;
      children = Component(props, refOrContext);
    }
    resetHooksState();
    return children;
  }
  function getThenableStateAfterSuspending() {
    const state = thenableState;
    thenableState = null;
    return state;
  }
  function checkDidRenderIdHook() {
    // This should be called immediately after every finishHooks call.
    // Conceptually, it's part of the return value of finishHooks; it's only a
    // separate function to avoid using an array tuple.
    const didRenderIdHook = localIdCounter !== 0;
    return didRenderIdHook;
  }
  function getActionStateCount() {
    // This should be called immediately after every finishHooks call.
    // Conceptually, it's part of the return value of finishHooks; it's only a
    // separate function to avoid using an array tuple.
    return actionStateCounter;
  }
  function getActionStateMatchingIndex() {
    // This should be called immediately after every finishHooks call.
    // Conceptually, it's part of the return value of finishHooks; it's only a
    // separate function to avoid using an array tuple.
    return actionStateMatchingIndex;
  }

  // Reset the internal hooks state if an error occurs while rendering a component
  function resetHooksState() {
    {
      isInHookUserCodeInDev = false;
    }
    currentlyRenderingComponent = null;
    currentlyRenderingTask = null;
    currentlyRenderingRequest = null;
    currentlyRenderingKeyPath = null;
    didScheduleRenderPhaseUpdate = false;
    firstWorkInProgressHook = null;
    numberOfReRenders = 0;
    renderPhaseUpdates = null;
    workInProgressHook = null;
  }
  function readContext(context) {
    {
      if (isInHookUserCodeInDev) {
        console.error('Context can only be read while React is rendering. ' + 'In classes, you can read it in the render method or getDerivedStateFromProps. ' + 'In function components, you can read it directly in the function body, but not ' + 'inside Hooks like useReducer() or useMemo().');
      }
    }
    return readContext$1(context);
  }
  function useContext(context) {
    {
      currentHookNameInDev = 'useContext';
    }
    resolveCurrentlyRenderingComponent();
    return readContext$1(context);
  }
  function basicStateReducer(state, action) {
    // $FlowFixMe[incompatible-use]: Flow doesn't like mixed types
    return typeof action === 'function' ? action(state) : action;
  }
  function useState(initialState) {
    {
      currentHookNameInDev = 'useState';
    }
    return useReducer(basicStateReducer,
    // useReducer has a special case to support lazy useState initializers
    initialState);
  }
  function useReducer(reducer, initialArg, init) {
    {
      if (reducer !== basicStateReducer) {
        currentHookNameInDev = 'useReducer';
      }
    }
    currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
    workInProgressHook = createWorkInProgressHook();
    if (isReRender) {
      // This is a re-render. Apply the new render phase updates to the previous
      // current hook.
      const queue = workInProgressHook.queue;
      const dispatch = queue.dispatch;
      if (renderPhaseUpdates !== null) {
        // Render phase updates are stored in a map of queue -> linked list
        const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
        if (firstRenderPhaseUpdate !== undefined) {
          // $FlowFixMe[incompatible-use] found when upgrading Flow
          renderPhaseUpdates.delete(queue);
          // $FlowFixMe[incompatible-use] found when upgrading Flow
          let newState = workInProgressHook.memoizedState;
          let update = firstRenderPhaseUpdate;
          do {
            // Process this render phase update. We don't have to check the
            // priority because it will always be the same as the current
            // render's.
            const action = update.action;
            {
              isInHookUserCodeInDev = true;
            }
            newState = reducer(newState, action);
            {
              isInHookUserCodeInDev = false;
            }
            // $FlowFixMe[incompatible-type] we bail out when we get a null
            update = update.next;
          } while (update !== null);

          // $FlowFixMe[incompatible-use] found when upgrading Flow
          workInProgressHook.memoizedState = newState;
          return [newState, dispatch];
        }
      }
      // $FlowFixMe[incompatible-use] found when upgrading Flow
      return [workInProgressHook.memoizedState, dispatch];
    } else {
      {
        isInHookUserCodeInDev = true;
      }
      let initialState;
      if (reducer === basicStateReducer) {
        // Special case for `useState`.
        initialState = typeof initialArg === 'function' ? initialArg() : initialArg;
      } else {
        initialState = init !== undefined ? init(initialArg) : initialArg;
      }
      {
        isInHookUserCodeInDev = false;
      }
      // $FlowFixMe[incompatible-use] found when upgrading Flow
      workInProgressHook.memoizedState = initialState;
      // $FlowFixMe[incompatible-use] found when upgrading Flow
      const queue = workInProgressHook.queue = {
        last: null,
        dispatch: null
      };
      const dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingComponent, queue);
      // $FlowFixMe[incompatible-use] found when upgrading Flow
      return [workInProgressHook.memoizedState, dispatch];
    }
  }
  function useMemo(nextCreate, deps) {
    currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
    workInProgressHook = createWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    if (workInProgressHook !== null) {
      const prevState = workInProgressHook.memoizedState;
      if (prevState !== null) {
        if (nextDeps !== null) {
          const prevDeps = prevState[1];
          if (areHookInputsEqual(nextDeps, prevDeps)) {
            return prevState[0];
          }
        }
      }
    }
    {
      isInHookUserCodeInDev = true;
    }
    const nextValue = nextCreate();
    {
      isInHookUserCodeInDev = false;
    }
    // $FlowFixMe[incompatible-use] found when upgrading Flow
    workInProgressHook.memoizedState = [nextValue, nextDeps];
    return nextValue;
  }
  function useRef(initialValue) {
    currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
    workInProgressHook = createWorkInProgressHook();
    const previousRef = workInProgressHook.memoizedState;
    if (previousRef === null) {
      const ref = {
        current: initialValue
      };
      {
        Object.seal(ref);
      }
      // $FlowFixMe[incompatible-use] found when upgrading Flow
      workInProgressHook.memoizedState = ref;
      return ref;
    } else {
      return previousRef;
    }
  }
  function dispatchAction(componentIdentity, queue, action) {
    if (numberOfReRenders >= RE_RENDER_LIMIT) {
      throw new Error('Too many re-renders. React limits the number of renders to prevent ' + 'an infinite loop.');
    }
    if (componentIdentity === currentlyRenderingComponent) {
      // This is a render phase update. Stash it in a lazily-created map of
      // queue -> linked list of updates. After this render pass, we'll restart
      // and apply the stashed updates on top of the work-in-progress hook.
      didScheduleRenderPhaseUpdate = true;
      const update = {
        action,
        next: null
      };
      if (renderPhaseUpdates === null) {
        renderPhaseUpdates = new Map();
      }
      const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
      if (firstRenderPhaseUpdate === undefined) {
        // $FlowFixMe[incompatible-use] found when upgrading Flow
        renderPhaseUpdates.set(queue, update);
      } else {
        // Append the update to the end of the list.
        let lastRenderPhaseUpdate = firstRenderPhaseUpdate;
        while (lastRenderPhaseUpdate.next !== null) {
          lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
        }
        lastRenderPhaseUpdate.next = update;
      }
    }
  }
  function useCallback(callback, deps) {
    return useMemo(() => callback, deps);
  }
  function throwOnUseEffectEventCall() {
    throw new Error("A function wrapped in useEffectEvent can't be called during rendering.");
  }
  function useEffectEvent(callback) {
    // $FlowIgnore[incompatible-return]
    return throwOnUseEffectEventCall;
  }
  function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
    if (getServerSnapshot === undefined) {
      throw new Error('Missing getServerSnapshot, which is required for ' + 'server-rendered content. Will revert to client rendering.');
    }
    return getServerSnapshot();
  }
  function useDeferredValue(value, initialValue) {
    resolveCurrentlyRenderingComponent();
    return initialValue !== undefined ? initialValue : value;
  }
  function unsupportedStartTransition() {
    throw new Error('startTransition cannot be called during server rendering.');
  }
  function useTransition() {
    resolveCurrentlyRenderingComponent();
    return [false, unsupportedStartTransition];
  }
  function useHostTransitionStatus() {
    resolveCurrentlyRenderingComponent();
    return NotPendingTransition;
  }
  function unsupportedSetOptimisticState() {
    throw new Error('Cannot update optimistic state while rendering.');
  }
  function useOptimistic(passthrough, reducer) {
    resolveCurrentlyRenderingComponent();
    return [passthrough, unsupportedSetOptimisticState];
  }
  function createPostbackActionStateKey(permalink, componentKeyPath, hookIndex) {
    if (permalink !== undefined) {
      // Don't bother to hash a permalink-based key since it's already short.
      return 'p' + permalink;
    } else {
      // Append a node to the key path that represents the form state hook.
      const keyPath = [componentKeyPath, null, hookIndex];
      // Key paths are hashed to reduce the size. It does not need to be secure,
      // and it's more important that it's fast than that it's completely
      // collision-free.
      const keyPathHash = createFastHash(JSON.stringify(keyPath));
      return 'k' + keyPathHash;
    }
  }
  function useActionState(action, initialState, permalink) {
    resolveCurrentlyRenderingComponent();

    // Count the number of useActionState hooks per component. We also use this to
    // track the position of this useActionState hook relative to the other ones in
    // this component, so we can generate a unique key for each one.
    const actionStateHookIndex = actionStateCounter++;
    const request = currentlyRenderingRequest;

    // $FlowIgnore[prop-missing]
    const formAction = action.$$FORM_ACTION;
    if (typeof formAction === 'function') {
      // This is a server action. These have additional features to enable
      // MPA-style form submissions with progressive enhancement.

      // TODO: If the same permalink is passed to multiple useActionStates, and
      // they all have the same action signature, Fizz will pass the postback
      // state to all of them. We should probably only pass it to the first one,
      // and/or warn.

      // The key is lazily generated and deduped so the that the keypath doesn't
      // get JSON.stringify-ed unnecessarily, and at most once.
      let nextPostbackStateKey = null;

      // Determine the current form state. If we received state during an MPA form
      // submission, then we will reuse that, if the action identity matches.
      // Otherwise, we'll use the initial state argument. We will emit a comment
      // marker into the stream that indicates whether the state was reused.
      let state = initialState;
      const componentKeyPath = currentlyRenderingKeyPath;
      const postbackActionState = getFormState(request);
      // $FlowIgnore[prop-missing]
      const isSignatureEqual = action.$$IS_SIGNATURE_EQUAL;
      if (postbackActionState !== null && typeof isSignatureEqual === 'function') {
        const postbackKey = postbackActionState[1];
        const postbackReferenceId = postbackActionState[2];
        const postbackBoundArity = postbackActionState[3];
        if (isSignatureEqual.call(action, postbackReferenceId, postbackBoundArity)) {
          nextPostbackStateKey = createPostbackActionStateKey(permalink, componentKeyPath, actionStateHookIndex);
          if (postbackKey === nextPostbackStateKey) {
            // This was a match
            actionStateMatchingIndex = actionStateHookIndex;
            // Reuse the state that was submitted by the form.
            state = postbackActionState[0];
          }
        }
      }

      // Bind the state to the first argument of the action.
      const boundAction = action.bind(null, state);

      // Wrap the action so the return value is void.
      const dispatch = payload => {
        boundAction(payload);
      };

      // $FlowIgnore[prop-missing]
      if (typeof boundAction.$$FORM_ACTION === 'function') {
        // $FlowIgnore[prop-missing]
        dispatch.$$FORM_ACTION = prefix => {
          const metadata = boundAction.$$FORM_ACTION(prefix);

          // Override the action URL
          if (permalink !== undefined) {
            {
              checkAttributeStringCoercion(permalink, 'target');
            }
            permalink += '';
            metadata.action = permalink;
          }
          const formData = metadata.data;
          if (formData) {
            if (nextPostbackStateKey === null) {
              nextPostbackStateKey = createPostbackActionStateKey(permalink, componentKeyPath, actionStateHookIndex);
            }
            formData.append('$ACTION_KEY', nextPostbackStateKey);
          }
          return metadata;
        };
      }
      return [state, dispatch, false];
    } else {
      // This is not a server action, so the implementation is much simpler.

      // Bind the state to the first argument of the action.
      const boundAction = action.bind(null, initialState);
      // Wrap the action so the return value is void.
      const dispatch = payload => {
        boundAction(payload);
      };
      return [initialState, dispatch, false];
    }
  }
  function useId() {
    const task = currentlyRenderingTask;
    const treeId = getTreeId(task.treeContext);
    const resumableState = currentResumableState;
    if (resumableState === null) {
      throw new Error('Invalid hook call. Hooks can only be called inside of the body of a function component.');
    }
    const localId = localIdCounter++;
    return makeId(resumableState, treeId, localId);
  }
  function use(usable) {
    if (usable !== null && typeof usable === 'object') {
      // $FlowFixMe[method-unbinding]
      if (typeof usable.then === 'function') {
        // This is a thenable.
        const thenable = usable;
        return unwrapThenable(thenable);
      } else if (usable.$$typeof === REACT_CONTEXT_TYPE) {
        const context = usable;
        return readContext(context);
      }
    }

    // eslint-disable-next-line react-internal/safe-string-coercion
    throw new Error('An unsupported type was passed to use(): ' + String(usable));
  }
  function unwrapThenable(thenable) {
    const index = thenableIndexCounter;
    thenableIndexCounter += 1;
    if (thenableState === null) {
      thenableState = createThenableState();
    }
    return trackUsedThenable(thenableState, thenable, index);
  }
  function unsupportedRefresh() {
    throw new Error('Cache cannot be refreshed during server rendering.');
  }
  function useCacheRefresh() {
    return unsupportedRefresh;
  }
  function useMemoCache(size) {
    const data = new Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = REACT_MEMO_CACHE_SENTINEL;
    }
    return data;
  }
  const HooksDispatcher = {
    readContext,
    use,
    useContext,
    useMemo,
    useReducer,
    useRef,
    useState,
    useInsertionEffect: noop,
    useLayoutEffect: noop,
    useCallback,
    // useImperativeHandle is not run in the server environment
    useImperativeHandle: noop,
    // Effects are not run in the server environment.
    useEffect: noop,
    // Debugging effect
    useDebugValue: noop,
    useDeferredValue,
    useTransition,
    useId,
    // Subscriptions are not setup in a server environment.
    useSyncExternalStore,
    useOptimistic,
    useActionState,
    useFormState: useActionState,
    useHostTransitionStatus,
    useMemoCache,
    useCacheRefresh
  } ;
  {
    HooksDispatcher.useEffectEvent = useEffectEvent;
  }
  let currentResumableState = null;
  function setCurrentResumableState(resumableState) {
    currentResumableState = resumableState;
  }

  // DEV-only global reference to the currently executing task
  let currentTaskInDEV = null;
  function setCurrentTaskInDEV(task) {
    {
      currentTaskInDEV = task;
    }
  }

  function getCacheForType(resourceType) {
    throw new Error('Not implemented.');
  }
  function cacheSignal() {
    throw new Error('Not implemented.');
  }
  const DefaultAsyncDispatcher = {
    getCacheForType,
    cacheSignal
  };
  {
    DefaultAsyncDispatcher.getOwner = () => {
      if (currentTaskInDEV === null) {
        return null;
      }
      return currentTaskInDEV.componentStack;
    };
  }

  // Helpers to patch console.logs to avoid logging during side-effect free
  // replaying on render function. This currently only patches the object
  // lazily which won't cover if the log function was extracted eagerly.
  // We could also eagerly patch the method.

  let disabledDepth = 0;
  let prevLog;
  let prevInfo;
  let prevWarn;
  let prevError;
  let prevGroup;
  let prevGroupCollapsed;
  let prevGroupEnd;
  function disabledLog() {}
  disabledLog.__reactDisabledLog = true;
  function disableLogs() {
    {
      if (disabledDepth === 0) {
        /* eslint-disable react-internal/no-production-logging */
        prevLog = console.log;
        prevInfo = console.info;
        prevWarn = console.warn;
        prevError = console.error;
        prevGroup = console.group;
        prevGroupCollapsed = console.groupCollapsed;
        prevGroupEnd = console.groupEnd;
        // https://github.com/facebook/react/issues/19099
        const props = {
          configurable: true,
          enumerable: true,
          value: disabledLog,
          writable: true
        };
        // $FlowFixMe[cannot-write] Flow thinks console is immutable.
        Object.defineProperties(console, {
          info: props,
          log: props,
          warn: props,
          error: props,
          group: props,
          groupCollapsed: props,
          groupEnd: props
        });
      }
      disabledDepth++;
    }
  }
  function reenableLogs() {
    {
      disabledDepth--;
      if (disabledDepth === 0) {
        const props = {
          configurable: true,
          enumerable: true,
          writable: true
        };
        // $FlowFixMe[cannot-write] Flow thinks console is immutable.
        Object.defineProperties(console, {
          log: assign({}, props, {
            value: prevLog
          }),
          info: assign({}, props, {
            value: prevInfo
          }),
          warn: assign({}, props, {
            value: prevWarn
          }),
          error: assign({}, props, {
            value: prevError
          }),
          group: assign({}, props, {
            value: prevGroup
          }),
          groupCollapsed: assign({}, props, {
            value: prevGroupCollapsed
          }),
          groupEnd: assign({}, props, {
            value: prevGroupEnd
          })
        });
      }
      if (disabledDepth < 0) {
        console.error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
      }
    }
  }

  const ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

  // This is forked in server builds where the default stack frame may be source mapped.

  var DefaultPrepareStackTrace = undefined;

  function formatOwnerStack(error) {
    const prevPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = DefaultPrepareStackTrace;
    let stack = error.stack;
    Error.prepareStackTrace = prevPrepareStackTrace;
    if (stack.startsWith('Error: react-stack-top-frame\n')) {
      // V8's default formatting prefixes with the error message which we
      // don't want/need.
      stack = stack.slice(29);
    }
    let idx = stack.indexOf('\n');
    if (idx !== -1) {
      // Pop the JSX frame.
      stack = stack.slice(idx + 1);
    }
    idx = stack.indexOf('react_stack_bottom_frame');
    if (idx !== -1) {
      idx = stack.lastIndexOf('\n', idx);
    }
    if (idx !== -1) {
      // Cut off everything after the bottom frame since it'll be internals.
      stack = stack.slice(0, idx);
    } else {
      // We didn't find any internal callsite out to user space.
      // This means that this was called outside an owner or the owner is fully internal.
      // To keep things light we exclude the entire trace in this case.
      return '';
    }
    return stack;
  }

  let prefix;
  let suffix;
  function describeBuiltInComponentFrame(name) {
    if (prefix === undefined) {
      // Extract the VM specific prefix used by each line.
      try {
        throw Error();
      } catch (x) {
        const match = x.stack.trim().match(/\n( *(at )?)/);
        prefix = match && match[1] || '';
        suffix = x.stack.indexOf('\n    at') > -1 ?
        // V8
        ' (<anonymous>)' :
        // JSC/Spidermonkey
        x.stack.indexOf('@') > -1 ? '@unknown:0:0' :
        // Other
        '';
      }
    }
    // We use the prefix to ensure our stacks line up with native stack frames.
    return '\n' + prefix + name + suffix;
  }
  function describeDebugInfoFrame(name, env, location) {
    if (location != null) {
      // If we have a location, it's the child's owner stack. Treat the bottom most frame as
      // the location of this function.
      const childStack = formatOwnerStack(location);
      const idx = childStack.lastIndexOf('\n');
      const lastLine = idx === -1 ? childStack : childStack.slice(idx + 1);
      if (lastLine.indexOf(name) !== -1) {
        // For async stacks it's possible we don't have the owner on it. As a precaution only
        // use this frame if it has the name of the function in it.
        return '\n' + lastLine;
      }
    }
    return describeBuiltInComponentFrame(name + (env ? ' [' + env + ']' : ''));
  }
  let reentry = false;
  let componentFrameCache;
  {
    const PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
    componentFrameCache = new PossiblyWeakMap();
  }

  /**
   * Leverages native browser/VM stack frames to get proper details (e.g.
   * filename, line + col number) for a single component in a component stack. We
   * do this by:
   *   (1) throwing and catching an error in the function - this will be our
   *       control error.
   *   (2) calling the component which will eventually throw an error that we'll
   *       catch - this will be our sample error.
   *   (3) diffing the control and sample error stacks to find the stack frame
   *       which represents our component.
   */
  function describeNativeComponentFrame(fn, construct) {
    // If something asked for a stack inside a fake render, it should get ignored.
    if (!fn || reentry) {
      return '';
    }
    {
      const frame = componentFrameCache.get(fn);
      if (frame !== undefined) {
        return frame;
      }
    }
    reentry = true;
    const previousPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = DefaultPrepareStackTrace;
    let previousDispatcher = null;
    {
      previousDispatcher = ReactSharedInternals.H;
      // Set the dispatcher in DEV because this might be call in the render function
      // for warnings.
      ReactSharedInternals.H = null;
      disableLogs();
    }
    try {
      /**
       * Finding a common stack frame between sample and control errors can be
       * tricky given the different types and levels of stack trace truncation from
       * different JS VMs. So instead we'll attempt to control what that common
       * frame should be through this object method:
       * Having both the sample and control errors be in the function under the
       * `DescribeNativeComponentFrameRoot` property, + setting the `name` and
       * `displayName` properties of the function ensures that a stack
       * frame exists that has the method name `DescribeNativeComponentFrameRoot` in
       * it for both control and sample stacks.
       */
      const RunInRootFrame = {
        DetermineComponentFrameRoot() {
          let control;
          try {
            // This should throw.
            if (construct) {
              // Something should be setting the props in the constructor.
              const Fake = function () {
                throw Error();
              };
              // $FlowFixMe[prop-missing]
              Object.defineProperty(Fake.prototype, 'props', {
                set: function () {
                  // We use a throwing setter instead of frozen or non-writable props
                  // because that won't throw in a non-strict mode function.
                  throw Error();
                }
              });
              if (typeof Reflect === 'object' && Reflect.construct) {
                // We construct a different control for this case to include any extra
                // frames added by the construct call.
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                // $FlowFixMe[prop-missing] found when upgrading Flow
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              // TODO(luna): This will currently only throw if the function component
              // tries to access React/ReactDOM/props. We should probably make this throw
              // in simple components too
              const maybePromise = fn();

              // If the function component returns a promise, it's likely an async
              // component, which we don't yet support. Attach a noop catch handler to
              // silence the error.
              // TODO: Implement component stacks for async client components?
              if (maybePromise && typeof maybePromise.catch === 'function') {
                maybePromise.catch(() => {});
              }
            }
          } catch (sample) {
            // This is inlined manually because closure doesn't do it for us.
            if (sample && control && typeof sample.stack === 'string') {
              return [sample.stack, control.stack];
            }
          }
          return [null, null];
        }
      };
      // $FlowFixMe[prop-missing]
      RunInRootFrame.DetermineComponentFrameRoot.displayName = 'DetermineComponentFrameRoot';
      const namePropDescriptor = Object.getOwnPropertyDescriptor(RunInRootFrame.DetermineComponentFrameRoot, 'name');
      // Before ES6, the `name` property was not configurable.
      if (namePropDescriptor && namePropDescriptor.configurable) {
        // V8 utilizes a function's `name` property when generating a stack trace.
        Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot,
        // Configurable properties can be updated even if its writable descriptor
        // is set to `false`.
        // $FlowFixMe[cannot-write]
        'name', {
          value: 'DetermineComponentFrameRoot'
        });
      }
      const _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(),
        sampleStack = _RunInRootFrame$Deter[0],
        controlStack = _RunInRootFrame$Deter[1];
      if (sampleStack && controlStack) {
        // This extracts the first frame from the sample that isn't also in the control.
        // Skipping one frame that we assume is the frame that calls the two.
        const sampleLines = sampleStack.split('\n');
        const controlLines = controlStack.split('\n');
        let s = 0;
        let c = 0;
        while (s < sampleLines.length && !sampleLines[s].includes('DetermineComponentFrameRoot')) {
          s++;
        }
        while (c < controlLines.length && !controlLines[c].includes('DetermineComponentFrameRoot')) {
          c++;
        }
        // We couldn't find our intentionally injected common root frame, attempt
        // to find another common root frame by search from the bottom of the
        // control stack...
        if (s === sampleLines.length || c === controlLines.length) {
          s = sampleLines.length - 1;
          c = controlLines.length - 1;
          while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
            // We expect at least one stack frame to be shared.
            // Typically this will be the root most one. However, stack frames may be
            // cut off due to maximum stack limits. In this case, one maybe cut off
            // earlier than the other. We assume that the sample is longer or the same
            // and there for cut off earlier. So we should find the root most frame in
            // the sample somewhere in the control.
            c--;
          }
        }
        for (; s >= 1 && c >= 0; s--, c--) {
          // Next we find the first one that isn't the same which should be the
          // frame that called our sample function and the control.
          if (sampleLines[s] !== controlLines[c]) {
            // In V8, the first line is describing the message but other VMs don't.
            // If we're about to return the first line, and the control is also on the same
            // line, that's a pretty good indicator that our sample threw at same line as
            // the control. I.e. before we entered the sample frame. So we ignore this result.
            // This can happen if you passed a class to function component, or non-function.
            if (s !== 1 || c !== 1) {
              do {
                s--;
                c--;
                // We may still have similar intermediate frames from the construct call.
                // The next one that isn't the same should be our match though.
                if (c < 0 || sampleLines[s] !== controlLines[c]) {
                  // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
                  let frame = '\n' + sampleLines[s].replace(' at new ', ' at ');

                  // If our component frame is labeled "<anonymous>"
                  // but we have a user-provided "displayName"
                  // splice it in to make the stack more readable.
                  if (fn.displayName && frame.includes('<anonymous>')) {
                    frame = frame.replace('<anonymous>', fn.displayName);
                  }
                  if (true) {
                    if (typeof fn === 'function') {
                      componentFrameCache.set(fn, frame);
                    }
                  }
                  // Return the line we found.
                  return frame;
                }
              } while (s >= 1 && c >= 0);
            }
            break;
          }
        }
      }
    } finally {
      reentry = false;
      {
        ReactSharedInternals.H = previousDispatcher;
        reenableLogs();
      }
      Error.prepareStackTrace = previousPrepareStackTrace;
    }
    // Fallback to just using the name if we couldn't make it throw.
    const name = fn ? fn.displayName || fn.name : '';
    const syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';
    {
      if (typeof fn === 'function') {
        componentFrameCache.set(fn, syntheticFrame);
      }
    }
    return syntheticFrame;
  }
  function describeClassComponentFrame(ctor) {
    return describeNativeComponentFrame(ctor, true);
  }
  function describeFunctionComponentFrame(fn) {
    return describeNativeComponentFrame(fn, false);
  }

  function shouldConstruct$1(Component) {
    return Component.prototype && Component.prototype.isReactComponent;
  }
  function describeComponentStackByType(type) {
    if (typeof type === 'string') {
      return describeBuiltInComponentFrame(type);
    }
    if (typeof type === 'function') {
      if (shouldConstruct$1(type)) {
        return describeClassComponentFrame(type);
      } else {
        return describeFunctionComponentFrame(type);
      }
    }
    if (typeof type === 'object' && type !== null) {
      switch (type.$$typeof) {
        case REACT_FORWARD_REF_TYPE:
          {
            return describeFunctionComponentFrame(type.render);
          }
        case REACT_MEMO_TYPE:
          {
            return describeFunctionComponentFrame(type.type);
          }
        case REACT_LAZY_TYPE:
          {
            const lazyComponent = type;
            const payload = lazyComponent._payload;
            const init = lazyComponent._init;
            try {
              type = init(payload);
            } catch (x) {
              // TODO: When we support Thenables as component types we should rename this.
              return describeBuiltInComponentFrame('Lazy');
            }
            return describeComponentStackByType(type);
          }
      }
      if (typeof type.name === 'string') {
        return describeDebugInfoFrame(type.name, type.env, type.debugLocation);
      }
    }
    switch (type) {
      case REACT_SUSPENSE_LIST_TYPE:
        {
          return describeBuiltInComponentFrame('SuspenseList');
        }
      case REACT_SUSPENSE_TYPE:
        {
          return describeBuiltInComponentFrame('Suspense');
        }
    }
    return '';
  }
  function getStackByComponentStackNode(componentStack) {
    try {
      let info = '';
      let node = componentStack;
      do {
        info += describeComponentStackByType(node.type);
        // $FlowFixMe[incompatible-type] we bail out when we get a null
        node = node.parent;
      } while (node);
      return info;
    } catch (x) {
      return '\nError generating stack: ' + x.message + '\n' + x.stack;
    }
  }
  function describeFunctionComponentFrameWithoutLineNumber(fn) {
    // We use this because we don't actually want to describe the line of the component
    // but just the component name.
    const name = fn ? fn.displayName || fn.name : '';
    return name ? describeBuiltInComponentFrame(name) : '';
  }
  function getOwnerStackByComponentStackNodeInDev(componentStack) {
    try {
      let info = '';

      // The owner stack of the current component will be where it was created, i.e. inside its owner.
      // There's no actual name of the currently executing component. Instead, that is available
      // on the regular stack that's currently executing. However, for built-ins there is no such
      // named stack frame and it would be ignored as being internal anyway. Therefore we add
      // add one extra frame just to describe the "current" built-in component by name.
      // Similarly, if there is no owner at all, then there's no stack frame so we add the name
      // of the root component to the stack to know which component is currently executing.
      if (typeof componentStack.type === 'string') {
        info += describeBuiltInComponentFrame(componentStack.type);
      } else if (typeof componentStack.type === 'function') {
        if (!componentStack.owner) {
          // Only if we have no other data about the callsite do we add
          // the component name as the single stack frame.
          info += describeFunctionComponentFrameWithoutLineNumber(componentStack.type);
        }
      } else {
        if (!componentStack.owner) {
          info += describeComponentStackByType(componentStack.type);
        }
      }
      let owner = componentStack;
      while (owner) {
        let ownerStack = null;
        if (owner.debugStack != null) {
          // Server Component
          // TODO: Should we stash this somewhere for caching purposes?
          ownerStack = formatOwnerStack(owner.debugStack);
          owner = owner.owner;
        } else {
          // Client Component
          const node = owner;
          if (node.stack != null) {
            if (typeof node.stack !== 'string') {
              ownerStack = node.stack = formatOwnerStack(node.stack);
            } else {
              ownerStack = node.stack;
            }
          }
          owner = owner.owner;
        }
        // If we don't actually print the stack if there is no owner of this JSX element.
        // In a real app it's typically not useful since the root app is always controlled
        // by the framework. These also tend to have noisy stacks because they're not rooted
        // in a React render but in some imperative bootstrapping code. It could be useful
        // if the element was created in module scope. E.g. hoisted. We could add a a single
        // stack frame for context for example but it doesn't say much if that's a wrapper.
        if (owner && ownerStack) {
          info += '\n' + ownerStack;
        }
      }
      return info;
    } catch (x) {
      return '\nError generating stack: ' + x.message + '\n' + x.stack;
    }
  }

  // These indirections exists so we can exclude its stack frame in DEV (and anything below it).
  // TODO: Consider marking the whole bundle instead of these boundaries.

  const callComponent = {
    react_stack_bottom_frame: function (Component, props, secondArg) {
      return Component(props, secondArg);
    }
  };
  const callComponentInDEV = // We use this technique to trick minifiers to preserve the function name.
  callComponent.react_stack_bottom_frame.bind(callComponent) ;
  const callRender = {
    react_stack_bottom_frame: function (instance) {
      return instance.render();
    }
  };
  const callRenderInDEV = // We use this technique to trick minifiers to preserve the function name.
  callRender.react_stack_bottom_frame.bind(callRender) ;
  const callLazyInit = {
    react_stack_bottom_frame: function (lazy) {
      const payload = lazy._payload;
      const init = lazy._init;
      return init(payload);
    }
  };
  const callLazyInitInDEV = // We use this technique to trick minifiers to preserve the function name.
  callLazyInit.react_stack_bottom_frame.bind(callLazyInit) ;

  let lastResetTime = 0;
  let getCurrentTime;
  const hasPerformanceNow =
  // $FlowFixMe[method-unbinding]
  typeof performance === 'object' && typeof performance.now === 'function';
  if (hasPerformanceNow) {
    const localPerformance = performance;
    getCurrentTime = () => localPerformance.now();
  } else {
    const localDate = Date;
    getCurrentTime = () => localDate.now();
  }
  function resetOwnerStackLimit() {
    {
      const now = getCurrentTime();
      const timeSinceLastReset = now - lastResetTime;
      if (timeSinceLastReset > 1000) {
        ReactSharedInternals.recentlyCreatedOwnerStacks = 0;
        lastResetTime = now;
      }
    }
  }

  // Linked list representing the identity of a component given the component/tag name and key.
  // The name might be minified but we assume that it's going to be the same generated name. Typically
  // because it's just the same compiled output in practice.

  // resume with segmentID at the index

  const CLIENT_RENDERED = 4; // if it errors or infinitely suspends

  const PENDING = 0;
  const COMPLETED = 1;
  const FLUSHED = 2;
  const ABORTED = 3;
  const ERRORED = 4;
  const POSTPONED = 5;
  const RENDERING = 6;
  const OPENING = 10;
  const OPEN = 11;
  const ABORTING = 12;
  const CLOSING = 13;
  const CLOSED = 14;

  // This is a default heuristic for how to split up the HTML content into progressive
  // loading. Our goal is to be able to display additional new content about every 500ms.
  // Faster than that is unnecessary and should be throttled on the client. It also
  // adds unnecessary overhead to do more splits. We don't know if it's a higher or lower
  // end device but higher end suffer less from the overhead than lower end does from
  // not getting small enough pieces. We error on the side of low end.
  // We base this on low end 3G speeds which is about 500kbits per second. We assume
  // that there can be a reasonable drop off from max bandwidth which leaves you with
  // as little as 80%. We can receive half of that each 500ms - at best. In practice,
  // a little bandwidth is lost to processing and contention - e.g. CSS and images that
  // are downloaded along with the main content. So we estimate about half of that to be
  // the lower end throughput. In other words, we expect that you can at least show
  // about 12.5kb of content per 500ms. Not counting starting latency for the first
  // paint.
  // 500 * 1024 / 8 * .8 * 0.5 / 2
  const DEFAULT_PROGRESSIVE_CHUNK_SIZE = 12800;
  function getBlockingRenderMaxSize(request) {
    // We want to make sure that we can block the reveal of a well designed complete
    // shell but if you have constructed a too large shell (e.g. by not adding any
    // Suspense boundaries) then that might take too long to render. We shouldn't
    // punish users (or overzealous metrics tracking) in that scenario.
    // There's a trade off here. If this limit is too low then you can't fit a
    // reasonably well built UI within it without getting errors. If it's too high
    // then things that accidentally fall below it might take too long to load.
    // Web Vitals target 1.8 seconds for first paint and our goal to have the limit
    // be fast enough to hit that. For this argument we assume that most external
    // resources are already cached because it's a return visit, or inline styles.
    // If it's not, then it's highly unlikely that any render blocking instructions
    // we add has any impact what so ever on the paint.
    // Assuming a first byte of about 600ms which is kind of bad but common with a
    // decent static host. If it's longer e.g. due to dynamic rendering, then you
    // are going to bound by dynamic production of the content and you're better off
    // with Suspense boundaries anyway. This number doesn't matter much. Then you
    // have about 1.2 seconds left for bandwidth. On 3G that gives you about 112.5kb
    // worth of data. That's worth about 10x in terms of uncompressed bytes. Then we
    // half that just to account for longer latency, slower bandwidth and CPU processing.
    // Now we're down to about 500kb. In fact, looking at metrics we've collected with
    // rel="expect" examples and other documents, the impact on documents smaller than
    // that is within the noise. That's because there's enough happening within that
    // start up to not make HTML streaming not significantly better.
    // Content above the fold tends to be about 100-200kb tops. Therefore 500kb should
    // be enough head room for a good loading state. After that you should use
    // Suspense or SuspenseList to improve it.
    // Since this is highly related to the reason you would adjust the
    // progressiveChunkSize option, and always has to be higher, we define this limit
    // in terms of it. So if you want to increase the limit because you have high
    // bandwidth users, then you can adjust it up. If you are concerned about even
    // slower bandwidth then you can adjust it down.
    return request.progressiveChunkSize * 40; // 512kb by default.
  }
  function isEligibleForOutlining(request, boundary) {
    // For very small boundaries, don't bother producing a fallback for outlining.
    // The larger this limit is, the more we can save on preparing fallbacks in case we end up
    // outlining.
    return (boundary.byteSize > 500 || hasSuspenseyContent(boundary.contentState)) &&
    // For boundaries that can possibly contribute to the preamble we don't want to outline
    // them regardless of their size since the fallbacks should only be emitted if we've
    // errored the boundary.
    boundary.contentPreamble === null;
  }
  function defaultErrorHandler(error) {
    if (typeof error === 'object' && error !== null && typeof error.environmentName === 'string') {
      // This was a Server error. We print the environment name in a badge just like we do with
      // replays of console logs to indicate that the source of this throw as actually the Server.
      bindToConsole('error', [error], error.environmentName)();
    } else {
      console['error'](error); // Don't transform to our wrapper
    }
    return null;
  }
  function RequestInstance(resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, formState) {
    const pingedTasks = [];
    const abortSet = new Set();
    this.destination = null;
    this.flushScheduled = false;
    this.resumableState = resumableState;
    this.renderState = renderState;
    this.rootFormatContext = rootFormatContext;
    this.progressiveChunkSize = progressiveChunkSize === undefined ? DEFAULT_PROGRESSIVE_CHUNK_SIZE : progressiveChunkSize;
    this.status = OPENING;
    this.fatalError = null;
    this.nextSegmentId = 0;
    this.allPendingTasks = 0;
    this.pendingRootTasks = 0;
    this.completedRootSegment = null;
    this.completedPreambleSegments = null;
    this.byteSize = 0;
    this.abortableTasks = abortSet;
    this.pingedTasks = pingedTasks;
    this.clientRenderedBoundaries = [];
    this.completedBoundaries = [];
    this.partialBoundaries = [];
    this.trackedPostpones = null;
    this.onError = onError === undefined ? defaultErrorHandler : onError;
    this.onPostpone = onPostpone === undefined ? noop : onPostpone;
    this.onAllReady = onAllReady === undefined ? noop : onAllReady;
    this.onShellReady = onShellReady === undefined ? noop : onShellReady;
    this.onShellError = onShellError === undefined ? noop : onShellError;
    this.onFatalError = onFatalError === undefined ? noop : onFatalError;
    this.formState = formState === undefined ? null : formState;
    {
      this.didWarnForKey = null;
    }
  }
  function createRequest(children, resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, formState) {
    {
      resetOwnerStackLimit();
    }

    // $FlowFixMe[invalid-constructor]: the shapes are exact here but Flow doesn't like constructors
    const request = new RequestInstance(resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, formState);

    // This segment represents the root fallback.
    const rootSegment = createPendingSegment(request, 0, null, rootFormatContext,
    // Root segments are never embedded in Text on either edge
    false, false);
    // There is no parent so conceptually, we're unblocked to flush this segment.
    rootSegment.parentFlushed = true;
    const rootTask = createRenderTask(request, null, children, -1, null, rootSegment, null, null, request.abortableTasks, null, rootFormatContext, rootContextSnapshot, emptyTreeContext, null, null, emptyContextObject, null);
    pushComponentStack(rootTask);
    request.pingedTasks.push(rootTask);
    return request;
  }
  function createPrerenderRequest(children, resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone) {
    const request = createRequest(children, resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, undefined);
    // Start tracking postponed holes during this render.
    request.trackedPostpones = {
      workingMap: new Map(),
      rootNodes: [],
      rootSlots: null
    };
    return request;
  }
  function resumeRequest(children, postponedState, renderState, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone) {
    {
      resetOwnerStackLimit();
    }

    // $FlowFixMe[invalid-constructor]: the shapes are exact here but Flow doesn't like constructors
    const request = new RequestInstance(postponedState.resumableState, renderState, postponedState.rootFormatContext, postponedState.progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone, null);
    request.nextSegmentId = postponedState.nextSegmentId;
    if (typeof postponedState.replaySlots === 'number') {
      // We have a resume slot at the very root. This is effectively just a full rerender.
      const rootSegment = createPendingSegment(request, 0, null, postponedState.rootFormatContext,
      // Root segments are never embedded in Text on either edge
      false, false);
      // There is no parent so conceptually, we're unblocked to flush this segment.
      rootSegment.parentFlushed = true;
      const rootTask = createRenderTask(request, null, children, -1, null, rootSegment, null, null, request.abortableTasks, null, postponedState.rootFormatContext, rootContextSnapshot, emptyTreeContext, null, null, emptyContextObject, null);
      pushComponentStack(rootTask);
      request.pingedTasks.push(rootTask);
      return request;
    }
    const replay = {
      nodes: postponedState.replayNodes,
      slots: postponedState.replaySlots,
      pendingTasks: 0
    };
    const rootTask = createReplayTask(request, null, replay, children, -1, null, null, request.abortableTasks, null, postponedState.rootFormatContext, rootContextSnapshot, emptyTreeContext, null, null, emptyContextObject, null);
    pushComponentStack(rootTask);
    request.pingedTasks.push(rootTask);
    return request;
  }
  function resumeAndPrerenderRequest(children, postponedState, renderState, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone) {
    const request = resumeRequest(children, postponedState, renderState, onError, onAllReady, onShellReady, onShellError, onFatalError, onPostpone);
    // Start tracking postponed holes during this render.
    request.trackedPostpones = {
      workingMap: new Map(),
      rootNodes: [],
      rootSlots: null
    };
    return request;
  }
  let currentRequest = null;
  function resolveRequest() {
    if (currentRequest) return currentRequest;
    return null;
  }
  function pingTask(request, task) {
    const pingedTasks = request.pingedTasks;
    pingedTasks.push(task);
    if (request.pingedTasks.length === 1) {
      request.flushScheduled = request.destination !== null;
      if (request.trackedPostpones !== null || request.status === OPENING) {
        scheduleMicrotask(() => performWork(request));
      } else {
        scheduleWork(() => performWork(request));
      }
    }
  }
  function createSuspenseBoundary(request, row, fallbackAbortableTasks, contentPreamble, fallbackPreamble) {
    const boundary = {
      status: PENDING,
      rootSegmentID: -1,
      parentFlushed: false,
      pendingTasks: 0,
      row: row,
      completedSegments: [],
      byteSize: 0,
      fallbackAbortableTasks,
      errorDigest: null,
      contentState: createHoistableState(),
      fallbackState: createHoistableState(),
      contentPreamble,
      fallbackPreamble,
      trackedContentKeyPath: null,
      trackedFallbackNode: null
    };
    {
      // DEV-only fields for hidden class
      boundary.errorMessage = null;
      boundary.errorStack = null;
      boundary.errorComponentStack = null;
    }
    if (row !== null) {
      // This boundary will block this row from completing.
      row.pendingTasks++;
      const blockedBoundaries = row.boundaries;
      if (blockedBoundaries !== null) {
        // Previous rows will block this boundary itself from completing.
        request.allPendingTasks++;
        boundary.pendingTasks++;
        blockedBoundaries.push(boundary);
      }
      const inheritedHoistables = row.inheritedHoistables;
      if (inheritedHoistables !== null) {
        hoistHoistables(boundary.contentState, inheritedHoistables);
      }
    }
    return boundary;
  }
  function createRenderTask(request, thenableState, node, childIndex, blockedBoundary, blockedSegment, blockedPreamble, hoistableState, abortSet, keyPath, formatContext, context, treeContext, row, componentStack, legacyContext, debugTask) {
    request.allPendingTasks++;
    if (blockedBoundary === null) {
      request.pendingRootTasks++;
    } else {
      blockedBoundary.pendingTasks++;
    }
    if (row !== null) {
      row.pendingTasks++;
    }
    const task = {
      replay: null,
      node,
      childIndex,
      ping: () => pingTask(request, task),
      blockedBoundary,
      blockedSegment,
      blockedPreamble,
      hoistableState,
      abortSet,
      keyPath,
      formatContext,
      context,
      treeContext,
      row,
      componentStack,
      thenableState
    };
    {
      task.debugTask = debugTask;
    }
    abortSet.add(task);
    return task;
  }
  function createReplayTask(request, thenableState, replay, node, childIndex, blockedBoundary, hoistableState, abortSet, keyPath, formatContext, context, treeContext, row, componentStack, legacyContext, debugTask) {
    request.allPendingTasks++;
    if (blockedBoundary === null) {
      request.pendingRootTasks++;
    } else {
      blockedBoundary.pendingTasks++;
    }
    if (row !== null) {
      row.pendingTasks++;
    }
    replay.pendingTasks++;
    const task = {
      replay,
      node,
      childIndex,
      ping: () => pingTask(request, task),
      blockedBoundary,
      blockedSegment: null,
      blockedPreamble: null,
      hoistableState,
      abortSet,
      keyPath,
      formatContext,
      context,
      treeContext,
      row,
      componentStack,
      thenableState
    };
    {
      task.debugTask = debugTask;
    }
    abortSet.add(task);
    return task;
  }
  function createPendingSegment(request, index, boundary, parentFormatContext, lastPushedText, textEmbedded) {
    return {
      status: PENDING,
      parentFlushed: false,
      id: -1,
      // lazily assigned later
      index,
      chunks: [],
      children: [],
      preambleChildren: [],
      parentFormatContext,
      boundary,
      lastPushedText,
      textEmbedded
    };
  }
  function getCurrentStackInDEV() {
    {
      if (currentTaskInDEV === null || currentTaskInDEV.componentStack === null) {
        return '';
      }
      return getOwnerStackByComponentStackNodeInDev(currentTaskInDEV.componentStack);
    }
  }
  function getStackFromNode(stackNode) {
    return getStackByComponentStackNode(stackNode);
  }
  function pushHaltedAwaitOnComponentStack(task, debugInfo) {
    if (debugInfo != null) {
      for (let i = debugInfo.length - 1; i >= 0; i--) {
        const info = debugInfo[i];
        if (typeof info.name === 'string') {
          // This is a Server Component. Any awaits in previous Server Components already resolved.
          break;
        }
        if (typeof info.time === 'number') {
          // This had an end time. Any awaits before this must have already resolved.
          break;
        }
        if (info.awaited != null) {
          const asyncInfo = info;
          const bestStack = asyncInfo.debugStack == null ? asyncInfo.awaited : asyncInfo;
          if (bestStack.debugStack !== undefined) {
            task.componentStack = {
              parent: task.componentStack,
              type: asyncInfo,
              owner: bestStack.owner,
              stack: bestStack.debugStack
            };
            task.debugTask = bestStack.debugTask;
            break;
          }
        }
      }
    }
  }
  function pushServerComponentStack(task, debugInfo) {
    // Build a Server Component parent stack from the debugInfo.
    if (debugInfo != null) {
      const stack = debugInfo;
      for (let i = 0; i < stack.length; i++) {
        const componentInfo = stack[i];
        if (typeof componentInfo.name !== 'string') {
          continue;
        }
        if (componentInfo.debugStack === undefined) {
          continue;
        }
        task.componentStack = {
          parent: task.componentStack,
          type: componentInfo,
          owner: componentInfo.owner,
          stack: componentInfo.debugStack
        };
        task.debugTask = componentInfo.debugTask;
      }
    }
  }
  function pushComponentStack(task) {
    const node = task.node;
    // Create the Component Stack frame for the element we're about to try.
    // It's unfortunate that we need to do this refinement twice. Once for
    // the stack frame and then once again while actually
    if (typeof node === 'object' && node !== null) {
      switch (node.$$typeof) {
        case REACT_ELEMENT_TYPE:
          {
            const element = node;
            const type = element.type;
            const owner = element._owner ;
            const stack = element._debugStack ;
            {
              pushServerComponentStack(task, element._debugInfo);
              task.debugTask = element._debugTask;
            }
            task.componentStack = createComponentStackFromType(task.componentStack, type, owner, stack);
            break;
          }
        case REACT_LAZY_TYPE:
          {
            {
              const lazyNode = node;
              pushServerComponentStack(task, lazyNode._debugInfo);
            }
            break;
          }
        default:
          {
            {
              const maybeUsable = node;
              if (typeof maybeUsable.then === 'function') {
                const thenable = maybeUsable;
                pushServerComponentStack(task, thenable._debugInfo);
              }
            }
          }
      }
    }
  }
  function createComponentStackFromType(parent, type, owner,
  // DEV only
  stack // DEV only
  ) {
    {
      return {
        parent,
        type,
        owner,
        stack
      };
    }
  }
  function replaceSuspenseComponentStackWithSuspenseFallbackStack(componentStack) {
    if (componentStack === null) {
      return null;
    }
    return createComponentStackFromType(componentStack.parent, 'Suspense Fallback', componentStack.owner , componentStack.stack );
  }
  function getThrownInfo(node) {
    const errorInfo = {};
    if (node) {
      Object.defineProperty(errorInfo, 'componentStack', {
        configurable: true,
        enumerable: true,
        get() {
          // Lazyily generate the stack since it's expensive.
          const stack = getStackFromNode(node);
          Object.defineProperty(errorInfo, 'componentStack', {
            value: stack
          });
          return stack;
        }
      });
    }
    return errorInfo;
  }
  function encodeErrorForBoundary(boundary, digest, error, thrownInfo, wasAborted) {
    boundary.errorDigest = digest;
    {
      let message, stack;
      // In dev we additionally encode the error message and component stack on the boundary
      if (error instanceof Error) {
        // eslint-disable-next-line react-internal/safe-string-coercion
        message = String(error.message);
        // eslint-disable-next-line react-internal/safe-string-coercion
        stack = String(error.stack);
      } else if (typeof error === 'object' && error !== null) {
        message = describeObjectForErrorMessage(error);
        stack = null;
      } else {
        // eslint-disable-next-line react-internal/safe-string-coercion
        message = String(error);
        stack = null;
      }
      const prefix = wasAborted ? 'Switched to client rendering because the server rendering aborted due to:\n\n' : 'Switched to client rendering because the server rendering errored:\n\n';
      boundary.errorMessage = prefix + message;
      boundary.errorStack = stack !== null ? prefix + stack : null;
      boundary.errorComponentStack = thrownInfo.componentStack;
    }
  }
  function logRecoverableError(request, error, errorInfo, debugTask) {
    // If this callback errors, we intentionally let that error bubble up to become a fatal error
    // so that someone fixes the error reporting instead of hiding it.
    const onError = request.onError;
    const errorDigest = debugTask ? debugTask.run(onError.bind(null, error, errorInfo)) : onError(error, errorInfo);
    if (errorDigest != null && typeof errorDigest !== 'string') {
      // We used to throw here but since this gets called from a variety of unprotected places it
      // seems better to just warn and discard the returned value.
      {
        console.error('onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "%s" instead', typeof errorDigest);
      }
      return;
    }
    return errorDigest;
  }
  function fatalError(request, error, errorInfo, debugTask) {
    // This is called outside error handling code such as if the root errors outside
    // a suspense boundary or if the root suspense boundary's fallback errors.
    // It's also called if React itself or its host configs errors.
    const onShellError = request.onShellError;
    const onFatalError = request.onFatalError;
    if (debugTask) {
      debugTask.run(onShellError.bind(null, error));
      debugTask.run(onFatalError.bind(null, error));
    } else {
      onShellError(error);
      onFatalError(error);
    }
    if (request.destination !== null) {
      request.status = CLOSED;
      closeWithError(request.destination, error);
    } else {
      request.status = CLOSING;
      request.fatalError = error;
    }
  }
  function renderSuspenseBoundary(request, someTask, keyPath, props) {
    if (someTask.replay !== null) {
      // If we're replaying through this pass, it means we're replaying through
      // an already completed Suspense boundary. It's too late to do anything about it
      // so we can just render through it.
      const prevKeyPath = someTask.keyPath;
      const prevContext = someTask.formatContext;
      const prevRow = someTask.row;
      someTask.keyPath = keyPath;
      someTask.formatContext = getSuspenseContentFormatContext(request.resumableState, prevContext);
      someTask.row = null;
      const content = props.children;
      try {
        renderNode(request, someTask, content, -1);
      } finally {
        someTask.keyPath = prevKeyPath;
        someTask.formatContext = prevContext;
        someTask.row = prevRow;
      }
      return;
    }
    // $FlowFixMe: Refined.
    const task = someTask;
    const prevKeyPath = task.keyPath;
    const prevContext = task.formatContext;
    const prevRow = task.row;
    const parentBoundary = task.blockedBoundary;
    const parentPreamble = task.blockedPreamble;
    const parentHoistableState = task.hoistableState;
    const parentSegment = task.blockedSegment;

    // Each time we enter a suspense boundary, we split out into a new segment for
    // the fallback so that we can later replace that segment with the content.
    // This also lets us split out the main content even if it doesn't suspend,
    // in case it ends up generating a large subtree of content.
    const fallback = props.fallback;
    const content = props.children;
    const fallbackAbortSet = new Set();
    let newBoundary;
    if (canHavePreamble(task.formatContext)) {
      newBoundary = createSuspenseBoundary(request, task.row, fallbackAbortSet, createPreambleState(), createPreambleState());
    } else {
      newBoundary = createSuspenseBoundary(request, task.row, fallbackAbortSet, null, null);
    }
    if (request.trackedPostpones !== null) {
      newBoundary.trackedContentKeyPath = keyPath;
    }
    const insertionIndex = parentSegment.chunks.length;
    // The children of the boundary segment is actually the fallback.
    const boundarySegment = createPendingSegment(request, insertionIndex, newBoundary, task.formatContext,
    // boundaries never require text embedding at their edges because comment nodes bound them
    false, false);
    parentSegment.children.push(boundarySegment);
    // The parentSegment has a child Segment at this index so we reset the lastPushedText marker on the parent
    parentSegment.lastPushedText = false;

    // This segment is the actual child content. We can start rendering that immediately.
    const contentRootSegment = createPendingSegment(request, 0, null, task.formatContext,
    // boundaries never require text embedding at their edges because comment nodes bound them
    false, false);
    // We mark the root segment as having its parent flushed. It's not really flushed but there is
    // no parent segment so there's nothing to wait on.
    contentRootSegment.parentFlushed = true;
    if (request.trackedPostpones !== null) {
      // Stash the original stack frame.
      const suspenseComponentStack = task.componentStack;
      // This is a prerender. In this mode we want to render the fallback synchronously and schedule
      // the content to render later. This is the opposite of what we do during a normal render
      // where we try to skip rendering the fallback if the content itself can render synchronously
      const trackedPostpones = request.trackedPostpones;
      const fallbackKeyPath = [keyPath[0], 'Suspense Fallback', keyPath[2]];
      const fallbackReplayNode = [fallbackKeyPath[1], fallbackKeyPath[2], [], null];
      trackedPostpones.workingMap.set(fallbackKeyPath, fallbackReplayNode);
      // We are rendering the fallback before the boundary content so we keep track of
      // the fallback replay node until we determine if the primary content suspends
      newBoundary.trackedFallbackNode = fallbackReplayNode;
      task.blockedSegment = boundarySegment;
      task.blockedPreamble = newBoundary.fallbackPreamble;
      task.keyPath = fallbackKeyPath;
      task.formatContext = getSuspenseFallbackFormatContext(request.resumableState, prevContext);
      task.componentStack = replaceSuspenseComponentStackWithSuspenseFallbackStack(suspenseComponentStack);
      boundarySegment.status = RENDERING;
      try {
        renderNode(request, task, fallback, -1);
        pushSegmentFinale(boundarySegment.chunks, request.renderState, boundarySegment.lastPushedText, boundarySegment.textEmbedded);
        boundarySegment.status = COMPLETED;
        finishedSegment(request, parentBoundary, boundarySegment);
      } catch (thrownValue) {
        if (request.status === ABORTING) {
          boundarySegment.status = ABORTED;
        } else {
          boundarySegment.status = ERRORED;
        }
        throw thrownValue;
      } finally {
        task.blockedSegment = parentSegment;
        task.blockedPreamble = parentPreamble;
        task.keyPath = prevKeyPath;
        task.formatContext = prevContext;
      }

      // We create a suspended task for the primary content because we want to allow
      // sibling fallbacks to be rendered first.
      const suspendedPrimaryTask = createRenderTask(request, null, content, -1, newBoundary, contentRootSegment, newBoundary.contentPreamble, newBoundary.contentState, task.abortSet, keyPath, getSuspenseContentFormatContext(request.resumableState, task.formatContext), task.context, task.treeContext, null,
      // The row gets reset inside the Suspense boundary.
      suspenseComponentStack, emptyContextObject, task.debugTask );
      pushComponentStack(suspendedPrimaryTask);
      request.pingedTasks.push(suspendedPrimaryTask);
    } else {
      // This is a normal render. We will attempt to synchronously render the boundary content
      // If it is successful we will elide the fallback task but if it suspends or errors we schedule
      // the fallback to render. Unlike with prerenders we attempt to deprioritize the fallback render

      // Currently this is running synchronously. We could instead schedule this to pingedTasks.
      // I suspect that there might be some efficiency benefits from not creating the suspended task
      // and instead just using the stack if possible.
      // TODO: Call this directly instead of messing with saving and restoring contexts.

      // We can reuse the current context and task to render the content immediately without
      // context switching. We just need to temporarily switch which boundary and which segment
      // we're writing to. If something suspends, it'll spawn new suspended task with that context.
      task.blockedBoundary = newBoundary;
      task.blockedPreamble = newBoundary.contentPreamble;
      task.hoistableState = newBoundary.contentState;
      task.blockedSegment = contentRootSegment;
      task.keyPath = keyPath;
      task.formatContext = getSuspenseContentFormatContext(request.resumableState, prevContext);
      task.row = null;
      contentRootSegment.status = RENDERING;
      try {
        // We use the safe form because we don't handle suspending here. Only error handling.
        renderNode(request, task, content, -1);
        pushSegmentFinale(contentRootSegment.chunks, request.renderState, contentRootSegment.lastPushedText, contentRootSegment.textEmbedded);
        contentRootSegment.status = COMPLETED;
        finishedSegment(request, newBoundary, contentRootSegment);
        queueCompletedSegment(newBoundary, contentRootSegment);
        if (newBoundary.pendingTasks === 0 && newBoundary.status === PENDING) {
          // This must have been the last segment we were waiting on. This boundary is now complete.
          newBoundary.status = COMPLETED;
          // Therefore we won't need the fallback. We early return so that we don't have to create
          // the fallback. However, if this boundary ended up big enough to be eligible for outlining
          // we can't do that because we might still need the fallback if we outline it.
          if (!isEligibleForOutlining(request, newBoundary)) {
            if (prevRow !== null) {
              // If we have synchronously completed the boundary and it's not eligible for outlining
              // then we don't have to wait for it to be flushed before we unblock future rows.
              // This lets us inline small rows in order.
              if (--prevRow.pendingTasks === 0) {
                finishSuspenseListRow(request, prevRow);
              }
            }
            if (request.pendingRootTasks === 0 && task.blockedPreamble) {
              // The root is complete and this boundary may contribute part of the preamble.
              // We eagerly attempt to prepare the preamble here because we expect most requests
              // to have few boundaries which contribute preambles and it allow us to do this
              // preparation work during the work phase rather than the when flushing.
              preparePreamble(request);
            }
            return;
          }
        } else {
          const boundaryRow = prevRow;
          if (boundaryRow !== null && boundaryRow.together) {
            tryToResolveTogetherRow(request, boundaryRow);
          }
        }
      } catch (thrownValue) {
        newBoundary.status = CLIENT_RENDERED;
        let error;
        if (request.status === ABORTING) {
          contentRootSegment.status = ABORTED;
          error = request.fatalError;
        } else {
          contentRootSegment.status = ERRORED;
          error = thrownValue;
        }
        const thrownInfo = getThrownInfo(task.componentStack);
        let errorDigest;
        {
          errorDigest = logRecoverableError(request, error, thrownInfo, task.debugTask );
        }
        encodeErrorForBoundary(newBoundary, errorDigest, error, thrownInfo, false);
        untrackBoundary(request, newBoundary);

        // We don't need to decrement any task numbers because we didn't spawn any new task.
        // We don't need to schedule any task because we know the parent has written yet.
        // We do need to fallthrough to create the fallback though.
      } finally {
        task.blockedBoundary = parentBoundary;
        task.blockedPreamble = parentPreamble;
        task.hoistableState = parentHoistableState;
        task.blockedSegment = parentSegment;
        task.keyPath = prevKeyPath;
        task.formatContext = prevContext;
        task.row = prevRow;
      }
      const fallbackKeyPath = [keyPath[0], 'Suspense Fallback', keyPath[2]];
      // We create suspended task for the fallback because we don't want to actually work
      // on it yet in case we finish the main content, so we queue for later.
      const suspendedFallbackTask = createRenderTask(request, null, fallback, -1, parentBoundary, boundarySegment, newBoundary.fallbackPreamble, newBoundary.fallbackState, fallbackAbortSet, fallbackKeyPath, getSuspenseFallbackFormatContext(request.resumableState, task.formatContext), task.context, task.treeContext, task.row, replaceSuspenseComponentStackWithSuspenseFallbackStack(task.componentStack), emptyContextObject, task.debugTask );
      pushComponentStack(suspendedFallbackTask);
      // TODO: This should be queued at a separate lower priority queue so that we only work
      // on preparing fallbacks if we don't have any more main content to task on.
      request.pingedTasks.push(suspendedFallbackTask);
    }
  }
  function replaySuspenseBoundary(request, task, keyPath, props, id, childNodes, childSlots, fallbackNodes, fallbackSlots) {
    const prevKeyPath = task.keyPath;
    const prevContext = task.formatContext;
    const prevRow = task.row;
    const previousReplaySet = task.replay;
    const parentBoundary = task.blockedBoundary;
    const parentHoistableState = task.hoistableState;
    const content = props.children;
    const fallback = props.fallback;
    const fallbackAbortSet = new Set();
    let resumedBoundary;
    if (canHavePreamble(task.formatContext)) {
      resumedBoundary = createSuspenseBoundary(request, task.row, fallbackAbortSet, createPreambleState(), createPreambleState());
    } else {
      resumedBoundary = createSuspenseBoundary(request, task.row, fallbackAbortSet, null, null);
    }
    resumedBoundary.parentFlushed = true;
    // We restore the same id of this boundary as was used during prerender.
    resumedBoundary.rootSegmentID = id;

    // We can reuse the current context and task to render the content immediately without
    // context switching. We just need to temporarily switch which boundary and replay node
    // we're writing to. If something suspends, it'll spawn new suspended task with that context.
    task.blockedBoundary = resumedBoundary;
    task.hoistableState = resumedBoundary.contentState;
    task.keyPath = keyPath;
    task.formatContext = getSuspenseContentFormatContext(request.resumableState, prevContext);
    task.row = null;
    task.replay = {
      nodes: childNodes,
      slots: childSlots,
      pendingTasks: 1
    };
    try {
      // We use the safe form because we don't handle suspending here. Only error handling.
      renderNode(request, task, content, -1);
      if (task.replay.pendingTasks === 1 && task.replay.nodes.length > 0) {
        throw new Error("Couldn't find all resumable slots by key/index during replaying. " + "The tree doesn't match so React will fallback to client rendering.");
      }
      task.replay.pendingTasks--;
      if (resumedBoundary.pendingTasks === 0 && resumedBoundary.status === PENDING) {
        // This must have been the last segment we were waiting on. This boundary is now complete.
        // Therefore we won't need the fallback. We early return so that we don't have to create
        // the fallback.
        resumedBoundary.status = COMPLETED;
        request.completedBoundaries.push(resumedBoundary);
        // We restore the parent componentStack. Semantically this is the same as
        // popComponentStack(task) but we do this instead because it should be slightly
        // faster
        return;
      }
    } catch (error) {
      resumedBoundary.status = CLIENT_RENDERED;
      const thrownInfo = getThrownInfo(task.componentStack);
      let errorDigest;
      {
        errorDigest = logRecoverableError(request, error, thrownInfo, task.debugTask );
      }
      encodeErrorForBoundary(resumedBoundary, errorDigest, error, thrownInfo, false);
      task.replay.pendingTasks--;

      // The parent already flushed in the prerender so we need to schedule this to be emitted.
      request.clientRenderedBoundaries.push(resumedBoundary);

      // We don't need to decrement any task numbers because we didn't spawn any new task.
      // We don't need to schedule any task because we know the parent has written yet.
      // We do need to fallthrough to create the fallback though.
    } finally {
      task.blockedBoundary = parentBoundary;
      task.hoistableState = parentHoistableState;
      task.replay = previousReplaySet;
      task.keyPath = prevKeyPath;
      task.formatContext = prevContext;
      task.row = prevRow;
    }
    const fallbackKeyPath = [keyPath[0], 'Suspense Fallback', keyPath[2]];

    // We create suspended task for the fallback because we don't want to actually work
    // on it yet in case we finish the main content, so we queue for later.
    const fallbackReplay = {
      nodes: fallbackNodes,
      slots: fallbackSlots,
      pendingTasks: 0
    };
    const suspendedFallbackTask = createReplayTask(request, null, fallbackReplay, fallback, -1, parentBoundary, resumedBoundary.fallbackState, fallbackAbortSet, fallbackKeyPath, getSuspenseFallbackFormatContext(request.resumableState, task.formatContext), task.context, task.treeContext, task.row, replaceSuspenseComponentStackWithSuspenseFallbackStack(task.componentStack), emptyContextObject, task.debugTask );
    pushComponentStack(suspendedFallbackTask);
    // TODO: This should be queued at a separate lower priority queue so that we only work
    // on preparing fallbacks if we don't have any more main content to task on.
    request.pingedTasks.push(suspendedFallbackTask);
  }
  function finishSuspenseListRow(request, row) {
    // This row finished. Now we have to unblock all the next rows that were blocked on this.
    unblockSuspenseListRow(request, row.next, row.hoistables);
  }
  function unblockSuspenseListRow(request, unblockedRow, inheritedHoistables) {
    // We do this in a loop to avoid stack overflow for very long lists that get unblocked.
    while (unblockedRow !== null) {
      if (inheritedHoistables !== null) {
        // Hoist any hoistables from the previous row into the next row so that it can be
        // later transferred to all the rows.
        hoistHoistables(unblockedRow.hoistables, inheritedHoistables);
        // Mark the row itself for any newly discovered Suspense boundaries to inherit.
        // This is different from hoistables because that also includes hoistables from
        // all the boundaries below this row and not just previous rows.
        unblockedRow.inheritedHoistables = inheritedHoistables;
      }
      // Unblocking the boundaries will decrement the count of this row but we keep it above
      // zero so they never finish this row recursively.
      const unblockedBoundaries = unblockedRow.boundaries;
      if (unblockedBoundaries !== null) {
        unblockedRow.boundaries = null;
        for (let i = 0; i < unblockedBoundaries.length; i++) {
          const unblockedBoundary = unblockedBoundaries[i];
          if (inheritedHoistables !== null) {
            hoistHoistables(unblockedBoundary.contentState, inheritedHoistables);
          }
          finishedTask(request, unblockedBoundary, null, null);
        }
      }
      // Instead we decrement at the end to keep it all in this loop.
      unblockedRow.pendingTasks--;
      if (unblockedRow.pendingTasks > 0) {
        // Still blocked.
        break;
      }
      inheritedHoistables = unblockedRow.hoistables;
      unblockedRow = unblockedRow.next;
    }
  }
  function trackPostponedSuspenseListRow(request, trackedPostpones, postponedRow) {
    // TODO: Because we unconditionally call this, it will be called by finishedTask
    // and so ends up recursive which can lead to stack overflow for very long lists.
    if (postponedRow !== null) {
      const postponedBoundaries = postponedRow.boundaries;
      if (postponedBoundaries !== null) {
        postponedRow.boundaries = null;
        for (let i = 0; i < postponedBoundaries.length; i++) {
          const postponedBoundary = postponedBoundaries[i];
          trackPostponedBoundary(request, trackedPostpones, postponedBoundary);
          finishedTask(request, postponedBoundary, null, null);
        }
      }
    }
  }
  function tryToResolveTogetherRow(request, togetherRow) {
    // If we have a "together" row and all the pendingTasks are really the boundaries themselves,
    // and we won't outline any of them then we can unblock this row early so that we can inline
    // all the boundaries at once.
    const boundaries = togetherRow.boundaries;
    if (boundaries === null || togetherRow.pendingTasks !== boundaries.length) {
      return;
    }
    let allCompleteAndInlinable = true;
    for (let i = 0; i < boundaries.length; i++) {
      const rowBoundary = boundaries[i];
      if (rowBoundary.pendingTasks !== 1 || rowBoundary.parentFlushed || isEligibleForOutlining(request, rowBoundary)) {
        allCompleteAndInlinable = false;
        break;
      }
    }
    if (allCompleteAndInlinable) {
      unblockSuspenseListRow(request, togetherRow, togetherRow.hoistables);
    }
  }
  function createSuspenseListRow(previousRow) {
    const newRow = {
      pendingTasks: 1,
      // At first the row is blocked on attempting rendering itself.
      boundaries: null,
      hoistables: createHoistableState(),
      inheritedHoistables: null,
      together: false,
      next: null
    };
    if (previousRow !== null && previousRow.pendingTasks > 0) {
      // If the previous row is not done yet, we add ourselves to be blocked on it.
      // When it finishes, we'll decrement our pending tasks.
      newRow.pendingTasks++;
      newRow.boundaries = [];
      previousRow.next = newRow;
    }
    return newRow;
  }
  function renderSuspenseListRows(request, task, keyPath, rows, revealOrder) {
    // This is a fork of renderChildrenArray that's aware of tracking rows.
    const prevKeyPath = task.keyPath;
    const prevTreeContext = task.treeContext;
    const prevRow = task.row;
    const previousComponentStack = task.componentStack;
    let previousDebugTask = null;
    {
      previousDebugTask = task.debugTask;
      // We read debugInfo from task.node.props.children instead of rows because it
      // might have been an unwrapped iterable so we read from the original node.
      pushServerComponentStack(task, task.node.props.children._debugInfo);
    }
    task.keyPath = keyPath;
    const totalChildren = rows.length;
    let previousSuspenseListRow = null;
    if (task.replay !== null) {
      // Replay
      // First we need to check if we have any resume slots at this level.
      const resumeSlots = task.replay.slots;
      if (resumeSlots !== null && typeof resumeSlots === 'object') {
        for (let n = 0; n < totalChildren; n++) {
          // Since we are going to resume into a slot whose order was already
          // determined by the prerender, we can safely resume it even in reverse
          // render order.
          const i = revealOrder !== 'backwards' && revealOrder !== 'unstable_legacy-backwards' ? n : totalChildren - 1 - n;
          const node = rows[i];
          task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
          task.treeContext = pushTreeContext(prevTreeContext, totalChildren, i);
          const resumeSegmentID = resumeSlots[i];
          // TODO: If this errors we should still continue with the next sibling.
          if (typeof resumeSegmentID === 'number') {
            resumeNode(request, task, resumeSegmentID, node, i);
            // We finished rendering this node, so now we can consume this
            // slot. This must happen after in case we rerender this task.
            delete resumeSlots[i];
          } else {
            renderNode(request, task, node, i);
          }
          if (--previousSuspenseListRow.pendingTasks === 0) {
            finishSuspenseListRow(request, previousSuspenseListRow);
          }
        }
      } else {
        for (let n = 0; n < totalChildren; n++) {
          // Since we are going to resume into a slot whose order was already
          // determined by the prerender, we can safely resume it even in reverse
          // render order.
          const i = revealOrder !== 'backwards' && revealOrder !== 'unstable_legacy-backwards' ? n : totalChildren - 1 - n;
          const node = rows[i];
          {
            warnForMissingKey(request, task, node);
          }
          task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
          task.treeContext = pushTreeContext(prevTreeContext, totalChildren, i);
          renderNode(request, task, node, i);
          if (--previousSuspenseListRow.pendingTasks === 0) {
            finishSuspenseListRow(request, previousSuspenseListRow);
          }
        }
      }
    } else {
      task = task; // Refined
      if (revealOrder !== 'backwards' && revealOrder !== 'unstable_legacy-backwards') {
        // Forwards direction
        for (let i = 0; i < totalChildren; i++) {
          const node = rows[i];
          {
            warnForMissingKey(request, task, node);
          }
          task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
          task.treeContext = pushTreeContext(prevTreeContext, totalChildren, i);
          renderNode(request, task, node, i);
          if (--previousSuspenseListRow.pendingTasks === 0) {
            finishSuspenseListRow(request, previousSuspenseListRow);
          }
        }
      } else {
        // For backwards direction we need to do things a bit differently.
        // We give each row its own segment so that we can render the content in
        // reverse order but still emit it in the right order when we flush.
        const parentSegment = task.blockedSegment;
        const childIndex = parentSegment.children.length;
        const insertionIndex = parentSegment.chunks.length;
        for (let i = totalChildren - 1; i >= 0; i--) {
          const node = rows[i];
          task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
          task.treeContext = pushTreeContext(prevTreeContext, totalChildren, i);
          const newSegment = createPendingSegment(request, insertionIndex, null, task.formatContext,
          // Assume we are text embedded at the trailing edges
          i === 0 ? parentSegment.lastPushedText : true, true);
          // Insert in the beginning of the sequence, which will insert before any previous rows.
          parentSegment.children.splice(childIndex, 0, newSegment);
          task.blockedSegment = newSegment;
          {
            warnForMissingKey(request, task, node);
          }
          try {
            renderNode(request, task, node, i);
            pushSegmentFinale(newSegment.chunks, request.renderState, newSegment.lastPushedText, newSegment.textEmbedded);
            newSegment.status = COMPLETED;
            finishedSegment(request, task.blockedBoundary, newSegment);
            if (--previousSuspenseListRow.pendingTasks === 0) {
              finishSuspenseListRow(request, previousSuspenseListRow);
            }
          } catch (thrownValue) {
            if (request.status === ABORTING) {
              newSegment.status = ABORTED;
            } else {
              newSegment.status = ERRORED;
            }
            throw thrownValue;
          }
        }
        task.blockedSegment = parentSegment;
        // Reset lastPushedText for current Segment since the new Segments "consumed" it
        parentSegment.lastPushedText = false;
      }
    }
    if (prevRow !== null && previousSuspenseListRow !== null && previousSuspenseListRow.pendingTasks > 0) {
      // If we are part of an outer SuspenseList and our last row is still pending, then that blocks
      // the parent row from completing. We can continue the chain.
      prevRow.pendingTasks++;
      previousSuspenseListRow.next = prevRow;
    }

    // Because this context is always set right before rendering every child, we
    // only need to reset it to the previous value at the very end.
    task.treeContext = prevTreeContext;
    task.row = prevRow;
    task.keyPath = prevKeyPath;
    {
      task.componentStack = previousComponentStack;
      task.debugTask = previousDebugTask;
    }
  }
  function renderSuspenseList(request, task, keyPath, props) {
    const children = props.children;
    const revealOrder = props.revealOrder;
    // TODO: Support tail hidden/collapsed modes.
    // const tailMode: SuspenseListTailMode = props.tail;
    if (revealOrder === 'forwards' || revealOrder === 'backwards' || revealOrder === 'unstable_legacy-backwards') {
      // For ordered reveal, we need to produce rows from the children.
      if (isArray(children)) {
        renderSuspenseListRows(request, task, keyPath, children, revealOrder);
        return;
      }
      const iteratorFn = getIteratorFn(children);
      if (iteratorFn) {
        const iterator = iteratorFn.call(children);
        if (iterator) {
          {
            validateIterable(task, children, -1, iterator, iteratorFn);
          }
          // TODO: We currently use the same id algorithm as regular nodes
          // but we need a new algorithm for SuspenseList that doesn't require
          // a full set to be loaded up front to support Async Iterable.
          // When we have that, we shouldn't buffer anymore.
          let step = iterator.next();
          if (!step.done) {
            do {
              step = iterator.next();
            } while (!step.done);
            renderSuspenseListRows(request, task, keyPath, children, revealOrder);
          }
          return;
        }
      }
      // This case will warn on the client. It's the same as independent revealOrder.
    }
    if (revealOrder === 'together') {
      const prevKeyPath = task.keyPath;
      const prevRow = task.row;
      const newRow = task.row = createSuspenseListRow(null);
      // This will cause boundaries to block on this row, but there's nothing to
      // unblock them. We'll use the partial flushing pass to unblock them.
      newRow.boundaries = [];
      newRow.together = true;
      task.keyPath = keyPath;
      renderNodeDestructive(request, task, children, -1);
      if (--newRow.pendingTasks === 0) {
        finishSuspenseListRow(request, newRow);
      }
      task.keyPath = prevKeyPath;
      task.row = prevRow;
      if (prevRow !== null && newRow.pendingTasks > 0) {
        // If we are part of an outer SuspenseList and our row is still pending, then that blocks
        // the parent row from completing. We can continue the chain.
        prevRow.pendingTasks++;
        newRow.next = prevRow;
      }
      return;
    }
    // For other reveal order modes, we just render it as a fragment.
    const prevKeyPath = task.keyPath;
    task.keyPath = keyPath;
    renderNodeDestructive(request, task, children, -1);
    task.keyPath = prevKeyPath;
  }
  function renderPreamble(request, task, blockedSegment, node) {
    const preambleSegment = createPendingSegment(request, 0, null, task.formatContext, false, false);
    blockedSegment.preambleChildren.push(preambleSegment);
    task.blockedSegment = preambleSegment;
    try {
      preambleSegment.status = RENDERING;
      renderNode(request, task, node, -1);
      pushSegmentFinale(preambleSegment.chunks, request.renderState, preambleSegment.lastPushedText, preambleSegment.textEmbedded);
      preambleSegment.status = COMPLETED;
      finishedSegment(request, task.blockedBoundary, preambleSegment);
    } finally {
      task.blockedSegment = blockedSegment;
    }
  }
  function renderHostElement(request, task, keyPath, type, props) {
    const segment = task.blockedSegment;
    if (segment === null) {
      // Replay
      const children = props.children; // TODO: Make this a Config for replaying.
      const prevContext = task.formatContext;
      const prevKeyPath = task.keyPath;
      task.formatContext = getChildFormatContext(prevContext, type, props);
      task.keyPath = keyPath;

      // We use the non-destructive form because if something suspends, we still
      // need to pop back up and finish this subtree of HTML.
      renderNode(request, task, children, -1);

      // We expect that errors will fatal the whole task and that we don't need
      // the correct context. Therefore this is not in a finally.
      task.formatContext = prevContext;
      task.keyPath = prevKeyPath;
    } else {
      // Render
      // RenderTask always has a preambleState
      const children = pushStartInstance(segment.chunks, type, props, request.resumableState, request.renderState, task.blockedPreamble, task.hoistableState, task.formatContext, segment.lastPushedText);
      segment.lastPushedText = false;
      const prevContext = task.formatContext;
      const prevKeyPath = task.keyPath;
      task.keyPath = keyPath;
      const newContext = task.formatContext = getChildFormatContext(prevContext, type, props);
      if (isPreambleContext(newContext)) {
        // $FlowFixMe: Refined
        renderPreamble(request, task, segment, children);
      } else {
        // We use the non-destructive form because if something suspends, we still
        // need to pop back up and finish this subtree of HTML.
        renderNode(request, task, children, -1);
      }

      // We expect that errors will fatal the whole task and that we don't need
      // the correct context. Therefore this is not in a finally.
      task.formatContext = prevContext;
      task.keyPath = prevKeyPath;
      pushEndInstance(segment.chunks, type, props, request.resumableState, prevContext);
      segment.lastPushedText = false;
    }
  }
  function shouldConstruct(Component) {
    return Component.prototype && Component.prototype.isReactComponent;
  }
  function renderWithHooks(request, task, keyPath, Component, props, secondArg) {
    // Reset the task's thenable state before continuing, so that if a later
    // component suspends we can reuse the same task object. If the same
    // component suspends again, the thenable state will be restored.
    const prevThenableState = task.thenableState;
    task.thenableState = null;
    const componentIdentity = {};
    prepareToUseHooks(request, task, keyPath, componentIdentity, prevThenableState);
    let result;
    {
      result = callComponentInDEV(Component, props, secondArg);
    }
    return finishHooks(Component, props, result, secondArg);
  }
  function finishClassComponent(request, task, keyPath, instance, Component, props) {
    let nextChildren;
    {
      nextChildren = callRenderInDEV(instance);
    }
    if (request.status === ABORTING) {
      // eslint-disable-next-line no-throw-literal
      throw null;
    }
    {
      if (instance.props !== props) {
        if (!didWarnAboutReassigningProps) {
          console.error('It looks like %s is reassigning its own `this.props` while rendering. ' + 'This is not supported and can lead to confusing bugs.', getComponentNameFromType(Component) || 'a component');
        }
        didWarnAboutReassigningProps = true;
      }
    }
    const prevKeyPath = task.keyPath;
    task.keyPath = keyPath;
    renderNodeDestructive(request, task, nextChildren, -1);
    task.keyPath = prevKeyPath;
  }
  function resolveClassComponentProps(Component, baseProps) {
    let newProps = baseProps;

    // Remove ref from the props object, if it exists.
    if ('ref' in baseProps) {
      newProps = {};
      for (const propName in baseProps) {
        if (propName !== 'ref') {
          newProps[propName] = baseProps[propName];
        }
      }
    }

    // Resolve default props.
    const defaultProps = Component.defaultProps;
    if (defaultProps) {
      // We may have already copied the props object above to remove ref. If so,
      // we can modify that. Otherwise, copy the props object with Object.assign.
      if (newProps === baseProps) {
        newProps = assign({}, newProps, baseProps);
      }
      // Taken from old JSX runtime, where this used to live.
      for (const propName in defaultProps) {
        if (newProps[propName] === undefined) {
          newProps[propName] = defaultProps[propName];
        }
      }
    }
    return newProps;
  }
  function renderClassComponent(request, task, keyPath, Component, props) {
    const resolvedProps = resolveClassComponentProps(Component, props);
    const maskedContext = undefined;
    const instance = constructClassInstance(Component, resolvedProps);
    mountClassInstance(instance, Component, resolvedProps, maskedContext);
    finishClassComponent(request, task, keyPath, instance, Component, resolvedProps);
  }
  const didWarnAboutBadClass = {};
  const didWarnAboutContextTypes = {};
  const didWarnAboutContextTypeOnFunctionComponent = {};
  const didWarnAboutGetDerivedStateOnFunctionComponent = {};
  let didWarnAboutReassigningProps = false;
  let didWarnAboutGenerators = false;
  let didWarnAboutMaps = false;
  function renderFunctionComponent(request, task, keyPath, Component, props) {
    let legacyContext;
    {
      if (Component.prototype && typeof Component.prototype.render === 'function') {
        const componentName = getComponentNameFromType(Component) || 'Unknown';
        if (!didWarnAboutBadClass[componentName]) {
          console.error("The <%s /> component appears to have a render method, but doesn't extend React.Component. " + 'This is likely to cause errors. Change %s to extend React.Component instead.', componentName, componentName);
          didWarnAboutBadClass[componentName] = true;
        }
      }
    }
    const value = renderWithHooks(request, task, keyPath, Component, props, legacyContext);
    if (request.status === ABORTING) {
      // eslint-disable-next-line no-throw-literal
      throw null;
    }
    const hasId = checkDidRenderIdHook();
    const actionStateCount = getActionStateCount();
    const actionStateMatchingIndex = getActionStateMatchingIndex();
    {
      if (Component.contextTypes) {
        const componentName = getComponentNameFromType(Component) || 'Unknown';
        if (!didWarnAboutContextTypes[componentName]) {
          didWarnAboutContextTypes[componentName] = true;
          {
            console.error('%s uses the legacy contextTypes API which was removed in React 19. ' + 'Use React.createContext() with React.useContext() instead. ' + '(https://react.dev/link/legacy-context)', componentName);
          }
        }
      }
    }
    {
      validateFunctionComponentInDev(Component);
    }
    finishFunctionComponent(request, task, keyPath, value, hasId, actionStateCount, actionStateMatchingIndex);
  }
  function finishFunctionComponent(request, task, keyPath, children, hasId, actionStateCount, actionStateMatchingIndex) {
    let didEmitActionStateMarkers = false;
    if (actionStateCount !== 0 && request.formState !== null) {
      // For each useActionState hook, emit a marker that indicates whether we
      // rendered using the form state passed at the root. We only emit these
      // markers if form state is passed at the root.
      const segment = task.blockedSegment;
      if (segment === null) ; else {
        didEmitActionStateMarkers = true;
        const target = segment.chunks;
        for (let i = 0; i < actionStateCount; i++) {
          if (i === actionStateMatchingIndex) {
            pushFormStateMarkerIsMatching(target);
          } else {
            pushFormStateMarkerIsNotMatching(target);
          }
        }
      }
    }
    const prevKeyPath = task.keyPath;
    task.keyPath = keyPath;
    if (hasId) {
      // This component materialized an id. We treat this as its own level, with
      // a single "child" slot.
      const prevTreeContext = task.treeContext;
      const totalChildren = 1;
      const index = 0;
      // Modify the id context. Because we'll need to reset this if something
      // suspends or errors, we'll use the non-destructive render path.
      task.treeContext = pushTreeContext(prevTreeContext, totalChildren, index);
      renderNode(request, task, children, -1);
      // Like the other contexts, this does not need to be in a finally block
      // because renderNode takes care of unwinding the stack.
      task.treeContext = prevTreeContext;
    } else if (didEmitActionStateMarkers) {
      // If there were useActionState hooks, we must use the non-destructive path
      // because this component is not a pure indirection; we emitted markers
      // to the stream.
      renderNode(request, task, children, -1);
    } else {
      // We're now successfully past this task, and we haven't modified the
      // context stack. We don't have to pop back to the previous task every
      // again, so we can use the destructive recursive form.
      renderNodeDestructive(request, task, children, -1);
    }
    task.keyPath = prevKeyPath;
  }
  function validateFunctionComponentInDev(Component) {
    {
      if (Component && Component.childContextTypes) {
        console.error('childContextTypes cannot be defined on a function component.\n' + '  %s.childContextTypes = ...', Component.displayName || Component.name || 'Component');
      }
      if (typeof Component.getDerivedStateFromProps === 'function') {
        const componentName = getComponentNameFromType(Component) || 'Unknown';
        if (!didWarnAboutGetDerivedStateOnFunctionComponent[componentName]) {
          console.error('%s: Function components do not support getDerivedStateFromProps.', componentName);
          didWarnAboutGetDerivedStateOnFunctionComponent[componentName] = true;
        }
      }
      if (typeof Component.contextType === 'object' && Component.contextType !== null) {
        const componentName = getComponentNameFromType(Component) || 'Unknown';
        if (!didWarnAboutContextTypeOnFunctionComponent[componentName]) {
          console.error('%s: Function components do not support contextType.', componentName);
          didWarnAboutContextTypeOnFunctionComponent[componentName] = true;
        }
      }
    }
  }
  function renderForwardRef(request, task, keyPath, type, props, ref) {
    let propsWithoutRef;
    if ('ref' in props) {
      // `ref` is just a prop now, but `forwardRef` expects it to not appear in
      // the props object. This used to happen in the JSX runtime, but now we do
      // it here.
      propsWithoutRef = {};
      for (const key in props) {
        // Since `ref` should only appear in props via the JSX transform, we can
        // assume that this is a plain object. So we don't need a
        // hasOwnProperty check.
        if (key !== 'ref') {
          propsWithoutRef[key] = props[key];
        }
      }
    } else {
      propsWithoutRef = props;
    }
    const children = renderWithHooks(request, task, keyPath, type.render, propsWithoutRef, ref);
    const hasId = checkDidRenderIdHook();
    const actionStateCount = getActionStateCount();
    const actionStateMatchingIndex = getActionStateMatchingIndex();
    finishFunctionComponent(request, task, keyPath, children, hasId, actionStateCount, actionStateMatchingIndex);
  }
  function renderMemo(request, task, keyPath, type, props, ref) {
    const innerType = type.type;
    renderElement(request, task, keyPath, innerType, props, ref);
  }
  function renderContextConsumer(request, task, keyPath, context, props) {
    const render = props.children;
    {
      if (typeof render !== 'function') {
        console.error('A context consumer was rendered with multiple children, or a child ' + "that isn't a function. A context consumer expects a single child " + 'that is a function. If you did pass a function, make sure there ' + 'is no trailing or leading whitespace around it.');
      }
    }
    const newValue = readContext$1(context);
    const newChildren = render(newValue);
    const prevKeyPath = task.keyPath;
    task.keyPath = keyPath;
    renderNodeDestructive(request, task, newChildren, -1);
    task.keyPath = prevKeyPath;
  }
  function renderContextProvider(request, task, keyPath, context, props) {
    const value = props.value;
    const children = props.children;
    let prevSnapshot;
    {
      prevSnapshot = task.context;
    }
    const prevKeyPath = task.keyPath;
    task.context = pushProvider(context, value);
    task.keyPath = keyPath;
    renderNodeDestructive(request, task, children, -1);
    task.context = popProvider(context);
    task.keyPath = prevKeyPath;
    {
      if (prevSnapshot !== task.context) {
        console.error('Popping the context provider did not return back to the original snapshot. This is a bug in React.');
      }
    }
  }
  function renderLazyComponent(request, task, keyPath, lazyComponent, props, ref) {
    let Component;
    {
      Component = callLazyInitInDEV(lazyComponent);
    }
    if (request.status === ABORTING) {
      // eslint-disable-next-line no-throw-literal
      throw null;
    }
    renderElement(request, task, keyPath, Component, props, ref);
  }
  function renderActivity(request, task, keyPath, props) {
    const segment = task.blockedSegment;
    if (segment === null) {
      // Replay
      const mode = props.mode;
      if (mode === 'hidden') ; else {
        // A visible Activity boundary has its children rendered inside the boundary.
        const prevKeyPath = task.keyPath;
        task.keyPath = keyPath;
        renderNode(request, task, props.children, -1);
        task.keyPath = prevKeyPath;
      }
    } else {
      // Render
      const mode = props.mode;
      if (mode === 'hidden') ; else {
        // An Activity boundary is delimited so that we can hydrate it separately.
        pushStartActivityBoundary(segment.chunks, request.renderState);
        segment.lastPushedText = false;
        // A visible Activity boundary has its children rendered inside the boundary.
        const prevKeyPath = task.keyPath;
        task.keyPath = keyPath;
        // We use the non-destructive form because if something suspends, we still
        // need to pop back up and finish the end comment.
        renderNode(request, task, props.children, -1);
        task.keyPath = prevKeyPath;
        pushEndActivityBoundary(segment.chunks, request.renderState);
        segment.lastPushedText = false;
      }
    }
  }
  function renderElement(request, task, keyPath, type, props, ref) {
    if (typeof type === 'function') {
      if (shouldConstruct(type)) {
        renderClassComponent(request, task, keyPath, type, props);
        return;
      } else {
        renderFunctionComponent(request, task, keyPath, type, props);
        return;
      }
    }
    if (typeof type === 'string') {
      renderHostElement(request, task, keyPath, type, props);
      return;
    }
    switch (type) {
      // LegacyHidden acts the same as a fragment. This only works because we
      // currently assume that every instance of LegacyHidden is accompanied by a
      // host component wrapper. In the hidden mode, the host component is given a
      // `hidden` attribute, which ensures that the initial HTML is not visible.
      // To support the use of LegacyHidden as a true fragment, without an extra
      // DOM node, we would have to hide the initial HTML in some other way.
      // TODO: Delete in LegacyHidden. It's an unstable API only used in the
      // www build. As a migration step, we could add a special prop to Offscreen
      // that simulates the old behavior (no hiding, no change to effects).
      case REACT_LEGACY_HIDDEN_TYPE:
      case REACT_STRICT_MODE_TYPE:
      case REACT_PROFILER_TYPE:
      case REACT_FRAGMENT_TYPE:
        {
          const prevKeyPath = task.keyPath;
          task.keyPath = keyPath;
          renderNodeDestructive(request, task, props.children, -1);
          task.keyPath = prevKeyPath;
          return;
        }
      case REACT_ACTIVITY_TYPE:
        {
          renderActivity(request, task, keyPath, props);
          return;
        }
      case REACT_SUSPENSE_LIST_TYPE:
        {
          renderSuspenseList(request, task, keyPath, props);
          return;
        }
      case REACT_VIEW_TRANSITION_TYPE:
      case REACT_SCOPE_TYPE:
        {
          throw new Error('ReactDOMServer does not yet support scope components.');
        }
      case REACT_SUSPENSE_TYPE:
        {
          renderSuspenseBoundary(request, task, keyPath, props);
          return;
        }
    }
    if (typeof type === 'object' && type !== null) {
      switch (type.$$typeof) {
        case REACT_FORWARD_REF_TYPE:
          {
            renderForwardRef(request, task, keyPath, type, props, ref);
            return;
          }
        case REACT_MEMO_TYPE:
          {
            renderMemo(request, task, keyPath, type, props, ref);
            return;
          }
        case REACT_CONTEXT_TYPE:
          {
            const context = type;
            renderContextProvider(request, task, keyPath, context, props);
            return;
          }
        case REACT_CONSUMER_TYPE:
          {
            const context = type._context;
            renderContextConsumer(request, task, keyPath, context, props);
            return;
          }
        case REACT_LAZY_TYPE:
          {
            renderLazyComponent(request, task, keyPath, type, props, ref);
            return;
          }
      }
    }
    let info = '';
    {
      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
        info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and " + 'named imports.';
      }
    }
    throw new Error('Element type is invalid: expected a string (for built-in ' + 'components) or a class/function (for composite components) ' + ("but got: " + (type == null ? type : typeof type) + "." + info));
  }
  function resumeNode(request, task, segmentId, node, childIndex) {
    const prevReplay = task.replay;
    const blockedBoundary = task.blockedBoundary;
    const resumedSegment = createPendingSegment(request, 0, null, task.formatContext, false, false);
    resumedSegment.id = segmentId;
    resumedSegment.parentFlushed = true;
    try {
      // Convert the current ReplayTask to a RenderTask.
      const renderTask = task;
      renderTask.replay = null;
      renderTask.blockedSegment = resumedSegment;
      renderNode(request, task, node, childIndex);
      resumedSegment.status = COMPLETED;
      finishedSegment(request, blockedBoundary, resumedSegment);
      if (blockedBoundary === null) {
        request.completedRootSegment = resumedSegment;
      } else {
        queueCompletedSegment(blockedBoundary, resumedSegment);
        if (blockedBoundary.parentFlushed) {
          request.partialBoundaries.push(blockedBoundary);
        }
      }
    } finally {
      // Restore to a ReplayTask.
      task.replay = prevReplay;
      task.blockedSegment = null;
    }
  }
  function replayElement(request, task, keyPath, name, keyOrIndex, childIndex, type, props, ref, replay) {
    // We're replaying. Find the path to follow.
    const replayNodes = replay.nodes;
    for (let i = 0; i < replayNodes.length; i++) {
      // Flow doesn't support refinement on tuples so we do it manually here.
      const node = replayNodes[i];
      if (keyOrIndex !== node[1]) {
        continue;
      }
      if (node.length === 4) {
        // Matched a replayable path.
        // Let's double check that the component name matches as a precaution.
        if (name !== null && name !== node[0]) {
          throw new Error('Expected the resume to render <' + node[0] + '> in this slot but instead it rendered <' + name + '>. ' + "The tree doesn't match so React will fallback to client rendering.");
        }
        const childNodes = node[2];
        const childSlots = node[3];
        const currentNode = task.node;
        task.replay = {
          nodes: childNodes,
          slots: childSlots,
          pendingTasks: 1
        };
        try {
          renderElement(request, task, keyPath, type, props, ref);
          if (task.replay.pendingTasks === 1 && task.replay.nodes.length > 0
          // TODO check remaining slots
          ) {
            throw new Error("Couldn't find all resumable slots by key/index during replaying. " + "The tree doesn't match so React will fallback to client rendering.");
          }
          task.replay.pendingTasks--;
        } catch (x) {
          if (typeof x === 'object' && x !== null && (x === SuspenseException || typeof x.then === 'function')) {
            // Suspend
            if (task.node === currentNode) {
              // This same element suspended so we need to pop the replay we just added.
              task.replay = replay;
            } else {
              // We finished rendering this node, so now we can consume this slot.
              replayNodes.splice(i, 1);
            }
            throw x;
          }
          task.replay.pendingTasks--;
          // Unlike regular render, we don't terminate the siblings if we error
          // during a replay. That's because this component didn't actually error
          // in the original prerender. What's unable to complete is the child
          // replay nodes which might be Suspense boundaries which are able to
          // absorb the error and we can still continue with siblings.
          const thrownInfo = getThrownInfo(task.componentStack);
          erroredReplay(request, task.blockedBoundary, x, thrownInfo, childNodes, childSlots, task.debugTask );
        }
        task.replay = replay;
      } else {
        // Let's double check that the component type matches.
        if (type !== REACT_SUSPENSE_TYPE) {
          const expectedType = 'Suspense';
          throw new Error('Expected the resume to render <' + expectedType + '> in this slot but instead it rendered <' + (getComponentNameFromType(type) || 'Unknown') + '>. ' + "The tree doesn't match so React will fallback to client rendering.");
        }
        // Matched a replayable path.
        replaySuspenseBoundary(request, task, keyPath, props, node[5], node[2], node[3], node[4] === null ? [] : node[4][2], node[4] === null ? null : node[4][3]);
      }
      // We finished rendering this node, so now we can consume this
      // slot. This must happen after in case we rerender this task.
      replayNodes.splice(i, 1);
      return;
    }
    // We didn't find any matching nodes. We assume that this element was already
    // rendered in the prelude and skip it.
  }
  function validateIterable(task, iterable, childIndex, iterator, iteratorFn) {
    {
      if (iterator === iterable) {
        // We don't support rendering Generators as props because it's a mutation.
        // See https://github.com/facebook/react/issues/12995
        // We do support generators if they were created by a GeneratorFunction component
        // as its direct child since we can recreate those by rerendering the component
        // as needed.
        const isGeneratorComponent = childIndex === -1 &&
        // Only the root child is valid
        task.componentStack !== null && typeof task.componentStack.type === 'function' &&
        // FunctionComponent
        // $FlowFixMe[method-unbinding]
        Object.prototype.toString.call(task.componentStack.type) === '[object GeneratorFunction]' &&
        // $FlowFixMe[method-unbinding]
        Object.prototype.toString.call(iterator) === '[object Generator]';
        if (!isGeneratorComponent) {
          if (!didWarnAboutGenerators) {
            console.error('Using Iterators as children is unsupported and will likely yield ' + 'unexpected results because enumerating a generator mutates it. ' + 'You may convert it to an array with `Array.from()` or the ' + '`[...spread]` operator before rendering. You can also use an ' + 'Iterable that can iterate multiple times over the same items.');
          }
          didWarnAboutGenerators = true;
        }
      } else if (iterable.entries === iteratorFn) {
        // Warn about using Maps as children
        if (!didWarnAboutMaps) {
          console.error('Using Maps as children is not supported. ' + 'Use an array of keyed ReactElements instead.');
          didWarnAboutMaps = true;
        }
      }
    }
  }
  function warnOnFunctionType(invalidChild) {
    {
      const name = invalidChild.displayName || invalidChild.name || 'Component';
      console.error('Functions are not valid as a React child. This may happen if ' + 'you return %s instead of <%s /> from render. ' + 'Or maybe you meant to call this function rather than return it.', name, name);
    }
  }
  function warnOnSymbolType(invalidChild) {
    {
      // eslint-disable-next-line react-internal/safe-string-coercion
      const name = String(invalidChild);
      console.error('Symbols are not valid as a React child.\n' + '  %s', name);
    }
  }

  // This function by it self renders a node and consumes the task by mutating it
  // to update the current execution state.
  function renderNodeDestructive(request, task, node, childIndex) {
    if (task.replay !== null && typeof task.replay.slots === 'number') {
      // TODO: Figure out a cheaper place than this hot path to do this check.
      const resumeSegmentID = task.replay.slots;
      resumeNode(request, task, resumeSegmentID, node, childIndex);
      return;
    }
    // Stash the node we're working on. We'll pick up from this task in case
    // something suspends.
    task.node = node;
    task.childIndex = childIndex;
    const previousComponentStack = task.componentStack;
    const previousDebugTask = task.debugTask ;
    pushComponentStack(task);
    retryNode(request, task);
    task.componentStack = previousComponentStack;
    {
      task.debugTask = previousDebugTask;
    }
  }
  function retryNode(request, task) {
    const node = task.node;
    const childIndex = task.childIndex;
    if (node === null) {
      return;
    }

    // Handle object types
    if (typeof node === 'object') {
      switch (node.$$typeof) {
        case REACT_ELEMENT_TYPE:
          {
            const element = node;
            const type = element.type;
            const key = element.key;
            const props = element.props;

            // TODO: We should get the ref off the props object right before using
            // it.
            const refProp = props.ref;
            const ref = refProp !== undefined ? refProp : null;
            const debugTask = task.debugTask ;
            const name = getComponentNameFromType(type);
            const keyOrIndex = key == null ? childIndex === -1 ? 0 : childIndex : key;
            const keyPath = [task.keyPath, name, keyOrIndex];
            if (task.replay !== null) {
              if (debugTask) {
                debugTask.run(replayElement.bind(null, request, task, keyPath, name, keyOrIndex, childIndex, type, props, ref, task.replay));
              } else {
                replayElement(request, task, keyPath, name, keyOrIndex, childIndex, type, props, ref, task.replay);
              }
              // No matches found for this node. We assume it's already emitted in the
              // prelude and skip it during the replay.
            } else {
              // We're doing a plain render.
              if (debugTask) {
                debugTask.run(renderElement.bind(null, request, task, keyPath, type, props, ref));
              } else {
                renderElement(request, task, keyPath, type, props, ref);
              }
            }
            return;
          }
        case REACT_PORTAL_TYPE:
          throw new Error('Portals are not currently supported by the server renderer. ' + 'Render them conditionally so that they only appear on the client render.');
        case REACT_LAZY_TYPE:
          {
            const lazyNode = node;
            let resolvedNode;
            {
              resolvedNode = callLazyInitInDEV(lazyNode);
            }
            if (request.status === ABORTING) {
              // eslint-disable-next-line no-throw-literal
              throw null;
            }
            // Now we render the resolved node
            renderNodeDestructive(request, task, resolvedNode, childIndex);
            return;
          }
      }
      if (isArray(node)) {
        renderChildrenArray(request, task, node, childIndex);
        return;
      }
      const iteratorFn = getIteratorFn(node);
      if (iteratorFn) {
        const iterator = iteratorFn.call(node);
        if (iterator) {
          {
            validateIterable(task, node, childIndex, iterator, iteratorFn);
          }
          // We need to know how many total children are in this set, so that we
          // can allocate enough id slots to acommodate them. So we must exhaust
          // the iterator before we start recursively rendering the children.
          // TODO: This is not great but I think it's inherent to the id
          // generation algorithm.
          let step = iterator.next();
          if (!step.done) {
            const children = [];
            do {
              children.push(step.value);
              step = iterator.next();
            } while (!step.done);
            renderChildrenArray(request, task, children, childIndex);
          }
          return;
        }
      }

      // Usables are a valid React node type. When React encounters a Usable in
      // a child position, it unwraps it using the same algorithm as `use`. For
      // example, for promises, React will throw an exception to unwind the
      // stack, then replay the component once the promise resolves.
      //
      // A difference from `use` is that React will keep unwrapping the value
      // until it reaches a non-Usable type.
      //
      // e.g. Usable<Usable<Usable<T>>> should resolve to T
      const maybeUsable = node;
      if (typeof maybeUsable.then === 'function') {
        // Clear any previous thenable state that was created by the unwrapping.
        task.thenableState = null;
        const thenable = maybeUsable;
        const result = renderNodeDestructive(request, task, unwrapThenable(thenable), childIndex);
        return result;
      }
      if (maybeUsable.$$typeof === REACT_CONTEXT_TYPE) {
        const context = maybeUsable;
        return renderNodeDestructive(request, task, readContext$1(context), childIndex);
      }

      // $FlowFixMe[method-unbinding]
      const childString = Object.prototype.toString.call(node);
      throw new Error("Objects are not valid as a React child (found: " + (childString === '[object Object]' ? 'object with keys {' + Object.keys(node).join(', ') + '}' : childString) + "). " + 'If you meant to render a collection of children, use an array ' + 'instead.');
    }
    if (typeof node === 'string') {
      const segment = task.blockedSegment;
      if (segment === null) ; else {
        segment.lastPushedText = pushTextInstance(segment.chunks, node, request.renderState, segment.lastPushedText);
      }
      return;
    }
    if (typeof node === 'number' || typeof node === 'bigint') {
      const segment = task.blockedSegment;
      if (segment === null) ; else {
        segment.lastPushedText = pushTextInstance(segment.chunks, '' + node, request.renderState, segment.lastPushedText);
      }
      return;
    }
    {
      if (typeof node === 'function') {
        warnOnFunctionType(node);
      }
      if (typeof node === 'symbol') {
        warnOnSymbolType(node);
      }
    }
  }
  function replayFragment(request, task, children, childIndex) {
    // If we're supposed follow this array, we'd expect to see a ReplayNode matching
    // this fragment.
    const replay = task.replay;
    const replayNodes = replay.nodes;
    for (let j = 0; j < replayNodes.length; j++) {
      const node = replayNodes[j];
      if (node[1] !== childIndex) {
        continue;
      }
      // Matched a replayable path.
      const childNodes = node[2];
      const childSlots = node[3];
      task.replay = {
        nodes: childNodes,
        slots: childSlots,
        pendingTasks: 1
      };
      try {
        renderChildrenArray(request, task, children, -1);
        if (task.replay.pendingTasks === 1 && task.replay.nodes.length > 0) {
          throw new Error("Couldn't find all resumable slots by key/index during replaying. " + "The tree doesn't match so React will fallback to client rendering.");
        }
        task.replay.pendingTasks--;
      } catch (x) {
        if (typeof x === 'object' && x !== null && (x === SuspenseException || typeof x.then === 'function')) {
          // Suspend
          throw x;
        }
        task.replay.pendingTasks--;
        // Unlike regular render, we don't terminate the siblings if we error
        // during a replay. That's because this component didn't actually error
        // in the original prerender. What's unable to complete is the child
        // replay nodes which might be Suspense boundaries which are able to
        // absorb the error and we can still continue with siblings.
        // This is an error, stash the component stack if it is null.
        const thrownInfo = getThrownInfo(task.componentStack);
        erroredReplay(request, task.blockedBoundary, x, thrownInfo, childNodes, childSlots, task.debugTask );
      }
      task.replay = replay;
      // We finished rendering this node, so now we can consume this
      // slot. This must happen after in case we rerender this task.
      replayNodes.splice(j, 1);
      break;
    }
  }
  function warnForMissingKey(request, task, child) {
    {
      if (child === null || typeof child !== 'object' || child.$$typeof !== REACT_ELEMENT_TYPE && child.$$typeof !== REACT_PORTAL_TYPE) {
        return;
      }
      if (!child._store || (child._store.validated || child.key != null) && child._store.validated !== 2) {
        return;
      }
      if (typeof child._store !== 'object') {
        throw new Error('React Component in warnForMissingKey should have a _store. ' + 'This error is likely caused by a bug in React. Please file an issue.');
      }

      // $FlowFixMe[cannot-write] unable to narrow type from mixed to writable object
      child._store.validated = 1;
      let didWarnForKey = request.didWarnForKey;
      if (didWarnForKey == null) {
        didWarnForKey = request.didWarnForKey = new WeakSet();
      }
      const parentStackFrame = task.componentStack;
      if (parentStackFrame === null || didWarnForKey.has(parentStackFrame)) {
        // We already warned for other children in this parent.
        return;
      }
      didWarnForKey.add(parentStackFrame);
      const componentName = getComponentNameFromType(child.type);
      const childOwner = child._owner;
      const parentOwner = parentStackFrame.owner;
      let currentComponentErrorInfo = '';
      if (parentOwner && typeof parentOwner.type !== 'undefined') {
        const name = getComponentNameFromType(parentOwner.type);
        if (name) {
          currentComponentErrorInfo = '\n\nCheck the render method of `' + name + '`.';
        }
      }
      if (!currentComponentErrorInfo) {
        if (componentName) {
          currentComponentErrorInfo = "\n\nCheck the top-level render call using <" + componentName + ">.";
        }
      }

      // Usually the current owner is the offender, but if it accepts children as a
      // property, it may be the creator of the child that's responsible for
      // assigning it a key.
      let childOwnerAppendix = '';
      if (childOwner != null && parentOwner !== childOwner) {
        let ownerName = null;
        if (typeof childOwner.type !== 'undefined') {
          ownerName = getComponentNameFromType(childOwner.type);
        } else if (typeof childOwner.name === 'string') {
          ownerName = childOwner.name;
        }
        if (ownerName) {
          // Give the component that originally created this child.
          childOwnerAppendix = " It was passed a child from " + ownerName + ".";
        }
      }

      // We create a fake component stack for the child to log the stack trace from.
      const previousComponentStack = task.componentStack;
      const stackFrame = createComponentStackFromType(task.componentStack, child.type, child._owner, child._debugStack);
      task.componentStack = stackFrame;
      // react-19-enable error to warn
      console.warn('Each child in a list should have a unique "key" prop.' + '%s%s See https://react.dev/link/warning-keys for more information.', currentComponentErrorInfo, childOwnerAppendix);
      task.componentStack = previousComponentStack;
    }
  }
  function renderChildrenArray(request, task, children, childIndex) {
    const prevKeyPath = task.keyPath;
    const previousComponentStack = task.componentStack;
    let previousDebugTask = null;
    {
      previousDebugTask = task.debugTask;
      // We read debugInfo from task.node instead of children because it might have been an
      // unwrapped iterable so we read from the original node.
      pushServerComponentStack(task, task.node._debugInfo);
    }
    if (childIndex !== -1) {
      task.keyPath = [task.keyPath, 'Fragment', childIndex];
      if (task.replay !== null) {
        replayFragment(request,
        // $FlowFixMe: Refined.
        task, children, childIndex);
        task.keyPath = prevKeyPath;
        {
          task.componentStack = previousComponentStack;
          task.debugTask = previousDebugTask;
        }
        return;
      }
    }
    const prevTreeContext = task.treeContext;
    const totalChildren = children.length;
    if (task.replay !== null) {
      // Replay
      // First we need to check if we have any resume slots at this level.
      const resumeSlots = task.replay.slots;
      if (resumeSlots !== null && typeof resumeSlots === 'object') {
        for (let i = 0; i < totalChildren; i++) {
          const node = children[i];
          task.treeContext = pushTreeContext(prevTreeContext, totalChildren, i);
          // We need to use the non-destructive form so that we can safely pop back
          // up and render the sibling if something suspends.
          const resumeSegmentID = resumeSlots[i];
          // TODO: If this errors we should still continue with the next sibling.
          if (typeof resumeSegmentID === 'number') {
            resumeNode(request, task, resumeSegmentID, node, i);
            // We finished rendering this node, so now we can consume this
            // slot. This must happen after in case we rerender this task.
            delete resumeSlots[i];
          } else {
            renderNode(request, task, node, i);
          }
        }
        task.treeContext = prevTreeContext;
        task.keyPath = prevKeyPath;
        {
          task.componentStack = previousComponentStack;
          task.debugTask = previousDebugTask;
        }
        return;
      }
    }
    for (let i = 0; i < totalChildren; i++) {
      const node = children[i];
      {
        warnForMissingKey(request, task, node);
      }
      task.treeContext = pushTreeContext(prevTreeContext, totalChildren, i);
      // We need to use the non-destructive form so that we can safely pop back
      // up and render the sibling if something suspends.
      renderNode(request, task, node, i);
    }

    // Because this context is always set right before rendering every child, we
    // only need to reset it to the previous value at the very end.
    task.treeContext = prevTreeContext;
    task.keyPath = prevKeyPath;
    {
      task.componentStack = previousComponentStack;
      task.debugTask = previousDebugTask;
    }
  }
  function trackPostponedBoundary(request, trackedPostpones, boundary) {
    boundary.status = POSTPONED;
    // We need to eagerly assign it an ID because we'll need to refer to
    // it before flushing and we know that we can't inline it.
    boundary.rootSegmentID = request.nextSegmentId++;
    const boundaryKeyPath = boundary.trackedContentKeyPath;
    if (boundaryKeyPath === null) {
      throw new Error('It should not be possible to postpone at the root. This is a bug in React.');
    }
    const fallbackReplayNode = boundary.trackedFallbackNode;
    const children = [];
    const boundaryNode = trackedPostpones.workingMap.get(boundaryKeyPath);
    if (boundaryNode === undefined) {
      const suspenseBoundary = [boundaryKeyPath[1], boundaryKeyPath[2], children, null, fallbackReplayNode, boundary.rootSegmentID];
      trackedPostpones.workingMap.set(boundaryKeyPath, suspenseBoundary);
      addToReplayParent(suspenseBoundary, boundaryKeyPath[0], trackedPostpones);
      return suspenseBoundary;
    } else {
      // Upgrade to ReplaySuspenseBoundary.
      const suspenseBoundary = boundaryNode;
      suspenseBoundary[4] = fallbackReplayNode;
      suspenseBoundary[5] = boundary.rootSegmentID;
      return suspenseBoundary;
    }
  }
  function trackPostpone(request, trackedPostpones, task, segment) {
    segment.status = POSTPONED;
    const keyPath = task.keyPath;
    const boundary = task.blockedBoundary;
    if (boundary === null) {
      segment.id = request.nextSegmentId++;
      trackedPostpones.rootSlots = segment.id;
      if (request.completedRootSegment !== null) {
        // Postpone the root if this was a deeper segment.
        request.completedRootSegment.status = POSTPONED;
      }
      return;
    }
    if (boundary !== null && boundary.status === PENDING) {
      const boundaryNode = trackPostponedBoundary(request, trackedPostpones, boundary);
      if (boundary.trackedContentKeyPath === keyPath && task.childIndex === -1) {
        // Assign ID
        if (segment.id === -1) {
          if (segment.parentFlushed) {
            // If this segment's parent was already flushed, it means we really just
            // skipped the parent and this segment is now the root.
            segment.id = boundary.rootSegmentID;
          } else {
            segment.id = request.nextSegmentId++;
          }
        }
        // We postponed directly inside the Suspense boundary so we mark this for resuming.
        boundaryNode[3] = segment.id;
        return;
      }
      // Otherwise, fall through to add the child node.
    }

    // We know that this will leave a hole so we might as well assign an ID now.
    // We might have one already if we had a parent that gave us its ID.
    if (segment.id === -1) {
      if (segment.parentFlushed && boundary !== null) {
        // If this segment's parent was already flushed, it means we really just
        // skipped the parent and this segment is now the root.
        segment.id = boundary.rootSegmentID;
      } else {
        segment.id = request.nextSegmentId++;
      }
    }
    if (task.childIndex === -1) {
      // Resume starting from directly inside the previous parent element.
      if (keyPath === null) {
        trackedPostpones.rootSlots = segment.id;
      } else {
        const workingMap = trackedPostpones.workingMap;
        let resumableNode = workingMap.get(keyPath);
        if (resumableNode === undefined) {
          resumableNode = [keyPath[1], keyPath[2], [], segment.id];
          addToReplayParent(resumableNode, keyPath[0], trackedPostpones);
        } else {
          resumableNode[3] = segment.id;
        }
      }
    } else {
      let slots;
      if (keyPath === null) {
        slots = trackedPostpones.rootSlots;
        if (slots === null) {
          slots = trackedPostpones.rootSlots = {};
        } else if (typeof slots === 'number') {
          throw new Error('It should not be possible to postpone both at the root of an element ' + 'as well as a slot below. This is a bug in React.');
        }
      } else {
        const workingMap = trackedPostpones.workingMap;
        let resumableNode = workingMap.get(keyPath);
        if (resumableNode === undefined) {
          slots = {};
          resumableNode = [keyPath[1], keyPath[2], [], slots];
          workingMap.set(keyPath, resumableNode);
          addToReplayParent(resumableNode, keyPath[0], trackedPostpones);
        } else {
          slots = resumableNode[3];
          if (slots === null) {
            slots = resumableNode[3] = {};
          } else if (typeof slots === 'number') {
            throw new Error('It should not be possible to postpone both at the root of an element ' + 'as well as a slot below. This is a bug in React.');
          }
        }
      }
      slots[task.childIndex] = segment.id;
    }
  }

  // In case a boundary errors, we need to stop tracking it because we won't
  // resume it.
  function untrackBoundary(request, boundary) {
    const trackedPostpones = request.trackedPostpones;
    if (trackedPostpones === null) {
      return;
    }
    const boundaryKeyPath = boundary.trackedContentKeyPath;
    if (boundaryKeyPath === null) {
      return;
    }
    const boundaryNode = trackedPostpones.workingMap.get(boundaryKeyPath);
    if (boundaryNode === undefined) {
      return;
    }

    // Downgrade to plain ReplayNode since we won't replay through it.
    // $FlowFixMe[cannot-write]: We intentionally downgrade this to the other tuple.
    boundaryNode.length = 4;
    // Remove any resumable slots.
    boundaryNode[2] = [];
    boundaryNode[3] = null;

    // TODO: We should really just remove the boundary from all parent paths too so
    // we don't replay the path to it.
  }
  function spawnNewSuspendedReplayTask(request, task, thenableState) {
    return createReplayTask(request, thenableState, task.replay, task.node, task.childIndex, task.blockedBoundary, task.hoistableState, task.abortSet, task.keyPath, task.formatContext, task.context, task.treeContext, task.row, task.componentStack, emptyContextObject, task.debugTask );
  }
  function spawnNewSuspendedRenderTask(request, task, thenableState) {
    // Something suspended, we'll need to create a new segment and resolve it later.
    const segment = task.blockedSegment;
    const insertionIndex = segment.chunks.length;
    const newSegment = createPendingSegment(request, insertionIndex, null, task.formatContext,
    // Adopt the parent segment's leading text embed
    segment.lastPushedText,
    // Assume we are text embedded at the trailing edge
    true);
    segment.children.push(newSegment);
    // Reset lastPushedText for current Segment since the new Segment "consumed" it
    segment.lastPushedText = false;
    return createRenderTask(request, thenableState, task.node, task.childIndex, task.blockedBoundary, newSegment, task.blockedPreamble, task.hoistableState, task.abortSet, task.keyPath, task.formatContext, task.context, task.treeContext, task.row, task.componentStack, emptyContextObject, task.debugTask );
  }

  // This is a non-destructive form of rendering a node. If it suspends it spawns
  // a new task and restores the context of this task to what it was before.
  function renderNode(request, task, node, childIndex) {
    // Snapshot the current context in case something throws to interrupt the
    // process.
    const previousFormatContext = task.formatContext;
    const previousContext = task.context;
    const previousKeyPath = task.keyPath;
    const previousTreeContext = task.treeContext;
    const previousComponentStack = task.componentStack;
    const previousDebugTask = task.debugTask ;
    let x;
    // Store how much we've pushed at this point so we can reset it in case something
    // suspended partially through writing something.
    const segment = task.blockedSegment;
    if (segment === null) {
      // Replay
      task = task; // Refined
      const previousReplaySet = task.replay;
      try {
        return renderNodeDestructive(request, task, node, childIndex);
      } catch (thrownValue) {
        resetHooksState();
        x = thrownValue === SuspenseException ?
        // This is a special type of exception used for Suspense. For historical
        // reasons, the rest of the Suspense implementation expects the thrown
        // value to be a thenable, because before `use` existed that was the
        // (unstable) API for suspending. This implementation detail can change
        // later, once we deprecate the old API in favor of `use`.
        getSuspendedThenable() : thrownValue;
        if (request.status === ABORTING) ; else if (typeof x === 'object' && x !== null) {
          // $FlowFixMe[method-unbinding]
          if (typeof x.then === 'function') {
            const wakeable = x;
            const thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
            const newTask = spawnNewSuspendedReplayTask(request,
            // $FlowFixMe: Refined.
            task, thenableState);
            const ping = newTask.ping;
            wakeable.then(ping, ping);

            // Restore the context. We assume that this will be restored by the inner
            // functions in case nothing throws so we don't use "finally" here.
            task.formatContext = previousFormatContext;
            task.context = previousContext;
            task.keyPath = previousKeyPath;
            task.treeContext = previousTreeContext;
            task.componentStack = previousComponentStack;
            task.replay = previousReplaySet;
            {
              task.debugTask = previousDebugTask;
            }
            // Restore all active ReactContexts to what they were before.
            switchContext(previousContext);
            return;
          }
          if (x.message === 'Maximum call stack size exceeded') {
            // This was a stack overflow. We do a lot of recursion in React by default for
            // performance but it can lead to stack overflows in extremely deep trees.
            // We do have the ability to create a trampoile if this happens which makes
            // this kind of zero-cost.
            const thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
            const newTask = spawnNewSuspendedReplayTask(request,
            // $FlowFixMe: Refined.
            task, thenableState);

            // Immediately schedule the task for retrying.
            request.pingedTasks.push(newTask);

            // Restore the context. We assume that this will be restored by the inner
            // functions in case nothing throws so we don't use "finally" here.
            task.formatContext = previousFormatContext;
            task.context = previousContext;
            task.keyPath = previousKeyPath;
            task.treeContext = previousTreeContext;
            task.componentStack = previousComponentStack;
            task.replay = previousReplaySet;
            {
              task.debugTask = previousDebugTask;
            }
            // Restore all active ReactContexts to what they were before.
            switchContext(previousContext);
            return;
          }
        }

        // TODO: Abort any undiscovered Suspense boundaries in the ReplayNode.
      }
    } else {
      // Render
      const childrenLength = segment.children.length;
      const chunkLength = segment.chunks.length;
      try {
        return renderNodeDestructive(request, task, node, childIndex);
      } catch (thrownValue) {
        resetHooksState();

        // Reset the write pointers to where we started.
        segment.children.length = childrenLength;
        segment.chunks.length = chunkLength;
        x = thrownValue === SuspenseException ?
        // This is a special type of exception used for Suspense. For historical
        // reasons, the rest of the Suspense implementation expects the thrown
        // value to be a thenable, because before `use` existed that was the
        // (unstable) API for suspending. This implementation detail can change
        // later, once we deprecate the old API in favor of `use`.
        getSuspendedThenable() : thrownValue;
        if (request.status === ABORTING) ; else if (typeof x === 'object' && x !== null) {
          // $FlowFixMe[method-unbinding]
          if (typeof x.then === 'function') {
            const wakeable = x;
            const thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
            const newTask = spawnNewSuspendedRenderTask(request,
            // $FlowFixMe: Refined.
            task, thenableState);
            const ping = newTask.ping;
            wakeable.then(ping, ping);

            // Restore the context. We assume that this will be restored by the inner
            // functions in case nothing throws so we don't use "finally" here.
            task.formatContext = previousFormatContext;
            task.context = previousContext;
            task.keyPath = previousKeyPath;
            task.treeContext = previousTreeContext;
            task.componentStack = previousComponentStack;
            {
              task.debugTask = previousDebugTask;
            }
            // Restore all active ReactContexts to what they were before.
            switchContext(previousContext);
            return;
          }
          if (x.message === 'Maximum call stack size exceeded') {
            // This was a stack overflow. We do a lot of recursion in React by default for
            // performance but it can lead to stack overflows in extremely deep trees.
            // We do have the ability to create a trampoile if this happens which makes
            // this kind of zero-cost.
            const thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
            const newTask = spawnNewSuspendedRenderTask(request,
            // $FlowFixMe: Refined.
            task, thenableState);

            // Immediately schedule the task for retrying.
            request.pingedTasks.push(newTask);

            // Restore the context. We assume that this will be restored by the inner
            // functions in case nothing throws so we don't use "finally" here.
            task.formatContext = previousFormatContext;
            task.context = previousContext;
            task.keyPath = previousKeyPath;
            task.treeContext = previousTreeContext;
            task.componentStack = previousComponentStack;
            {
              task.debugTask = previousDebugTask;
            }
            // Restore all active ReactContexts to what they were before.
            switchContext(previousContext);
            return;
          }
        }
      }
    }

    // Restore the context. We assume that this will be restored by the inner
    // functions in case nothing throws so we don't use "finally" here.
    task.formatContext = previousFormatContext;
    task.context = previousContext;
    task.keyPath = previousKeyPath;
    task.treeContext = previousTreeContext;
    // We intentionally do not restore the component stack on the error pathway
    // Whatever handles the error needs to use this stack which is the location of the
    // error. We must restore the stack wherever we handle this

    // Restore all active ReactContexts to what they were before.
    switchContext(previousContext);
    throw x;
  }
  function erroredReplay(request, boundary, error, errorInfo, replayNodes, resumeSlots, debugTask) {
    // Erroring during a replay doesn't actually cause an error by itself because
    // that component has already rendered. What causes the error is the resumable
    // points that we did not yet finish which will be below the point of the reset.
    // For example, if we're replaying a path to a Suspense boundary that is not done
    // that doesn't error the parent Suspense boundary.
    // This might be a bit strange that the error in a parent gets thrown at a child.
    // We log it only once and reuse the digest.
    let errorDigest;
    {
      errorDigest = logRecoverableError(request, error, errorInfo, debugTask);
    }
    abortRemainingReplayNodes(request, boundary, replayNodes, resumeSlots, error, errorDigest, errorInfo, false);
  }
  function erroredTask(request, boundary, row, error, errorInfo, debugTask) {
    if (row !== null) {
      if (--row.pendingTasks === 0) {
        finishSuspenseListRow(request, row);
      }
    }
    request.allPendingTasks--;

    // Report the error to a global handler.
    let errorDigest;
    // We don't handle halts here because we only halt when prerendering and
    // when prerendering we should be finishing tasks not erroring them when
    // they halt or postpone
    {
      errorDigest = logRecoverableError(request, error, errorInfo, debugTask);
    }
    if (boundary === null) {
      fatalError(request, error, errorInfo, debugTask);
    } else {
      boundary.pendingTasks--;
      if (boundary.status !== CLIENT_RENDERED) {
        boundary.status = CLIENT_RENDERED;
        encodeErrorForBoundary(boundary, errorDigest, error, errorInfo, false);
        untrackBoundary(request, boundary);
        const boundaryRow = boundary.row;
        if (boundaryRow !== null) {
          // Unblock the SuspenseListRow that was blocked by this boundary.
          if (--boundaryRow.pendingTasks === 0) {
            finishSuspenseListRow(request, boundaryRow);
          }
        }

        // Regardless of what happens next, this boundary won't be displayed,
        // so we can flush it, if the parent already flushed.
        if (boundary.parentFlushed) {
          // We don't have a preference where in the queue this goes since it's likely
          // to error on the client anyway. However, intentionally client-rendered
          // boundaries should be flushed earlier so that they can start on the client.
          // We reuse the same queue for errors.
          request.clientRenderedBoundaries.push(boundary);
        }
        if (request.pendingRootTasks === 0 && request.trackedPostpones === null && boundary.contentPreamble !== null) {
          // The root is complete and this boundary may contribute part of the preamble.
          // We eagerly attempt to prepare the preamble here because we expect most requests
          // to have few boundaries which contribute preambles and it allow us to do this
          // preparation work during the work phase rather than the when flushing.
          preparePreamble(request);
        }
      }
    }
    if (request.allPendingTasks === 0) {
      completeAll(request);
    }
  }
  function abortTaskSoft(task) {
    // This aborts task without aborting the parent boundary that it blocks.
    // It's used for when we didn't need this task to complete the tree.
    // If task was needed, then it should use abortTask instead.
    const request = this;
    const boundary = task.blockedBoundary;
    const segment = task.blockedSegment;
    if (segment !== null) {
      segment.status = ABORTED;
      finishedTask(request, boundary, task.row, segment);
    }
  }
  function abortRemainingSuspenseBoundary(request, rootSegmentID, error, errorDigest, errorInfo, wasAborted) {
    const resumedBoundary = createSuspenseBoundary(request, null, new Set(), null, null);
    resumedBoundary.parentFlushed = true;
    // We restore the same id of this boundary as was used during prerender.
    resumedBoundary.rootSegmentID = rootSegmentID;
    resumedBoundary.status = CLIENT_RENDERED;
    encodeErrorForBoundary(resumedBoundary, errorDigest, error, errorInfo, wasAborted);
    if (resumedBoundary.parentFlushed) {
      request.clientRenderedBoundaries.push(resumedBoundary);
    }
  }
  function abortRemainingReplayNodes(request, boundary, nodes, slots, error, errorDigest, errorInfo, aborted) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.length === 4) {
        abortRemainingReplayNodes(request, boundary, node[2], node[3], error, errorDigest, errorInfo, aborted);
      } else {
        const boundaryNode = node;
        const rootSegmentID = boundaryNode[5];
        abortRemainingSuspenseBoundary(request, rootSegmentID, error, errorDigest, errorInfo, aborted);
      }
    }
    // Empty the set, since we've cleared it now.
    nodes.length = 0;
    if (slots !== null) {
      // We had something still to resume in the parent boundary. We must trigger
      // the error on the parent boundary since it's not able to complete.
      if (boundary === null) {
        throw new Error('We should not have any resumable nodes in the shell. ' + 'This is a bug in React.');
      } else if (boundary.status !== CLIENT_RENDERED) {
        boundary.status = CLIENT_RENDERED;
        encodeErrorForBoundary(boundary, errorDigest, error, errorInfo, aborted);
        if (boundary.parentFlushed) {
          request.clientRenderedBoundaries.push(boundary);
        }
      }
      // Empty the set
      if (typeof slots === 'object') {
        for (const index in slots) {
          delete slots[index];
        }
      }
    }
  }
  function abortTask(task, request, error) {
    // This aborts the task and aborts the parent that it blocks, putting it into
    // client rendered mode.
    const boundary = task.blockedBoundary;
    const segment = task.blockedSegment;
    if (segment !== null) {
      if (segment.status === RENDERING) {
        // This is the a currently rendering Segment. The render itself will
        // abort the task.
        return;
      }
      segment.status = ABORTED;
    }
    const errorInfo = getThrownInfo(task.componentStack);
    {
      // If the task is not rendering, then this is an async abort. Conceptually it's as if
      // the abort happened inside the async gap. The abort reason's stack frame won't have that
      // on the stack so instead we use the owner stack and debug task of any halted async debug info.
      const node = task.node;
      if (node !== null && typeof node === 'object') {
        // Push a fake component stack frame that represents the await.
        pushHaltedAwaitOnComponentStack(task, node._debugInfo);
        /*
        if (task.thenableState !== null) {
          // TODO: If we were stalled inside use() of a Client Component then we should
          // rerender to get the stack trace from the use() call.
        }
        */
      }
    }
    if (boundary === null) {
      if (request.status !== CLOSING && request.status !== CLOSED) {
        const replay = task.replay;
        if (replay === null) {
          // We didn't complete the root so we have nothing to show. We can close
          // the request;
          if (request.trackedPostpones !== null && segment !== null) {
            const trackedPostpones = request.trackedPostpones;
            // We are aborting a prerender and must treat the shell as halted
            // We log the error but we still resolve the prerender
            logRecoverableError(request, error, errorInfo, task.debugTask);
            trackPostpone(request, trackedPostpones, task, segment);
            finishedTask(request, null, task.row, segment);
          } else {
            logRecoverableError(request, error, errorInfo, task.debugTask);
            fatalError(request, error, errorInfo, task.debugTask);
          }
          return;
        } else {
          // If the shell aborts during a replay, that's not a fatal error. Instead
          // we should be able to recover by client rendering all the root boundaries in
          // the ReplaySet.
          replay.pendingTasks--;
          if (replay.pendingTasks === 0 && replay.nodes.length > 0) {
            let errorDigest;
            {
              errorDigest = logRecoverableError(request, error, errorInfo, null);
            }
            abortRemainingReplayNodes(request, null, replay.nodes, replay.slots, error, errorDigest, errorInfo, true);
          }
          request.pendingRootTasks--;
          if (request.pendingRootTasks === 0) {
            completeShell(request);
          }
        }
      }
    } else {
      // We construct an errorInfo from the boundary's componentStack so the error in dev will indicate which
      // boundary the message is referring to
      const trackedPostpones = request.trackedPostpones;
      if (boundary.status !== CLIENT_RENDERED) {
        {
          if (trackedPostpones !== null && segment !== null) {
            // We are aborting a prerender
            {
              // We are aborting a prerender and must halt this boundary.
              // We treat this like other postpones during prerendering
              logRecoverableError(request, error, errorInfo, task.debugTask);
            }
            trackPostpone(request, trackedPostpones, task, segment);
            // If this boundary was still pending then we haven't already cancelled its fallbacks.
            // We'll need to abort the fallbacks, which will also error that parent boundary.
            boundary.fallbackAbortableTasks.forEach(fallbackTask => abortTask(fallbackTask, request, error));
            boundary.fallbackAbortableTasks.clear();
            return finishedTask(request, boundary, task.row, segment);
          }
        }
        boundary.status = CLIENT_RENDERED;
        // We are aborting a render or resume which should put boundaries
        // into an explicitly client rendered state
        let errorDigest;
        {
          errorDigest = logRecoverableError(request, error, errorInfo, task.debugTask);
        }
        boundary.status = CLIENT_RENDERED;
        encodeErrorForBoundary(boundary, errorDigest, error, errorInfo, true);
        untrackBoundary(request, boundary);
        if (boundary.parentFlushed) {
          request.clientRenderedBoundaries.push(boundary);
        }
      }
      boundary.pendingTasks--;
      const boundaryRow = boundary.row;
      if (boundaryRow !== null) {
        // Unblock the SuspenseListRow that was blocked by this boundary.
        if (--boundaryRow.pendingTasks === 0) {
          finishSuspenseListRow(request, boundaryRow);
        }
      }

      // If this boundary was still pending then we haven't already cancelled its fallbacks.
      // We'll need to abort the fallbacks, which will also error that parent boundary.
      boundary.fallbackAbortableTasks.forEach(fallbackTask => abortTask(fallbackTask, request, error));
      boundary.fallbackAbortableTasks.clear();
    }
    const row = task.row;
    if (row !== null) {
      if (--row.pendingTasks === 0) {
        finishSuspenseListRow(request, row);
      }
    }
    request.allPendingTasks--;
    if (request.allPendingTasks === 0) {
      completeAll(request);
    }
  }
  function abortTaskDEV(task, request, error) {
    {
      const prevTaskInDEV = currentTaskInDEV;
      const prevGetCurrentStackImpl = ReactSharedInternals.getCurrentStack;
      setCurrentTaskInDEV(task);
      ReactSharedInternals.getCurrentStack = getCurrentStackInDEV;
      try {
        abortTask(task, request, error);
      } finally {
        setCurrentTaskInDEV(prevTaskInDEV);
        ReactSharedInternals.getCurrentStack = prevGetCurrentStackImpl;
      }
    }
  }
  function safelyEmitEarlyPreloads(request, shellComplete) {
    try {
      emitEarlyPreloads(request.renderState, request.resumableState, shellComplete);
    } catch (error) {
      // We assume preloads are optimistic and thus non-fatal if errored.
      const errorInfo = {};
      logRecoverableError(request, error, errorInfo, null);
    }
  }

  // I extracted this function out because we want to ensure we consistently emit preloads before
  // transitioning to the next request stage and this transition can happen in multiple places in this
  // implementation.
  function completeShell(request) {
    if (request.trackedPostpones === null) {
      // We only emit early preloads on shell completion for renders. For prerenders
      // we wait for the entire Request to finish because we are not responding to a
      // live request and can wait for as much data as possible.

      // we should only be calling completeShell when the shell is complete so we
      // just use a literal here
      const shellComplete = true;
      safelyEmitEarlyPreloads(request, shellComplete);
    }
    if (request.trackedPostpones === null) {
      // When the shell is complete it will be possible to flush. We attempt to prepre
      // the Preamble here in case it is ready for flushing.
      // We exclude prerenders because these cannot flush until after completeAll has been called
      preparePreamble(request);
    }

    // We have completed the shell so the shell can't error anymore.
    request.onShellError = noop;
    const onShellReady = request.onShellReady;
    onShellReady();
  }

  // I extracted this function out because we want to ensure we consistently emit preloads before
  // transitioning to the next request stage and this transition can happen in multiple places in this
  // implementation.
  function completeAll(request) {
    // During a render the shell must be complete if the entire request is finished
    // however during a Prerender it is possible that the shell is incomplete because
    // it postponed. We cannot use rootPendingTasks in the prerender case because
    // those hit zero even when the shell postpones. Instead we look at the completedRootSegment
    const shellComplete = request.trackedPostpones === null ?
    // Render, we assume it is completed
    true :
    // Prerender Request, we use the state of the root segment
    request.completedRootSegment === null || request.completedRootSegment.status !== POSTPONED;
    safelyEmitEarlyPreloads(request, shellComplete);

    // When the shell is complete it will be possible to flush. We attempt to prepre
    // the Preamble here in case it is ready for flushing
    preparePreamble(request);
    const onAllReady = request.onAllReady;
    onAllReady();
  }
  function queueCompletedSegment(boundary, segment) {
    if (segment.chunks.length === 0 && segment.children.length === 1 && segment.children[0].boundary === null && segment.children[0].id === -1) {
      // This is an empty segment. There's nothing to write, so we can instead transfer the ID
      // to the child. That way any existing references point to the child.
      const childSegment = segment.children[0];
      childSegment.id = segment.id;
      childSegment.parentFlushed = true;
      if (childSegment.status === COMPLETED || childSegment.status === ABORTED || childSegment.status === ERRORED) {
        queueCompletedSegment(boundary, childSegment);
      }
    } else {
      const completedSegments = boundary.completedSegments;
      completedSegments.push(segment);
    }
  }
  function finishedSegment(request, boundary, segment) {
    if (byteLengthOfChunk !== null) {
      // Count the bytes of all the chunks of this segment.
      const chunks = segment.chunks;
      let segmentByteSize = 0;
      for (let i = 0; i < chunks.length; i++) {
        segmentByteSize += byteLengthOfChunk(chunks[i]);
      }
      // Accumulate on the parent boundary to power heuristics.
      if (boundary === null) {
        request.byteSize += segmentByteSize;
      } else {
        boundary.byteSize += segmentByteSize;
      }
    }
  }
  function finishedTask(request, boundary, row, segment) {
    if (row !== null) {
      if (--row.pendingTasks === 0) {
        finishSuspenseListRow(request, row);
      } else if (row.together) {
        tryToResolveTogetherRow(request, row);
      }
    }
    request.allPendingTasks--;
    if (boundary === null) {
      if (segment !== null && segment.parentFlushed) {
        if (request.completedRootSegment !== null) {
          throw new Error('There can only be one root segment. This is a bug in React.');
        }
        request.completedRootSegment = segment;
      }
      request.pendingRootTasks--;
      if (request.pendingRootTasks === 0) {
        completeShell(request);
      }
    } else {
      boundary.pendingTasks--;
      if (boundary.status === CLIENT_RENDERED) ; else if (boundary.pendingTasks === 0) {
        if (boundary.status === PENDING) {
          boundary.status = COMPLETED;
        }
        // This must have been the last segment we were waiting on. This boundary is now complete.
        if (segment !== null && segment.parentFlushed) {
          // Our parent segment already flushed, so we need to schedule this segment to be emitted.
          // If it is a segment that was aborted, we'll write other content instead so we don't need
          // to emit it.
          if (segment.status === COMPLETED || segment.status === ABORTED) {
            queueCompletedSegment(boundary, segment);
          }
        }
        if (boundary.parentFlushed) {
          // The segment might be part of a segment that didn't flush yet, but if the boundary's
          // parent flushed, we need to schedule the boundary to be emitted.
          request.completedBoundaries.push(boundary);
        }

        // We can now cancel any pending task on the fallback since we won't need to show it anymore.
        // This needs to happen after we read the parentFlushed flags because aborting can finish
        // work which can trigger user code, which can start flushing, which can change those flags.
        // If the boundary was POSTPONED, we still need to finish the fallback first.
        // If the boundary is eligible to be outlined during flushing we can't cancel the fallback
        // since we might need it when it's being outlined.
        if (boundary.status === COMPLETED) {
          const boundaryRow = boundary.row;
          if (boundaryRow !== null) {
            // Hoist the HoistableState from the boundary to the row so that the next rows
            // can depend on the same dependencies.
            hoistHoistables(boundaryRow.hoistables, boundary.contentState);
          }
          if (!isEligibleForOutlining(request, boundary)) {
            boundary.fallbackAbortableTasks.forEach(abortTaskSoft, request);
            boundary.fallbackAbortableTasks.clear();
            if (boundaryRow !== null) {
              // If we aren't eligible for outlining, we don't have to wait until we flush it.
              if (--boundaryRow.pendingTasks === 0) {
                finishSuspenseListRow(request, boundaryRow);
              }
            }
          }
          if (request.pendingRootTasks === 0 && request.trackedPostpones === null && boundary.contentPreamble !== null) {
            // The root is complete and this boundary may contribute part of the preamble.
            // We eagerly attempt to prepare the preamble here because we expect most requests
            // to have few boundaries which contribute preambles and it allow us to do this
            // preparation work during the work phase rather than the when flushing.
            preparePreamble(request);
          }
        } else if (boundary.status === POSTPONED) {
          const boundaryRow = boundary.row;
          if (boundaryRow !== null) {
            if (request.trackedPostpones !== null) {
              // If this boundary is postponed, then we need to also postpone any blocked boundaries
              // in the next row.
              trackPostponedSuspenseListRow(request, request.trackedPostpones, boundaryRow.next);
            }
            if (--boundaryRow.pendingTasks === 0) {
              // This is really unnecessary since we've already postponed the boundaries but
              // for pairity with other track+finish paths. We might end up using the hoisting.
              finishSuspenseListRow(request, boundaryRow);
            }
          }
        }
      } else {
        if (segment !== null && segment.parentFlushed) {
          // Our parent already flushed, so we need to schedule this segment to be emitted.
          // If it is a segment that was aborted, we'll write other content instead so we don't need
          // to emit it.
          if (segment.status === COMPLETED || segment.status === ABORTED) {
            queueCompletedSegment(boundary, segment);
            const completedSegments = boundary.completedSegments;
            if (completedSegments.length === 1) {
              // This is the first time since we last flushed that we completed anything.
              // We can schedule this boundary to emit its partially completed segments early
              // in case the parent has already been flushed.
              if (boundary.parentFlushed) {
                request.partialBoundaries.push(boundary);
              }
            }
          }
        }
        const boundaryRow = boundary.row;
        if (boundaryRow !== null && boundaryRow.together) {
          tryToResolveTogetherRow(request, boundaryRow);
        }
      }
    }
    if (request.allPendingTasks === 0) {
      completeAll(request);
    }
  }
  function retryTask(request, task) {
    const segment = task.blockedSegment;
    if (segment === null) {
      retryReplayTask(request,
      // $FlowFixMe: Refined.
      task);
    } else {
      retryRenderTask(request,
      // $FlowFixMe: Refined.
      task, segment);
    }
  }
  function retryRenderTask(request, task, segment) {
    if (segment.status !== PENDING) {
      // We completed this by other means before we had a chance to retry it.
      return;
    }

    // We track when a Segment is rendering so we can handle aborts while rendering
    segment.status = RENDERING;

    // We restore the context to what it was when we suspended.
    // We don't restore it after we leave because it's likely that we'll end up
    // needing a very similar context soon again.
    switchContext(task.context);
    let prevTaskInDEV = null;
    {
      prevTaskInDEV = currentTaskInDEV;
      setCurrentTaskInDEV(task);
    }
    const childrenLength = segment.children.length;
    const chunkLength = segment.chunks.length;
    try {
      // We call the destructive form that mutates this task. That way if something
      // suspends again, we can reuse the same task instead of spawning a new one.

      retryNode(request, task);
      pushSegmentFinale(segment.chunks, request.renderState, segment.lastPushedText, segment.textEmbedded);
      task.abortSet.delete(task);
      segment.status = COMPLETED;
      finishedSegment(request, task.blockedBoundary, segment);
      finishedTask(request, task.blockedBoundary, task.row, segment);
    } catch (thrownValue) {
      resetHooksState();

      // Reset the write pointers to where we started.
      segment.children.length = childrenLength;
      segment.chunks.length = chunkLength;
      const x = thrownValue === SuspenseException ?
      // This is a special type of exception used for Suspense. For historical
      // reasons, the rest of the Suspense implementation expects the thrown
      // value to be a thenable, because before `use` existed that was the
      // (unstable) API for suspending. This implementation detail can change
      // later, once we deprecate the old API in favor of `use`.
      getSuspendedThenable() : request.status === ABORTING ? request.fatalError : thrownValue;
      if (request.status === ABORTING && request.trackedPostpones !== null) {
        // We are aborting a prerender and need to halt this task.
        const trackedPostpones = request.trackedPostpones;
        const thrownInfo = getThrownInfo(task.componentStack);
        task.abortSet.delete(task);
        {
          logRecoverableError(request, x, thrownInfo, task.debugTask );
        }
        trackPostpone(request, trackedPostpones, task, segment);
        finishedTask(request, task.blockedBoundary, task.row, segment);
        return;
      }
      if (typeof x === 'object' && x !== null) {
        // $FlowFixMe[method-unbinding]
        if (typeof x.then === 'function') {
          // Something suspended again, let's pick it back up later.
          segment.status = PENDING;
          task.thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
          const ping = task.ping;
          // We've asserted that x is a thenable above
          x.then(ping, ping);
          return;
        }
      }
      const errorInfo = getThrownInfo(task.componentStack);
      task.abortSet.delete(task);
      segment.status = ERRORED;
      erroredTask(request, task.blockedBoundary, task.row, x, errorInfo, task.debugTask );
      return;
    } finally {
      {
        setCurrentTaskInDEV(prevTaskInDEV);
      }
    }
  }
  function retryReplayTask(request, task) {
    if (task.replay.pendingTasks === 0) {
      // There are no pending tasks working on this set, so we must have aborted.
      return;
    }

    // We restore the context to what it was when we suspended.
    // We don't restore it after we leave because it's likely that we'll end up
    // needing a very similar context soon again.
    switchContext(task.context);
    let prevTaskInDEV = null;
    {
      prevTaskInDEV = currentTaskInDEV;
      setCurrentTaskInDEV(task);
    }
    try {
      // We call the destructive form that mutates this task. That way if something
      // suspends again, we can reuse the same task instead of spawning a new one.
      if (typeof task.replay.slots === 'number') {
        const resumeSegmentID = task.replay.slots;
        resumeNode(request, task, resumeSegmentID, task.node, task.childIndex);
      } else {
        retryNode(request, task);
      }
      if (task.replay.pendingTasks === 1 && task.replay.nodes.length > 0) {
        throw new Error("Couldn't find all resumable slots by key/index during replaying. " + "The tree doesn't match so React will fallback to client rendering.");
      }
      task.replay.pendingTasks--;
      task.abortSet.delete(task);
      finishedTask(request, task.blockedBoundary, task.row, null);
    } catch (thrownValue) {
      resetHooksState();
      const x = thrownValue === SuspenseException ?
      // This is a special type of exception used for Suspense. For historical
      // reasons, the rest of the Suspense implementation expects the thrown
      // value to be a thenable, because before `use` existed that was the
      // (unstable) API for suspending. This implementation detail can change
      // later, once we deprecate the old API in favor of `use`.
      getSuspendedThenable() : thrownValue;
      if (typeof x === 'object' && x !== null) {
        // $FlowFixMe[method-unbinding]
        if (typeof x.then === 'function') {
          // Something suspended again, let's pick it back up later.
          const ping = task.ping;
          x.then(ping, ping);
          task.thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
          return;
        }
      }
      task.replay.pendingTasks--;
      task.abortSet.delete(task);
      const errorInfo = getThrownInfo(task.componentStack);
      erroredReplay(request, task.blockedBoundary, request.status === ABORTING ? request.fatalError : x, errorInfo, task.replay.nodes, task.replay.slots, task.debugTask );
      request.pendingRootTasks--;
      if (request.pendingRootTasks === 0) {
        completeShell(request);
      }
      request.allPendingTasks--;
      if (request.allPendingTasks === 0) {
        completeAll(request);
      }
      return;
    } finally {
      {
        setCurrentTaskInDEV(prevTaskInDEV);
      }
    }
  }
  function performWork(request) {
    if (request.status === CLOSED || request.status === CLOSING) {
      return;
    }
    const prevContext = getActiveContext();
    const prevDispatcher = ReactSharedInternals.H;
    ReactSharedInternals.H = HooksDispatcher;
    const prevAsyncDispatcher = ReactSharedInternals.A;
    ReactSharedInternals.A = DefaultAsyncDispatcher;
    const prevRequest = currentRequest;
    currentRequest = request;
    let prevGetCurrentStackImpl = null;
    {
      prevGetCurrentStackImpl = ReactSharedInternals.getCurrentStack;
      ReactSharedInternals.getCurrentStack = getCurrentStackInDEV;
    }
    const prevResumableState = currentResumableState;
    setCurrentResumableState(request.resumableState);
    try {
      const pingedTasks = request.pingedTasks;
      let i;
      for (i = 0; i < pingedTasks.length; i++) {
        const task = pingedTasks[i];
        retryTask(request, task);
      }
      pingedTasks.splice(0, i);
      if (request.destination !== null) {
        flushCompletedQueues(request, request.destination);
      }
    } catch (error) {
      const errorInfo = {};
      logRecoverableError(request, error, errorInfo, null);
      fatalError(request, error, errorInfo, null);
    } finally {
      setCurrentResumableState(prevResumableState);
      ReactSharedInternals.H = prevDispatcher;
      ReactSharedInternals.A = prevAsyncDispatcher;
      {
        ReactSharedInternals.getCurrentStack = prevGetCurrentStackImpl;
      }
      if (prevDispatcher === HooksDispatcher) {
        // This means that we were in a reentrant work loop. This could happen
        // in a renderer that supports synchronous work like renderToString,
        // when it's called from within another renderer.
        // Normally we don't bother switching the contexts to their root/default
        // values when leaving because we'll likely need the same or similar
        // context again. However, when we're inside a synchronous loop like this
        // we'll to restore the context to what it was before returning.
        switchContext(prevContext);
      }
      currentRequest = prevRequest;
    }
  }
  function preparePreambleFromSubtree(request, segment, collectedPreambleSegments) {
    if (segment.preambleChildren.length) {
      collectedPreambleSegments.push(segment.preambleChildren);
    }
    let pendingPreambles = false;
    for (let i = 0; i < segment.children.length; i++) {
      const nextSegment = segment.children[i];
      pendingPreambles = preparePreambleFromSegment(request, nextSegment, collectedPreambleSegments) || pendingPreambles;
    }
    return pendingPreambles;
  }
  function preparePreambleFromSegment(request, segment, collectedPreambleSegments) {
    const boundary = segment.boundary;
    if (boundary === null) {
      // This segment is not a boundary, let's check it's children
      return preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
    }
    const preamble = boundary.contentPreamble;
    const fallbackPreamble = boundary.fallbackPreamble;
    if (preamble === null || fallbackPreamble === null) {
      // This boundary cannot have a preamble so it can't block the flushing of
      // the preamble.
      return false;
    }
    const status = boundary.status;
    switch (status) {
      case COMPLETED:
        {
          // This boundary is complete. It might have inner boundaries which are pending
          // and able to provide a preamble so we have to check it's children
          hoistPreambleState(request.renderState, preamble);
          // We track this boundary's byteSize on the request since it will always flush with
          // the request since it may contribute to the preamble
          request.byteSize += boundary.byteSize;
          const boundaryRootSegment = boundary.completedSegments[0];
          if (!boundaryRootSegment) {
            // Using the same error from flushSegment to avoid making a new one since conceptually the problem is still the same
            throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in React.');
          }
          return preparePreambleFromSubtree(request, boundaryRootSegment, collectedPreambleSegments);
        }
      case POSTPONED:
        {
          // This segment is postponed. When prerendering we consider this pending still because
          // it can resume. If we're rendering then this is equivalent to errored.
          if (request.trackedPostpones !== null) {
            // This boundary won't contribute a preamble to the current prerender
            return true;
          }
          // Expected fallthrough
        }
      case CLIENT_RENDERED:
        {
          if (segment.status === COMPLETED) {
            // This boundary is errored so if it contains a preamble we should include it
            hoistPreambleState(request.renderState, fallbackPreamble);
            return preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
          }
          // Expected fallthrough
        }
      default:
        // This boundary is still pending and might contain a preamble
        return true;
    }
  }
  function preparePreamble(request) {
    if (request.completedRootSegment && request.completedPreambleSegments === null) {
      const collectedPreambleSegments = [];
      const originalRequestByteSize = request.byteSize;
      const hasPendingPreambles = preparePreambleFromSegment(request, request.completedRootSegment, collectedPreambleSegments);
      if (isPreambleReady(request.renderState, hasPendingPreambles)) {
        request.completedPreambleSegments = collectedPreambleSegments;
      } else {
        // We restore the original size since the preamble is not ready
        // and we will prepare it again.
        request.byteSize = originalRequestByteSize;
      }
    }
  }
  function flushPreamble(request, destination, rootSegment, preambleSegments, skipBlockingShell) {
    // The preamble is ready.
    writePreambleStart(destination, request.resumableState, request.renderState, skipBlockingShell);
    for (let i = 0; i < preambleSegments.length; i++) {
      const segments = preambleSegments[i];
      for (let j = 0; j < segments.length; j++) {
        flushSegment(request, destination, segments[j], null);
      }
    }
    writePreambleEnd(destination, request.renderState);
  }
  function flushSubtree(request, destination, segment, hoistableState) {
    segment.parentFlushed = true;
    switch (segment.status) {
      case PENDING:
        {
          // We're emitting a placeholder for this segment to be filled in later.
          // Therefore we'll need to assign it an ID - to refer to it by.
          segment.id = request.nextSegmentId++;
          // Fallthrough
        }
      case POSTPONED:
        {
          const segmentID = segment.id;
          // When this segment finally completes it won't be embedded in text since it will flush separately
          segment.lastPushedText = false;
          segment.textEmbedded = false;
          return writePlaceholder(destination, request.renderState, segmentID);
        }
      case COMPLETED:
        {
          segment.status = FLUSHED;
          let r = true;
          const chunks = segment.chunks;
          let chunkIdx = 0;
          const children = segment.children;
          for (let childIdx = 0; childIdx < children.length; childIdx++) {
            const nextChild = children[childIdx];
            // Write all the chunks up until the next child.
            for (; chunkIdx < nextChild.index; chunkIdx++) {
              writeChunk(destination, chunks[chunkIdx]);
            }
            r = flushSegment(request, destination, nextChild, hoistableState);
          }
          // Finally just write all the remaining chunks
          for (; chunkIdx < chunks.length - 1; chunkIdx++) {
            writeChunk(destination, chunks[chunkIdx]);
          }
          if (chunkIdx < chunks.length) {
            r = writeChunkAndReturn(destination, chunks[chunkIdx]);
          }
          return r;
        }
      case ABORTED:
        {
          return true;
        }
      default:
        {
          throw new Error('Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.');
        }
    }
  }

  // Running count for how much bytes of boundaries have flushed inlined into the currently
  // flushing root or completed boundary.
  let flushedByteSize = 0;
  function flushSegment(request, destination, segment, hoistableState) {
    const boundary = segment.boundary;
    if (boundary === null) {
      // Not a suspense boundary.
      return flushSubtree(request, destination, segment, hoistableState);
    }
    boundary.parentFlushed = true;
    // This segment is a Suspense boundary. We need to decide whether to
    // emit the content or the fallback now.
    if (boundary.status === CLIENT_RENDERED) {
      // Emit a client rendered suspense boundary wrapper.
      // We never queue the inner boundary so we'll never emit its content or partial segments.

      const row = boundary.row;
      if (row !== null) {
        // Since this boundary end up client rendered, we can unblock future suspense list rows.
        // This means that they may appear out of order if the future rows succeed but this is
        // a client rendered row.
        if (--row.pendingTasks === 0) {
          finishSuspenseListRow(request, row);
        }
      }
      {
        writeStartClientRenderedSuspenseBoundary(destination, request.renderState, boundary.errorDigest, boundary.errorMessage, boundary.errorStack, boundary.errorComponentStack);
      }
      // Flush the fallback.
      flushSubtree(request, destination, segment, hoistableState);
      return writeEndClientRenderedSuspenseBoundary(destination, request.renderState);
    } else if (boundary.status !== COMPLETED) {
      if (boundary.status === PENDING) {
        // For pending boundaries we lazily assign an ID to the boundary
        // and root segment.
        boundary.rootSegmentID = request.nextSegmentId++;
      }
      if (boundary.completedSegments.length > 0) {
        // If this is at least partially complete, we can queue it to be partially emitted early.
        request.partialBoundaries.push(boundary);
      }

      // This boundary is still loading. Emit a pending suspense boundary wrapper.

      const id = boundary.rootSegmentID;
      writeStartPendingSuspenseBoundary(destination, request.renderState, id);
      if (hoistableState) {
        hoistHoistables(hoistableState, boundary.fallbackState);
      }
      // Flush the fallback.
      flushSubtree(request, destination, segment, hoistableState);
      return writeEndPendingSuspenseBoundary(destination, request.renderState);
    } else if (
    // We don't outline when we're emitting partially completed boundaries optimistically
    // because it doesn't make sense to outline something if its parent is going to be
    // blocked on something later in the stream anyway.
    !flushingPartialBoundaries && isEligibleForOutlining(request, boundary) && (flushedByteSize + boundary.byteSize > request.progressiveChunkSize || hasSuspenseyContent(boundary.contentState))) {
      // Inlining this boundary would make the current sequence being written too large
      // and block the parent for too long. Instead, it will be emitted separately so that we
      // can progressively show other content.
      // We add it to the queue during the flush because we have to ensure that
      // the parent flushes first so that there's something to inject it into.
      // We also have to make sure that it's emitted into the queue in a deterministic slot.
      // I.e. we can't insert it here when it completes.

      // Assign an ID to refer to the future content by.
      boundary.rootSegmentID = request.nextSegmentId++;
      request.completedBoundaries.push(boundary);
      // Emit a pending rendered suspense boundary wrapper.
      writeStartPendingSuspenseBoundary(destination, request.renderState, boundary.rootSegmentID);

      // While we are going to flush the fallback we are going to follow it up with
      // the completed boundary immediately so we make the choice to omit fallback
      // boundary state from the parent since it will be replaced when the boundary
      // flushes later in this pass or in a future flush

      // Flush the fallback.
      flushSubtree(request, destination, segment, hoistableState);
      return writeEndPendingSuspenseBoundary(destination, request.renderState);
    } else {
      // We're inlining this boundary so its bytes get counted to the current running count.
      flushedByteSize += boundary.byteSize;
      if (hoistableState) {
        hoistHoistables(hoistableState, boundary.contentState);
      }
      const row = boundary.row;
      if (row !== null && isEligibleForOutlining(request, boundary)) {
        // Once we have written the boundary, we can unblock the row and let future
        // rows be written. This may schedule new completed boundaries.
        if (--row.pendingTasks === 0) {
          finishSuspenseListRow(request, row);
        }
      }

      // We can inline this boundary's content as a complete boundary.
      writeStartCompletedSuspenseBoundary(destination, request.renderState);
      const completedSegments = boundary.completedSegments;
      if (completedSegments.length !== 1) {
        throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in React.');
      }
      const contentSegment = completedSegments[0];
      flushSegment(request, destination, contentSegment, hoistableState);
      return writeEndCompletedSuspenseBoundary(destination, request.renderState);
    }
  }
  function flushClientRenderedBoundary(request, destination, boundary) {
    {
      return writeClientRenderBoundaryInstruction(destination, request.resumableState, request.renderState, boundary.rootSegmentID, boundary.errorDigest, boundary.errorMessage, boundary.errorStack, boundary.errorComponentStack);
    }
  }
  function flushSegmentContainer(request, destination, segment, hoistableState) {
    writeStartSegment(destination, request.renderState, segment.parentFormatContext, segment.id);
    flushSegment(request, destination, segment, hoistableState);
    return writeEndSegment(destination, segment.parentFormatContext);
  }
  function flushCompletedBoundary(request, destination, boundary) {
    flushedByteSize = boundary.byteSize; // Start counting bytes
    const completedSegments = boundary.completedSegments;
    let i = 0;
    for (; i < completedSegments.length; i++) {
      const segment = completedSegments[i];
      flushPartiallyCompletedSegment(request, destination, boundary, segment);
    }
    completedSegments.length = 0;
    const row = boundary.row;
    if (row !== null && isEligibleForOutlining(request, boundary)) {
      // Once we have written the boundary, we can unblock the row and let future
      // rows be written. This may schedule new completed boundaries.
      if (--row.pendingTasks === 0) {
        finishSuspenseListRow(request, row);
      }
    }
    writeHoistablesForBoundary(destination, boundary.contentState, request.renderState);
    return writeCompletedBoundaryInstruction(destination, request.resumableState, request.renderState, boundary.rootSegmentID, boundary.contentState);
  }
  function flushPartialBoundary(request, destination, boundary) {
    flushedByteSize = boundary.byteSize; // Start counting bytes
    const completedSegments = boundary.completedSegments;
    let i = 0;
    for (; i < completedSegments.length; i++) {
      const segment = completedSegments[i];
      if (!flushPartiallyCompletedSegment(request, destination, boundary, segment)) {
        i++;
        completedSegments.splice(0, i);
        // Only write as much as the buffer wants. Something higher priority
        // might want to write later.
        return false;
      }
    }
    completedSegments.splice(0, i);
    const row = boundary.row;
    if (row !== null && row.together && boundary.pendingTasks === 1) {
      // "together" rows are blocked on their own boundaries.
      // We have now flushed all the boundary's segments as partials.
      // We can now unblock it from blocking the row that will eventually
      // unblock the boundary itself which can issue its complete instruction.
      // TODO: Ideally the complete instruction would be in a single <script> tag.
      if (row.pendingTasks === 1) {
        unblockSuspenseListRow(request, row, row.hoistables);
      } else {
        row.pendingTasks--;
      }
    }
    return writeHoistablesForBoundary(destination, boundary.contentState, request.renderState);
  }
  function flushPartiallyCompletedSegment(request, destination, boundary, segment) {
    if (segment.status === FLUSHED) {
      // We've already flushed this inline.
      return true;
    }
    const hoistableState = boundary.contentState;
    const segmentID = segment.id;
    if (segmentID === -1) {
      // This segment wasn't previously referred to. This happens at the root of
      // a boundary. We make kind of a leap here and assume this is the root.
      const rootSegmentID = segment.id = boundary.rootSegmentID;
      if (rootSegmentID === -1) {
        throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');
      }
      return flushSegmentContainer(request, destination, segment, hoistableState);
    } else if (segmentID === boundary.rootSegmentID) {
      // When we emit postponed boundaries, we might have assigned the ID already
      // but it's still the root segment so we can't inject it into the parent yet.
      return flushSegmentContainer(request, destination, segment, hoistableState);
    } else {
      flushSegmentContainer(request, destination, segment, hoistableState);
      return writeCompletedSegmentInstruction(destination, request.resumableState, request.renderState, segmentID);
    }
  }
  let flushingPartialBoundaries = false;
  function flushCompletedQueues(request, destination) {
    beginWriting(destination);
    try {
      // The structure of this is to go through each queue one by one and write
      // until the sink tells us to stop. When we should stop, we still finish writing
      // that item fully and then yield. At that point we remove the already completed
      // items up until the point we completed them.

      if (request.pendingRootTasks > 0) {
        // When there are pending root tasks we don't want to flush anything
        return;
      }
      let i;
      const completedRootSegment = request.completedRootSegment;
      if (completedRootSegment !== null) {
        if (completedRootSegment.status === POSTPONED) {
          return;
        }
        const completedPreambleSegments = request.completedPreambleSegments;
        if (completedPreambleSegments === null) {
          // The preamble isn't ready yet even though the root is so we omit flushing
          return;
        }
        flushedByteSize = request.byteSize; // Start counting bytes
        // TODO: Count the size of the preamble chunks too.
        let skipBlockingShell = false;
        if (enableFizzBlockingRender) ;
        flushPreamble(request, destination, completedRootSegment, completedPreambleSegments, skipBlockingShell);
        flushSegment(request, destination, completedRootSegment, null);
        request.completedRootSegment = null;
        const isComplete = request.allPendingTasks === 0 && request.clientRenderedBoundaries.length === 0 && request.completedBoundaries.length === 0 && (request.trackedPostpones === null || request.trackedPostpones.rootNodes.length === 0 && request.trackedPostpones.rootSlots === null);
        writeCompletedRoot(destination, request.resumableState, request.renderState, isComplete);
      }
      writeHoistables(destination, request.resumableState, request.renderState);
      // We emit client rendering instructions for already emitted boundaries first.
      // This is so that we can signal to the client to start client rendering them as
      // soon as possible.
      const clientRenderedBoundaries = request.clientRenderedBoundaries;
      for (i = 0; i < clientRenderedBoundaries.length; i++) {
        const boundary = clientRenderedBoundaries[i];
        if (!flushClientRenderedBoundary(request, destination, boundary)) {
          request.destination = null;
          i++;
          clientRenderedBoundaries.splice(0, i);
          return;
        }
      }
      clientRenderedBoundaries.splice(0, i);

      // Next we emit any complete boundaries. It's better to favor boundaries
      // that are completely done since we can actually show them, than it is to emit
      // any individual segments from a partially complete boundary.
      const completedBoundaries = request.completedBoundaries;
      for (i = 0; i < completedBoundaries.length; i++) {
        const boundary = completedBoundaries[i];
        if (!flushCompletedBoundary(request, destination, boundary)) {
          request.destination = null;
          i++;
          completedBoundaries.splice(0, i);
          return;
        }
      }
      completedBoundaries.splice(0, i);

      // Allow anything written so far to flush to the underlying sink before
      // we continue with lower priorities.
      completeWriting(destination);
      beginWriting(destination);

      // TODO: Here we'll emit data used by hydration.

      // Next we emit any segments of any boundaries that are partially complete
      // but not deeply complete.
      flushingPartialBoundaries = true;
      const partialBoundaries = request.partialBoundaries;
      for (i = 0; i < partialBoundaries.length; i++) {
        const boundary = partialBoundaries[i];
        if (!flushPartialBoundary(request, destination, boundary)) {
          request.destination = null;
          i++;
          partialBoundaries.splice(0, i);
          return;
        }
      }
      partialBoundaries.splice(0, i);
      flushingPartialBoundaries = false;

      // Next we check the completed boundaries again. This may have had
      // boundaries added to it in case they were too larged to be inlined.
      // SuspenseListRows might have been unblocked as well.
      // New ones might be added in this loop.
      const largeBoundaries = request.completedBoundaries;
      for (i = 0; i < largeBoundaries.length; i++) {
        const boundary = largeBoundaries[i];
        if (!flushCompletedBoundary(request, destination, boundary)) {
          request.destination = null;
          i++;
          largeBoundaries.splice(0, i);
          return;
        }
      }
      largeBoundaries.splice(0, i);
    } finally {
      flushingPartialBoundaries = false;
      if (request.allPendingTasks === 0 && request.clientRenderedBoundaries.length === 0 && request.completedBoundaries.length === 0
      // We don't need to check any partially completed segments because
      // either they have pending task or they're complete.
      ) {
        request.flushScheduled = false;
        // We write the trailing tags but only if don't have any data to resume.
        // If we need to resume we'll write the postamble in the resume instead.
        {
          writePostamble(destination, request.resumableState);
        }
        completeWriting(destination);
        flushBuffered(destination);
        {
          if (request.abortableTasks.size !== 0) {
            console.error('There was still abortable task at the root when we closed. This is a bug in React.');
          }
        }
        // We're done.
        request.status = CLOSED;
        close(destination);
        // We need to stop flowing now because we do not want any async contexts which might call
        // float methods to initiate any flushes after this point
        stopFlowing(request);
      } else {
        completeWriting(destination);
        flushBuffered(destination);
      }
    }
  }
  function startWork(request) {
    request.flushScheduled = request.destination !== null;
    // When prerendering we use microtasks for pinging work
    {
      scheduleMicrotask(() => performWork(request));
    }
    scheduleWork(() => {
      if (request.status === OPENING) {
        request.status = OPEN;
      }
      if (request.trackedPostpones === null) {
        // this is either a regular render or a resume. For regular render we want
        // to call emitEarlyPreloads after the first performWork because we want
        // are responding to a live request and need to balance sending something early
        // (i.e. don't want for the shell to finish) but we need something to send.
        // The only implementation of this is for DOM at the moment and during resumes nothing
        // actually emits but the code paths here are the same.
        // During a prerender we don't want to be too aggressive in emitting early preloads
        // because we aren't responding to a live request and we can wait for the prerender to
        // postpone before we emit anything.
        {
          enqueueEarlyPreloadsAfterInitialWork(request);
        }
      }
    });
  }
  function enqueueEarlyPreloadsAfterInitialWork(request) {
    const shellComplete = request.pendingRootTasks === 0;
    safelyEmitEarlyPreloads(request, shellComplete);
  }
  function enqueueFlush(request) {
    if (request.flushScheduled === false &&
    // If there are pinged tasks we are going to flush anyway after work completes
    request.pingedTasks.length === 0 &&
    // If there is no destination there is nothing we can flush to. A flush will
    // happen when we start flowing again
    request.destination !== null) {
      request.flushScheduled = true;
      scheduleWork(() => {
        // We need to existence check destination again here because it might go away
        // in between the enqueueFlush call and the work execution
        const destination = request.destination;
        if (destination) {
          flushCompletedQueues(request, destination);
        } else {
          request.flushScheduled = false;
        }
      });
    }
  }

  // This function is intented to only be called during the pipe function for the Node builds.
  // The reason we need this is because `renderToPipeableStream` is the only API which allows
  // you to start flowing before the shell is complete and we've had a chance to emit early
  // preloads already. This is really just defensive programming to ensure that we give hosts an
  // opportunity to flush early preloads before streaming begins in case they are in an environment
  // that only supports a single call to emitEarlyPreloads like the DOM renderers. It's unfortunate
  // to put this Node only function directly in ReactFizzServer but it'd be more ackward to factor it
  // by moving the implementation into ReactServerStreamConfigNode and even then we may not be able to
  // eliminate all the wasted branching.
  function prepareForStartFlowingIfBeforeAllReady(request) {
    const shellComplete = request.trackedPostpones === null ?
    // Render Request, we define shell complete by the pending root tasks
    request.pendingRootTasks === 0 :
    // Prerender Request, we define shell complete by completedRootSegemtn
    request.completedRootSegment === null ? request.pendingRootTasks === 0 : request.completedRootSegment.status !== POSTPONED;
    safelyEmitEarlyPreloads(request, shellComplete);
  }
  function startFlowing(request, destination) {
    if (request.status === CLOSING) {
      request.status = CLOSED;
      closeWithError(destination, request.fatalError);
      return;
    }
    if (request.status === CLOSED) {
      return;
    }
    if (request.destination !== null) {
      // We're already flowing.
      return;
    }
    request.destination = destination;
    try {
      flushCompletedQueues(request, destination);
    } catch (error) {
      const errorInfo = {};
      logRecoverableError(request, error, errorInfo, null);
      fatalError(request, error, errorInfo, null);
    }
  }
  function stopFlowing(request) {
    request.destination = null;
  }

  // This is called to early terminate a request. It puts all pending boundaries in client rendered state.
  function abort(request, reason) {
    if (request.status === OPEN || request.status === OPENING) {
      request.status = ABORTING;
    }
    try {
      const abortableTasks = request.abortableTasks;
      if (abortableTasks.size > 0) {
        const error = reason === undefined ? new Error('The render was aborted by the server without a reason.') : typeof reason === 'object' && reason !== null && typeof reason.then === 'function' ? new Error('The render was aborted by the server with a promise.') : reason;
        // This error isn't necessarily fatal in this case but we need to stash it
        // so we can use it to abort any pending work
        request.fatalError = error;
        if (true) {
          abortableTasks.forEach(task => abortTaskDEV(task, request, error));
        }
        abortableTasks.clear();
      }
      if (request.destination !== null) {
        flushCompletedQueues(request, request.destination);
      }
    } catch (error) {
      const errorInfo = {};
      logRecoverableError(request, error, errorInfo, null);
      fatalError(request, error, errorInfo, null);
    }
  }
  function flushResources(request) {
    enqueueFlush(request);
  }
  function getFormState(request) {
    return request.formState;
  }
  function getResumableState(request) {
    return request.resumableState;
  }
  function getRenderState(request) {
    return request.renderState;
  }
  function addToReplayParent(node, parentKeyPath, trackedPostpones) {
    if (parentKeyPath === null) {
      trackedPostpones.rootNodes.push(node);
    } else {
      const workingMap = trackedPostpones.workingMap;
      let parentNode = workingMap.get(parentKeyPath);
      if (parentNode === undefined) {
        parentNode = [parentKeyPath[1], parentKeyPath[2], [], null];
        workingMap.set(parentKeyPath, parentNode);
        addToReplayParent(parentNode, parentKeyPath[0], trackedPostpones);
      }
      parentNode[2].push(node);
    }
  }

  // Returns the state of a postponed request or null if nothing was postponed.
  function getPostponedState(request) {
    const trackedPostpones = request.trackedPostpones;
    if (trackedPostpones === null || trackedPostpones.rootNodes.length === 0 && trackedPostpones.rootSlots === null) {
      // Reset. Let the flushing behave as if we completed the whole document.
      request.trackedPostpones = null;
      return null;
    }
    let replaySlots;
    let nextSegmentId;
    if (request.completedRootSegment !== null && (
    // The Root postponed
    request.completedRootSegment.status === POSTPONED ||
    // Or the Preamble was not available
    request.completedPreambleSegments === null)) {
      nextSegmentId = 0;
      // We need to ensure that on resume we retry the root. We use a number
      // type for the replaySlots to signify this (see resumeRequest).
      // The value -1 represents an unassigned ID but is not functionally meaningful
      // for resuming at the root.
      replaySlots = -1;
      // We either postponed the root or we did not have a preamble to flush
      resetResumableState(request.resumableState, request.renderState);
    } else {
      nextSegmentId = request.nextSegmentId;
      replaySlots = trackedPostpones.rootSlots;
      completeResumableState(request.resumableState);
    }
    return {
      nextSegmentId,
      rootFormatContext: request.rootFormatContext,
      progressiveChunkSize: request.progressiveChunkSize,
      resumableState: request.resumableState,
      replayNodes: trackedPostpones.rootNodes,
      replaySlots
    };
  }

  exports.abort = abort;
  exports.createPrerenderRequest = createPrerenderRequest;
  exports.createRequest = createRequest;
  exports.flushResources = flushResources;
  exports.getFormState = getFormState;
  exports.getPostponedState = getPostponedState;
  exports.getRenderState = getRenderState;
  exports.getResumableState = getResumableState;
  exports.performWork = performWork;
  exports.prepareForStartFlowingIfBeforeAllReady = prepareForStartFlowingIfBeforeAllReady;
  exports.resolveClassComponentProps = resolveClassComponentProps;
  exports.resolveRequest = resolveRequest;
  exports.resumeAndPrerenderRequest = resumeAndPrerenderRequest;
  exports.resumeRequest = resumeRequest;
  exports.startFlowing = startFlowing;
  exports.startWork = startWork;
  exports.stopFlowing = stopFlowing;

}));
