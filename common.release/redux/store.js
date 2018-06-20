'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _reduxLogger = require('redux-logger');

var _reduxSaga = require('redux-saga');

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loggerMiddleware = (0, _reduxLogger.createLogger)();
var sagaMiddleware = (0, _reduxSaga2.default)();
var middlewares = [_reduxThunk2.default];

middlewares.push(loggerMiddleware);
middlewares.push(sagaMiddleware);

var createStoreWithMiddleware = _redux.applyMiddleware.apply(undefined, middlewares)(_redux.createStore);

exports.default = {
    createStoreWithMiddleware: createStoreWithMiddleware,
    sagaMiddleware: sagaMiddleware,
    createAction: function createAction(action, dispatch) {
        return (0, _redux.bindActionCreators)(action, dispatch);
    }
};