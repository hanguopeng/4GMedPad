var fs;
var db;
var camera;
apiready = function () {
    api.parseTapmode();
    // var header = document.querySelector('#header');
    // $api.fixStatusBar(header);
    camera = api.require('FNPhotograph');
    fs = api.require("fs");
    db = api.require('db');
};

function startCamer() {

    camera.open({
        path: 'fs://',
        album: true,
        quality: 'medium'
    }, function (ret) {
        var currentDate = new Date();
        var formateDatePath = formateNoSpaceTime(currentDate);
        ret.time = formateDatePath;
        var imagePath = ret.imagePath;

        if (ret.eventType == 'takePhoto') {
            var currentDate = new Date();
            var formateDate = formateNoSpaceTime(currentDate);
            var createDate = formatCurrentDate(currentDate);
            var person = $api.getStorage(storageKey.currentPerson);
            var defaultText = person.name + "-" + formateDate;

            var userId = $api.getStorage(storageKey.userId);
            var textTip = person.name+ "-" + formateDate
            fs.rename({
                oldPath:imagePath,
                //根据不同用户存放照片
                newPath: 'fs://' + userId + "/" + textTip + ".jpg"
            }, function (ret, err) {
                if (ret.status) {
                    //构造数据
                    var timestamp = currentDate.getTime();
                    var id = person.id + "" + timestamp;
                    var userId = $api.getStorage(storageKey.userId);
                    var personId = person.id;

                    //插入到数据库中一条记录
                    db.executeSql({
                        name: cmcdb.name,
                        sql: "INSERT INTO " + cmcdb.resTable + "(id,res_name,res_type,create_date,user_id,person_id,status) " +
                            "VALUES ('" + id + "','" + textTip + "',2,'" + createDate + "','" + userId + "','" + personId + "',0)"
                    }, function (ret, err) {
                        if (ret.status) {
                            api.toast({
                                msg: '保存成功',
                                duration: 2000,
                                location: 'bottom'
                            },function(ret,err){
                                startCamer();
                            })
                        } else {
                            api.alert({
                                title: '错误',
                                msg: '保存失败！' + err.msg,
                            }, function (ret, err) {
                                fs.remove({
                                    path: 'fs://' + textTip + ".amr"
                                }, function (ret, err) {
                                });
                            });
                        }
                    });
                } else {
                    api.alert(err.msg);
                }
            });
        }
    })


}

function startRecord() {
    $("#startBtn").hide();
    $("#stopBtn").show();
    $('.wave').addClass('ripple');
    fs.remove({
        path: 'fs://temp.amr'
    }, function (ret, err) {
    });
    api.startRecord({
        path: 'fs://temp.amr'
    });
}

function formatDateToString(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    return year + month + day;
}

function formatDateToStringWithHyphen(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    return year + "-" + month + "-" + day;
}

function formateDateAndTimeToString(date) {
    var hours = date.getHours();
    var mins = date.getMinutes();
    var secs = date.getSeconds();
    // var msecs = date.getMilliseconds();
    if (hours < 10) hours = "0" + hours;
    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;
    // if(msecs<10) secs = "0"+msecs;
    return formatDateToString(date) + hours + mins + secs;
}

function formatCurrentDate(date) {
    var hours = date.getHours();
    var mins = date.getMinutes();
    var secs = date.getSeconds();
    // var msecs = date.getMilliseconds();
    if (hours < 10) hours = "0" + hours;
    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;
    return formatDateToStringWithHyphen(date) + " " + hours + ":" + mins + ":" + secs;
}
function formatDateToStringWith(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    return year+ month+day;
}

function formateNoSpaceTime(date) {
    var hours = date.getHours();
    var mins = date.getMinutes();
    var secs = date.getSeconds();
    // var msecs = date.getMilliseconds();
    if (hours < 10) hours = "0" + hours;
    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;
    return formatDateToStringWith(date)+ hours+ mins + secs;
}

function closeWin() {
    api.closeWin();
}
