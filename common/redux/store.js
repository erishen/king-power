import {createStore, applyMiddleware, bindActionCreators} from 'redux'
import thunk from 'redux-thunk'
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';

const loggerMiddleware = createLogger();
const sagaMiddleware = createSagaMiddleware();
const middlewares = [thunk];

middlewares.push(loggerMiddleware);
middlewares.push(sagaMiddleware);

const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);

export default {
    createStoreWithMiddleware: createStoreWithMiddleware,
    sagaMiddleware: sagaMiddleware,
    createAction: (action, dispatch) => {
        return bindActionCreators(action, dispatch);
    }
};