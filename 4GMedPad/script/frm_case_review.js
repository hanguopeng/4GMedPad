var person = $api.getStorage(storageKey.currentPerson);
var patientId = person.id;
var operatorId = $api.getStorage(storageKey.userId);
var UIListMeeting;
var db;
apiready = function() {
  UIListMeeting = api.require('UIListMeeting');
  db = api.require('db');

  api.parseTapmode();
  api.addEventListener({
      name : 'keyback'
  }, function(ret, err) {
      api.closeFrameGroup({
          name: 'group'
      });
  });

  queryLeftList();

}

function queryLeftList(){
  //避免刷新当前页面导致该组件没有关闭，出现多个组件重叠
  UIListMeeting.close({});

  var requestUrl = config.caseQueryUrl+"?patientId="+patientId+"&page=1&limit=10&start=0";
  common.get({
    url: requestUrl,
    isLoading:true,
    success:function(ret){
      initList();
      if(ret.content && ret.content.list && ret.content.list.length>0){
        api.hideProgress();
        addData(ret.content.list);
      }else if(ret.content && ret.content.list && ret.content.list.length==0){
        api.hideProgress();
        api.toast({
          msg : '没有查询到病历信息'
        });
      }
    },
    offline:function(){
      initList();
      //从数据库取数据,然后传入下面的方法添加数据
      db.selectSql({
          name: cmcdb.name,
          sql: "SELECT * FROM " + cmcdb.dlCaseMenu + " where medPatientId='"+ patientId +"' and operatorId='"+ operatorId +"'"
      }, function(ret, err){
          if( ret.status ){
            if(ret.data.length > 0){
              addData(ret.data);
            }else{
              api.toast({
                  msg: '没有查询到对应的信息',
                  duration: config.duration,
                  location: 'bottom'
              });
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

//病历首页
function showIndexInfo(data){
  var contentTmpl = doT.template($api.text($api.byId('index-tpl')));
  fake = {"name":"战三","itemBoList":[{"key":"科室","value":"xx科室"},{"key":"性别","value":"男"},{"key":"出院诊断","value":"小潇洒的解放了卡萨就分了就撒了附近萨克的解放了撒娇的弗兰克"}]};
  //todo 将返回的key,value对，转换成普通对象
  var map = {}
  map["name"]=fake.name
  for (var i = 0; i < fake.itemBoList.length; i++) {
    map[fake.itemBoList[i].key] =  fake.itemBoList[i].value;
  }
  $api.html($api.byId('right'), contentTmpl(map));
}

//入院记录
function showCheckinInfo(data){
  var contentTmpl = doT.template($api.text($api.byId('checkin-tpl')));
  fake = {"name":"战三","itemBoList":[{"key":"科室","value":"xx科室"},{"key":"性别","value":"男"},{"key":"出院诊断","value":"小潇洒的解放了卡萨就分了就撒了附近萨克的解放了撒娇的弗兰克"}]};
  //todo 将返回的key,value对，转换成普通对象
  var map = {}
  map["name"]=fake.name
  for (var i = 0; i < fake.itemBoList.length; i++) {
    map[fake.itemBoList[i].key] =  fake.itemBoList[i].value;
  }
  $api.html($api.byId('right'), contentTmpl(map));
}

//首次病程
function showRecordInfo(data){
  var contentTmpl = doT.template($api.text($api.byId('record-tpl')));
  fake = {"name":"战三","itemBoList":[{"key":"科室","value":"xx科室"},{"key":"性别","value":"男"},{"key":"出院诊断","value":"小潇洒的解放了卡萨就分了就撒了附近萨克的解放了撒娇的弗兰克"}]};
  //todo 将返回的key,value对，转换成普通对象
  var map = {}
  map["name"]=fake.name
  for (var i = 0; i < fake.itemBoList.length; i++) {
    map[fake.itemBoList[i].key] =  fake.itemBoList[i].value;
  }
  $api.html($api.byId('right'), contentTmpl(map));
}

//显示出院记录
function showCheckoutInfo(data){
  var contentTmpl = doT.template($api.text($api.byId('checkout-tpl')));
  fake = {"name":"战三","itemBoList":[{"key":"科室","value":"xx科室"},{"key":"性别","value":"男"},{"key":"出院诊断","value":"小潇洒的解放了卡萨就分了就撒了附近萨克的解放了撒娇的弗兰克"}]};
  //todo 将返回的key,value对，转换成普通对象
  var map = {}
  map["name"]=fake.name
  for (var i = 0; i < fake.itemBoList.length; i++) {
    map[fake.itemBoList[i].key] =  fake.itemBoList[i].value;
  }
  $api.html($api.byId('right'), contentTmpl(map));
}

function showInfo(ret,data){
  //todo 请求具体数据，然后再根据类型调用不同的显示
  if(ret.data.typeCode==caseReviceType.index){
     // $api.html($api.byId("right"),"病历首页");
     showIndexInfo(data);
  }else if(ret.data.typeCode==caseReviceType.checkin){
    //$api.html($api.byId("right"),"入院记录");
    showCheckinInfo(data);
  }else if(ret.data.typeCode==caseReviceType.record){
    //$api.html($api.byId("right"),"首次病程");
    showRecordInfo(data);
  }else if(ret.data.typeCode==caseReviceType.checkout){
    //$api.html($api.byId("right"),"出院记录");
    showCheckoutInfo(data);
  }else{
    api.alert({
        title: '警告',
        msg: "该类型暂不支持"
    });
  }
}

function initList(){

  //todo 手动添加的数据，后续删除
  UIListMeeting.open({
      rect: {
          x: 0,
          y: 0,
          w: 300,
          h: api.frameHeight
      },
      data: [
        {
          head: '病历首页',
          headBg: '#cdcd00',
          name: "编写人",
          title: "2017-10-11",
          typeCode: "index",
          id: 1
       },
       {
         head: '入院记录',
         headBg: '#ff34b3',
         name: "编写人",
         title: "2017-10-11",
         typeCode: "checkin",
         id: 2
      },
      {
        head: '首次病程',
        headBg: '#ff0000',
        name: "编写人",
        title: "2017-10-11",
        typeCode: "record",
        id: 3
     },
     {
       head: '出院记录',
       headBg: '#ffd700',
       name: "编写人",
       title: "2017-10-11",
       typeCode: "checkout",
       id: 4
    }
     ],
      styles:{
        border: {
            color: '#EEE0E5',
            width: 0.5
        },
        item: {
            bgColor: '#F0F0F0',
            activeBgColor: '#EEE9E9',
            height: 80,
            headSize: 60,
            nameSize: 14,
            nameColor: '#000',
            nameWidth: 80,
            titleSize: 12,
            titleColor: '#000',
            titleWidth: 100,
            statusSize: 0,
            markSize: 0
        }
      },
      fixedOn: api.frameName
  }, function(ret, err) {
    if (ret) {
      if(ret.eventType=="clickContent"){
        UIListMeeting.getDataByIndex({
          index: ret.index
        }, function(ret, err) {
          if (ret) {
             //todo 换回真的地址
             //var queryUrl = config.caseInfoUrl+"/"+ret.data.id;
             var queryUrl = config.caseQueryUrl+"?patientId="+patientId+"&page=1&limit=10&start=0";
             common.get({
               url:queryUrl,
               isLoading:true,
               success:function(data){
                 showInfo(ret,data);
                 api.hideProgress();
               },
               offline:function(){
                 db.selectSql({
                     name: cmcdb.name,
                     sql: "SELECT * FROM " + cmcdb.dlCaseMenu + " where id='"+ ret.data.id +"'"
                 }, function(ret, err){
                     if( ret.status ){
                       if(ret.data.length > 0){
                         showInfo(ret,ret.data);
                       }else{
                         api.toast({
                             msg: '没有查询到对应的信息',
                             duration: config.duration,
                             location: 'bottom'
                         });
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
          } else {
             api.hideProgress();
              api.alert({
                  title: '错误',
                  msg: err.msg
              });
          }
        });
      }
    }else{
      alert(err.msg);
      api.hideProgress();
    }
  })
}

function addData(data){
  for (var i = 0; i < data.length; i++) {
    //todo 修改下面四中类型的数据字段
    if(data[i].typeCode=="index"){
      UIListMeeting.appendData({
        data:[{
          head: '病历首页',
          headBg: '#cdcd00',
          name: data[i].author,
          title: data[i].createTime,
          typeCode: "index",
          id: data[i].id
       }]
      });
    }else if(data[i].typeCode=="checkin"){
      UIListMeeting.appendData({
        data:[{
          head: '入院记录',
          headBg: '#ff34b3',
          name: data[i].author,
          title: data[i].createTime,
          typeCode: "checkin",
          id: data[i].id
        }]
      });
    }else if(data[i].typeCode=="record"){
      UIListMeeting.appendData({
        data:[{
          head: '首次病程',
          headBg: '#ff34b3',
          name: data[i].author,
          title: data[i].createTime,
          typeCode: "record",
          id: data[i].id
        }]
      });
    }else if(data[i].typeCode=="checkout"){
      UIListMeeting.appendData({
        data:[{
          head: '出院记录',
          headBg: '#ff34b3',
          name: data[i].author,
          title: data[i].createTime,
          typeCode: "checkout",
          id: data[i].id
        }]
      });
    }

  }
}
