/**
 * Created by lei_sun on 2018/6/1.
 */
import projectConfig from '../../config/project';
import version from '../../config/version';
const minify = require('html-minifier').minify;

const configName = process.env.CONFIGNAME;
const isRelease = process.env.RELEASE;
const serverPrefix = projectConfig.serverPrefix;
const title = 'react-redux-ssr';
const keywords = 'keywords';
const description = 'description';

let obj = {};
obj.renderFullPage = function(params){

    const { component, action } = params;
    let { preloadedState, ssr, isStatic } = params;

    if(ssr == undefined)
        ssr = 'true';

    if(isStatic == undefined)
        isStatic = 'false';

    if(preloadedState == undefined)
        preloadedState = {};

    let cssHref = '';
    switch (action){
        case "bootstrap":
            cssHref = `<link rel="stylesheet" href="${serverPrefix}/css/bootstrap.min.css" />`;
            break;
    }

    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="keywords" content=${keywords} />
    <meta name="description" content=${description} />
    <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui" />

    ${cssHref}

    <link rel="stylesheet" href="${serverPrefix}/kingPAGES/react/index.css?v=${version}" />

    <meta name="appBaseUrl" content="${serverPrefix}/" />
    <meta name="format-detection" content="telephone=no"/>

    <!-- uc强制竖屏 -->
    <meta name="screen-orientation" content="portrait" />
    <!-- QQ强制竖屏 -->
    <meta name="x5-orientation" content="portrait" />
    <!-- SEO -->
    <meta name="applicable-device" content="mobile" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta http-equiv="Cache-Control" content="no-siteapp" />
    
    <script type="text/javascript">
        window.ssr = '${ssr}';
        window.isStatic = '${isStatic}';
        window.configName = '${configName}';
    </script>
</head>

<body onselectstart="return false" style="overflow-y: auto">

    <div id="main">
        <div class="main-frame">
            <div class="main-viewport">
                    <div id="app"><div>${component}</div></div>
            </div>
            <div class="main-state"></div>
        </div>
    </div>
    <div id="footer"></div>
    
    <script>
          // 警告：关于在 HTML 中嵌入 JSON 的安全问题，请查看以下文档
          // http://redux.js.org/recipes/ServerRendering.html#security-considerations
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}
    </script>

    <script src="${serverPrefix}/kingJS/vendor.a3e5a454ebdab64af001.js"></script>
    <script src="${serverPrefix}/kingPAGES/react/bundle.js?v=${version}" type="text/javascript"></script>
</body>
</html>
    `

    if(isRelease){
        return minify(html, {
            collapseWhitespace: true,
            conservativeCollapse: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true
        });
    }
    else
        return html;
};

export default obj;