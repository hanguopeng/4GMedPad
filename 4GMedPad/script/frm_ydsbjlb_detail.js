var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
var id = ''
var userTime = ''
apiready = function() {
    api.parseTapmode();
    api.addEventListener({
        name : 'keyback'
    }, function(ret, err) {
        api.closeFrameGroup({
            name: 'group'
        });
    });
    var pageParam = api.pageParam;
    id = pageParam.id;
    userTime = pageParam.userTime;
    ydsbjlbDetailCommon(id);
    personInfo();
};


var ydsbjlbDetailCommon = function(id){
    var typeTab = $api.attr($api.dom($api.byId('typeTabContainer'),'.active'),'id');
    common.get({
        url: config.ydsbjlbDetailsUrl + id,
        isLoading: true,
        success:function(ret){
            $api.html($api.byId('tbody'),"");
            var contentTmpl = doT.template($api.text($api.byId('content-tmpl')));
            var contentTmpl1 = doT.template($api.text($api.byId('content-tmpl1')));
            if(ret.content) {
               var obj = {}
               if ('jiliang' === typeTab){
                   var basedBoList = ret.content.basedBoList;
                   for (var i = 0 ; i<basedBoList.length; i++){
                       $api.removeCls($api.byId('table1'), 'notShow');
                       $api.removeCls($api.byId('table2'), 'show');
                       $api.addCls($api.byId('table1'), 'show');
                       $api.addCls($api.byId('table2'), 'notShow');
                       obj = disposebasedBoList(basedBoList[i]);
                       $api.append($api.byId('tbody'), contentTmpl(obj));
                   }
               } else{
                   var monitoringBoList = ret.content.monitoringBoList;
                   for (var i = 0 ; i<monitoringBoList.length; i++){
                       $api.removeCls($api.byId('table2'), 'notShow');
                       $api.removeCls($api.byId('table1'), 'show');
                       $api.addCls($api.byId('table2'), 'show');
                       $api.addCls($api.byId('table1'), 'notShow');
                       obj = disposemonitoringBoList(ret.content.monitoringBoList[i]);
                       $api.append($api.byId('tbody1'), contentTmpl1(obj));
                   }
               }

            }
            api.hideProgress();
        }
    });
};

var disposebasedBoList = function(list){
    var obj = {};
    // 只整理页面需要的字段就可以
    obj["handleTime"] = list.handleTime;
    obj["basedAmount"] = list.basedAmount;
    obj["moring"] = list.moring;
    obj["noon"] = list.noon;
    obj["night"] = list.night;
    obj["nurseName"] = list.nurseName;
    return obj;
};

var disposemonitoringBoList = function(list){
    var obj = {};
    // 只整理页面需要的字段就可以
    obj["handleTime"] = list.handleTime;
    obj["stomach"] = list.stomach;
    obj["moring"] = list.moring;
    obj["noonBefore"] = list.noonBefore;
    obj["noonAfter"] = list.noonAfter;
    obj["nightBefore"] = list.nightBefore;
    obj["nigntAfter"] = list.nigntAfter;
    obj["sleepBefore"] = list.sleepBefore;
    obj["zero"] = list.zero;
    obj["three"] = list.three;
    obj["memo"] = list.memo;
    obj["nurseName"] = list.nurseName;
    return obj;
};

// 加载病人信息
var personInfo = function(){
    var personJson = {
        name: person.name,
        sex: person.sex=="1"?"男":"女",
        ryrq: person.inHospitalTime,
        ks: person.organizationName,
        ch: person.medBedName,
        zyh: person.registerNumber,
        userTime: userTime
    }
    var personInfoTmpl = doT.template($api.text($api.byId('personInfo-tmpl')));
    $api.html($api.byId('personInfo'), personInfoTmpl(personJson));
}

function closeWin(){
    api.closeWin();
}

var changeTab = function(obj){
    var active = $api.hasCls(obj,'active');
    if(!active){
        $api.removeCls($api.byId('jiliang'), 'active');
        $api.removeCls($api.byId('jiance'), 'active');

        $api.addCls(obj, 'active');

        ydsbjlbDetailCommon(id);
    }
};