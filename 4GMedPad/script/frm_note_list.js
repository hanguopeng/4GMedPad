var UIListMeeting;
var db;
var chooseLocalId;
var localCloudFlag = false;
apiready = function() {
  api.parseTapmode();
  UIListMeeting = api.require('UIListMeeting');
  db = api.require('db');

  //定义点击tab切换本地和云端音频
  var tab = new auiTab({
      element:document.getElementById("tab"),
  },function(ret){
      if(ret.index==1){
        showLocalNote();
          localCloudFlag = false;
      }else if(ret.index==2){
        showCloudNote();
          localCloudFlag = true;
      }
  });

  showLocalNote();

  //回退事件
  api.addEventListener({
    name : 'keyback'
  }, function(ret, err) {
    UIListMeeting.close({});
    // api.sendEvent({
    //     //病区页面刷新
    //     name: 'main_refresh'
    // });
    api.closeFrameGroup({
      name: 'group'
    });
  });

}

var pageSize = 20;
var curNum = 0;
var dataId = 0;
var cloudPage = 1;//第几页

function initPager(){
  curNum = 0;
  dataId = 0;
  cloudPage = 1;
}

var searchLocCloud  = function(){
    if(localCloudFlag==false){
        showLocalNote();
    }else{
        showCloudNote();
    }

}
//显示本地笔记列表
function showLocalNote(){
  var contentHeight = $api.byId("tab").offsetHeight;
  //避免刷新当前页面导致该组件没有关闭，出现多个组件重叠
  UIListMeeting.close({});
  initPager();

  if( openNoteList(contentHeight) !== -1 ){
      //从数据库中分页读取数据，构造列表
      pagerLocalSearch();
  }

  UIListMeeting.setRefreshFooter({
      loadingImg: 'widget://res/UIListMeeting_arrow.png',
      bgColor: '#F5F5F5',
      textColor: '#8E8E8E',
      textUp: '上拉加载更多...',
      textDown: '松开开始加载...',
      showTime: false
  }, function(ret, err) {
      if (ret) {
          UIListMeeting.reloadData();
          pagerLocalSearch();
      } else {
        api.alert({
            title: '错误',
            msg: err.msg
        });
      }
  });

  UIListMeeting.setRefreshHeader({
    loadingImg: 'widget://res/UIListMeeting_arrow.png',
    bgColor: '#F5F5F5',
    textColor: '#8E8E8E',
    textDown: '下拉可以刷新...',
    textUp: '松开开始刷新...',
    showTime: false
  }, function(ret, err) {
      if (ret) {
        UIListMeeting.reloadData({data:[]});
        initPager();
        pagerLocalSearch();
      } else {
        api.alert({
            title: '错误',
            msg: err.msg
        });
      }
  });
}

//显示云端笔记列表
function showCloudNote(){
  var contentHeight = $api.byId("tab").offsetHeight;
  //避免刷新当前页面导致该组件没有关闭，出现多个组件重叠
  UIListMeeting.close({});
  initPager();
  //todo 从远端接口分页读取数据，构造列表
  if( openNoteList(contentHeight) !== -1 ){
      pagerCloudSearch();
  }

  UIListMeeting.setRefreshFooter({
      loadingImg: 'widget://res/UIListMeeting_arrow.png',
      bgColor: '#F5F5F5',
      textColor: '#8E8E8E',
      textUp: '上拉加载更多...',
      textDown: '松开开始加载...',
      showTime: false
  }, function(ret, err) {
      if (ret) {
          UIListMeeting.reloadData();
          pagerCloudSearch();
      } else {
        api.alert({
            title: '错误',
            msg: err.msg
        });
      }
  });

  UIListMeeting.setRefreshHeader({
    loadingImg: 'widget://res/UIListMeeting_arrow.png',
    bgColor: '#F5F5F5',
    textColor: '#8E8E8E',
    textDown: '下拉可以刷新...',
    textUp: '松开开始刷新...',
    showTime: false
  }, function(ret, err) {
      if (ret) {
        UIListMeeting.reloadData({data:[]});
        initPager();
        pagerCloudSearch();
      } else {
        api.alert({
            title: '错误',
            msg: err.msg
        });
      }
  });
}

