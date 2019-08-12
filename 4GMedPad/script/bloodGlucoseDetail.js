
apiready = function() {
    api.parseTapmode();
    // var header = document.querySelector('#header');
    // $api.fixStatusBar(header);

    /*var logId = pageParam.logId;*/
    var pageParam = api.pageParam;

    var logId = pageParam.logId;
    bloodGlucoseDetail(logId);
};

var bloodGlucoseDetail = function(logId){
    // alert(logId);
    common.get({
        url: config.bloodGlucoseDetail+logId,
        isLoading: true,
        success:function(ret){
            $api.html($api.byId('tbody'),"");
            var contentTmpl = doT.template($api.text($api.byId('content-tmpl')));
            var obj = dealItemKeyValue(ret.content.itemList);
            $api.append($api.byId('tbody'), contentTmpl(obj));
        }
    });
}

var picker = function() {
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
//根据日期筛选血糖检测单详情
var search = function(){
    var patient = $api.getStorage(storageKey.currentPerson);
    var patientId = patient.id;
    var sDate = $api.trim($api.val($api.byId('dateRange')));
    var bDate = "";
    var eDate = "";
    if(""!=sDate){
        bDate = sDate+" 00:00:00";
        eDate = sDate+" 23:59:59";
    }
    common.post({
        url:config.bloodGlucose,
        isLoading:false,
        data:JSON.stringify({
            page:1,
            beginTime:bDate,
            endTime:eDate,
            patientId:patientId,
            template:3,
            templateList:[{"templateCode":"xtjchl","templateVersion":1}]
        }),
        success:function(ret){
            var contentTmpl = doT.template($api.text($api.byId('content-tmpl')));
            if(ret.content && ret.content.list && ret.content.list.length>0) {
                //alert(ret.content.list[0].itemList[0].value);
                var obj = dealItemKeyValue(ret.content.list[0].itemList);
                $api.html($api.byId('tbody'), contentTmpl(obj));
            }
        }
    })
}


var dealItemKeyValue = function(itemList){
    var obj = {};
    for(var i =0;i<itemList.length;i++){
        var key = itemList[i].key;
        var value = itemList[i].value;
        obj[""+key] = value;
    }
    return obj;
};
//筛选时间下拉选项
var changeSearchBlood = function(){
    common.get({
        url:config.bloodGlucoseDetail,
        isLoading: false,
        success:function(ret){
            $api.html($api.byId('mySelect'),'');
            var dateTmpl = doT.template($api.text($api.byId('date-tmpl')));
            var createTime ;
            $api.append(($api.byId('mySelect')), dateTmpl(createTime));

    }
    });
}

function closeWin(){
    api.closeWin();
}
