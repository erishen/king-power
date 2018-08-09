import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import util from '../common/helper/util';

export default class Arrange extends Component<{}> {

    constructor(props) {
        super(props);
        this.year = 0;
        this.month = 0;
        this.namesArr = ['张三', '李四', '赵五', '王六', '孙七', '候八']; // 工作人员名单列表
        this.mensWeekend = []; // 周末人员排班列表
        this.dateWeekend = []; // 周末日期列表
        this.workDateNearWeekend = []; // 临近周末前后两天的日期列表
        this.workOtherDate = []; // 其他工作日期列表
        this.arrangeArr = []; // 人员安排列表
        this.daysWeekend = 0; // 周末天数(周六 + 周日)
        this.tempWeekendFlag = false; // 临时增加周末设置, 人员数目少于周末数
        this.lastRandomName = []; // 上一次生成的随机人员
        this.randomTimes = 0; // 随机次数

        this.state = {
            arranges: null
        };
    }

    componentWillMount(){
        if (typeof window !== 'undefined') {
            var urlObj = util.getUrlObj(window.location.href);
            console.log('urlObj', urlObj);

            if(urlObj.year){
                var year = parseInt(urlObj.year, 10);
                this.year = year;
            }

            if(urlObj.month){
                var month = parseInt(urlObj.month, 10);
                if(month > 0 && month < 13){
                    if(month < 10)
                        month = '0' + month;
                    this.month = month;
                }
            }

            if(urlObj.names){
                var names = decodeURI(urlObj.names);
                this.namesArr = names.split(/,|，/);
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

    // type: 4,5, 1,2
    getRandomNamesNearWeekend(namesArr, type, exclude, callback){
        if(this.randomTimes > 20){
            this.randomTimes = 0;
            return callback && callback('待定');
        }

        var randomName = this.getRandomName(namesArr);
        var searchFlag = false;

        _.each(exclude, (item, index)=>{
            if(item == randomName){
                searchFlag = true;
                return false;
            }
        });

        _.each(this.lastRandomName, (item, index)=>{
            if(item == randomName){
                searchFlag = true;
                return false;
            }
        });

        //console.log('searchFlag', searchFlag);
        if(!searchFlag){
            if(this.lastRandomName.length == 2)
                this.lastRandomName.pop();

            this.lastRandomName.push(randomName);
            return callback && callback(randomName);
        }
        else {
            this.randomTimes++;
            this.getRandomNamesNearWeekend(namesArr, type, exclude, callback);
        }
    }

    arrangeWorkDateNearWeekend(namesArr, index){
        if(index >= 0 && index < this.workDateNearWeekend.length){
            var item = this.workDateNearWeekend[index];
            var type = item.type;
            var exclude = item.exclude;

            this.randomTimes = 0;
            this.getRandomNamesNearWeekend(namesArr, type, exclude, (randomName)=>{
                item.men = randomName;
                index++;
                this.arrangeWorkDateNearWeekend(namesArr, index);
            });
        }
    }

    arrangeOtherDate(namesArr, index){
        if(index >= 0 && index < this.workOtherDate.length){
            var item = this.workOtherDate[index];
            var type = item.type;
            var exclude = item.exclude;

            this.randomTimes = 0;
            this.getRandomNamesNearWeekend(namesArr, type, exclude, (randomName)=>{
                item.men = randomName;
                index++;
                this.arrangeOtherDate(namesArr, index);
            });
        }
    }

    componentDidMount() {
        var namesArr = this.namesArr;
        console.log('namesArr', namesArr, moment().format('YYYY-MM-DD'));

        if(namesArr && namesArr.length > 0){
            console.log('randomName', this.getRandomName(namesArr));

            var year = moment().format('YYYY');
            var month = moment().format('MM');
            console.log('year', year, 'month', month);

            if(this.year == 0){
                this.year = year;
            }
            else {
                year = this.year;
            }

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
            console.log('diffDay', diffDay, firstDay);

            if(diffDay >= 0 && diffDay < 6){
                for(var i = 0; i < Math.ceil(daysWeekend / 2); i++){
                    if(this.dateWeekend.length < daysWeekend) {
                        this.dateWeekend.push({ type: 6, value: diffDay + 1 + 7 * i });
                    }

                    if(this.dateWeekend.length < daysWeekend) {
                        this.dateWeekend.push({ type: 7, value: diffDay + 2 + 7 * i });
                    }
                }
            }
            else { // 本月1日为周日
                this.dateWeekend.push({ type:7, value: 1 });

                for(var i = 1; i < Math.ceil(daysWeekend / 2); i++) {
                    if(this.dateWeekend.length < daysWeekend) {
                        this.dateWeekend.push({ type: 6, value: 1 + 6 * i });
                    }

                    if(this.dateWeekend.length < daysWeekend) {
                        this.dateWeekend.push({ type: 7, value: 1 + 7 * i });
                    }
                }
            }
            console.log('dateWeekend', this.dateWeekend);

            _.each(this.dateWeekend, (item, index)=>{
                var type = item.type;
                var value = item.value;
                item.men = this.mensWeekend[index];
                //this.arrangeArr[value] = this.mensWeekend[index];

                if(type == 6){
                    var firstMen = this.mensWeekend[index];
                    var secondMen = this.mensWeekend[index+1];

                    if(value - 2 >= 1 && value - 2 <= daysInMonth)
                        this.workDateNearWeekend.push({ type: 4, value: value - 2, exclude: [ firstMen, secondMen ] });

                    if(value - 1 >= 1 && value - 1 <= daysInMonth)
                        this.workDateNearWeekend.push({ type: 5, value: value - 1, exclude: [ firstMen, secondMen ] });
                }
                else if(type == 7){
                    var firstMen = this.mensWeekend[index-1];
                    var secondMen = this.mensWeekend[index];

                    if(value + 1 >= 1 && value + 1 <= daysInMonth)
                        this.workDateNearWeekend.push({ type: 1, value: value + 1, exclude: [ firstMen, secondMen ] });

                    if(value + 2 >= 1 && value + 2 <= daysInMonth)
                        this.workDateNearWeekend.push({ type: 2, value: value + 2, exclude: [ firstMen, secondMen ] });
                }
            });

            // 临近周末前后两天的人员列表
            this.arrangeWorkDateNearWeekend(namesArr, 0);

            var tempDate = this.dateWeekend;
            tempDate = tempDate.concat(this.workDateNearWeekend);
            //console.log('tempDate', tempDate);

            for(var i = 1; i <= daysInMonth; i++){
                var searchFlag = false;

                _.each(tempDate, (item, index) => {
                    var value = item.value;

                    if(value == i){
                        searchFlag = true;
                        return false;
                    }
                });

                if(!searchFlag){
                    var date = i;
                    if(date < 10)
                        date = '0' + date;
                    var type = moment(year + '-' + month + '-' + date).day();

                    var beforeSecondDate = i - 2;
                    var beforeFirstDate = i - 1;
                    var afterFirstDate = i + 1;
                    var afterSecondDate = i + 2;
                    var exclude = [];

                    var appendExclude = function(date){
                        _.each(tempDate, (item, index) => {
                            var value = item.value;
                            var men = item.men;

                            if(value == date){
                                var excludeFlag = false;
                                _.each(exclude, (excludeItem, excludeIndex)=>{
                                    if(excludeItem == men){
                                        excludeFlag = true;
                                        return false;
                                    }
                                });

                                if(!excludeFlag)
                                    exclude.push(men);
                                return false;
                            }
                        });
                    };

                    if(beforeSecondDate >= 1){
                        appendExclude(beforeSecondDate);
                    }

                    if(beforeFirstDate >= 1){
                        appendExclude(beforeFirstDate);
                    }

                    if(afterFirstDate <= daysInMonth){
                        appendExclude(afterFirstDate);
                    }

                    if(afterSecondDate <= daysInMonth){
                        appendExclude(afterSecondDate);
                    }

                    this.workOtherDate.push({ type: type, value: i, exclude: exclude });
                }
            }

            // 其他工作日期人员列表
            this.lastRandomName.length = 0;
            this.randomTimes = 0;
            this.arrangeOtherDate(namesArr, 0);

            tempDate = tempDate.concat(this.workOtherDate);
            console.log('tempDate', tempDate);

            _.each(tempDate, (item, index) => {
                this.arrangeArr[item.value] = {
                    type: item.type,
                    men: item.men
                }
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

        let contentLeft = [];
        let contentRight = [];

        if(arranges){
            _.each(arranges, (item, index)=>{
                if(item){
                    var date = index;
                    if(index < 10)
                        date = '0' + index;

                    const today = this.year + '-' + this.month + '-' + date;

                    var men = item.men;
                    var type = parseInt(item.type, 10);

                    var weeks = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

                    if(type >= 1 && type <= 7){
                        var week = weeks[type-1];
                        var content = today + '(' + week + '): ' + men;

                        if(index % 2 == 1){
                            contentLeft.push(<div key={"arrange" + index}><p>{content}</p></div>);
                        }
                        else {
                            contentRight.push(<div key={"arrange" + index}><p>{content}</p></div>);
                        }
                    }
                }
            });
        }

        return (
            <div class="arrange">
                <div class="left">{contentLeft}</div>
                <div class="right">{contentRight}</div>
            </div>
        );
    }
}