function pagerLocalSearch(){
  api.showProgress({
    title:'',
    text: '努力加载中...'
  });
  var person = $api.getStorage(storageKey.currentPerson);
  var userId = $api.getStorage(storageKey.userId);
  if(curNum == 0){
    var sql = "SELECT * FROM " + cmcdb.resTable + " where person_id='"+ person.id +"' and res_type='1' and user_id='"+ userId +"' order by id desc limit " + curNum + "," + pageSize;
  }else{
    var sql = "SELECT * FROM " + cmcdb.resTable + " where id <'"+ dataId +"' and person_id='"+ person.id +"' and res_type='1' and user_id='"+ userId +"' order by id desc limit 0," + pageSize;
  }

  //console.log("sql="+sql);
  var audioList = db.selectSqlSync({
      name: cmcdb.name,
      sql: sql
  });

  if(audioList.status){
    curNum = curNum + audioList.data.length;
    for(var i=0;i<audioList.data.length;i++){
      //console.log(JSON.stringify(audioList.data[i]));
      if(audioList.data.length-1 == i){
        dataId = audioList.data[i].id;
      }

      if(audioList.data[i].status == "0"){
        //本地未上传
        UIListMeeting.appendData({
          data:[{head: i+1,
             headBg: '#cdcd00',
             name: audioList.data[i].res_name,
             title: audioList.data[i].create_date,
             btnType:0,
             content: audioList.data[i].content,
             createDate:audioList.data[i].create_date,
             localId: audioList.data[i].id,
             rightBtns: [{
                 bgColor: '#388e8e',
                 activeBgColor: '',
                 width: 60,
                 title: '上传',
                 titleSize: 12,
                 titleColor: '#fff',
                 icon: '',
                 iconWidth: 20
             },{
                 bgColor: '#CD3700',
                 activeBgColor: '',
                 width: 60,
                 title: '删除',
                 titleSize: 12,
                 titleColor: '#fff',
                 icon: '',
                 iconWidth: 20
             }]
           }
          ]
        });
        }else if(audioList.data[i].status == "1")
        {
          //本地已经上传
          UIListMeeting.appendData({
            data:[{head: i+1,
               headBg: '#388E8E',
               name: audioList.data[i].res_name,
               title:audioList.data[i].create_date,
               btnType:1,
               content: audioList.data[i].content,
               createDate:audioList.data[i].create_date,
               localId: audioList.data[i].id,
               fileId: audioList.data[i].file_id,
               rightBtns: [{
                   bgColor: '#CD3700',
                   activeBgColor: '',
                   width: 60,
                   title: '删除',
                   titleSize: 12,
                   titleColor: '#fff',
                   icon: '',
                   iconWidth: 20
               }]
             }
            ]
          });
        }

    }
    api.hideProgress();
  }else{
    api.hideProgress();
    api.alert({
        title: '错误',
        msg: audioList.msg
    });
  }
}

/**
 * 根据数据库id查询显示记事本内容
 */
function showNote(id){
  chooseLocalId = id;
  var sql = "SELECT * FROM " + cmcdb.resTable + " where id='"+ id +"'";
  var nodeList = db.selectSqlSync({
      name: cmcdb.name,
      sql: sql
  });

  if(nodeList.status){
    if(nodeList.data.length>0){
      var content = doT.template($api.text($api.byId('content-tmpl')));
      data = {name:nodeList.data[0].res_name,content:nodeList.data[0].content};
      $api.html($api.byId('content'), content(data));
    }
  }else{
    api.alert({
        title: '错误',
        msg: nodeList.msg
    });
  }
}

