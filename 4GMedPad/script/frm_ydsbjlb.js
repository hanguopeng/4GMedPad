var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
apiready = function() {
    api.parseTapmode();
    api.addEventListener({
        name : 'keyback'
    }, function(ret, err) {
        api.closeFrameGroup({
            name: 'group'
        });
    });
    ydsbjlbCommon();
    personInfo();
};


var ydsbjlbCommon = function(){
    common.get({
        url: config.ydsbjlbUrl + patientId,
        isLoading: true,
        success:function(ret){
            $api.html($api.byId('tbody'),"");
            var contentTmpl = doT.template($api.text($api.byId('content-tmpl')));
            if(ret.content && ret.content.length>0) {
                for (var i = 0; i < ret.content.length; i++) {
                    var obj = disposeList(ret.content[i]);
                    $api.append($api.byId('tbody'), contentTmpl(obj));
                }
            }
            api.hideProgress();
        }
    });
};

var disposeList = function(list){
    var obj = {};
    // 只整理页面需要的字段就可以
    // 用泵时间
    obj["userTime"] = list.userTime;
    // 护士签名
    obj["nurseName"] = list.nurseName;
    // 创建时间
    obj["createTime"] = list.createTime;
    obj["id"] = list.id;
    return obj;
};

// 加载病人信息
var personInfo = function(){
    var personJson = {
        name: person.name,
        sex: person.sex=="1"?"男":"女",
        ryrq: person.inHospitalTime,
        ks: person.organizationName,
        diagnose: person.diagnose
    }
    var personInfoTmpl = doT.template($api.text($api.byId('personInfo-tmpl')));
    $api.html($api.byId('personInfo'), personInfoTmpl(personJson));
}

function openDetailWin(obj){
    var id = $api.attr(obj,'data-id');//获取化验ID
    var userTime = $api.attr(obj,'data-userTime');//获取用泵时间
    api.openWin({
        name: 'frm_ydsbjlb_detail.html',
        url: './frm_ydsbjlb_detail.html',
        vScrollBarEnabled:true,
        hScrollBarEnabled:false,
        slidBackEnabled:false,
        animation:{
            type:'push',
            subType:'from_right'
        },
        pageParam:{
            id:id,
            userTime:userTime
        },
        reload:true
    });
}