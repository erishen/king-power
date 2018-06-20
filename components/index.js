/**
 * Created by lei_sun on 2017/11/6.
 */
import React, { Component } from 'react';
import rootReducer from './reducers'
import * as actions from './actions';
import commonStore from '../common/redux/store';

export default class Test extends Component<{}> {
    constructor(props){
        super(props);
        this.preloadedState = undefined;
        if (typeof window !== 'undefined') {
            this.preloadedState = window.__PRELOADED_STATE__;
        }

        this.store = commonStore.createStoreWithMiddleware(rootReducer, this.preloadedState);
        this.state = this.store.getState();
        this.action = commonStore.createAction(actions, this.store.dispatch);
    }

    componentWillMount() {
        //console.log('state', this.state);
    }

    componentDidMount() {
        this.unsubscribe = this.store.subscribe(() => {
            this.setState(this.store.getState());
        });

        if(!this.preloadedState || window.isStatic == 'true'){
            //this.action.initPageInfo();
            this.action.getGitHub();
        }
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        let { pageNum } = this.state;

        return (
            <div className="test">
                <div>{pageNum}</div>
                <div className="row">
                    <button onClick={()=>this.action.addPageNum()}> + </button>
                    <button onClick={()=>this.action.subtractPageNum()}> - </button>
                </div>
            </div>
        );
    }
}