function openNoteList(contentHeight){
  UIListMeeting.open({
      rect: {
          x: 0,
          y: contentHeight,
          w: 500,
          h: api.frameHeight-contentHeight
      },
      data: [],
      styles:{
        border: {
            color: '#EEE0E5',
            width: 0.5
        },
        item: {
            bgColor: '#F0F0F0',
            activeBgColor: '#EEE9E9',
            height: 50,
            headSize: 30,
            nameSize: 14,
            nameColor: '#000',
            nameWidth: 200,
            titleSize: 12,
            titleColor: '#000',
            titleWidth: 150,
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
              //如果是云端的，必须先下载然后再查看
              if(ret.data.btnType==2){
                api.toast({
                    msg: '请先下载后查看',
                    duration: config.duration,
                    location: 'bottom'
                });
              }else{
                //这是是下载过的，因此可以直接查询数据库显示内容
                showNote(ret.data.localId);
              }
           } else {
               api.alert({
                   title: '错误',
                   msg: err.msg
               });
           }
         });
       }else if(ret.eventType=="clickRightBtn"){
         //console.log("点击功能按钮"+ret.btnIndex);
         UIListMeeting.getDataByIndex({
           index: ret.index
         }, function(ret1, err) {
           if (ret1) {
               btnType = ret1.data.btnType;
               //console.log("btnType="+btnType);
               if(btnType == 0){
                 //console.log("进入本地未上传逻辑");
                 //本地未上传
                 if(ret.btnIndex == 0){
                   //上传
                   uploadLocalNote(ret.index);
                 }else if(ret.btnIndex == 1){
                   //本地删除
                   deleteLocalNote(ret.index);
                 }
               }else if(btnType == 1){
                 //本地已上传
                 if(ret.btnIndex == 0){
                   //本地删除
                   deleteLocalNote(ret.index);
                 }
               }else if(btnType == 2){
                 //云端未下载
                 if(ret.btnIndex == 0){
                   //下载
                   downloadCloudNote(ret.index);
                 }else if(ret.btnIndex == 1){
                   //云端删除
                   deleteCloudNote(ret.index);
                 }
               }else if(btnType == 3){
                 //云端已下载
                 if(ret.btnIndex == 0){
                   //云端删除
                   deleteCloudNote(ret.index);
                 }
               }
           } else {
             api.alert({
                 title: '错误',
                 msg: err.msg
             });
            return;
           }
         });
       }
     }else{
       alert(err.msg);
       api.hideProgress();
       return -1;
     }
  });
}

function deleteLocalNote(index){
  api.confirm({
      title: '提示',
      msg: '您确定删除该备忘吗？',
      buttons: ['确定', '取消']
  }, function(r, e){
    if(r.buttonIndex==1){
      UIListMeeting.getDataByIndex({
        index: index
      },function(ret,err){
        var id = ret.data.localId;
        var result = db.selectSqlSync({
            name: cmcdb.name,
            sql: "delete from " + cmcdb.resTable + " where id='"+ id +"'"
        });
        if(result.status){
          UIListMeeting.deleteItem({
            index: index
          },function(ret1, err1){
            if(!ret1.status){
              api.alert({
                  title: '错误',
                  msg: '删除列表失败',
              });
            }else{
              api.toast({
                  msg: '删除成功',
                  duration: config.duration,
                  location: 'bottom'
              });
            }
          })
        }else{
          api.alert({
              title: '删除记录错误',
              msg: result.msg
          });
        }
      });
    }
  });
}

