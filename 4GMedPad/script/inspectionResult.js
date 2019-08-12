var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
var homepageId = person.homepageId;
var page = 1;
var db;
/*检查结果*/
var searchPatientDetail = function(patientId){
    if ($api.getStorage(storageKey.offlineFlag) == "on") {
        //离线
        var sql = "select * from " + cmcdb.dbMedExamine +
            " where medPatientId = '" + patientId + "' limit " + 10 * (page - 1) + "," + 10 * page;
        //console.log("sql=" + sql);
        var dbMedExamineResult = db.selectSqlSync({
            name: cmcdb.name,
            sql: sql
        });
        //console.log("dbMedExamineResult=" + JSON.stringify(dbMedExamineResult));

        var pageJson = {
            totalCount: dbMedExamineResult.data.length,
            pageSize: 10,
            totalPage: dbMedExamineResult.data.length / 10 + 1,
            currPage: page
        };
        pageInfo(pageJson);
        $api.html($api.byId('inspectionResult'), "");
        if (dbMedExamineResult && dbMedExamineResult.data) {
            for (var i = 0; i < dbMedExamineResult.data.length; i++) {
                var item = dbMedExamineResult.data[i];
                var html = '<tr data-id="'+item.id+'" tapmode="trActive" onclick="openDetailWin(this)">' +
                    '        <td>' +item.name+
                    '        </td>' +
                    '        <td>' +item.sendDoctorName +
                    '        </td>' +
                    '        <td>'  +item.reportTime +
                    '        </td>' +
                    '        <td>'  +item.sendTime +
                    '        </td>' +
                    '    </tr>';
                $api.append($api.byId('inspectionResult'),html);
            }
        }
    }else{
        common.get({
            url: config.medExaminelUrl+patientId + "&page="+page + "&homepageId="+homepageId,
            isLoading: true,
            success:function(ret){
                var totalCount = ret.content.totalCount;
                var pageSize = ret.content.pageSize;
                var totalPage = ret.content.totalPage;
                var currPage = ret.content.currPage;
                var pageJson = {
                    totalCount:totalCount,
                    pageSize:pageSize,
                    totalPage:totalPage,
                    currPage:page
                };
                pageInfo(pageJson);

                $api.html($api.byId('inspectionResult'), "");
                if(ret.content && ret.content.list && ret.content.list.length>0) {
                    for (var i = 0; i < ret.content.list.length; i++) {
                        var item = ret.content.list[i];
                        var html = '<tr data-id="' + item.id + '" data-execute-id="' + item.medAdviceExecuteId + '" tapmode="trActive" onclick="openDetailWin(this)">' +
                            '        <td>' + item.name +
                            '        </td>' +
                            '        <td>' + item.sendDoctorName +
                            '        </td>' +
                            '        <td>' + item.reportTime +
                            '        </td>' +
                            '        <td>' + item.sendTime +
                            '        </td>' +
                            '    </tr>';
                        $api.append($api.byId('inspectionResult'), html);
                    }
                }
            }
        });
    }
};

apiready = function () {
    api.parseTapmode();
    db = api.require('db');
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
    searchPatientDetail(patientId);
};
function openDetailWin(obj){
    var id = $api.attr(obj,'data-id');//获取化验ID
    var examineId = $api.attr(obj,'data-execute-id');//获取执行id
    api.openWin({
        name: 'win_inspection_detail',
        url: './win_inspection_detail.html',
        vScrollBarEnabled:true,
        hScrollBarEnabled:false,
        slidBackEnabled:false,
        animation:{
            type:'push',
            subType:'from_right'
        },
        pageParam:{
            id:id,
            examineId:examineId
        },
        reload:true
    });

}



var pageInfo = function(pageJson){
    var pageInfoTmpl = doT.template($api.text($api.byId('pageInfo-tmpl')));
    $api.html($api.byId('pageDivContainer'), pageInfoTmpl(pageJson));
}

var firstPage = function(){
    page = 1;
    searchPatientDetail(patientId);
}

var prePage = function(){
    var currentPage = $api.attr($api.byId('pageNumContainer'),'data-currentPage');
    page = parseInt(currentPage) - 1;
    searchPatientDetail(patientId);
}

var nextPage = function(size){
    var currentPage = $api.attr($api.byId('pageNumContainer'),'data-currentPage');
    page = parseInt(currentPage) + 1;
    searchPatientDetail(patientId);
}
