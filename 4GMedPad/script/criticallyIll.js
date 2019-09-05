var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
var homepageId = person.homepageId
var registerNumber= person.registerNumber
var page = 1;

apiready = function() {
    api.addEventListener({
        name : 'keyback'
    }, function(ret, err) {
        api.closeFrameGroup({
            name: 'group'
        });
    });

    bloodGlucose(patientId);
    personInfo();
};
var requestUrl = config.criticallyIllQuery;
var bloodGlucose = function(patientId){
    common.post({
        url: requestUrl,
        isLoading: true,
        data:JSON.stringify({
          patientId: person.id,
          homepageId:homepageId,
          page: page,
          templateList:[{"templateCode":"xyzlkwzhzhld","templateVersion":1}]
        }),
        success:function(ret){
            //alert(JSON.stringify(ret));
            $api.html($api.byId('tbody'),"");
            var contentTmpl = doT.template($api.text($api.byId('content-tmpl')));
            if(ret.content && ret.content && ret.content.length>0) {
                for (var i = 0; i < ret.content.length; i++) {
                    var obj = dealItemKeyValue(ret.content[i]);
                    $api.append($api.byId('tbody'), contentTmpl(obj));
                }
            }
            api.hideProgress();
        }
    });
}

var dealItemKeyValue = function(content){
    var obj = {};
    obj["xydate"] = content.xydate
    obj["tiwen"] = content.tiwen
    obj["maibo"] = content.maibo
    obj["huxi"] = content.huxi
    obj["xueya"] = content.xueya

    obj["xueyangbaohedu"] = content.xueyangbaohedu
    obj["xiyang"] = content.xiyang
    obj["ruliangmingcheng"] = content.ruliangmingcheng
    obj["ruliangml"] = content.ruliangml
    obj["chuliangmingcheng"] = content.chuliangmingcheng
   obj["chuliangml"] = content.chuliangml

    obj["yansexingzhuang"] = content.yansexingzhuang
    obj["yishi"] = content.yishi
    obj["yinshi"] = content.yinshi
    obj["tiwei"] = content.tiwei
    obj["pifuqingkuang"] = content.pifuqingkuang
    obj["daoguanguanli"] = content.daoguanguanli

    obj["jiankangjiaoyu"] = content.jiankangjiaoyu
    obj["bingqingguancha"] = content.bingqingguancha
    obj["hulicuoshi"] = content.hulicuoshi
    obj["hushiqianming"] = content.hushiqianming

    return obj;
};

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