function uploadLocalNote(index){
  api.showProgress({
    title:'',
    text: '上传中...'
  });

  UIListMeeting.getDataByIndex({
    index: index
  },function(ret,err){
    var localId = ret.data.localId;
    var userId = $api.getStorage(storageKey.userId);
    var person = $api.getStorage(storageKey.currentPerson);

    api.ajax({
      url: config.accessoryInfoUrl,
      method: 'post',
      headers: {
        "Content-Type": "application/json",
        "token":$api.getStorage(storageKey.token)
      },
      dataType: 'json',
      data: {
          body: JSON.stringify({
            accessoryIdList:[],
            localId:localId,
            name: ret.data.name,
            medPatientId:person.id,
            createUserId:userId,
            content: ret.data.content,
            createTime:ret.data.createDate,
            type: accessoryType.note
          })
      }
    },function(ret5,err5){
      if(ret5){
        if(ret5.code==200){
          //console.log("文本上传返回结果:"+JSON.stringify(ret5));
          //如果成功修改数据库表中的记录status=1，去掉列表中的item的上传按钮
          var updateResult= db.executeSqlSync({
              name: cmcdb.name,
              sql: "update " + cmcdb.resTable + " set status = '1',file_id='"+ ret5.content.id +"' where id='"+localId+"'"
          });
          if(updateResult.status){
            UIListMeeting.updateItem({
              index:index,
              data:{
                   head: '',
                   headBg: '#cdcd00',
                   name: ret.data.name,
                   title:ret.data.title,
                   btnType:1,
                   content: ret.data.content,
                   createDate:ret.data.createDate,
                   localId: ret.data.localId,
                   fileId: ret5.content.id
              }
            },function(ret2,err2){
              if(ret2.status){
                UIListMeeting.setSwipeBtns({
                  index: index,
                  btns: [{
                      bgColor: '#CD3700',
                      activeBgColor: '',
                      width: 60,
                      title: '删除',
                      titleSize: 12,
                      titleColor: '#fff',
                      icon: '',
                      iconWidth: 20
                  }]
                },function(ret3,err3){
                  api.hideProgress();
                  if(ret3.status){
                    api.toast({
                        msg: '上传成功',
                        duration: config.duration,
                        location: 'bottom'
                    });
                  }else{
                    api.alert({
                        title: '错误',
                        msg: '更新列表记录按钮错误',
                    });
                  }
                });
              }else{
                api.hideProgress();
                api.alert({
                    title: '错误',
                    msg: '更新记录列表错误',
                });
              }
            });

          }else{
            api.hideProgress();
            api.alert({
                title: '数据更新错误',
                msg: updateResult.msg,
            });
          }
        }else{
          api.hideProgress();
          api.alert({
              title: '错误',
              msg: ret5.msg,
          });
        }
      }else{
        api.hideProgress();
        api.alert({
            title: '错误',
            msg: "上传音频失败",
        });
      }
    });


  });
}


function pagerCloudSearch(){
  var person = $api.getStorage(storageKey.currentPerson);
  var userId = $api.getStorage(storageKey.userId);
    var recordTime = $api.val($api.byId('dateRange'));
    var recodPerson = $api.val($api.byId('recoder'));
    var uurl = "" ;
    if(""!=recordTime || ""!=recoder){
        uurl = "&recordTime="+recordTime+"&recordPerson="+recodPerson;
    }
  common.get({
    url:config.accessoryQueryUrl+"?localId="+dataId+"&type="+accessoryType.note+"&patientId="+person.id+"&page="+cloudPage+"&limit="+pageSize+uurl,
      /*"&limit="+pageSize+*/
    isLoading:true,
    success:function(ret){
      var datas = ret.content;
      //alert(JSON.stringify(datas));
      //console.log(JSON.stringify(datas));
      if(datas && datas.length == 0){
        api.hideProgress();
        if(dataId == 0){
          initPager();
          api.toast({
              msg: '没有查询到记录',
              duration: 2000,
              location: 'bottom'
          });
        }
        return;
      }
      //增加页数
      cloudPage++;
      //0001
      //将数据中的localId全部取出来，然后从数据库中查询，
      //构造一个key=localId,value=0/1的map,0表示该记录本地没有，1表示有
      //根据这个map动态构造右侧按钮是否有下载
      var localIdArr = new Array();
      for(var i=0;i<datas.length;i++){
        localIdArr.push(datas[i].localId);
      }

      var sql = 'SELECT id FROM ' + cmcdb.resTable + " where id in ("+ localIdArr.join(",") + ")";
      var ids = db.selectSqlSync({
          name: cmcdb.name,
          sql: sql
      });

      var localIdMap = {};
      if(ids.status){
        for(var i=0;i<ids.data.length;i++){
          localIdMap[ids.data[i].id] = true;
        }
      }

      for(var i=0;i<datas.length;i++){
        dataId = datas[i].localId;
        if(localIdMap[datas[i].localId]){
          //本地存在，不显示下载按钮
          UIListMeeting.appendData({
            data:[{head: i+1,
               headBg: '#388E8E',
               name: datas[i].name,
               title:datas[i].createTime,
               btnType:3,
               content:datas[i].content,
               createDate:datas[i].createTime,
               localId: datas[i].localId,
               fileId: datas[i].id, //ward_id
               rightBtns: [{
                   bgColor: '#CD3700',
                   activeBgColor: '',
                   width: 60,
                   title: '删除',
                   titleSize: 12,
                   titleColor: '#fff',
                   icon: '',
                   iconWidth: 20
               }]
             }
            ]
          });
        }else{
          //本地不存在，需要显示下载按钮
          UIListMeeting.appendData({
            data:[{head: i+1,
               headBg: '#cdcd00',
               name: datas[i].name,
               title:datas[i].createTime,
               btnType:2,
               content: datas[i].content,
               createDate:datas[i].createTime,
               localId: datas[i].localId,
               fileId: datas[i].id,//ward_id
               rightBtns: [{
                   bgColor: '#388e8e',
                   activeBgColor: '',
                   width: 60,
                   title: '下载',
                   titleSize: 12,
                   titleColor: '#fff',
                   icon: '',
                   iconWidth: 20
               },{
                   bgColor: '#CD3700',
                   activeBgColor: '',
                   width: 60,
                   title: '删除',
                   titleSize: 12,
                   titleColor: '#fff',
                   icon: '',
                   iconWidth: 20
               }]
             }
            ]
          });
        }
      }

      api.hideProgress();
    }
  });
}


