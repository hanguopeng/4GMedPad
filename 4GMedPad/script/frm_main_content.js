var persons = [];
var areaId;
var db;
/*
 * 根据条件查询所有病人信息
 */
function searchPersons(){
  $api.html($api.byId('nurseLevelContent'), "");
  $api.html($api.byId('personContent'), "");
  $api.rmStorage(storageKey.currentPerson);
  $api.rmStorage(storageKey.currentIdx);
  $api.rmStorage(storageKey.lastIdx);
  $api.rmStorage(storageKey.persons);

  var doctorName = $api.trim($api.val($api.byId("doctorName")));
  var nurseName = $api.trim($api.val($api.byId("nurseName")));
  var patientFlag = $api.val($api.dom("input[name='patientFlag']:checked"));
  var emptyBed = $api.byId("emptyBed").checked;

  var requestUrl = config.patientSearchUrl+"?myPatientFlag="+patientFlag+
  "&doctor="+doctorName+"&nurse="+nurseName+"&inpatientArea="+areaId+"&nullBedFlag="+emptyBed+"&operatorId="+$api.getStorage(storageKey.userId);
  common.get({
    url:requestUrl,
    isLoading:true,
    success:function(ret){
      api.hideProgress();
      $api.removeCls($api.byId('nurseLevelContent'), 'aui-hide');
      var arry = $api.domAll($api.byId('searchSection'), ".offline-hide");
      for (var i = 0; i < arry.length; i++) {
        $api.removeCls(arry[i], 'aui-hide');
      }
      //动态添加病人信息
      if(ret.content && ret.content.list && ret.content.list.length>0){
          for(var i=0;i<ret.content.list.length;i++){
              var lis = ret.content.list[i];
              lis.inHospitalTime = lis.inHospitalTime.slice(0,10);
          }

        var levelInfo = doT.template($api.text($api.byId('nurse-level-tpl')));
        var personInfo = doT.template($api.text($api.byId('person-info-tpl')));
        $api.html($api.byId('nurseLevelContent'), levelInfo(ret.content));
        $api.html($api.byId('personContent'), personInfo(ret.content));
        //存储persons
        persons = ret.content.list;
        $api.setStorage(storageKey.persons, persons);
      }else if(ret.content && ret.content.list && ret.content.list.length==0){
        api.toast({
          msg : '无患者'
        });
      }
    },
    offline:function(){
      //去掉不需要显示的部分
      $api.addCls($api.byId('nurseLevelContent'), 'aui-hide');
      var arry = $api.domAll($api.byId('searchSection'), ".offline-hide");
      for (var i = 0; i < arry.length; i++) {
        $api.addCls(arry[i], 'aui-hide');
      }


      db.selectSql({
          name: cmcdb.name,
          sql: "SELECT * FROM " + cmcdb.dlPatientTable + " where bed_organization_id = '"+ areaId +"' and operator_id='" + $api.getStorage(storageKey.userId) +"'"
      }, function(ret, err){
          if( ret.status ){
            if(ret.data.length > 0){
              var personInfo = doT.template($api.text($api.byId('offline-person-info-tpl')));
              $api.html($api.byId('personContent'), personInfo(ret.data));
              //存储persons
              persons = ret.data;
              //console.log("persons="+ JSON.stringify(persons));
              $api.setStorage(storageKey.persons, persons);
            }
          }else{
              api.alert({
                  title: '错误',
                  msg: ret.msg
              });
          }
          api.hideProgress();
      });
    }
  });
}

/**
 * 重置查询条件，查询病人信息
 */
function refresh(){
  //设置所有选项为初始值
  /*var doctorName = $api.val($api.byId("doctorName"));
  var nurseName = $api.val($api.byId("nurseName"));
  var emptyBedFlag = $api.byId("emptyBed").checked
  $api.dom("input[name='patientFlag'][value='0']").checked=true;*/
  searchPersons();
}

/**
 * 添加病区修改监听器，当header上面的下拉框修改之后，重新进行查询
 */
function addInpatientAreaChangedListener(){
  api.addEventListener({
      name: eventName.InpatientAreaChanged
  }, function(ret, err) {
      areaId=ret.value.areaId;
      searchPersons();
  });
}

function addOfflineOrOnlineListener(){
  api.addEventListener({
      name: eventName.offlineOrOnline
  }, function(ret, err) {
      searchPersons();
  });
}

apiready = function() {
  api.parseTapmode();
  areaId = api.pageParam.areaId;
  db = api.require('db');
  searchPersons();
  addInpatientAreaChangedListener();
  addOfflineOrOnlineListener();
};

function openPersonCenter(idx){
  var allPersons = $api.getStorage(storageKey.persons);
  var person = allPersons[idx];
  $api.setStorage(storageKey.currentPerson, person);
  $api.setStorage(storageKey.currentIdx, idx); //左右箭头的时候需要
  $api.setStorage(storageKey.lastIdx, allPersons.length-1); //设置最后一个索引的大小，length-1

  api.openDrawerLayout({
        name: 'drawer_person_content',
        url: './drawer_person_content.html',
        animation:{
            type:'flip'
        },
        leftPane:{
            edge: api.winWidth-250,
            name: 'drawer_person_menu',
            url: './drawer_person_menu.html'
        }
    });
}
/**
* 打开用户信息页面
*/
function openMenu(){
  api.openDrawerPane({
      type: 'right'
  });
}

function download(){
  api.openWin({
      name: 'win_download',
      url: '../html/win_download.html',
      reload: true
  });

}


// add by Mela.s 20190808
function subStrDate(date) {
    if (!isEmpty(date)){
        return date.slice(0, 11)
    }
}

function isEmpty(str){
    if (str === null || str ==='' || str === undefined){
        return true
    }
}