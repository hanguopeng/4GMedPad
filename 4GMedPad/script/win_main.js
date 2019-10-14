var fs;
var db;
//目前数据库版本为1，原来版本为0，下次需要重新建表将下面两个变量都修改增加1就行
var currentVersion = 1;
var dbVersion = 0;
/**
 * 绑定退出事件
 */
function ExitApp() {
    var ci = 0;
    var time1, time2;
    api.addEventListener({
        name: 'keyback'
    }, function (ret, err) {
        if (ci == 0) {
            time1 = new Date().getTime();
            ci = 1;
            api.toast({
                msg: '再按一次返回键退出'
            });
        } else if (ci == 1) {
            time2 = new Date().getTime();
            if (time2 - time1 < 2000) {
                common.clearStorage();
                if (db) {
                    db.closeDatabaseSync({
                        name: cmcdb.name
                    });
                }
                api.closeWidget({
                    id: api.appId,
                    retData: {
                        name: 'closeWidget'
                    },
                    silent: true
                });
            } else {
                ci = 0;
                api.toast({
                    msg: '再按一次返回键退出'
                });
            }
        }
    });
}

/*
 * 沉浸式
 */
function immersive(header) {
    var systemType = api.systemType;  // 获取手机类型，比如： ios
    if (systemType == 'ios') {//兼容ios和安卓
        $api.addCls(header, 'headerIos');
    } else {
        $api.addCls(header, 'headerAnd');
    }
    api.setStatusBarStyle({
        color: '#03a9f4',//设置APP状态栏背景色
        style: 'light'
    });
}
//退出登录
function closeWin(){
    api.confirm({
        title: '退出登录',
        msg: '是否退出登录？',
        buttons: ['确定', '取消']
    }, function(ret, err) {
        var index = ret.buttonIndex;
        if(index===1){
                common.clearStorage();
                api.closeToWin({
                    name: 'root'
                });
        }
    });
}
/**
 * 获取登录人员信息
 */
function getUserInfo() {
    common.get({
        url: config.loginUserInfoUrl,
        isLoading: true,
        success: function (ret) {
            //不关闭遮罩，还要获取疗区信息
            //填写欢迎信息
            $api.text($api.byId('welcomeContent'), "欢迎您：" + common.notNull(ret.content.name));
            getOrganizationInfo();
            $api.setStorage(storageKey.userName, ret.content.name);
            $api.setStorage(storageKey.userId, ret.content.id);
            //根据用户创建不同的文件目录
            fs.exist({
                path: 'fs://' + ret.content.id
            }, function (retfs, err) {
                if (!retfs.exist) {
                    //不存在，新建一个用户id对应的文件夹
                    fs.createDir({
                        path: 'fs://' + ret.content.id
                    }, function (retdir, err) {
                        if (!retdir.status) {
                            api.toast({
                                msg: '创建文件夹失败！',
                                duration: config.duration,
                                location: 'bottom'
                            });
                        }
                    });// fs createDir
                }
            });//fs exist
        }
    });
}

/**
 * 获取疗区信息
 */
function getOrganizationInfo() {
    common.get({
        url: config.organizationUrl,
        isLoading: false,
        success: function (ret) {
            api.hideProgress();
            //填写疗区信息
            if (ret.content.length > 0) {
                //排序
                ret.content.sort(common.sortAsc);
                for (var i = 0; i < ret.content.length; i++) {
                    if (i == 0) {
                        $api.append($api.byId('areaSel'), '<option value="' + ret.content[i].id + '" selected="selected">' + ret.content[i].name + '</option>');
                    } else {
                        $api.append($api.byId('areaSel'), '<option value="' + ret.content[i].id + '">' + ret.content[i].name + '</option>');
                    }

                }
                openMainFrame();
            } else {
                api.alert({
                    msg: '没有查询到疗区'
                });
            }
        }
    });
}

function openMainFrame() {
    var header = document.querySelector('#header');
    var pos = $api.offset(header);
    api.openFrame({ // 打开Frame
        name: 'frm_main_content',
        url: 'frm_main_content.html',
        rect: {
            x: 0,
            y: pos.h, // 头部留位置
            w: 'auto',
            h: 'auto'
        },
        pageParam: {
            areaId: $api.byId('areaSel').value
        },
        bounces: true,
        reload: true,
        vScrollBarEnabled: false
    });
}

