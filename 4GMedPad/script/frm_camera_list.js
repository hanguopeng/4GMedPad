var chooseName="";
var UIListMeeting;
var fs;
var audioStreamer;
var db;
var localCloudFlag = false ;
var imageBrowser;

apiready = function() {
    api.parseTapmode();

    imageBrowser = api.require('imageBrowser');
    audioStreamer = api.require('audioStreamer');
    UIListMeeting = api.require('UIListMeeting');
    fs = api.require('fs');
    db = api.require('db');



    //定义点击tab切换本地和云端
    var tab = new auiTab({
        element:document.getElementById("tab"),
    },function(ret){
        if(ret.index==1){
            localCloudFlag = false;
            showLocalCamera();
        }else if(ret.index==2){
            localCloudFlag = true;
            showCloudCamera();
        }
    });
    showLocalCamera();

    //回退事件
    api.addEventListener({
        name : 'keyback'
    }, function(ret, err) {
        if(audioStreamer){
            audioStreamer.stop();
        }
        UIListMeeting.close({});
        // api.sendEvent({
        //     //病区页面刷新
        //     name: 'main_refresh'
        // });
        api.closeFrameGroup({
            name: 'group'
        });
    });

    //监听关闭侧边栏的事件，点击左侧的按钮，需要将音频停止
    api.addEventListener({
        name: 'functionBtn'
    }, function(ret, err) {
        if(audioStreamer){
            audioStreamer.stop();
        }
    });

    //音频结束事件
    audioStreamer.addEventListener({
    }, function(ret) {
        if(ret.state=="finished"){
            if(audioStreamer){
                switchmusic(0);
            }
        }
    });
};


var pageSize = 10;
var curNum = 0;
var dataId = 0;
var cloudPage = 1;//第几页
function initPager(){
    curNum = 0;
    dataId = 0;
    cloudPage = 1;
}

//根据tab的内容获取搜索本地还是云端
var searchLocCloud  = function(){
    if(localCloudFlag==false){
        showLocalCamera();
    }else{
        showCloudCamera();
    }

}