function downloadCloudNote(index){
  api.showProgress({
    title:'',
    text: '下载中...'
  });
  UIListMeeting.getDataByIndex({
    index: index
  },function(ret,err){
    //下载文件
    //同时插入数据库一条记录，status为1,
    //更新该item的右侧菜单按钮，btnType=3
    //console.log(JSON.stringify(ret));

    var userId = $api.getStorage(storageKey.userId);
    var person = $api.getStorage(storageKey.currentPerson);

    common.get({
      url: config.accessoryGetUrl+ret.data.fileId,
      isLoading: true,
      success:function(ret1){
        var datas = ret1.content;
        //console.log(JSON.stringify(datas));

        db.executeSql({
          name: cmcdb.name,
          sql: "INSERT INTO " + cmcdb.resTable + "(id,file_id,res_name,res_type,create_date,user_id,person_id,content,status) "+
               "VALUES ('"+ ret.data.localId+"','"+ ret.data.fileId +"','"+ ret.data.name +"',1,'"+
               ret.data.createDate +"','"+ userId +"','"+ person.id + "','"+ datas.content +"',1)"
        }, function(ret2, err2) {
            if (ret2.status) {
              UIListMeeting.updateItem({
                index:index,
                data:{
                     head: i+1,
                     headBg: '#cdcd00',
                     name: ret.data.name,
                     title:ret.data.createDate,
                     btnType:3,
                     content: ret.data.content,
                     createDate:ret.data.createDate,
                     localId: ret.data.localId,
                     fileId: ret.data.fileId
                }
              },function(ret3,err3){
                if(ret3.status){
                  UIListMeeting.setSwipeBtns({
                    index: index,
                    btns: [{
                        bgColor: '#CD3700',
                        activeBgColor: '',
                        width: 60,
                        title: '删除',
                        titleSize: 12,
                        titleColor: '#fff',
                        icon: '',
                        iconWidth: 20
                    }]
                  },function(ret4,err4){
                    api.hideProgress();
                    if(ret4.status){
                      //下载成功
                      api.toast({
                          msg: '下载已完成',
                          duration: config.duration,
                          location: 'bottom'
                      });
                    }else{
                      api.alert({
                          title: '错误',
                          msg: '更新列表错误，请刷新',
                      });
                    }
                  });
                }else{
                  api.hideProgress();
                  api.alert({
                      title: '错误',
                      msg: '更新列表错误，请刷新',
                  });
                }
              });
            } else {
              api.hideProgress();
              api.alert({
                title: '错误',
                msg: '下载失败！'+err2.msg,
              });
            }
        });
      }
    });
  });
}

