/**
 * Created by lei_sun on 2018/6/7.
 */
import Test from '../components/index';
import Bootstrap from '../components/bootstrap';
import Lazyload from '../components/lazyload';

// ssr => default true, can set false.
export default {
    test: {
        action: 'test',
        component: Test,
        //preloadedState: { pageNum: 20 },
        apiFunc: function(fetch, req, res){
            return new Promise((resolve, reject)=> {
                fetch.get('https://api.github.com/repos/erishen/react-redux-ssr', {}, req, res, true).then((response) => {
                    console.log('response', response);
                    resolve({
                        pageNum: response.stargazers_count
                    });
                }).catch((err) => {
                    reject(err);
                });
            });
        }
    },
    bootstrap: {
        action: 'bootstrap',
        component: Bootstrap
    },
    lazyload: {
        action: 'lazyload',
        component: Lazyload
    }
}