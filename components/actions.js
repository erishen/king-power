/**
 * Created by lei_sun on 2017/11/6.
 */
import testService from '../common/services/testService';

export const INIT_PAGE = 'INIT_PAGE';
export const initPageInfo = (params) => ({
    type: INIT_PAGE,
    ...params
});

export const ADD_PAGE_NUM = 'ADD_PAGE_NUM';
export const addPageNum = (params) => ({
    type: ADD_PAGE_NUM,
    ...params
});

export const SUBTRACT_PAGE_NUM = 'SUBTRACT_PAGE_NUM';
export const subtractPageNum = (params) => ({
    type: SUBTRACT_PAGE_NUM,
    ...params
});

export const GET_GITHUB = 'GET_GITHUB';
export const GET_GITHUB_SUCCEEDED = 'GET_GITHUB_SUCCEEDED';
export const GET_GITHUB_FAILED = 'GET_GITHUB_FAILED';

export const getGitHub = (params) => {
    return function(dispatch){
        dispatch({
            type: GET_GITHUB,
            ...params
        });

        testService.getReactReduxSsrGithub().then((response) => {
            console.log({ getReactReduxSsrGithub_response: response });
            if(params == undefined){
                params = {
                    github: 0
                };
            }

            if(response){
                params.github = response.stargazers_count;
            }

            dispatch({
                type: GET_GITHUB_SUCCEEDED,
                ...params
            });
        }).catch((e)=>{
            dispatch({
                type: GET_GITHUB_FAILED,
                message: e.message
            });
        });
    };
};