/**
 * 修改下拉框发送刷新病人事件
 */
function sendAreaChangedEvent() {
    var areaId = $api.byId('areaSel').value;
    $api.setStorage(storageKey.areaId, areaId);
    api.sendEvent({
        name: eventName.InpatientAreaChanged,
        extra: {
            areaId: areaId
        }
    });
}

apiready = function () {
    fs = api.require('fs');
    db = api.require('db');
    api.parseTapmode();
    var header = document.querySelector('#header');
    //$api.fixStatusBar(header);
    immersive(header);
    getUserInfo();
    ExitApp();
    db.openDatabase({//打开
        name: cmcdb.name,
        path: cmcdb.path
    }, function (ret, err) {
        if (ret.status) {
            // 从数据库中读取记录，如果表不存在表示以前的版本，需要重新创建表结构，如果存在版本并且和现在的一致则不操作，否则后续做数据迁移操作
            var result = db.selectSqlSync({
                name: cmcdb.name,
                sql: 'select version from ' + cmcdb.dbVersion
            });
            if(result.status){
              dbVersion = result.data[0].version;
            }

            if(currentVersion != dbVersion){
              //console.log("execute build table");

              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists  '+cmcdb.dbVersion
              });

              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists  '+cmcdb.resTable
              });
              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists  '+cmcdb.dlStatusTable
              });
              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists  '+cmcdb.dlPatientTable
              });
              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists  ' + cmcdb.dbMedAssayTable
              });

              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists ' + cmcdb.dbMedExamine
              });

              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists ' + cmcdb.dbMedAdvice
              });

              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists ' + cmcdb.dbMedAdviceExecute
              });

              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists ' + cmcdb.dbNurAnimalHeatSituation
              });

              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists ' + cmcdb.dbNurLastExamine
              });

              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists ' + cmcdb.dbMedCostSituation
              });

              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists ' + cmcdb.dbMedPatientDetails
              });

              db.executeSqlSync({
                  name: cmcdb.name,
                  sql: 'DROP TABLE if exists ' + cmcdb.dlCaseMenu
              });

              db.executeSql({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS '" + cmcdb.dbVersion + "'(version int)"
              }, function (ret, err) {
                  if (!ret.status) {
                      api.alert({
                          msg: '初始化版本数据失败'
                      });
                  }else{
                    db.executeSql({
                      name: cmcdb.name,
                      sql: "insert into " + cmcdb.dbVersion + "(version) values ('"+ currentVersion +"')"
                    },function(ret1,err1){
                      if (!ret1.status) {
                          api.alert({msg: '插入版本数据失败'});
                      }
                    });
                  }
              });

              db.executeSql({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS '" + cmcdb.resTable + "'(id varchar(20) PRIMARY KEY NOT NULL,acc_id varchar(50),file_id varchar(50),res_name varchar(255),res_type int,create_date varchar(20),user_id varchar(50),person_id varchar(50),content TEXT,duration long,status int)"
              }, function (ret, err) {
                  if (!ret.status) {
                      api.alert({
                          msg: '初始化资源数据失败'
                      });
                  } else {
                      db.executeSqlSync({
                          name: cmcdb.name,
                          sql: "create index idx_res_1 on " + cmcdb.resTable + "(acc_id)"
                      });

                      db.executeSqlSync({
                          name: cmcdb.name,
                          sql: "create index idx_res_2 on " + cmcdb.resTable + "(file_id)"
                      });
                  }
              });

              db.executeSql({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS '" + cmcdb.dlStatusTable + "'(operator_id varchar(20) PRIMARY KEY NOT NULL, version int,open int, last_download_time char(19))"
              }, function (ret, err) {
                  if (!ret.status) {
                      api.alert({
                          msg: '初始化离线数据失败'
                      });
                  }
              });

              var result = db.executeSqlSync({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS '" + cmcdb.dlPatientTable + "'(age TEXT,await_bed_flag TEXT,backlog_flag TEXT,bed_organization_id TEXT,diagnose TEXT,doctor_id TEXT,doctor_name TEXT,drug_allergy TEXT,fever_flag TEXT,health_type_code TEXT,health_type_name TEXT,high_risk_flag TEXT,id TEXT,id_number TEXT,in_hospital_time TEXT,med_bed_id TEXT,med_bed_name TEXT,my_patient_flag TEXT,name TEXT,new_advice_flag TEXT,nurse_id TEXT,nurse_level_code TEXT,nurse_level_name TEXT,nurse_name TEXT,operation_flag TEXT,operator_id TEXT,organization_code TEXT,organization_id TEXT,organization_name TEXT,out_hospital_time TEXT,predict_out_hospital_time TEXT,register_number TEXT,sex TEXT,telephone TEXT,version TEXT)"
              });
              if (!result.status) {
                  api.alert({
                      msg: '初始化离线数据1失败'
                  });
                  return;
              }else{
                db.executeSqlSync({
                    name: cmcdb.name,
                    sql: "create index idx_dl_patient_1 on " + cmcdb.dlPatientTable + "(operator_id,version)"
                });
              }

              // 化验信息表
              var result = db.executeSqlSync({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS " + cmcdb.dbMedAssayTable + " (" +
                      "  id                 TEXT," +
                      "  medPatientId     TEXT," +
                      "  medAdviceId        TEXT," +
                      "  medAdviceExecuteId TEXT," +
                      "  name               TEXT," +
                      "  sendTime           TEXT," +
                      "  reportTime         TEXT," +
                      "  sendDoctorId       TEXT," +
                      "  sendDoctorName     TEXT," +
                      "  createTime         TEXT," +
                      "  updateTime         TEXT," +
                      "  itemList          TEXT," +
                      "  version          TEXT," +
                      "  operator_id          TEXT" +
                      ")"
              });
              if (!result.status) {
                  api.alert({
                      msg: '初始化离线数据dbMedAssayTable失败'
                  });
                  return;
              }else{
                db.executeSqlSync({
                    name: cmcdb.name,
                    sql: "create index idx_dl_med_assay_1 on " + cmcdb.dbMedAssayTable + "(medPatientId,version)"
                });
              }

              // 检查信息表
              var result = db.executeSqlSync({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS " + cmcdb.dbMedExamine + " (" +
                      "  id                 TEXT," +
                      "  medPatientId     TEXT," +
                      "  medAdviceId        TEXT," +
                      "  medAdviceExecuteId TEXT," +
                      "  name               TEXT," +
                      "  sendTime           TEXT," +
                      "  reportTime         TEXT," +
                      "  sendDoctorId       TEXT," +
                      "  sendDoctorName     TEXT," +
                      "  discover         TEXT," +
                      "  result         TEXT," +
                      "  createTime          TEXT," +
                      "  updateTime          TEXT," +
                      "  accessoryList          TEXT," +
                      "  version          TEXT," +
                      "  operator_id          TEXT" +
                      ")"
              });
              if (!result.status) {
                  api.alert({
                      msg: '初始化离线数据dbMedExamine失败'
                  });
                  return;
              }else{
                db.executeSqlSync({
                    name: cmcdb.name,
                    sql: "create index idx_dl_med_examine_1 on " + cmcdb.dbMedExamine + "(medPatientId,version)"
                });
              }

              // 医嘱列表
              var result = db.executeSqlSync({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS "+cmcdb.dbMedAdvice+" (" +
                      "  id                 TEXT," +
                      "  medPatientId     TEXT," +
                      "  mark        TEXT," +
                      "  adviceName        TEXT," +
                      "  beginTime        TEXT," +
                      "  beginDoctorId        TEXT," +
                      "  beginDoctorCode        TEXT," +
                      "  beginDoctor        TEXT," +
                      "  beginOrgId        TEXT," +
                      "  beginOrgCode        TEXT," +
                      "  beginOrg        TEXT," +
                      "  statusCode        TEXT," +
                      "  statusName        TEXT," +
                      "  dosage        TEXT," +
                      "  unit        TEXT," +
                      "  frequency        TEXT," +
                      "  noSendNum        TEXT," +
                      "  sendBackNum        TEXT," +
                      "  sendNum        TEXT," +
                      "  num        TEXT," +
                      "  precedence        TEXT," +
                      "  bigKindNum        TEXT," +
                      "  usage        TEXT," +
                      "  acceptOrgId        TEXT," +
                      "  acceptOrgCode        TEXT," +
                      "  acceptOrgName        TEXT," +
                      "  chargingName        TEXT," +
                      "  chargeType        TEXT," +
                      "  source        TEXT," +
                      "  recipeNum        TEXT," +
                      "  skinTestResult        TEXT," +
                      "  allPrice        TEXT," +
                      "  version          TEXT," +
                      "  operator_id          TEXT" +
                      ")"
              });
              if (!result.status) {
                  api.alert({
                      msg: '初始化离线数据dbMedAdvice失败'
                  });
                  return;
              }else{
                db.executeSqlSync({
                    name: cmcdb.name,
                    sql: "create index idx_dl_med_advice_1 on " + cmcdb.dbMedAdvice + "(medPatientId,version)"
                });
              }

              // 医嘱执行记录
              var result = db.executeSqlSync({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS "+cmcdb.dbMedAdviceExecute+" (" +
                      "  id                 TEXT," +
                      "  mark        TEXT," +
                      "  adviceName        TEXT," +
                      "  adviceItemCode        TEXT," +
                      "  bigKindNum        TEXT," +
                      "  dosage        TEXT," +
                      "  unit        TEXT," +
                      "  usage        TEXT," +
                      "  frequency        TEXT," +
                      "  stateCode        TEXT," +
                      "  stateName        TEXT," +
                      "  executeTime        TEXT," +
                      "  executeUserId        TEXT," +
                      "  executeUserCode        TEXT," +
                      "  executeUserName        TEXT," +
                      "  createUserId        TEXT," +
                      "  createTime        TEXT," +
                      "  medPatientId        TEXT," +
                      "  version          TEXT," +
                      "  operator_id          TEXT" +
                      ")"
              });
              if (!result.status) {
                  api.alert({
                      msg: '初始化离线数据dbMedAdviceExecute失败'
                  });
                  return;
              }else{
                db.executeSqlSync({
                    name: cmcdb.name,
                    sql: "create index idx_dl_med_advice_execute_1 on " + cmcdb.dbMedAdviceExecute + "(medPatientId,version)"
                });
              }

              // 体温变化记录
              var result = db.executeSqlSync({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS "+cmcdb.dbNurAnimalHeatSituation+" (" +
                      "  id                 TEXT," +
                      "  medPatientId        TEXT," +
                      "  temperature        TEXT," +
                      "  time        TEXT," +
                      "  version          TEXT," +
                      "  operator_id          TEXT" +
                      ")"
              });
              if (!result.status) {
                  api.alert({
                      msg: '初始化离线数据dbNurAnimalHeatSituation失败'
                  });
                  return;
              }else{
                db.executeSqlSync({
                    name: cmcdb.name,
                    sql: "create index idx_dl_nur_animalHeat_situation_1 on " + cmcdb.dbNurAnimalHeatSituation + "(medPatientId,version)"
                });
              }

              // 护理信息
              var result = db.executeSqlSync({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS "+cmcdb.dbNurLastExamine+" (" +
                      "  medPatientId      TEXT," +
                      "  temperature       TEXT," +
                      "  breathe           TEXT," +
                      "  pulse             TEXT," +
                      "  bloodPressureLow  TEXT," +
                      "  bloodPressureHigh TEXT," +
                      "  heartRate         TEXT," +
                      "  version           TEXT," +
                      "  operator_id       TEXT" +
                      ")"
              });
              if (!result.status) {
                  api.alert({
                      msg: '初始化离线数据dbNurLastExamine失败'
                  });
                  return;
              }else{
                db.executeSqlSync({
                    name: cmcdb.name,
                    sql: "create index idx_dl_nur_lastExamine_1 on " + cmcdb.dbNurLastExamine + "(medPatientId,version)"
                });
              }

              // 费用信息
              var result = db.executeSqlSync({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS "+cmcdb.dbMedCostSituation+" (" +
                      "  medPatientId     TEXT," +
                      "  prepayMoney      TEXT," +
                      "  closedOrderMoney TEXT," +
                      "  assureMoney      TEXT," +
                      "  healthMoney      TEXT," +
                      "  consumeMoney     TEXT," +
                      "  balance          TEXT," +
                      "  version          TEXT," +
                      "  operator_id      TEXT" +
                      ")"
              });
              if (!result.status) {
                  api.alert({
                      msg: '初始化离线数据dbMedCostSituation失败'
                  });
                  return;
              }else{
                db.executeSqlSync({
                    name: cmcdb.name,
                    sql: "create index idx_dl_cost_situation_1 on " + cmcdb.dbMedCostSituation + "(medPatientId,version)"
                });
              }

              // 病人详情
              var result = db.executeSqlSync({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS "+cmcdb.dbMedPatientDetails+" (" +
                      "  id          TEXT," +
                      "  medPatientId          TEXT," +
                      "  registerNumber          TEXT," +
                      "  name          TEXT," +
                      "  age          TEXT," +
                      "  idNumber          TEXT," +
                      "  drugAllergy          TEXT," +
                      "  organizationId          TEXT," +
                      "  organizationCode          TEXT," +
                      "  organizationName          TEXT," +
                      "  birthday          TEXT," +
                      "  sexCode          TEXT," +
                      "  sexName          TEXT," +
                      "  nationCode          TEXT," +
                      "  nationName          TEXT," +
                      "  marriageCode          TEXT," +
                      "  marriageName          TEXT," +
                      "  nativePlace          TEXT," +
                      "  educationCode          TEXT," +
                      "  educationName          TEXT," +
                      "  identity          TEXT," +
                      "  medBedId          TEXT," +
                      "  medBedName          TEXT," +
                      "  inHospitalTime          TEXT," +
                      "  contactsName          TEXT," +
                      "  contactsMobile          TEXT," +
                      "  contactsRelation          TEXT," +
                      "  healthTypeCode          TEXT," +
                      "  healthTypeName          TEXT," +
                      "  nurseLevelCode          TEXT," +
                      "  nurseLevelName          TEXT," +
                      "  diagnose          TEXT," +
                      "  version          TEXT," +
                      "  operator_id      TEXT" +
                      ")"
              });
              if (!result.status) {
                  api.alert({
                      msg: '初始化离线数据dbMedPatientDetails失败'
                  });
                  return;
              }else{
                db.executeSqlSync({
                    name: cmcdb.name,
                    sql: "create index idx_dl_med_patient_details_1 on " + cmcdb.dbMedPatientDetails + "(medPatientId,version)"
                });
              }

              //病历信息
              result = db.executeSqlSync({
                  name: cmcdb.name,
                  sql: "CREATE TABLE IF NOT EXISTS '" + cmcdb.dlCaseMenu + "'(id varchar(50),name varchar(2000),typeCode varchar(200),medPatientId varchar(50),medPatientName varchar(100),author varchar(100),createTime varchar(20),version int,operatorId varchar(200),content TEXT )"
              });
              if (!result.status) {
                  api.alert({
                      msg: '初始化离线数据病历列表失败'
                  });
                  return;
              }else{
                db.executeSqlSync({
                    name: cmcdb.name,
                    sql: "create index idxdlcasemenu1 on " + cmcdb.dlCaseMenu + "(med_patient_id,operator_id)"
                });
                db.executeSqlSync({
                    name: cmcdb.name,
                    sql: "create index idxdlcasemenu2 on " + cmcdb.dlCaseMenu + "(id)"
                });
              }
            }
        }
        else {
            api.alert({
                msg: '初始化数据集合失败'
            });
            return;
        }
    });

    //当查询完一次数据之后，将所有数据存储到到localstorage中，以对象数组的方式存放
    //点击某一个床号，判断是否存在病人，如果存在病人，通过数据的序列，从localstorage
    //中取出对应的数据，存放到单独的一个key中，后续的frame页面从该key中获取该病人的信息
    //如果查询用户没有记录，需要在页面进行提示
    //退出时需要清空这些数据
    //避免异常退出，登录成功之后也清空一次
};
