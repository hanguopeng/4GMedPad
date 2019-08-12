var db;
apiready = function() {
    api.parseTapmode();
    db = api.require('db');
    // var header = document.querySelector('#header');
    // $api.fixStatusBar(header);
    var pageParam = api.pageParam;
    var id = pageParam.id;
    var examineId = pageParam.examineId;
    inspectionDetail(id,examineId);
};

function closeWin(){
    api.closeWin();
}

/*检查结果 返回结果存在问题*/
// todo 20190807 实时数据，本次修改离线功能没有修改
var inspectionDetail = function(id,examineId){
    //console.log("offlineFlag = " + $api.getStorage(storageKey.offlineFlag));
    if($api.getStorage(storageKey.offlineFlag)=="on"){
        var sql = "select * from "+cmcdb.dbMedExamine+" where id = '"+examineId+"'";
        //console.log("sql="+sql);
        var medExamineDetail = db.selectSqlSync({
            name: cmcdb.name,
            sql: sql
        });
        //console.log("medExamineDetail="+JSON.stringify(medExamineDetail));
        if(medExamineDetail && medExamineDetail.data){
            if(medExamineDetail.data.length >= 1){
                var accessoryList = medExamineDetail.data[0].accessoryList;
                // var accessoryDetail = JSON.parse(accessoryList);
                //console.log("accessoryDetail="+JSON.stringify(accessoryDetail));
                $api.html($api.byId('discover'), medExamineDetail.data[0].discover);
                $api.html($api.byId('result'), medExamineDetail.data[0].result);
                // $api.html($api.byId('accessoryList'), "");
                // for(var i = 0;i<accessoryDetail.length;i++){
                //     var item = accessoryDetail[i];
                //     var html = '<div class="detail-item-content aui-padded-t-5">\n' +
                //         '            <a href="javascript:;" class="detail-img-name">'+item.name+'</a>\n' +
                //         '            <div class="detail-img-container">\n' +
                //         '                <img src="'+localServer+"/static"+item.path+'" alt="'+item.name+'">\n' +
                //         '            </div>\n' +
                //         '        </div>';
                //     $api.append($api.byId('accessoryList'),html);
                // }
            }
        }
    }else{
        common.get({
            url: config.medExamineDetailUrl+id+"/"+examineId,
            isLoading: true,
            success:function(ret){
                $api.html($api.byId('discover'), ret.content.discover);
                $api.html($api.byId('result'), ret.content.result);

                // $api.html($api.byId('accessoryList'), "");
                // for(var i = 0;i<ret.content.accessoryList.length;i++){
                //     var item = ret.content.accessoryList[i];
                //     var html = '<div class="detail-item-content aui-padded-t-5">\n' +
                //         '            <a href="javascript:;" class="detail-img-name">'+item.name+'</a>\n' +
                //         '            <div class="detail-img-container">\n' +
                //         '                <img src="'+localServer+"/static"+item.path+'" alt="'+item.name+'">\n' +
                //         '            </div>\n' +
                //         '        </div>';
                //     $api.append($api.byId('accessoryList'),html);
                // }
            }
        });
    }
}
