var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
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
    //alert(spage);
    common.get({
        url: config.costItemDetails+patientId + "&page="+spage,
        isLoading: true,
        success:function(ret){

            /*$api.html($api.byId('tbody'),"");*/
            var feeInfo = doT.template($api.text($api.byId('feeInfo-tmpl')));
            $api.html($api.byId('searchInfo'),feeInfo(""));
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
    spage = parseInt(currentPage) - 1;
    searchFeeDetail(patientId,spage);
}

var nextPage = function(npage){
    var currentPage = $api.attr($api.byId('pageNumContainer'),'data-currentPage');
    spage =npage;
    searchFeeDetail(patientId,spage);
}

function openFeeDetails() {
    api.closeFrame({
        name: 'frm_fee_detail'
    });

        //alert('1111');
        api.openFrame({
            name: 'frm_fee_detail',
            url: './frm_fee_detail.html',
            rect: {
                x: api.winWidth - 600,
                y: api.winHeight - api.frameHeight,
                w: 600,
                h: api.frameHeight
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
            vScrollBarEnabled: true,
            hScrollBarEnabled: false,
            reload:true
        });
        //alert('222');

}
