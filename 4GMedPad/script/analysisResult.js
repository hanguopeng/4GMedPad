var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
var homepageId = person.homepageId;
var page = 1;
var db;
/*化验结果*/
var searchPatientDetail = function (patientId) {
    if ($api.getStorage(storageKey.offlineFlag) == "on") {
        //离线
        var sql = "select * from " + cmcdb.dbMedAssayTable +
            " where medPatientId = '" + patientId + "' limit " + 10 * (page - 1) + "," + 10 * page;
        //console.log("sql=" + sql);
        var medAssayResult = db.selectSqlSync({
            name: cmcdb.name,
            sql: sql
        });
        //console.log("medAssayResult=" + JSON.stringify(medAssayResult));

        var pageJson = {
            totalCount: medAssayResult.data.length,
            pageSize: 10,
            totalPage: medAssayResult.data.length / 10 + 1,
            currPage: page
        };
        pageInfo(pageJson);
        $api.html($api.byId('hyjg'), "");
        if (medAssayResult && medAssayResult.data) {
            for (var i = 0; i < medAssayResult.data.length; i++) {
                var item = medAssayResult.data[i];
                var html = '<tr data-id="' + item.id + '" tapmode="trActive" onclick="openDetailWin(this)">' +
                    '<td>' + item.name +
                    '</td>' +
                    '<td>' + item.sendTime +
                    '</td>' +
                    '<td>' + item.reportTime +
                    '</td>' +
                    '<td>' + item.sendDoctorName +
                    '</td>' +
                    '</tr>';
                $api.append($api.byId('hyjg'), html);
            }
        }
    } else {
        //在线
        common.get({
            url: config.medAssayUrl + patientId + "&page=" + page+ "&homepageId="+homepageId,
            isLoading: true,
            success: function (ret) {
                var totalCount = ret.content.totalCount;
                var pageSize = ret.content.pageSize;
                var totalPage = ret.content.totalPage;
                var currPage = ret.content.currPage;
                var pageJson = {
                    totalCount: totalCount,
                    pageSize: pageSize,
                    totalPage: totalPage,
                    currPage: page
                };
                pageInfo(pageJson);

                $api.html($api.byId('hyjg'), "");
                if(ret.content && ret.content.list && ret.content.list.length>0) {
                    for (var i = 0; i < ret.content.list.length; i++) {
                        var item = ret.content.list[i];
                        var html = '<tr data-id="' + item.id + '" tapmode="trActive" onclick="openDetailWin(this)">' +
                            '<td>' + item.name +
                            '</td>' +
                            '<td>' + item.sendTime +
                            '</td>' +
                            '<td>' + item.reportTime +
                            '</td>' +
                            '<td>' + item.sendDoctorName +
                            '</td>' +
                            '</tr>';
                        $api.append($api.byId('hyjg'), html);
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
        name: 'keyback'
    }, function (ret, err) {
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

function openDetailWin(obj) {
    var assayId = $api.attr(obj, 'data-id');//获取化验ID
    api.openWin({
        name: 'win_analysis_detail',
        url: './win_analysis_detail.html',
        vScrollBarEnabled: true,
        hScrollBarEnabled: false,
        slidBackEnabled: false,
        animation: {
            type: 'push',
            subType: 'from_right'
        },
        pageParam: {
            assayId: assayId
        },
        reload: true
    });
}

var pageInfo = function (pageJson) {
    var pageInfoTmpl = doT.template($api.text($api.byId('pageInfo-tmpl')));
    $api.html($api.byId('pageDivContainer'), pageInfoTmpl(pageJson));
}

var firstPage = function () {
    page = 1;
    searchPatientDetail(patientId);
}

var prePage = function () {
    var currentPage = $api.attr($api.byId('pageNumContainer'), 'data-currentPage');
    page = parseInt(currentPage) - 1;
    searchPatientDetail(patientId);
}

var nextPage = function (size) {
    var currentPage = $api.attr($api.byId('pageNumContainer'), 'data-currentPage');
    page = parseInt(currentPage) + 1;
    searchPatientDetail(patientId);
}
