var db;
apiready = function() {
    api.parseTapmode();
    db = api.require('db');
    // var header = document.querySelector('#header');
    // $api.fixStatusBar(header);
    var pageParam = api.pageParam;
    var assayId = pageParam.assayId;
    assayDetail(assayId);
};

function closeWin(){
    api.closeWin();
}

var assayDetail = function(assayId){
    if($api.getStorage(storageKey.offlineFlag)=="on"){
        var sql = "select * from "+cmcdb.dbMedAssayTable+" where id = '"+assayId+"'";
        var medAssayDetail = db.selectSqlSync({
            name: cmcdb.name,
            sql: sql
        });
        if(medAssayDetail && medAssayDetail.data){
            if(medAssayDetail.data.length >= 1){
                var itemList = medAssayDetail.data[0].itemList;
                var itemDetail = JSON.parse(itemList);
                $api.text($api.byId('assayDetailName'), medAssayDetail.data[0].name);
                $api.html($api.byId('hyjgMx'), "")
                for(var i=0;i<itemDetail.length;i++){
                    var item = itemDetail[i];
                    var exceptionsHint = item.exceptionsHint;
                    var exceptionsHintHtml = "<span>"+item.exceptionsFlag+"</span>";
                    if(exceptionsHint &&
                        (exceptionsHint == 'H'
                            || exceptionsHint == 'h'
                            || exceptionsHint == 'L'
                            || exceptionsHint == 'l')
                    ) {
                        exceptionsHintHtml = "<span style='color: red;'>"+item.exceptionsFlag+"</span>";
                    }
                    var html = '<tr>' +
                        '           <td>' + item.key +
                        '           </td>' +
                        '           <td>' + item.value +
                        '           </td>' +
                        '           <td>' + item.referenceValue +
                        '           </td>' +
                        '           <td>' + exceptionsHintHtml+
                        '           </td>' +
                        '       </tr>';
                    $api.append($api.byId('hyjgMx'),html);
                }
            }
        }
    }else{
        common.get({
            url: config.medAssayDetailUrl+assayId,
            isLoading: true,
            success:function(ret){
                $api.text($api.byId('assayDetailName'), ret.content.name);
                $api.html($api.byId('hyjgMx'), "");
                for(var i=0;i<ret.content.itemList.length;i++){
                    var item = ret.content.itemList[i];
                    var exceptionsHint = item.exceptionsHint;
                    var exceptionsHintHtml = "<span>"+item.exceptionsFlag+"</span>";
                    if(exceptionsHint &&
                        (exceptionsHint == 'H'
                            || exceptionsHint == 'h'
                            || exceptionsHint == 'L'
                            || exceptionsHint == 'l')
                    ) {
                        exceptionsHintHtml = "<span style='color: red;'>"+item.exceptionsFlag+"</span>";
                    }
                    var html = '<tr>' +
                        '           <td>' + item.key +
                        '           </td>' +
                        '           <td>' + item.value +
                        '           </td>' +
                        '           <td>' + item.referenceValue +
                        '           </td>' +
                        '           <td>' + exceptionsHintHtml+
                        '           </td>' +
                        '       </tr>';
                    $api.append($api.byId('hyjgMx'),html);
                }
            }
        });
    }
};
