var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
var page = 1;

apiready = function() {
    api.parseTapmode();
    api.addEventListener({
        name : 'keyback'
    }, function(ret, err) {
        api.closeFrameGroup({
            name: 'group'
        });
    });
    smtzjcjldCommon();
    personInfo();
};


var smtzjcjldCommon = function(){
    common.get({
        url: config.smtzjcjldUrl + "?registerNumber=" +person.registerNumber + "&page=" + page + "&limit=10",
        isLoading: true,
        success:function(ret){
            var totalCount = ret.content.totalCount;
            var pageSize = ret.content.pageSize;
            var totalPage = ret.content.totalPage;
            var currPage = ret.content.currPage;
            var pageJson = {
                totalCount:totalCount,
                pageSize:pageSize,
                totalPage:totalPage,
                currPage:currPage
            };
            pageInfo(pageJson);
            $api.html($api.byId('tbody'),"");
            var contentTmpl = doT.template($api.text($api.byId('content-tmpl')));
            if(ret.content && ret.content.list && ret.content.list.length>0) {
                for (var i = 0; i < ret.content.list.length; i++) {
                    var obj = disposeList(ret.content.list[i]);
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
    obj["handleTime"] = list.handleTime;
    obj["temperature"] = list.temperature;
    var pulse = list.pulse
    var pulse1 = list.pulse1
    obj["pulse"] = ""
    if (pulse && !pulse1){
        obj["pulse"] = "自测：" + pulse;
    }else if (!pulse && pulse1) {
        obj["pulse"] = "起搏器：" + pulse1;
    }else if (pulse && pulse1){
        obj["pulse"] = "自测：" + pulse + " / 起搏器：" + pulse1;
    }
    obj["breathRate"] = list.breathRate;
    var bloodPressureLow = list.bloodPressureLow;
    var bloodPressureHigh = list.bloodPressureHigh;
    if (bloodPressureLow && bloodPressureHigh){
       obj["bloodPressure"] = bloodPressureLow+"/"+bloodPressureHigh;
    }
    obj["input"] = list.input;
    obj["inputMl"] = list.inputMl;
    obj["output"] = list.output;
    obj["outputMl"] = list.outputMl;
    obj["hsqm"] = list.hsqm;
    return obj;
};

// 加载病人信息
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

// 加载页数信息
var pageInfo = function(pageJson){
    var pageInfoTmpl = doT.template($api.text($api.byId('pageInfo-tmpl')));
    $api.html($api.byId('pageDivContainer'), pageInfoTmpl(pageJson));
}

// 第一页
var firstPage = function(){
    page = 1;
    smtzjcjldCommon(patientId);
}

// 上一页
var prePage = function(){
    var currentPage = $api.attr($api.byId('pageNumContainer'),'data-currentPage');
    page = parseInt(currentPage) - 1;
    smtzjcjldCommon(patientId);
}

// 下一页
var nextPage = function(size){
    var currentPage = $api.attr($api.byId('pageNumContainer'),'data-currentPage');
    page = parseInt(currentPage) + 1;
    smtzjcjldCommon(patientId);
}