function deleteCloudNote(index){
  //确定是否有可以删除本地的提示
  //如果不删除本地，需要更新该记录的status状态为0，否者删除该记录和对应的文件
  UIListMeeting.getDataByIndex({
    index: index
  },function(ret,err){
    if(ret.data.btnType==3){
      //提示是否包含删除本地的选项
      api.confirm({
          title: '提示',
          msg: '确定删除云端以及本地的该文件?',
          buttons: ['仅云端','全部', '取消']
      }, function(ret1, err){
          if(ret1.buttonIndex==1){
            //删除云端不删除本地
            delNoteOnlyCloudNotLocal(ret,index);
          }else if(ret1.buttonIndex==2){
            //全部删除
            delNoteCloudAndLocal(ret,index);
          }
      });

    }else if(ret.data.btnType==2){
      //提示是否删除云端
      api.confirm({
          title: '提示',
          msg: '确定删除云端的该文件?',
          buttons: ['确定', '取消']
      }, function(ret1, err){
        if(ret1.buttonIndex==1){
          //删除云端
          delNoteOnlyCloud(ret,index);
        }
      });

    }
  });
}

//删除云端,本地存在但是不删除本地
function delNoteOnlyCloudNotLocal(ret,index){
  common.post({
    url:config.accessoryDelUrl+ret.data.fileId,
    isLoading:true,
    text:'数据删除中...',
    success:function(r){
      //删除成功
      db.executeSql({
          name: cmcdb.name,
          sql: "update " + cmcdb.resTable + " set status = '0' where id='"+ret.data.localId+"'"
      }, function(ret1, err1){
          api.hideProgress();
          if( ret1.status ){
            UIListMeeting.deleteItem({
              index: index
            },function(ret3, err3){
              if(ret3.status){
                api.toast({
                    msg: '删除成功',
                    duration: config.duration,
                    location: 'bottom'
                });
              }else{
                api.alert({
                    title: '错误',
                    msg:'删除列表失败',
                });
              }
            });
          }else{
              alert( JSON.stringify( err1 ) );
          }
      });
    }
  });
}

//删除云端和本地
function delNoteCloudAndLocal(ret,index){
  common.post({
    url:config.accessoryDelUrl+ret.data.fileId,
    isLoading:true,
    text:'数据删除中...',
    success:function(r){
      var userId = $api.getStorage(storageKey.userId);

      UIListMeeting.deleteItem({
        index: index
      },function(ret3,err){
        if(ret3.status){
          //删除数据库数据
          var result = db.selectSqlSync({
              name: cmcdb.name,
              sql: "delete from " + cmcdb.resTable + " where id='"+ret.data.localId+"'"
          });

          api.hideProgress();
          if(result.status){
            if(chooseLocalId == ret.data.localId){
              $api.html($api.byId('content'), '');
            }
            api.toast({
                msg: '删除成功',
                duration: config.duration,
                location: 'bottom'
            });

          }else{
            api.alert({
                title: '错误',
                msg: '删除本地记录失败',
            });
          }
        }else{
          api.hideProgress();
          api.alert({
              title: '错误',
              msg: '删除列表失败',
          });
        }
      })
    }
  });
}

//仅删除云端记录，没有本地记录
function delNoteOnlyCloud(ret,index){
  common.post({
    url:config.accessoryDelUrl+ret.data.fileId,
    isLoading:true,
    text:'数据删除中...',
    success:function(r){
      //删除成功
      api.hideProgress();
      UIListMeeting.deleteItem({
        index: index
      },function(ret3, err){
        if(ret3.status){
          api.toast({
              msg: '删除成功',
              duration: config.duration,
              location: 'bottom'
          });
        }else{
          api.alert({
              title: '错误',
              msg: ret3.msg,
          });
        }
      });
    }
  });
}
var adpicker = function() {
    api.openPicker({
        type: 'date',
        title: '开始时间'
    }, function(ret, err){
        var recordYear = ret.year;
        var recordMonth = ret.month;
        var recordDay = ret.day;
        var recordDate = recordYear + "-" + (recordMonth<10? "0"+recordMonth:recordMonth) + "-" + (recordDay<10?"0"+recordDay:recordDay);
        $api.val($api.byId("dateRange"),recordDate);
    });
}
