/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';
import ReactCurrentDispatcher from './ReactCurrentDispatcher';
import ReactCurrentBatchConfig from './ReactCurrentBatchConfig';
import ReactCurrentOwner from './ReactCurrentOwner';
import ReactDebugCurrentFrame from './ReactDebugCurrentFrame';
import IsSomeRendererActing from './IsSomeRendererActing';

const ReactSharedInternals = {
  ReactCurrentDispatcher,
  ReactCurrentBatchConfig,
  ReactCurrentOwner,
  IsSomeRendererActing,
  // Used by renderers to avoid bundling object-assign twice in UMD bundles:
  assign,
};

if (__DEV__) {
  ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
}

if (typeof window === 'undefined') {
  ReactSharedInternals._currentDispatcher = ReactCurrentDispatcher;
  Object.defineProperty(ReactSharedInternals, 'ReactCurrentDispatcher', {
    set: function (dispatcher) {
      let uuid = '-';
      if (global.process && global.process.domain && global.process.domain.req) {
        uuid = global.process.domain.req.get('X-REQUESTUUID') || 'no-request-uuid';
      }
      if (global.sbis && global.sbis.WarningMsg) {
        global.sbis.WarningMsg(`setting ReactCurrentDispatcher. requestUuid: ${uuid}`);
      }
      this._currentDispatcher = dispatcher;
    },
    get: function () {
      return this._currentDispatcher;
    },
    enumerable: true
  });
}

export default ReactSharedInternals;