function pagerCloudSearch(){
    var person = $api.getStorage(storageKey.currentPerson);
    var userId = $api.getStorage(storageKey.userId);
    var recordTime = $api.val($api.byId('dateRange'));
    var recordPerson = $api.val($api.byId('recoder'));
    var uurl = "";
    /*var preUrl = config.accessoryQueryUrl ;
    var midUrl = "?localId="+dataId+"&type="+accessoryType.audio+"&patientId="+person.id+"&limit="+pageSize+"&page="+cloudPage;
    var beUrl = "";
      if("" != recordTime || "" != recoder){
          preUrl = config.accessoryQueryUrlDetails;
          beUrl = "&recordTime"+recordTime+"&recordPerson"+recoder;
      }*/
    if(""!=recordTime || ""!=recordPerson){
        uurl = "&recordTime="+recordTime+"&recordPerson="+recordPerson;
    }
    common.get({
        url:config.accessoryQueryUrl+"?localId="+dataId+"&type="+accessoryType.camera+"&patientId="+person.id+"&limit="+pageSize+"&page="+cloudPage+uurl,
        isLoading:true,
        success:function(ret){
            //alert(ret.content);
            var datas = ret.content;
            //alert(JSON.stringify(datas));
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
                            headBg: '#388e8e',
                            name: datas[i].name,
                            //title:"时长 "+ secondToDate(datas[i].duration),
                            title: datas[i].createTime,
                            btnType:3,
                            duration:datas[i].duration,
                            createDate:datas[i].createTime,
                            localId: datas[i].localId,
                            fileId: datas[i].id, //ward_id
                            accId: datas[i].accessoryList[0].id,
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
                            //title:"时长 "+ secondToDate(datas[i].duration),
                            title:datas[i].createTime,
                            btnType:2,
                            duration:datas[i].duration,
                            createDate:datas[i].createTime,
                            localId: datas[i].localId,
                            fileId: datas[i].id,//ward_id
                            accId: datas[i].accessoryList[0].id,
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


function  pagerLocalSearch(){
    api.showProgress({
        title:'',
        text: '努力加载中...'
    });
    var person = $api.getStorage(storageKey.currentPerson);
    var userId = $api.getStorage(storageKey.userId);
    if(curNum == 0){
        var sql = "SELECT * FROM " + cmcdb.resTable + " where person_id='"+ person.id +"' and res_type='2' and user_id='"+ userId +"' order by id desc limit " + curNum + "," + pageSize;
    }else{
        var sql = "SELECT * FROM " + cmcdb.resTable + " where id <'"+ dataId +"' and person_id='"+ person.id +"' and res_type='2' and user_id='"+ userId +"' order by id desc limit 0," + pageSize;
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
                        //title:"时长 "+ secondToDate(audioList.data[i].duration),
                        title: audioList.data[i].create_date,
                        btnType:0,
                        duration:audioList.data[i].duration,
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
                        headBg: '#388e8e',
                        name: audioList.data[i].res_name,
                        //title:"时长 "+ secondToDate(audioList.data[i].duration),
                        title:audioList.data[i].create_date,
                        btnType:1,
                        duration:audioList.data[i].duration,
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

function showLocalCamera(){
    var contentHeight = $api.byId("tab").offsetHeight;
    //避免刷新当前页面导致该组件没有关闭，出现多个组件重叠
    UIListMeeting.close({});
    initPager();
    //从数据库中分页读取数据，构造列表
    if( openAudioList(contentHeight) !== -1 ){
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

function showCloudCamera(){
    var contentHeight = $api.byId("tab").offsetHeight;
    //避免刷新当前页面导致该组件没有关闭，出现多个组件重叠
    UIListMeeting.close({});
    initPager();
    //todo 从远端接口分页读取数据，构造列表
    if( openAudioList(contentHeight) !== -1 ){
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

function openAudioList(contentHeight,func){
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
                        //如果是云端的，必须先下载然后再播放
                        if(ret.data.btnType==2){
                            api.toast({
                                msg: '请先下载后播放',
                                duration: config.duration,
                                location: 'bottom'
                            });
                        }else{
                            chooseName = ret.data.name;
                            viewCamera(1);
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
                                uploadLocalCamera(ret.index);
                            }else if(ret.btnIndex == 1){
                                //本地删除
                                deleteLocalCamera(ret.index);
                            }
                        }else if(btnType == 1){
                            //本地已上传
                            if(ret.btnIndex == 0){
                                //本地删除
                                deleteLocalCamera(ret.index);
                            }
                        }else if(btnType == 2){
                            //云端未下载
                            if(ret.btnIndex == 0){
                                //下载
                                downloadCloudCamera(ret.index);
                            }else if(ret.btnIndex == 1){
                                //云端删除
                                deleteCloudCamera(ret.index);
                            }
                        }else if(btnType == 3){
                            //云端已下载
                            if(ret.btnIndex == 0){
                                //云端删除
                                deleteCloudCamera(ret.index);
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

            //  if(func){
            //    func();
            //  }
        }else{
            alert(err.msg);
            api.hideProgress();
            return -1;
        }
    });
}

function viewCamera(){
    if(chooseName==""){
        api.toast({
            msg: '请选择张图片',
            duration: 2000,
            location: 'bottom'
        });
        return;
    }
    if(condition === 0){ //condition=0 鼠标点击图片
        var click = button.getAttribute("data-click");
        if (click == 2) {
            // 点开
            button.setAttribute("data-click", 1);
            button.src = "../image/musicplay/play_btn_pause.png";
            playmusic();
        }else {
            // 关闭
            button.setAttribute("data-click", 2);
            button.src = "../image/musicplay/play_btn_play.png";
            stopmusic();
        }
    }else if(condition === 1){ //condition=1 切换音频
        audioStreamer.stop();
        button.setAttribute("data-click", 1);
        button.src = "../image/musicplay/play_btn_pause.png";
        playmusic();
        //console.log("condition = 1");
    }

    UIPhotoViewer.open({
        images: [
            'fs://img/image1.png',
            'fs://img/encryption.png'
        ],
        placeholderImg: 'widget://res/img/apicloud.png',
        bgColor: '#000'
    }, function(ret, err) {
        if (ret) {
            alert(JSON.stringify(ret));
        } else {
            alert(JSON.stringify(err));
        }
    });
}

//云端下载 0003
function downloadCloudCamera(index){
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

        var userId = $api.getStorage(storageKey.userId);
        var person = $api.getStorage(storageKey.currentPerson);
        var file = 'fs://'+userId+"/"+ ret.data.name +".jpg";
        api.download({
            url: config.accessoryDownloadUrl+ret.data.accId,
            savePath: file
        }, function(ret1, err) {
            //console.log("download error:" + JSON.stringify(ret1)+JSON.stringify(err));
            if (ret1.state == 1) {
                db.executeSql({
                    name: cmcdb.name,
                    sql: "INSERT INTO " + cmcdb.resTable + "(id,acc_id,file_id,res_name,res_type,create_date,user_id,person_id,duration,status) "+
                        "VALUES ('"+ ret.data.localId+"','"+ ret.data.accId +"','"+ ret.data.fileId +"','"+ ret.data.name +"',0,'"+
                        ret.data.createDate +"','"+ userId +"','"+ person.id +"','"+ ret.data.duration +"',1)"
                }, function(ret2, err2) {
                    if (ret2.status) {
                        UIListMeeting.updateItem({
                            index:index,
                            data:{
                                head: '',
                                headBg: '#cdcd00',
                                name: ret.data.name,
                                //title:"时长 "+ secondToDate(ret.data.duration),
                                title:ret.data.createTime,
                                btnType:3,
                                duration:ret.data.duration,
                                createDate:ret.data.createTime,
                                localId: ret.data.localId,
                                fileId: ret.data.fileId,
                                accId: ret.data.accId
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
                            msg: '保存音频失败！'+err2.msg,
                        }, function(ret, err) {
                            fs.remove({
                                path: file
                            }, function(ret, err) {});
                        });
                    }
                });


            } else if(ret1.state == 2){
                api.hideProgress();
                api.alert({
                    title: '错误',
                    msg: '音频下载失败，请重新下载'
                });
            }
        });
    });
}

//云端删除
function deleteCloudCamera(index){
    //确定是否有可以删除本地的提示
    //如果不删除本地，需要更新该记录的status状态为0，否者删除该记录和对应的文件
    UIListMeeting.getDataByIndex({
        index: index
    },function(ret,err){
        if(ret.data.btnType==3){
            //提示是否包含删除本地的选项
            api.confirm({
                title: '提示',
                msg: '确定删除云端以及本地的该音频文件?',
                buttons: ['仅云端','全部', '取消']
            }, function(ret1, err){
                if(ret1.buttonIndex==1){
                    //删除云端不删除本地
                    delAudioOnlyCloudNotLocal(ret,index);
                }else if(ret1.buttonIndex==2){
                    //全部删除
                    delAudioCloudAndLocal(ret,index);
                }
            });

        }else if(ret.data.btnType==2){
            //提示是否删除云端
            api.confirm({
                title: '提示',
                msg: '确定删除云端的该音频文件?',
                buttons: ['确定', '取消']
            }, function(ret1, err){
                if(ret1.buttonIndex==1){
                    //删除云端
                    delAudioOnlyCloud(ret,index);
                }
            });

        }
    });
}

//删除云端,本地存在但是不删除本地
function delAudioOnlyCloudNotLocal(ret,index){
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

//删除云端和本地音频
function delAudioCloudAndLocal(ret,index){
    common.post({
        url:config.accessoryDelUrl+ret.data.fileId,
        isLoading:true,
        text:'数据删除中...',
        success:function(r){
            var userId = $api.getStorage(storageKey.userId);
            fs.remove({
                path: 'fs://'+userId+"/"+ ret.data.name +".jpg"
            }, function(ret1, err) {
                if (ret1.status) {
                    UIListMeeting.deleteItem({
                        index: index
                    },function(ret3, err){
                        if(!ret3.status){
                            api.hideProgress();
                            api.alert({
                                title: '错误',
                                msg: '删除列表失败',
                            });
                        }else{
                            //删除数据库数据
                            db.selectSqlSync({
                                name: cmcdb.name,
                                sql: "delete from " + cmcdb.resTable + " where id='"+ret.data.localId+"'"
                            });
                            api.hideProgress();
                            //console.log("chooseName="+chooseName+",ret.data.name="+ret.data.name);
                            if(chooseName == ret.data.name){
                                //删除的和选择播放的一样
                                audioStreamer.stop();
                                chooseName="";
                                $api.byId("playImg").setAttribute("data-click", 2);
                                $api.byId("playImg").src = "../image/musicplay/play_btn_play.png";
                                $api.byId('audioName').innerHTML="请选择一个音频进行播放";
                                var musicdisc = document.getElementsByClassName('playdisc')[0];
                                var musicneedle = document.getElementsByClassName('play_needle')[0];
                                musicdisc.style.webkitAnimationPlayState = 'paused';
                                musicneedle.style.transform = 'rotate(-30deg)';
                                musicneedle.style.webkitTransform = 'rotate(-30deg)';
                            }

                            api.toast({
                                msg: '删除成功',
                                duration: config.duration,
                                location: 'bottom'
                            });
                        }
                    });
                }
            });
        }
    });
}

//仅删除云端音频，没有本地音频
function delAudioOnlyCloud(ret,index){
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

//本地上传音频
//0002
function uploadLocalCamera(index){
    api.showProgress({
        title:'',
        text: '音频上传中...'
    });
    UIListMeeting.getDataByIndex({
        index: index
    },function(ret,err){
        var localId = ret.data.localId;
        var userId = $api.getStorage(storageKey.userId);
        var file = 'fs://'+userId+"/"+ ret.data.name +".jpg";
        var person = $api.getStorage(storageKey.currentPerson);
        //上传文件
        api.ajax({
            url: config.accessoryUploadUrl,
            method: 'post',
            headers: {
                "token":$api.getStorage(storageKey.token)
            },
            data: {
                files: {
                    file: file
                }
            }
        },function(ret1, err1){
            if (ret1) {
                if(ret1.code==200){
                    //console.log("第一次上传返回结果:"+JSON.stringify(ret1));
                    uploadId = ret1.data.id;
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
                                accessoryIdList: [uploadId],
                                localId:localId,
                                name: ret.data.name,
                                medPatientId:person.id,
                                createUserId:userId,
                                duration:ret.data.duration,
                                createTime:ret.data.createDate,
                                type: accessoryType.camera
                            })
                        }
                    },function(ret5,err5){
                        if(ret5){
                            if(ret5.code==200){
                                //console.log("第二次上传返回结果:"+JSON.stringify(ret5));
                                //console.log(JSON.stringify(ret5));
                                //如果成功修改数据库表中的记录status=1，去掉列表中的item的上传按钮
                                var updateResult= db.executeSqlSync({
                                    name: cmcdb.name,
                                    sql: "update " + cmcdb.resTable + " set status = '1',acc_id='"+ uploadId +"',file_id='"+ ret5.content.id +"' where id='"+localId+"'"
                                });
                                if(updateResult.status){
                                    UIListMeeting.updateItem({
                                        index:index,
                                        data:{
                                            head: '',
                                            headBg: '#cdcd00',
                                            name: ret.data.name,
                                            //title:ret.data.title,
                                            title:ret.data.createDate,
                                            btnType:1,
                                            duration:ret.data.duration,
                                            createDate:ret.data.createDate,
                                            localId: ret.data.localId,
                                            accId: uploadId,
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
                                                        msg: '更新记录错误',
                                                    });
                                                }
                                            });
                                        }else{
                                            api.hideProgress();
                                            api.alert({
                                                title: '错误',
                                                msg: '更新记录错误',
                                            });
                                        }
                                    });

                                }else{
                                    api.hideProgress();
                                    api.alert({
                                        title: '错误',
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
                }else{
                    api.hideProgress();
                    api.alert({
                        title: '错误',
                        msg: ret1.msg,
                    });

                }
            }else {
                api.hideProgress();
                api.alert({
                    title: '错误',
                    msg: err1.msg,
                });
            };
        });

    });
}

//本地删除音频
function deleteLocalCamera(index){
    //console.log("deleteLocalCamera");
    api.confirm({
        title: '提示',
        msg: '您确定删除该录音吗？',
        buttons: ['确定', '取消']
    }, function(r, e){
        if(r.buttonIndex==1){
            UIListMeeting.getDataByIndex({
                index: index
            },function(ret,err){
                var id = ret.data.localId;
                var userId = $api.getStorage(storageKey.userId);
                fs.remove({
                    path: 'fs://'+userId+"/"+ ret.data.name +".jpg"
                }, function(ret1, err) {
                    if (ret1.status) {
                        UIListMeeting.deleteItem({
                            index: index
                        },function(ret3, err){
                            if(!ret3.status){
                                api.alert({
                                    title: '错误',
                                    msg: '删除列表失败',
                                }, function(ret, err) {});
                            }else{
                                //删除数据库数据
                                db.selectSqlSync({
                                    name: cmcdb.name,
                                    sql: "delete from " + cmcdb.resTable + " where id='"+ id +"'"
                                });
                                //console.log("chooseName="+chooseName+",ret.data.name="+ret.data.name);
                                if(chooseName == ret.data.name){
                                    //删除的和选择播放的一样
                                    audioStreamer.stop();
                                    chooseName="";
                                    $api.byId("playImg").setAttribute("data-click", 2);
                                    $api.byId("playImg").src = "../image/musicplay/play_btn_play.png";
                                    $api.byId('audioName').innerHTML="请选择一个音频进行播放";
                                    var musicdisc = document.getElementsByClassName('playdisc')[0];
                                    var musicneedle = document.getElementsByClassName('play_needle')[0];
                                    musicdisc.style.webkitAnimationPlayState = 'paused';
                                    musicneedle.style.transform = 'rotate(-30deg)';
                                    musicneedle.style.webkitTransform = 'rotate(-30deg)';
                                }

                                api.toast({
                                    msg: '删除成功',
                                    duration: config.duration,
                                    location: 'bottom'
                                });
                            }
                        });
                    }
                });
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
// 输出03:05:59  时分秒
function secondToDate(result) {
    var h = Math.floor(result / 3600) < 10 ? '0'+Math.floor(result / 3600) : Math.floor(result / 3600);
    var m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60));
    var s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60));
    return result = h + ":" + m + ":" + s;
}
