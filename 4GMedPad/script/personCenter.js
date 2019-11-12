// var patientId = common.getCurrentPerson();
var person = $api.getStorage(storageKey.currentPerson);
var  homepageId = person.homepageId;
var patientId = person.id;
var db;
/*查询详情*/
var searchPatientDetail = function(patientId){
    if ($api.getStorage(storageKey.offlineFlag) == "on") {
        //离线
        var sql = "select * from " + cmcdb.dbMedPatientDetails +
            " where medPatientId = '" + patientId + "'";
        var medPatientDetails = db.selectSqlSync({
            name: cmcdb.name,
            sql: sql
        });
        if(medPatientDetails.data.length == 1){
            $api.text($api.byId('zhenduanjieguo'), medPatientDetails.data[0].diagnose||'-');
            $api.text($api.byId('ywgms'), medPatientDetails.data[0].drugAllergy||'-');
            $api.text($api.byId('registerNumber'), medPatientDetails.data[0].registerNumber||'-');
            $api.text($api.byId('birthday'), medPatientDetails.data[0].birthday||'-');
            $api.text($api.byId('nationName'), medPatientDetails.data[0].nationName||'-');
            $api.text($api.byId('sfid'), medPatientDetails.data[0].identity||'-');
            $api.text($api.byId('marriageName'), medPatientDetails.data[0].marriageName||'-');
            $api.text($api.byId('nativePlace'), medPatientDetails.data[0].nativePlace||'-');
            $api.text($api.byId('educationName'), medPatientDetails.data[0].educationName||'-');
            $api.text($api.byId('contactsName'), medPatientDetails.data[0].contactsName||'-');
            $api.text($api.byId('contactsMobile'), medPatientDetails.data[0].contactsMobile||'-');
            $api.text($api.byId('contactsRelation'), medPatientDetails.data[0].contactsRelation||'-');
            $api.text($api.byId('sfzh'), medPatientDetails.data[0].idNumber||'-');
            $api.text($api.byId('inHospitalTime'), medPatientDetails.data[0].inHospitalTime||'-');
        }
    } else {
        common.get({
            url: config.patientDetailUrl+patientId+"/"+homepageId,
            isLoading: true,
            success:function(ret){
                $api.text($api.byId('drugAllergy'), ret.content.drugAllergy||'-');
                $api.text($api.byId('diagnose'), ret.content.diagnose||'-');
                // $api.text($api.byId('ywgms'), ret.content.drugAllergy||'-');
                //$api.text($api.byId('registerNumber'), ret.content.registerNumber||'-');
                // $api.text($api.byId('birthday'), ret.content.birthday||'-');
                // $api.text($api.byId('nationName'), ret.content.nationName||'-');
                // $api.text($api.byId('sfid'),ret.content.identity||'-');
                $api.text($api.byId('patientType'), ret.content.patientType||'-');
                $api.text($api.byId('doctorName'), ret.content.doctorName||'-');
                $api.text($api.byId('nurseName'), ret.content.nurseName||'-');
                // $api.text($api.byId('contactsName'), ret.content.contactsName||'-');
                $api.text($api.byId('contactsMobile'), ret.content.contactsMobile||'-');
                // $api.text($api.byId('contactsRelation'), ret.content.contactsRelationCode||'-');
                $api.text($api.byId('costType'), ret.content.costType||'-');
                $api.text($api.byId('inOrganizationTime'), ret.content.inOrganizationTime||'-');
                $api.text($api.byId('inHospitalTime'), ret.content.inHospitalTime||'-');
                $api.text($api.byId('organizationName'), ret.content.organizationName||'-');
            }
        });
    }
};
/*护理检查信息*/
var searchLastExamineInfo = function(patientId){
    if ($api.getStorage(storageKey.offlineFlag) === "on") {
        //离线
        var sql = "select * from " + cmcdb.dbNurLastExamine +
            " where medPatientId = '" + patientId + "'";
        //console.log("sql=" + sql);
        var nurLastExamine = db.selectSqlSync({
            name: cmcdb.name,
            sql: sql
        });
        //console.log("nurLastExamine=" + JSON.stringify(nurLastExamine));

        if(nurLastExamine.data.length===1){
            $api.text($api.byId('tiwen'), nurLastExamine.data[0].temperature||'-');
            $api.text($api.byId('huxi'), nurLastExamine.data[0].breathe||'-');
            $api.text($api.byId('maibo'), nurLastExamine.data[0].pulse||'-');
            $api.text($api.byId('xueya'), (nurLastExamine.data[0].bloodPressureLow||'-')+"/"+(nurLastExamine.data[0].bloodPressureHigh||'-'));
            $api.text($api.byId('xinlv'), nurLastExamine.data[0].heartRate||'-');
            $api.text($api.byId('ttqd'), nurLastExamine.data[0].heartRate||'-');
        }else{
        }
    } else {
        common.get({
            url: config.patientLastExamineUrl+patientId+"/"+homepageId,
            isLoading: true,
            success:function(ret){
                if(ret.content.pulse){
                    $api.text($api.byId('maibo'), ret.content.pulse.measureValue||'');
                }else{
                    $api.text($api.byId('maibo'), '');
                }
                if(ret.content.temperature){
                    $api.text($api.byId('tiwen'), ret.content.temperature.measureValue||'');
                }else{
                    $api.text($api.byId('tiwen'), '');
                }
                if(ret.content.breathRate){
                    $api.text($api.byId('huxi'), ret.content.breathRate.measureValue||'');
                }else{
                    $api.text($api.byId('huxi'), '');
                }
                if(ret.content.bloodPressure){
                    $api.text($api.byId('xueya'), (ret.content.bloodPressure.measureValue||''));
                }else{
                    $api.text($api.byId('xueya'), '');
                }
                if(ret.content.heartRate){
                    $api.text($api.byId('xinlv'), ret.content.heartRate.measureValue||'');
                }else{
                    $api.text($api.byId('xinlv'), '');
                }
                if(ret.content.painIntensity){
                    $api.text($api.byId('ttqd'), ret.content.painIntensity.measureValue||'');
                }else{
                    $api.text($api.byId('ttqd'), '');
                }



            }
        });
    }
};


