import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import util from '../common/helper/util';

const tempName = '待定';
const tempTimes = 0;
const diffMenNums = 2;

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
        this.arrangeArr = []; // 人员安排列表(日期维度)
        this.menArr = [];  //  人品安排列表（人员维度）
        this.daysWeekend = 0; // 周末天数(周六 + 周日)
        this.tempWeekendFlag = false; // 临时增加周末设置, 人员数目少于周末数
        this.lastRandomName = []; // 上一次生成的随机人员
        this.randomTimes = 0; // 随机次数
        this.recallTimes = 0; // 重复调用次数

        this.state = {
            arranges: null,
            mens: null
        };
    }

    componentWillMount(){
        if (typeof window !== 'undefined') {
            const urlObj = util.getUrlObj(window.location.href);
            console.log('urlObj', urlObj);

            if(urlObj.year){
                const year = parseInt(urlObj.year, 10);
                this.year = year;
            }

            if(urlObj.month){
                let month = parseInt(urlObj.month, 10);
                if(month > 0 && month < 13){
                    if(month < 10)
                        month = '0' + month;
                    this.month = month;
                }
            }

            if(urlObj.names){
                const names = decodeURI(urlObj.names);
                this.namesArr = names.split(/,|，/);
            }

            this.initMenArr();
        }
    }

    initMenArr(){
        _.each(this.namesArr, (item, index)=>{
            this.menArr.push({
                men: item,
                dates: []
            });
        });

        this.menArr.push({
            men: tempName,
            dates: []
        });
    }

    stringToDate(dateString){
        dateString = dateString.split('-');
        return new Date(dateString[0], dateString[1] - 1, dateString[2]);
    }

    countWorkDay(date1, date2){
        date1 = this.stringToDate(date1);
        date2 = this.stringToDate(date2);
        const delta = (date2 - date1) / (1000 * 60 * 60 * 24) + 1; // 计算出总时间

        let weeks = 0;
        for(let i = 0; i < delta; i++){
            if(date1.getDay() == 0 || date1.getDay() == 6) weeks ++;  // 若为周六或周天则加1
            date1 = date1.valueOf();
            date1 += 1000 * 60 * 60 * 24;
            date1 = new Date(date1);
        }
        return delta - weeks;
    }

    getDaysInOneMonth(year, month){
        month = parseInt(month, 10);
        const d = new Date(year, month, 0);
        return d.getDate();
    }

    getRandomName(namesArr){
        if(namesArr && namesArr.length > 0) {
            const namesArrLen = namesArr.length;
            const randomIndex = util.getRandomNum(0, namesArrLen - 1);
            const randomName = namesArr[randomIndex];
            return randomName;
        }
        return null;
    }

    appendMensWeekend(namesArr, callback){
        const randomName = this.getRandomName(namesArr);

        if(randomName != null){
            let flag = true;
            _.each(this.mensWeekend, (item, index)=>{
                if(item == randomName){
                    flag = false;
                    return false;
                }
                return true;
            });

            if(this.tempWeekendFlag)
            {
                const mensWeekendLen = this.mensWeekend.length;
                for(let i = 0; i < this.daysWeekend - mensWeekendLen; i++){
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
            return callback && callback(tempName);
        }

        const randomName = this.getRandomName(namesArr);
        let searchFlag = false;

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
            const item = this.workDateNearWeekend[index];
            const { type, exclude } = item;

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
            const item = this.workOtherDate[index];
            const { type, exclude } = item;

            this.randomTimes = 0;
            this.getRandomNamesNearWeekend(namesArr, type, exclude, (randomName)=>{
                item.men = randomName;
                index++;
                this.arrangeOtherDate(namesArr, index);
            });
        }
    }

    getRandomNames(callback) {
        const namesArr = this.namesArr;
        console.log('namesArr', namesArr, moment().format('YYYY-MM-DD'));

        if(namesArr && namesArr.length > 0){
            console.log('randomName', this.getRandomName(namesArr));

            let year = moment().format('YYYY');
            let month = moment().format('MM');
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

            const daysInMonth = this.getDaysInOneMonth(year, month);
            const daysWork = this.countWorkDay(year + '-' + month + '-01', year + '-' + month + '-' + daysInMonth);
            const daysWeekend = daysInMonth - daysWork;
            console.log('daysInMonth', daysInMonth, 'daysWork', daysWork, 'daysWeekend', daysWeekend);

            this.daysWeekend = daysWeekend;
            this.getRandomNamesWeekend(namesArr, daysWeekend);
            console.log('this.mensWeekend', this.mensWeekend);

            // 找出本月第一个周六
            const firstDay = moment(year + '-' + month + '-01').day();
            const diffDay = 6 - firstDay;
            console.log('diffDay', diffDay, firstDay);

            if(diffDay >= 0 && diffDay < 6){
                for(let i = 0; i < Math.ceil(daysWeekend / 2); i++){
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

                for(let i = 1; i < Math.ceil(daysWeekend / 2); i++) {
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
                const { type, value } = item;

                item.men = this.mensWeekend[index];
                //this.arrangeArr[value] = this.mensWeekend[index];

                if(type == 6){
                    const firstMen = this.mensWeekend[index];
                    const secondMen = this.mensWeekend[index+1];

                    if(value - 2 >= 1 && value - 2 <= daysInMonth)
                        this.workDateNearWeekend.push({ type: 4, value: value - 2, exclude: [ firstMen, secondMen ] });

                    if(value - 1 >= 1 && value - 1 <= daysInMonth)
                        this.workDateNearWeekend.push({ type: 5, value: value - 1, exclude: [ firstMen, secondMen ] });
                }
                else if(type == 7){
                    const firstMen = this.mensWeekend[index-1];
                    const secondMen = this.mensWeekend[index];

                    if(value + 1 >= 1 && value + 1 <= daysInMonth)
                        this.workDateNearWeekend.push({ type: 1, value: value + 1, exclude: [ firstMen, secondMen ] });

                    if(value + 2 >= 1 && value + 2 <= daysInMonth)
                        this.workDateNearWeekend.push({ type: 2, value: value + 2, exclude: [ firstMen, secondMen ] });
                }
            });

            // 临近周末前后两天的人员列表
            this.arrangeWorkDateNearWeekend(namesArr, 0);

            let tempDate = this.dateWeekend;
            tempDate = tempDate.concat(this.workDateNearWeekend);
            //console.log('tempDate', tempDate);

            for(let i = 1; i <= daysInMonth; i++){
                let searchFlag = false;

                _.each(tempDate, (item, index) => {
                    const value = item.value;

                    if(value == i){
                        searchFlag = true;
                        return false;
                    }
                });

                if(!searchFlag){
                    let date = i;
                    if(date < 10)
                        date = '0' + date;
                    const type = moment(year + '-' + month + '-' + date).day();

                    const beforeSecondDate = i - 2;
                    const beforeFirstDate = i - 1;
                    const afterFirstDate = i + 1;
                    const afterSecondDate = i + 2;
                    let exclude = [];

                    const appendExclude = function(date){
                        _.each(tempDate, (item, index) => {
                            const { value, men } = item;

                            if(value == date){
                                let excludeFlag = false;
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
            console.log('tempDate', tempDate, this.menArr);

            let recallFlag = false;
            _.each(tempDate, (item, index) => {
                const { value, type, men } = item;

                if(men == tempName) { // 出现待定的情况，需要重新生成
                    if(this.recallTimes <= tempTimes){
                        recallFlag = true;
                        return true;
                    }
                }

                this.arrangeArr[value] = {
                    type: type,
                    men: men
                };

                _.each(this.menArr, (menItem, menIndex)=>{
                    if(men == menItem.men){
                        menItem.dates.push(value);
                    }
                });
                console.log('testDate', this.menArr);
            });

            let datesMin = 0;
            let datesMax = 0;

            _.each(this.menArr, (menItem, menIndex)=>{
                menItem.dates = _.sortBy(menItem.dates);

                if(menItem.men != tempName){
                    const datesLen = menItem.dates.length;

                    if(datesMin == 0)
                        datesMin = datesLen;
                    else if(datesMin > datesLen)
                        datesMin = datesLen;

                    if(datesMax == 0)
                        datesMax = datesLen;
                    else if(datesMax < datesLen)
                        datesMax = datesLen;
                }
            });

            if(this.recallTimes <= tempTimes){
                if(datesMax - datesMin >= diffMenNums)
                    recallFlag = true;
            }

            console.log('arrangeArr', this.arrangeArr, this.menArr, datesMax, datesMin, this.recallTimes, recallFlag);

            if(recallFlag){
                this.recallTimes++;

                this.dateWeekend.length = 0;
                this.workDateNearWeekend.length = 0;
                this.workOtherDate.length = 0;
                this.arrangeArr.length = 0;
                this.menArr.length = 0;
                this.initMenArr();
                console.log('this.menArr', this.menArr);
            }
            else {
                this.recallTimes = 0;
            }
            return callback && callback(recallFlag);
        }
    }

    getRandomNamesWrapper(callback){
        this.getRandomNames((recallFlag)=>{
            if(recallFlag){
                this.getRandomNamesWrapper(callback);
            }
            else {
                return callback && callback();
            }
        });
    }

    componentDidMount(){
        this.getRandomNamesWrapper(()=>{
            this.setState({
                arranges: this.arrangeArr,
                mens: this.menArr
            });
        });
    }

    componentWillUnmount() {
        this.namesArr = null;
    }

    render() {
        const { arranges, mens } = this.state;
        console.log('arranges', arranges, mens);

        let contentLeft = [];
        let contentRight = [];
        let contentMens = [];

        if(arranges){
            _.each(arranges, (item, index)=>{
                if(item){
                    let date = index;
                    if(index < 10)
                        date = '0' + index;

                    const today = this.year + '-' + this.month + '-' + date;
                    const men = item.men;
                    const type = parseInt(item.type, 10);
                    const weeks = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

                    if(type >= 1 && type <= 7){
                        const week = weeks[type-1];
                        const content = today + '(' + week + '): ' + men;

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

        if(mens){
            _.each(mens, (item, index)=>{
                const men = item.men;
                const dates = item.dates;

                if(men == tempName && dates.length == 0)
                    return true;

                const menContent = men + '(' + dates.length + "): " + dates.join('日, ') + '日';
                contentMens.push(<div key={"men" + index}><p>{menContent}</p></div>);
            });
        }

        return (
            <div class="arrange">
                <div class="content">
                    <div class="left">{contentLeft}</div>
                    <div class="right">{contentRight}</div>
                </div>
                <div class="men">
                    {contentMens}
                </div>
            </div>
        );
    }
}