/**
 * Created by lei_sun on 2018/6/12.
 */
import Test from '../components/index';

// ssr => default true, can set false.
export default {
    test: {
        action: 'test',
        component: Test,
        preloadedState: { pageNum: 20 }
    }
}