var adviceId
var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
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
    adviceId = api.pageParam.adviceId;
    yzjsDeatils(adviceId);
};
// 医嘱记录详情
var yzjsDeatils = function(adviceId){
    $api.html($api.byId("thead"), "");
    var contentTmpl = doT.template($api.text($api.byId('thead1-tmpl')));
    $api.html($api.byId('thead'), contentTmpl(''));

    $api.html($api.byId("tbody"), "");
    var contentTmpl = doT.template($api.text($api.byId('trInfo-tmpl')));
    $api.html($api.byId('tbody'), contentTmpl(''));
    /*common.get({
        url:"",
        isLoading:false,
        success:function(ret){
            if(ret&&ret.content){

            }

        }
    })*/

}

// 医嘱发送记录详情
var yzfsjlDetails = function(adviceId){
    $api.html($api.byId("thead"), "");
    var contentTmpl = doT.template($api.text($api.byId('thead2-tmpl')));
    $api.html($api.byId('thead'), contentTmpl(''));


    common.post({
        url: config.querySendList,
        isLoading: true,
        data: JSON.stringify({
            patientId:  patientId,   //病人ID
            homepageId:  person.homepageId,
            adviceId: adviceId
        }),
        dataType: "json",
        success: function (ret) {
            $api.html($api.byId("tbody"), "");
            var contentTmpl = doT.template($api.text($api.byId('trInfo-tmp2')));
            $api.html($api.byId('tbody'), contentTmpl(ret.content.list));
        }
    });

}

var changeTab = function(obj){
    var active = $api.hasCls(obj,'active');
    if(!active){
        $api.removeCls($api.byId('yzjj'), 'active');
        $api.removeCls($api.byId('yzfs'), 'active');
        $api.addCls(obj, 'active');
        var tabValue = $api.attr(obj,'value');
        if("医嘱计价内容"==tabValue){
            yzjsDeatils();
        }else{
            yzfsjlDetails();
        }

    }
};
