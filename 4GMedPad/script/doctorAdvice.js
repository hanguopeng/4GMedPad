var userId = $api.getStorage(storageKey.userId);
var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
var page = 1;
var id =1;
var db;
var priorityCode = ''
apiready = function() {
    api.parseTapmode();
    db = api.require('db');
    api.addEventListener({
        name : 'keyback'
    }, function(ret, err) {
        api.closeFrameGroup({
            name: 'group'
        });
    });
    $api.addEvt($api.dom('body'), 'click', function () {
        api.closeFrame({
            name: 'frm_doctor_advice_details'
        });
    });

    doctorAdvice(patientId);
};
function search(){
    doctorAdvice(patientId);
}

var doctorAdvice = function(patientId){

    var inUse
    var reportFlag
    if ($api.byId('inUse').checked){
        inUse = 1
    }
    if ($api.byId('reportFlag').checked){
        reportFlag = 1
    }

    var typeTab = $api.attr($api.dom($api.byId('typeTabContainer'),'.active'),'id');
    var topName = $api.attr($api.byId(typeTab), 'value');
    if ($api.getStorage(storageKey.offlineFlag) == "on") {
        //离线
        var sql = "select * from " + cmcdb.dbMedAdvice +
            " where medPatientId = '" + patientId + "'";
        if("all"!=typeTab){
            sql = sql+" and statusCode='"+topName+"'";
        }
        if(""!=yzdlcf){
            sql = sql+" and bigKindNum='"+yzdlcf+"'";
        }
        if(""!=yytj){
            sql = sql+" and usage='"+yytj+"'";
        }
        if(""!=sDate){
            url = url+"&foundTime="+sDate;
        }
        //console.log("sql=" + sql);
        var medAdviceResult = db.selectSqlSync({
            name: cmcdb.name,
            sql: sql
        });
        //console.log("medAdviceResult=" + JSON.stringify(medAdviceResult));

        $api.html($api.byId('tbody'),"");
        if (medAdviceResult && medAdviceResult.data) {
            var contentTmpl = doT.template($api.text($api.byId('content-tmpl')));
            for(var i=0;i<medAdviceResult.data.content.list.length;i++){
                var item = medAdviceResult.data.content.list[i];
                $api.append($api.byId('tbody'), contentTmpl(item));
            }
        }
    } else {
        common.post({
            url: config.queryAdviceList,
            isLoading: true,
            data: JSON.stringify({
                nurseId:  userId,   //护士ID
                patientId:  patientId,   //病人ID
                priorityCode:  priorityCode,    //医嘱优先级（期效）
                homepageId: person.homepageId,
                page: page,
                inUse: inUse,   //在用医嘱，选中是1
                reportFlag: reportFlag   //需要报告,  选中是1
            }),
            dataType: "json",
            success:function(ret){
                api.hideProgress();
                //alert(JSON.stringify(ret.content))
                $api.html($api.byId('tbody'),"");
                var contentTmpl = doT.template($api.text($api.byId('content-tmpl')));
                if(ret&&ret.content){
                    var totalCount = ret.content.totalCount;
                    var pageSize = ret.content.pageSize;
                    var totalPage = ret.content.totalPage;
                    var pageJson = {
                        totalCount:totalCount,
                        pageSize:pageSize,
                        totalPage:totalPage,
                        currPage:page
                    };
                    pageInfo(pageJson);
                    if (ret.content.list&&ret.content.list.length>0){
                        for(var i=0;i<ret.content.list.length;i++){
                            var item = ret.content.list[i];
                            // 判断是否有关联医嘱
                            if (item.sonBoList && item.sonBoList.length>0){
                                // 合并医嘱的标志
                                item.icon = "┌";
                                // 合并单元格的个数
                                item.size = item.sonBoList.length+1
                                // 是否显示期效和生效时间
                                item.show = true
                                $api.append($api.byId('tbody'), contentTmpl(item));
                                for (var j = 0;j<item.sonBoList.length;j++){
                                    var data = item.sonBoList[j];
                                    data.show = false
                                    if (j===item.sonBoList.length-1){
                                        data.icon = "└";
                                    }
                                    $api.append($api.byId('tbody'), contentTmpl(data));
                                }
                            }else{
                                item.size = 0
                                item.show = true
                                $api.append($api.byId('tbody'), contentTmpl(item));
                            }
                        }
                    } else{
                        api.toast({
                            msg: '无医嘱信息',
                            duration: 2000,
                            location: 'bottom'
                        })
                        return ;
                    }
                }
            }
        });
    }
};
var changeTab = function(obj,code){
    var active = $api.hasCls(obj,'active');
    if(!active){
        $api.removeCls($api.byId('all'), 'active');
        $api.removeCls($api.byId('cqyz'), 'active');
        $api.removeCls($api.byId('lsyz'), 'active');

        $api.addCls(obj, 'active');
        priorityCode = code
        doctorAdvice(patientId);
    }
};

var adpicker = function() {
    api.openPicker({
        type: 'date',
        title: '开始时间'
    }, function(ret, err){
        var recordYear = ret.year;
        var recordMonth = ret.month;
        var recordDay = ret.day;
        var recordDate = recordYear + "-" + (recordMonth<10? "0"+recordMonth:recordMonth) + "-" + (recordDay<10?"0"+recordDay:recordDay);
        $api.val($api.byId("dateRange"),recordDate);
    });
}
function openFeeDetails(adviceId) {
    api.closeFrame({
        name: 'frm_doctor_advice_details'
    });
    api.openFrame({
        name: 'frm_doctor_advice_details',
        url: './frm_doctor_advice_details.html',
        rect: {
            x: 0,
            y: api.winHeight - 300,
            w: api.winWidth,
            h: api.winHeight-280
        },
        progress: {
            type: "default",
            title: "",
            text: "正在加载数据"
        },
        animation: {
            type: "flip",
            subType: "from_bottom"
        },
        pageParam: {
            adviceId: adviceId
        },
        vScrollBarEnabled: true,
        hScrollBarEnabled: true,
        reload:true
    });

}

var pageInfo = function(pageJson){
    var pageInfoTmpl = doT.template($api.text($api.byId('pageInfo-tmpl')));
    $api.html($api.byId('pageDivContainer'), pageInfoTmpl(pageJson));
}

var firstPage = function(){
    page = 1;
    doctorAdvice(patientId);
}

var prePage = function(){
    var currentPage = $api.attr($api.byId('pageNumContainer'),'data-currentPage');
    page = parseInt(currentPage) - 1;
    doctorAdvice(patientId);
}

var nextPage = function(){
    var currentPage = $api.attr($api.byId('pageNumContainer'),'data-currentPage');
    page = parseInt(currentPage) + 1;
    doctorAdvice(patientId);
}
function isEmpty(str){
    if (str === null || str ==='' || str === undefined){
        return true
    }
}
