var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
var homepageId = person.homepageId;
var page = 1;
var spage = 1;
var haptime ;
var feeitem ;
var oraitem ;
apiready = function () {
    api.parseTapmode();
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
    searchFeeDetail(patientId,page);
    //costDetailInfo(patientId);
};

/*var searchPersons = function (){
    var yzyxj = '';
    var yzdlcfh = '';
    //var yzyxj = $api.val($api.byId('yzyzj') );
    //var yzdlcfh = $api.val($api.byId('yzdlcfh'));
    //alert(config.costSearch+"?patientId="+patientId + "&bigKindNum=" + yzdlcfh + "&precedence=" + yzyxj);
    common.get({
        url:config.costItemDetail+"?patientId="+patientId + "&bigKindNum=" + yzdlcfh + "&precedence=" + yzyxj,
        isLoading: true,
        success:function (ret) {
            $api.html($api.byId('tbody'),"");
            if(ret.content && ret.content.list && ret.content.list.length>0) {
                ret.content.tnum = 0;
                ret.content.tsubtotal = 0;
                ret.content.tpackNum = 0;
                ret.content.tnoSendNum = 0;
                ret.content.tsendBackNum = 0;
                ret.content.tselfPay = 0;
                ret.content.ttallyPay = 0;
                ret.content.tdiscountPay = 0;
                for (var i = 0; i < ret.content.list.length; i++) {
                    ret.content.list[i].id = i+1;
                    var trInfoTmpl = doT.template($api.text($api.byId('trInfo-tmpl')));
                    $api.append($api.byId('tbody'), trInfoTmpl(ret.content.list[i]));
                    ret.content.tnum = (ret.content.tnum + ret.content.list[i].num).toFixed(2);
                    ret.content.tsubtotal = (ret.content.tsubtotal + ret.content.list[i].subtotal).toFixed(2);
                    ret.content.tpackNum = (ret.content.tpackNum + ret.content.list[i].packNum).toFixed(2);
                    ret.content.tnoSendNum = (ret.content.tnoSendNum + ret.content.list[i].noSendNum).toFixed(2);
                    ret.content.tsendBackNum = (ret.content.tsendBackNum + ret.content.list[i].sendBackNum).toFixed(2);
                    ret.content.tselfPay = (ret.content.tselfPay + ret.content.list[i].selfPay).toFixed(2);
                    ret.content.ttallpay = (ret.content.ttallpay + ret.content.list[i].tallpay).toFixed(2);
                    ret.content.tdiscountPay = (ret.content.tdiscountPay + ret.content.list[i].discountPay).toFixed(2);

                }
                var totalTmpl = doT.template($api.text($api.byId('total-tmpl')));
                $api.html($api.byId('taotal'), totalTmpl(ret.content));
            }
        }
    })
}*/
var btntest = function(){
    var haptime = $api.val($api.byId('hpp-time'));;
    var feeitem = $api.val($api.byId('fee-item'));
    var oraitem = $api.val($api.byId('ora-item'));
    //alert('haptime: '+haptime+'  feeitem:'+feeitem+'  oraitem:'+oraitem);
}

var searchFeeDetail = function(patientId,spage){

    //alert('haptime: '+haptime+'  feeitem:'+feeitem+'  oraitem:'+oraitem);
    var params ={};
    params.homepageId = homepageId;
    params.page = spage;
    params.patientId = patientId;
    params.departmentName = oraitem;
    params.costType = feeitem;
    params.prepayDate = haptime;
    common.post({
        url: config.costListDetails,
        isLoading: true,
        data:params,
        success:function(ret){
            api.hideProgress();
            var totalCount = ret.content.totalCount;
            var pageSize = ret.content.pageSize;
            var totalPage = ret.content.totalPage;
            var currPage = ret.content.currPage;
            var pageJson = {
                totalCount:totalCount,
                pageSize:pageSize,
                totalPage:totalPage,
                currPage:currPage,
            };
            pageInfo(pageJson);
            $api.html($api.byId('tbody'),"");
            if(ret.content && ret.content.list && ret.content.list.length>0) {
                    var trInfoTmpl = doT.template($api.text($api.byId('trInfo-tmpl')));
                    $api.html($api.byId('tbody'), trInfoTmpl(ret.content.list));
            }
        }
    });
};


var searchTip = function(){
     haptime = $api.val($api.byId('hpp-time'));;
     feeitem = $api.val($api.byId('fee-item'));
     oraitem = $api.val($api.byId('ora-item'));

    //alert('haptime: '+haptime+'  feeitem:'+feeitem+'  oraitem:'+oraitem);
    searchFeeDetail(patientId,page);

}
/*
var costDetailInfo = function(patientId){
    common.get({
        url: config.costDetail+patientId,
        isLoading: true,
        success:function(ret){
            var feeInfoTmpl = doT.template($api.text($api.byId('feeInfo-tmpl')));
            $api.html($api.byId('searchInfo'), feeInfoTmpl(ret.content));
        }
    });
};
*/


/*var pageInfo = function(pageJson){
    var pageInfoTmpl = doT.template($api.text($api.byId('pageInfo-tmpl')));
    $api.html($api.byId('pageDivContainer'), pageInfoTmpl(pageJson));
}

var firstPage = function(){
    page = 1;
    searchFeeDetail(patientId,page);
}

var prePage = function(){
    var currentPage = $api.attr($api.byId('pageNumContainer'),'data-currentPage');
    if(currentPage>1){
        spage = parseInt(currentPage) - 1;
    }else{
        api.toast({
            msg: '已经是第一页啦',
            duration: 2000,
            location: 'bottom'
        });
        return;
    }

    searchFeeDetail(patientId,spage);
}

var nextPage = function(npage){
    var currentPage = $api.attr($api.byId('pageNumContainer'),'data-currentPage');
    spage =npage;
    searchFeeDetail(patientId,spage);
}*/

var pageInfo = function(pageJson){
    var pageInfoTmpl = doT.template($api.text($api.byId('pageInfo-tmpl')));
    $api.html($api.byId('pageDivContainer'), pageInfoTmpl(pageJson));
}

var firstPage = function(){
    page = 1;
    searchFeeDetail(patientId,page);
}

var prePage = function(){
    var currentPage = $api.attr($api.byId('pageNumContainer'),'data-currentPage');
    page = parseInt(currentPage) - 1;
    searchFeeDetail(patientId,page);
}

var nextPage = function(){
    var currentPage = $api.attr($api.byId('pageNumContainer'),'data-currentPage');
    page = parseInt(currentPage) + 1;
    searchFeeDetail(patientId,page);
}
