/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {Dispatcher} from 'react-reconciler/src/ReactInternalTypes';

/**
 * Keeps track of the current dispatcher.
 */
const ReactCurrentDispatcher = {
  /**
   * @internal
   * @type {ReactComponent}
   */
  current: (null: null | Dispatcher),
};

if (typeof window === 'undefined') {
  ReactCurrentDispatcher._current = null;
  ReactCurrentDispatcher._requestUuids = [];
  Object.defineProperty(ReactCurrentDispatcher, 'current', {
    set: function (curr) {
      if (curr === null) {
        let uuid = '-';
        if (global.process && global.process.domain && global.process.domain.req) {
          uuid = global.process.domain.req.get('X-REQUESTUUID');
        }
        this._requestUuids.push(`${uuid}_${Date.now()}`);
        if (this._requestUuids.length > 3) {
          this._requestUuids.shift();
        }
      }
      this._current = curr;
    },
    get: function () {
      return this._current;
    },
    enumerable: true
  });
}

export default ReactCurrentDispatcher;
