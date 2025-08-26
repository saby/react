define("react-dom/test-utils", ['exports', 'react'], (function (exports, React) { 'use strict';

  let didWarnAboutUsingAct = false;
  function act(callback) {
    if (didWarnAboutUsingAct === false) {
      didWarnAboutUsingAct = true;
      console.error('`ReactDOMTestUtils.act` is deprecated in favor of `React.act`. ' + 'Import `act` from `react` instead of `react-dom/test-utils`. ' + 'See https://react.dev/warnings/react-dom-test-utils for more info.');
    }
    return React.act(callback);
  }

  exports.act = act;

}));
