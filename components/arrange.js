import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import util from '../common/helper/util';

export default class Arrange extends Component<{}> {

    constructor(props) {
        super(props);
        this.namesArr = []; // 工作人员名单列表
        this.mensWeekend = []; // 周末人员排班列表
        this.daysWeekend = 0; // 周末天数(周六 + 周日)
        this.tempWeekendFlag = false; // 临时增加周末设置, 人员数目少于周末数
    }

    componentWillMount(){
        if (typeof window !== 'undefined') {
            var urlObj = util.getUrlObj(window.location.href);
            console.log('urlObj', urlObj);
            var names = urlObj.names;
            if(names){
                this.namesArr = names.split(',');
            }
        }
    }

    stringToDate(dateString){
        dateString = dateString.split('-');
        return new Date(dateString[0], dateString[1] - 1, dateString[2]);
    }

    countWorkDay(sDay, eDay){
        var s = this.stringToDate(sDay), e = this.stringToDate(eDay);
        var s_t_w = s.getDay(), e_t_w = e.getDay();

        //相差天数
        var diffDay = (e - s) / (1000 * 60 * 60 * 24) + 1;
        var diffWeekDay = diffDay - (s_t_w ==0?0:7-s_t_w) + e_t_w;
        //计算有几个完整的周
        var weeks = Math.floor(diffWeekDay/7);
        if(weeks<=0){ //在同一周内 即开始结束时间不可能同时为周天与周六（周天为一周第一天）
            return e_t_w-s_t_w+(s_t_w?1:0)+(e_t_w==6?-1:0);
        }else{
            return weeks*5 + (e_t_w==6?5:e_t_w) + ( s_t_w >= 1 && s_t_w <= 5 ? (6-s_t_w):0);
        }
    }

    getDaysInOneMonth(year, month){
        month = parseInt(month, 10);
        var d = new Date(year, month, 0);
        return d.getDate();
    }

    getRandomName(namesArr){
        if(namesArr) {
            var namesArrLen = namesArr.length;
            var randomIndex = util.getRandomNum(0, namesArrLen - 1);
            var randomName = namesArr[randomIndex];
            return randomName;
        }
        return null;
    }

    appendMensWeekend(namesArr, callback){
        var randomName = this.getRandomName(namesArr);

        var flag = true;
        _.each(this.mensWeekend, (item, index)=>{
            if(item == randomName){
                flag = false;
                return false;
            }
        });

        if(this.tempWeekendFlag)
        {
            var mensWeekendLen = this.mensWeekend.length;
            for(var i = 0; i < this.daysWeekend - mensWeekendLen; i++){
                this.mensWeekend.push(this.mensWeekend[i]);
            }
            return callback && callback();
        }

        if(flag){
            this.mensWeekend.push(randomName);
            return callback && callback();
        }
        else {
            if(this.mensWeekend.length == this.namesArr.length)
                this.tempWeekendFlag = true;

            this.appendMensWeekend(namesArr, callback);
        }
    }

    getRandomNamesWeekend(namesArr, index){
        if(index > 0){
            if(this.daysWeekend <= namesArr.length){
                this.appendMensWeekend(namesArr, ()=>{
                    index--;
                    this.getRandomNamesWeekend(namesArr, index);
                });
            }
            else {
                namesArr = namesArr.concat(namesArr);
                this.appendMensWeekend(namesArr, ()=>{
                    this.getRandomNamesWeekend(namesArr, index);
                });
            }
        }
    }

    componentDidMount() {
        var namesArr = this.namesArr;
        console.log('namesArr', namesArr, moment().format('YYYY-MM-DD'));

        if(namesArr){
            console.log('randomName', this.getRandomName(namesArr));

            var year = moment().format('YYYY');
            var month = moment().format('MM');
            console.log(year, month);

            var daysInMonth = this.getDaysInOneMonth(year, month);
            var daysWork = this.countWorkDay(year + '-' + month + '-01', year + '-' + month + '-' + daysInMonth);
            var daysWeekend = daysInMonth - daysWork;
            console.log(daysInMonth, daysWork, daysWeekend);

            this.daysWeekend = daysWeekend;
            this.getRandomNamesWeekend(namesArr, daysWeekend);
            console.log('this.mensWeekend', this.mensWeekend);
        }
    }

    componentWillUnmount() {
        this.namesArr = null;
    }

    render() {
        return (
            <div>Arrange</div>
        );
    }
}