/*费用信息查询*/
var costDetailInfo = function(patientId){
    if ($api.getStorage(storageKey.offlineFlag) == "on") {
        //离线
        var sql = "select * from " + cmcdb.dbMedCostSituation +
            " where medPatientId = '" + patientId + "'";
        //console.log("sql=" + sql);
        var medCostSituation = db.selectSqlSync({
            name: cmcdb.name,
            sql: sql
        });
        //console.log("medCostSituation=" + JSON.stringify(medCostSituation));
        if( medCostSituation.data.length == 1){
            $api.text($api.byId('prepayMoney'), medCostSituation.data[0].prepayMoney||'-');
            $api.text($api.byId('consumeMoney'), medCostSituation.data[0].consumeMoney||'-');
            $api.text($api.byId('assureMoney'), medCostSituation.data[0].assureMoney||'-');
            $api.text($api.byId('balance'), medCostSituation.data[0].balance);
        }

    } else {
        common.get({
            url: config.costSituationUrl+patientId+"/"+homepageId,
            isLoading: true,
            success:function(ret){
                //alert(JSON.stringify(ret));
                if(ret.content){
                $api.text($api.byId('balance'), ret.content.balance||'-');
                $api.text($api.byId('prepayMoney'), ret.content.prepayMoney||'-');
                $api.text($api.byId('unconsumeMoney'), ret.content.unconsumeMoney||'-');
                $api.text($api.byId('consumeMoney'), ret.content.consumeMoney||'-');
                $api.text($api.byId('selfMoney'), ret.content.selfMoney||'-');
                }
            }
        });
    }
};
/*输液情况*/
var transfuseSituationInfo = function(patientId){
    if ($api.getStorage(storageKey.offlineFlag) == "on") {
        //离线
        $api.text($api.byId('notBeginNum'), 0);
        $api.text($api.byId('beginNum'), 0);
        $api.text($api.byId('cargilleNum'), 0);
        $api.text($api.byId('finishNum'), 0);
    } else {
        common.get({
            url: config.transfuseSituationUrl+patientId,
            isLoading: true,
            success:function(ret){
                if(ret.content){
                    $api.text($api.byId('notBeginNum'), ret.content.notStartedNum||0);
                    $api.text($api.byId('beginNum'), ret.content.beginNum||0);
                    $api.text($api.byId('cargilleNum'), ret.content.cargilleNum||0);
                    $api.text($api.byId('finishNum'), ret.content.finishNum||0);
                }

            }
        });
    }
};
apiready = function() {
    api.parseTapmode();
    db = api.require('db');
    //echartInit();
    api.addEventListener({
        name : 'keyback'
    }, function(ret, err) {
        // api.sendEvent({
        //     //病区页面刷新
        //     name: 'main_refresh'
        // });

        api.closeFrameGroup({
            name: 'group'
        });
    });
    searchLastExamineInfo(patientId);
    var mxcxTmpl = doT.template($api.text($api.byId('mxcx-tmpl')));
    $api.html($api.byId('mxcx'), mxcxTmpl(person));
    searchPatientDetail(patientId);
    costDetailInfo(patientId);

};


    /*var lineReportDom = $api.byId('temperatureChangeLineReport');
    var rightTopInfo = $api.byId('rightTopInfo');

    var lineReportDomOffset = $api.offset(lineReportDom);
    var left = lineReportDomOffset.l;
    var top = lineReportDomOffset.t;
    var width = lineReportDomOffset.w;
    var height = $api.offset(rightTopInfo).h-80;
    lineInit(left,top,width,height);

    searchLastExamineInfo(patientId);
    searchPatientDetail(patientId);
    costDetailInfo(patientId);
    // transfuseSituationInfo(patientId);

/!*折现初始化*!/
var lineInit = function(x,y,w,h){
    if ($api.getStorage(storageKey.offlineFlag) == "on") {
        //离线
        var sql = "select * from " + cmcdb.dbNurAnimalHeatSituation +
            " where medPatientId = '" + patientId + "'";
        //console.log("sql=" + sql);
        var nurAnimalHeatSituation = db.selectSqlSync({
            name: cmcdb.name,
            sql: sql
        });
        //console.log("nurAnimalHeatSituation=" + JSON.stringify(nurAnimalHeatSituation));


        if (nurAnimalHeatSituation && nurAnimalHeatSituation.data) {
            var list = nurAnimalHeatSituation.data;
            var xAxisIndexArray = [];
            var datasArray = [];
            for(var i =0;i<list.length;i++){
                var temperature = list[i].temperature;
                var time = list[i].time.substr(5,5);
                xAxisIndexArray.push(time);
                datasArray.push(temperature);
            }
            if(list.length==0){
                xAxisIndexArray.push("0");
                datasArray.push(0);
            }
            UILineChartInit(x,y,w,h,xAxisIndexArray,datasArray);
        }
    } else {
        common.get({
            url: config.animalHeatSituation+patientId,
            isLoading: true,
            success:function(ret){
                var list = ret.content;
                //alert(JSON.stringify(ret.content));
                var xAxisIndexArray = [];
                var datasArray = [];
                for(var i =0;i<list.length;i++){
                    var temperature = list[i].temperature;
                    var time = list[i].time.substr(5,5);
                    xAxisIndexArray.push(time);
                    datasArray.push(temperature);
                }
                if(list.length==0){
                    xAxisIndexArray.push("0");
                    datasArray.push(0);
                }
                echartInit(xAxisIndexArray,datasArray);

                //echartLine(xAxisIndexArray,datasArray);
                //alert(xAxisIndexArray);
            }
        });
    }

};

function echartInit(xAxisIndexArray,datasArray){
    var myChart = echarts.init($api.byId('temperatureChangeLineReport'));
    option = {
        grid:{
          top:1,
          x:20,
          y:30
        },
        xAxis: {
            type: 'category',
            data: xAxisIndexArray
        },
        yAxis: {
            type: 'value',
            min:34,
            max:41
        },
        series: [{
            data: datasArray,
            type: 'line'
        }]
    };

    myChart.setOption(option);
}

var UILineChartInit = function(x,y,w,h,xAxisIndexArray,datasArray){
    var UILineChart = api.require('UILineChart');
    UILineChart.open({
        rect: {
            x: x,
            y: y,
            w: w,
            h: h
        },
        xAxis: {
            indexs: xAxisIndexArray,
            screenXcount: 7
        },
        yAxis: {
            max: 40,
            min: 10,
            step: 10,
            base: 37
        },
        datas: [
            datasArray,
        ],
        styles: {
            xAxis: {
                bg: '#fcfcfc',
                markColor: '#fc3c25',
                markSize: 8
            },
            yAxis: {
                bg: '#fcfcfc',
                markColor: '#888',
                markSize: 8
            },
            coordinate: {
                bg: '#fcfcfc',
                color: '#cccccc',
                baseColor: '#bbb',
            },
            colors: ['#333333']
        },
        fixedOn: api.frameName,
        fixed: false
    }, function(ret, err) {
        if (ret) {

        } else {

        }
    });
};*/

