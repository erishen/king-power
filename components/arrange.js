import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import util from '../common/helper/util';

export default class Arrange extends Component<{}> {

    constructor(props) {
        super(props);
        this.year = 0;
        this.month = 0;
        this.namesArr = []; // 工作人员名单列表
        this.mensWeekend = []; // 周末人员排班列表
        this.dateWeekend = []; // 周末日期列表
        this.arrangeArr = []; // 人员安排列表
        this.daysWeekend = 0; // 周末天数(周六 + 周日)
        this.tempWeekendFlag = false; // 临时增加周末设置, 人员数目少于周末数

        this.state = {
            arranges: null
        };
    }

    componentWillMount(){
        if (typeof window !== 'undefined') {
            var urlObj = util.getUrlObj(window.location.href);
            console.log('urlObj', urlObj);
            var month = parseInt(urlObj.month, 10);
            var names = decodeURI(urlObj.names);
            if(names){
                this.namesArr = names.split(',');
            }

            if(month > 0 && month < 13){
                if(month < 10)
                    month = '0' + month;
                this.month = month;
            }
        }
    }

    stringToDate(dateString){
        dateString = dateString.split('-');
        return new Date(dateString[0], dateString[1] - 1, dateString[2]);
    }

    countWorkDay(date1, date2){
        date1 = this.stringToDate(date1);
        date2 = this.stringToDate(date2);
        var delta = (date2 - date1) / (1000 * 60 * 60 * 24) + 1; // 计算出总时间

        var weeks = 0;
        for(var i = 0; i < delta; i++){
            if(date1.getDay() == 0 || date1.getDay() == 6) weeks ++;  // 若为周六或周天则加1
            date1 = date1.valueOf();
            date1 += 1000 * 60 * 60 * 24;
            date1 = new Date(date1);
        }
        return delta - weeks;
    }

    getDaysInOneMonth(year, month){
        month = parseInt(month, 10);
        var d = new Date(year, month, 0);
        return d.getDate();
    }

    getRandomName(namesArr){
        if(namesArr && namesArr.length > 0) {
            var namesArrLen = namesArr.length;
            var randomIndex = util.getRandomNum(0, namesArrLen - 1);
            var randomName = namesArr[randomIndex];
            return randomName;
        }
        return null;
    }

    appendMensWeekend(namesArr, callback){
        var randomName = this.getRandomName(namesArr);

        if(randomName != null){
            var flag = true;
            _.each(this.mensWeekend, (item, index)=>{
                if(item == randomName){
                    flag = false;
                    return false;
                }
                return true;
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
            console.log('year', year, 'month', month);
            this.year = year;

            if(this.month == 0){
                this.month = month;
            }
            else {
                month = this.month;
            }

            var daysInMonth = this.getDaysInOneMonth(year, month);
            var daysWork = this.countWorkDay(year + '-' + month + '-01', year + '-' + month + '-' + daysInMonth);
            var daysWeekend = daysInMonth - daysWork;
            console.log('daysInMonth', daysInMonth, 'daysWork', daysWork, 'daysWeekend', daysWeekend);

            this.daysWeekend = daysWeekend;
            this.getRandomNamesWeekend(namesArr, daysWeekend);
            console.log('this.mensWeekend', this.mensWeekend);

            // 找出本月第一个周六
            var firstDay = moment(year + '-' + month + '-01').day();
            var diffDay = 6 - firstDay;
            if(diffDay >= 0){
                for(var i = 0; i < Math.ceil(daysWeekend / 2); i++){
                    if(this.dateWeekend.length < daysWeekend) {
                        this.dateWeekend.push(diffDay + 1 + 7 * i);
                    }

                    if(this.dateWeekend.length < daysWeekend) {
                        this.dateWeekend.push(diffDay + 2 + 7 * i);
                    }
                }
            }
            else { // 本月1日为周日
                this.dateWeekend.push(1);

                for(var i = 1; i < Math.ceil(daysWeekend / 2); i++) {
                    if(this.dateWeekend.length < daysWeekend) {
                        this.dateWeekend.push(1 + 6 * i);
                    }

                    if(this.dateWeekend.length < daysWeekend) {
                        this.dateWeekend.push(1 + 7 * i);
                    }
                }
            }
            console.log('dateWeekend', this.dateWeekend);

            _.each(this.dateWeekend, (item, index)=>{
                this.arrangeArr[item] = this.mensWeekend[index];
            });

            console.log('arrangeArr', this.arrangeArr);
            this.setState({
                arranges: this.arrangeArr
            });
        }
    }

    componentWillUnmount() {
        this.namesArr = null;
    }

    render() {
        let { arranges } = this.state;
        console.log('arranges', arranges);

        let content = [];
        if(arranges){
            _.each(arranges, (item, index)=>{
                if(item){
                    if(index < 10)
                        index = '0' + index;

                    const date = this.year + '-' + this.month + '-' + index;
                    content.push(<div key={"arrange" + index}><p>{date}: {item}</p></div>);
                }
            });
        }

        return (
            <div>{content}</div>
        );
    }
}