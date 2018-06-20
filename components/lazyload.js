/**
 * Created by lei_sun on 2018/3/30.
 */
import React, { Component } from 'react';
import Lazyload from 'react-lazyload';
import _ from 'lodash';

export default class Page extends Component<{}> {
    getLazyImages(){
        const images = [
            'http://ww3.sinaimg.cn/mw690/62aad664jw1f2nxvya0u2j20u01hc16p.jpg',
            'http://ww1.sinaimg.cn/mw690/62aad664jw1f2nxvyo52qj20u01hcqeq.jpg',
            'http://ww2.sinaimg.cn/mw690/62aad664jw1f2nxvz2cj6j20u01hck1o.jpg',
            'http://ww1.sinaimg.cn/mw690/62aad664jw1f2nxvzfjv6j20u01hc496.jpg',
            'http://ww1.sinaimg.cn/mw690/62aad664jw1f2nxw0e1mlj20u01hcgvs.jpg',
            'http://ww4.sinaimg.cn/mw690/62aad664jw1f2nxw0p95dj20u01hc7d8.jpg',
            'http://ww2.sinaimg.cn/mw690/62aad664jw1f2nxw134xqj20u01hcqjg.jpg',
            'http://ww1.sinaimg.cn/mw690/62aad664jw1f2nxw1kcykj20u01hcn9p.jpg'
        ];

        let content = [];
        _.each(images, (item, index)=>{
            content.push(
                <Lazyload key={'lazyImage' + index} throttle={200} height={300}>
                    <img src={item} height="300" />
                </Lazyload>
            );
        });
        return content;
    }

    render() {
        return (
            <div className="lazy-load-wrapper">
                <div className="widget-list image-container">
                    {this.getLazyImages()}
                </div>
            </div>
        );
    }
}