var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
var homepageId = person.homepageId;
var page = 1;

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
            name: 'group',
        });
    });
    $api.addEvt($api.dom('body'), 'click', function () {
        api.closeFrame({
            name: 'frm_fee_detail'
        });
    });
    searchFeeDetail(patientId,page);
};

var searchFeeDetail = function(patientId,spage){
    var params ={};
    params.homepageId = homepageId;
    params.bigKindNum = "";
    params.limit = 10;
    params.medCostId = 0;
    params.page = spage;
    params.patientId = patientId;
    params.precedence = "";
    params.start = 0;
    //alert(spage);
    common.post({
        url: config.preCostList,
        isLoading:true,
        data:params,
        success:function(ret){
            api.hideProgress();
            $api.html($api.byId('tbody'),"");
            if(ret&&ret.content){
                //alert(JSON.stringify(ret.content))
                var preCostTmpl = doT.template($api.text($api.byId('preCostDetailList')));
                $api.html($api.byId('tbody'),preCostTmpl(ret.content));

                var pageTmpl = doT.template($api.text($api.byId('pageDivContainer-tmpl')));
                $api.html($api.byId('pageDivContainer'),pageTmpl(ret.content));

            }

        }
    });
};
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


