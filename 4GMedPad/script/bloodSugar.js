var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
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
var requestUrl = config.bloodSugarDetail+"?registerNumber="+registerNumber;
var bloodGlucose = function(patientId){
    common.get({
        url: requestUrl,
        isLoading: true,
        data:JSON.stringify({
          patientId: person.id,
          page: page,
          templateList:[{"templateCode":"bloodSugar","templateVersion":1}]
        }),
        success:function(ret){
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
    obj["xytime"] = content.xytime
    obj["xuetang"] = content.xuetang
    obj["huanzhezicexuetang"] = content.huanzhezicexuetang
    obj["qianzi"] = content.qianzi
    return obj;
};

var personInfo = function(){
    var personJson = {
        name: person.name,
        sex: person.sex=="1"?"男":"女",
        age: person.age,
        ryrq: person.inHospitalTime,
        ks: person.organizationName,
        ch: person.medBedName,
        zyh: person.registerNumber
    }
    var personInfoTmpl = doT.template($api.text($api.byId('personInfo-tmpl')));
    $api.html($api.byId('personInfo'), personInfoTmpl(personJson));
}