//暂时这么做，后续看看哪种更方便
function changeFrmGrp(idx){
    api.setFrameGroupIndex({
        name: 'group',
        index: idx,
        reload:true
    });
}


/*
var echartLine = function (ec,xAxisIndexArray,datasArray) {
    var temperatureChartLine = ec.init($api.byId('temperatureChangeLineReport'));
    alert(ec);
    option = {
        title : {
            text: '',
            subtext: ''
        },
        tooltip : {
            trigger: 'axis'
        },
        toolbox: {
            show : true,
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },

        calculable : true,
        xAxis : [
            {
                type : 'category',
                boundaryGap : false,
                data : xAxisIndexArray
            }
        ],
        yAxis : [
            {
                type : 'value',
                axisLabel : {
                    formatter: '{value} °C'
                },
                max:50,
                min:10
            }
        ],

        series : [
            {
                name:'最低气温',
                type:'line',
                color : ['#FFFFFF'],
                data:datasArray,
                markLine : {
                    itemStyle:{
                        normal:{
                            lineStyle:{
                                color:'red',
                                width:2,
                                type:'solid'  //'dotted'虚线 'solid'实线

                            }
                        }
                    },
                    data:[
                        [
                            {
                                name: '',
                                xAxis: '周一',
                                yAxis: 37
                            },
                            {
                                xAxis: '周六',
                                yAxis: 37
                            }
                        ]
                    ]


                }
            }
        ]
    };
    temperatureChartLine.setOption(option);
}
*/
