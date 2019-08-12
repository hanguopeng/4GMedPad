var db;
//版本号
var version = 1;
//原始版本
var originVersion = 0;
var operatorId = $api.getStorage(storageKey.userId);
apiready = function () {
    api.parseTapmode();
    db = api.require('db');
    //查询数据库表，如果没有数据，不显示最后下载时间，版本号为1，如果有数据，显示下载时间，版本在1和2之间切换
    //先下载后删除
    queryDownloadInfo();
    if ($api.getStorage(storageKey.offlineFlag) == "on") {
        $api.byId("offlineFlag").checked = true;
    } else {
        $api.byId("offlineFlag").checked = false;
    }

    api.addEventListener({
        name : 'keyback'
    }, function(ret, err) {
      closeWin();
    });

};

function queryDownloadInfo() {
    db.selectSql({
        name: cmcdb.name,
        sql: "SELECT * FROM " + cmcdb.dlStatusTable + " where operator_id='" + operatorId + "'"
    }, function (ret, err) {
        if (ret.status) {
            if (ret.data.length > 0) {
                var data = ret.data[0];
                $api.html($api.byId('showTime'), '电子病历最后下载时间:' + data.last_download_time);
                version = data.version % 2 + 1;
                originVersion = data.version;
            }
            $api.addEvt($api.byId("downloadIcon"), 'click', download);
        } else {
            api.alert({
                title: '错误',
                msg: '查询离线数据状态信息错误'
            });
        }
    });

}

function download() {
    api.showProgress({
        title: '',
        text: '正在下载...'
    });

    common.beginTransSync(db);

    common.get({
        url: config.patientDownloadUrl,
        isLoading: true,
        success: function (ret) {
            //插入我的病人信息
            try{
              if (insertPatients(ret)) {
                  downloadMedAssay();
              } else {
                  common.rollbackTransSync(db);
              }
            }catch(err){
              common.rollbackTransSync(db);
              api.hideProgress();
              api.alert({
                  title: '警告',
                  msg: '离线下载出现问题，请重试，如仍有问题，请联系管理员',
              });

            }

        },
        fail: function () {
            common.rollbackTransSync(db);
            api.hideProgress();
        }
    });
}

/**
 * 下载化验信息
 */
function downloadMedAssay() {
    common.get({
        url: config.medAssayDownloadUrl,
        isLoading: false,
        success: function (ret) {
            //插入化验信息
            var retFlag = insertMedAssay(ret);
            if (retFlag) {
                downloadMedAdvice();
            } else {
                common.rollbackTransSync(db);
            }
        },
        fail: function () {
            common.rollbackTransSync(db);
            api.hideProgress();
        }
    });
}
/**
 * 下载医嘱信息
 */
function downloadMedAdvice() {
    common.get({
        url: config.medAdviceDownloadUrl,
        isLoading: false,
        success: function (ret) {
            //插入医嘱信息
            var retFlag = insertMedAdvice(ret);
            if (retFlag) {
                downloadMedAdviceExecute();
            } else {
                common.rollbackTransSync(db);
            }
        },
        fail: function () {
            common.rollbackTransSync(db);
            api.hideProgress();
        }
    });
}
/**
 * 下载医嘱执行记录
 */
function downloadMedAdviceExecute() {
    common.get({
        url: config.medAdviceExecuteDownloadUrl,
        isLoading: false,
        success: function (ret) {
            //插入医嘱执行记录
            var retFlag = insertMedAdviceExecute(ret);
            if (retFlag) {
                downloadNurAnimalHeatSituation();
            } else {
                common.rollbackTransSync(db);
            }
        },
        fail: function () {
            common.rollbackTransSync(db);
            api.hideProgress();
        }
    });
}
/**
 * 下载体温变化
 */
function downloadNurAnimalHeatSituation() {
    common.get({
        url: config.nurAnimalHeatSituationDownloadUrl,
        isLoading: false,
        success: function (ret) {
            //插入体温变化
            var retFlag = insertNurAnimalHeatSituation(ret);
            if (retFlag) {
                downloadNurLastExamine();
            } else {
                common.rollbackTransSync(db);
            }
        },
        fail: function () {
            common.rollbackTransSync(db);
            api.hideProgress();
        }
    });
}
/**
 * 下载护理信息
 */
function downloadNurLastExamine() {
    common.get({
        url: config.nurLastExamineDownloadUrl,
        isLoading: false,
        success: function (ret) {
            //插入护理信息
            var retFlag = insertNurLastExamine(ret);
            if (retFlag) {
                downloadMedCostSituation();
            } else {
                common.rollbackTransSync(db);
            }
        },
        fail: function () {
            common.rollbackTransSync(db);
            api.hideProgress();
        }
    });
}
/**
 * 下载费用情况
 */
function downloadMedCostSituation() {
    common.get({
        url: config.medCostSituationDownloadUrl,
        isLoading: false,
        success: function (ret) {
            //插入护理信息
            var retFlag = insertMedCostSituation(ret);
            if (retFlag) {
                downloadMedPatientDetails();
            } else {
                common.rollbackTransSync(db);
            }
        },
        fail: function () {
            common.rollbackTransSync(db);
            api.hideProgress();
        }
    });
}
/**
 * 下载病人详情
 */
function downloadMedPatientDetails() {
    common.get({
        url: config.medPatientDetailsDownloadUrl,
        isLoading: false,
        success: function (ret) {
            //插入护理信息
            var retFlag = insertMedPatientDetails(ret);
            if (retFlag) {
                downloadMedExamine();
            } else {
                common.rollbackTransSync(db);
            }
        },
        fail: function () {
            common.rollbackTransSync(db);
            api.hideProgress();
        }
    });
}
/**
 * 下载检查信息
 */
function downloadMedExamine() {
    common.get({
        url: config.medExamineDownloadUrl,
        isLoading: false,
        success: function (ret) {
            //插入化验信息
            var retFlag = insertMedExamine(ret);
            if (retFlag) {
                downloadCaseList();
            } else {
                common.rollbackTransSync(db);
            }
            api.hideProgress();
        },
        fail: function () {
            common.rollbackTransSync(db);
            api.hideProgress();
        }
    });
}

// 下载病历列表 todo 修改请求配置
function downloadCaseList(){
  common.get({
      url: config.caseOfflineUrl,
      isLoading: false,
      success: function (ret) {
          //插入化验信息
          var retFlag = insertCaseList(ret);
          if (retFlag) {
            updateStatus();
            deleteRecord();
            common.commitTransSync(db);
          } else {
              common.rollbackTransSync(db);
          }
          api.hideProgress();
      },
      fail: function () {
          common.rollbackTransSync(db);
          api.hideProgress();
      }
  });
}

function insertCaseList(ret){
  var retFlag = true;
  if (ret.content && ret.content.list && ret.content.list.length > 0) {
      var datas = ret.content.list;
      for (var i = 0; i < datas.length; i++) {
          var item = datas[i];
          var id = item.id;
          var name = item.name;
          var typeCode= item.typeCode;
          var medPatientId = item.medPatientId;
          var medPatientName = item.medPatientName;
          var author = item.author;
          var createTime = item.createTime;
          var content = JSON.stringify(item.itemBoList);

          var sql = "insert into " + cmcdb.dlCaseMenu +
              "(id,name,typeCode,medPatientId,medPatientName,author,createTime,version,operatorId,content)" +
              "    VALUES ('" + id + "','" + name + "','" + typeCode + "','" + medPatientId + "','" + medPatientName + "','" + author + "'," +
              "'" + createTime + "','" + version + "','" + operatorId + "','" + content + "')";

          db.executeSqlSync({
              name: cmcdb.name,
              sql: sql
          }, function (ret, err) {
              if (!ret.status) {
                  retFlag = false;
              }
          });
      }
  }
  return retFlag;
}

/**
 * 插入化验信息
 * @param ret
 * @returns {boolean}
 */
function insertMedAssay(ret) {
    var retFlag = true;
    if (ret.content && ret.content.list && ret.content.list.length > 0) {
        var datas = ret.content.list;
        for (var i = 0; i < datas.length; i++) {
            var item = datas[i];
            var id = item.id;
            var medPatientId = item.medPatientId;
            var medAdviceId = item.medAdviceId;
            var medAdviceExecuteId = item.medAdviceExecuteId;
            var name = item.name;
            var sendTime = item.sendTime;
            var reportTime = item.reportTime;
            var sendDoctorId = item.sendDoctorId;
            var sendDoctorName = item.sendDoctorName;
            var createTime = item.createTime;
            var updateTime = item.updateTime;
            var itemList = JSON.stringify(item.itemList);
            var sql = "insert into " + cmcdb.dbMedAssayTable +
                "(id,medPatientId,medAdviceId,medAdviceExecuteId,name,sendTime,reportTime,sendDoctorId,sendDoctorName,createTime,updateTime,itemList,version,operator_id)\n" +
                "    VALUES ('" + id + "','" + medPatientId + "','" + medAdviceId + "','" + medAdviceExecuteId + "','" + name + "'," +
                "'" + sendTime + "','" + reportTime + "','" + sendDoctorId + "','" + sendDoctorName + "','" + createTime + "','" + updateTime + "','" + itemList + "','" + version + "','" + operatorId + "')";

            db.executeSqlSync({
                name: cmcdb.name,
                sql: sql
            }, function (ret, err) {
                if (!ret.status) {
                    retFlag = false;
                }
            });
        }
    }
    return retFlag;
}


/**
 * 插入检查信息
 * @param ret
 * @returns {boolean}
 */
function insertMedExamine(ret) {
    var retFlag = true;
    if (ret.content && ret.content.list && ret.content.list.length > 0) {
        var datas = ret.content.list;
        for (var i = 0; i < datas.length; i++) {
            var item = datas[i];
            var id = item.id;
            var medPatientId = item.medPatientId;
            var medAdviceId = item.medAdviceId;
            var medAdviceExecuteId = item.medAdviceExecuteId;
            var name = item.name;
            var sendTime = item.sendTime;
            var reportTime = item.reportTime;
            var sendDoctorId = item.sendDoctorId;
            var sendDoctorName = item.sendDoctorName;
            var discover = item.discover;
            var result = item.result;
            var createTime = item.createTime;
            var updateTime = item.updateTime;
            var accessoryList = JSON.stringify(item.accessoryList);
            var sql = "insert into " + cmcdb.dbMedExamine +
                "(id,medPatientId,medAdviceId,medAdviceExecuteId,name,sendTime,reportTime,sendDoctorId,sendDoctorName,discover,result,createTime,updateTime,accessoryList,version,operator_id)\n" +
                "    VALUES ('" + id + "','" + medPatientId + "','" + medAdviceId + "','" + medAdviceExecuteId + "','" + name + "'," +
                "'" + sendTime + "','" + reportTime + "','" + sendDoctorId + "','" + sendDoctorName + "','" + discover + "','" + result +
                "','" + createTime + "','" + updateTime + "','" + accessoryList + "','" + version + "','" + operatorId + "')";

            db.executeSqlSync({
                name: cmcdb.name,
                sql: sql
            }, function (ret, err) {
                if (!ret.status) {
                    retFlag = false;
                }
            });
        }
    }
    return retFlag;
}

/**
 * 插入医嘱记录
 * @param ret
 * @returns {boolean}
 */
function insertMedAdvice(ret) {
    var retFlag = true;
    if (ret.content && ret.content && ret.content.length > 0) {
        var datas = ret.content;
        for (var i = 0; i < datas.length; i++) {
            var item = datas[i];
            var id = item.id;
            var medPatientId = item.medPatientId;
            var mark = item.mark;
            var adviceName = item.adviceName;
            var beginTime = item.beginTime;
            var beginDoctorId = item.beginDoctorId;
            var beginDoctorCode = item.beginDoctorCode;
            var beginDoctor = item.beginDoctor;
            var beginOrgId = item.beginOrgId;
            var beginOrgCode = item.beginOrgCode;
            var beginOrg = item.beginOrg;
            var statusCode = item.statusCode;
            var statusName = item.statusName;
            var dosage = item.dosage;
            var unit = item.unit;
            var frequency = item.frequency;
            var noSendNum = item.noSendNum;
            var sendBackNum = item.sendBackNum;
            var sendNum = item.sendNum;
            var num = item.num;
            var precedence = item.precedence;
            var bigKindNum = item.bigKindNum;
            var usage = item.usage;
            var acceptOrgId = item.acceptOrgId;
            var acceptOrgCode = item.acceptOrgCode;
            var acceptOrgName = item.acceptOrgName;
            var chargingName = item.chargingName;
            var chargeType = item.chargeType;
            var source = item.source;
            var recipeNum = item.recipeNum;
            var skinTestResult = item.skinTestResult;
            var allPrice = item.allPrice;

            var sql = "insert into " + cmcdb.dbMedAdvice +
                "(id, medPatientId, mark, adviceName, beginTime, " +
                "beginDoctorId, beginDoctorCode, beginDoctor, beginOrgId, beginOrgCode, beginOrg, statusCode, " +
                "statusName, dosage, unit, frequency, noSendNum, sendBackNum, sendNum, num, precedence, " +
                "bigKindNum, usage, acceptOrgId, acceptOrgCode, acceptOrgName, chargingName, chargeType, " +
                "source, recipeNum, skinTestResult, allPrice, version, operator_id) \n" +
                "    VALUES ('" + id + "','" + medPatientId + "','" + mark + "','" + adviceName + "','" + beginTime + "'," +
                "'" + beginDoctorId + "','" + beginDoctorCode + "','" + beginDoctor + "','" + beginOrgId + "','" + beginOrgCode + "','" + beginOrg + "','" + statusCode +
                "','" + statusName + "','" + dosage + "','" + unit + "','" + frequency + "','" + noSendNum + "','" + sendBackNum + "','"+ sendNum + "','" + num + "','" + precedence +
                "','" + bigKindNum + "','" + usage + "','" + acceptOrgId + "','" + acceptOrgCode + "','" + acceptOrgName + "','" + chargingName + "','" + chargeType +
                "','" + source + "','" + recipeNum + "','" + skinTestResult + "','" + allPrice + "','" + version + "','" + operatorId + "')";

            db.executeSqlSync({
                name: cmcdb.name,
                sql: sql
            }, function (ret, err) {
                if (!ret.status) {
                    retFlag = false;
                }
            });
        }
    }
    return retFlag;
}

/**
 * 插入医嘱执行记录
 * @param ret
 * @returns {boolean}
 */
function insertMedAdviceExecute(ret) {
    var retFlag = true;
    if (ret.content && ret.content.list && ret.content.list.length > 0) {
        var datas = ret.content.list;
        for (var i = 0; i < datas.length; i++) {
            var item = datas[i];
            var id = item.id;
            var mark = item.mark;
            var adviceName = item.adviceName;
            var adviceItemCode = item.adviceItemCode;
            var bigKindNum = item.bigKindNum;
            var dosage = item.dosage;
            var unit = item.unit;
            var usage = item.usage;
            var frequency = item.frequency;
            var stateCode = item.stateCode;
            var stateName = item.stateName;
            var executeTime = item.executeTime;
            var executeUserId = item.executeUserId;
            var executeUserCode = item.executeUserCode;
            var executeUserName = item.executeUserName;
            var createUserId = item.createUserId;
            var createTime = item.createTime;
            var medPatientId = item.medPatientId;


            var sql = "insert into " + cmcdb.dbMedAdviceExecute +
                "(id, mark, adviceName, adviceItemCode, bigKindNum, " +
                "dosage, unit, usage, frequency, stateCode, stateName, " +
                "executeTime, executeUserId, executeUserCode, executeUserName, createUserId, createTime, " +
                "medPatientId, version, operator_id) \n" +
                "    VALUES ('" + id + "','" + mark + "','" + adviceName + "','" + adviceItemCode + "','" + bigKindNum + "'," +
                "'" + dosage + "','" + unit + "','" + usage + "','" + frequency + "','" + stateCode + "','" + stateName +
                "','" + executeTime + "','" + executeUserId + "','" + executeUserCode + "','" + executeUserName + "','" + createUserId + "','" + createTime +
                "','" + medPatientId + "','" + version + "','" + operatorId + "')";

            db.executeSqlSync({
                name: cmcdb.name,
                sql: sql
            }, function (ret, err) {
                if (!ret.status) {
                    retFlag = false;
                }
            });
        }
    }
    return retFlag;
}

/**
 * 插入体温变化
 * @param ret
 * @returns {boolean}
 */
function insertNurAnimalHeatSituation(ret) {
    var retFlag = true;
    if (ret.content && ret.content && ret.content.length > 0) {
        var datas = ret.content;
        for (var i = 0; i < datas.length; i++) {
            var item = datas[i];
            var id = item.id;
            var medPatientId = item.medPatientId;
            var temperature = item.temperature;
            var time = item.time;


            var sql = "insert into " + cmcdb.dbNurAnimalHeatSituation +
                "(id, medPatientId, temperature, time, version, operator_id) \n" +
                "    VALUES ('" + id + "','" + medPatientId + "','" + temperature + "','" + time + "','" + version + "','" + operatorId + "')";

            db.executeSqlSync({
                name: cmcdb.name,
                sql: sql
            }, function (ret, err) {
                if (!ret.status) {
                    retFlag = false;
                }
            });
        }
    }
    return retFlag;
}
/**
 * 插入护理信息
 * @param ret
 * @returns {boolean}
 */
function insertNurLastExamine(ret) {
    var retFlag = true;
    if (ret.content && ret.content && ret.content.length > 0) {
        var datas = ret.content;
        for (var i = 0; i < datas.length; i++) {
            var item = datas[i];
            var temperature = item.temperature;
            var breathe = item.breathe;
            var pulse = item.pulse;
            var bloodPressureLow = item.bloodPressureLow;
            var bloodPressureHigh = item.bloodPressureHigh;
            var heartRate = item.heartRate;
            var medPatientId = item.medPatientId;


            var sql = "insert into " + cmcdb.dbNurLastExamine +
                "(medPatientId, temperature, breathe, pulse, bloodPressureLow, bloodPressureHigh, " +
                "heartRate, version, operator_id) \n" +
                "    VALUES ('" + medPatientId + "','" + temperature + "','" + breathe + "','" + pulse + "','" + bloodPressureLow + "','" + bloodPressureHigh +
                "','" + heartRate + "','" + version +"','" + operatorId + "')";

            db.executeSqlSync({
                name: cmcdb.name,
                sql: sql
            }, function (ret, err) {
                if (!ret.status) {
                    retFlag = false;
                }
            });
        }
    }
    return retFlag;
}
/**
 * 插入费用情况
 * @param ret
 * @returns {boolean}
 */
function insertMedCostSituation(ret) {
    var retFlag = true;
    if (ret.content && ret.content && ret.content.length > 0) {
        var datas = ret.content;
        for (var i = 0; i < datas.length; i++) {
            var item = datas[i];
            var prepayMoney = item.prepayMoney;
            var closedOrderMoney = item.closedOrderMoney;
            var assureMoney = item.assureMoney;
            var healthMoney = item.healthMoney;
            var consumeMoney = item.consumeMoney;
            var balance = item.balance;
            var medPatientId = item.medPatientId;


            var sql = "insert into " + cmcdb.dbMedCostSituation +
                "(medPatientId, prepayMoney, closedOrderMoney, assureMoney, healthMoney," +
                " consumeMoney, balance, version, operator_id) \n" +
                "    VALUES ('" + medPatientId + "','" + prepayMoney + "','" + closedOrderMoney + "','" + assureMoney + "','" + healthMoney +
                "','" + consumeMoney + "','"+ balance + "','" + version +"','" + operatorId + "')";

            db.executeSqlSync({
                name: cmcdb.name,
                sql: sql
            }, function (ret, err) {
                if (!ret.status) {
                    retFlag = false;
                }
            });
        }
    }
    return retFlag;
}
/**
 * 插入病人详情
 * @param ret
 * @returns {boolean}
 */
function insertMedPatientDetails(ret) {
    var retFlag = true;
    if (ret.content && ret.content.list && ret.content.list.length > 0) {
        var datas = ret.content.list;
        for (var i = 0; i < datas.length; i++) {
            var item = datas[i];
            var id = item.id;
            var registerNumber = item.registerNumber;
            var name = item.name;
            var age = item.age;
            var idNumber = item.idNumber;
            var drugAllergy = item.drugAllergy;
            var organizationId = item.organizationId;
            var organizationCode = item.organizationCode;
            var organizationName = item.organizationName;
            var birthday = item.birthday;
            var sexCode = item.sexCode;
            var sexName = item.sexName;
            var nationCode = item.nationCode;
            var nationName = item.nationName;
            var marriageCode = item.marriageCode;
            var marriageName = item.marriageName;
            var nativePlace = item.nativePlace;
            var educationCode = item.educationCode;
            var educationName = item.educationName;
            var identity = item.identity;
            var medBedId = item.medBedId;
            var medBedName = item.medBedName;
            var inHospitalTime = item.inHospitalTime;
            var contactsName = item.contactsName;
            var contactsMobile = item.contactsMobile;
            var contactsRelation = item.contactsRelation;
            var healthTypeCode = item.healthTypeCode;
            var healthTypeName = item.healthTypeName;
            var nurseLevelCode = item.nurseLevelCode;
            var nurseLevelName = item.nurseLevelName;
            var diagnose = item.diagnose;


            var sql = "insert into " + cmcdb.dbMedPatientDetails +
                "(id, medPatientId, registerNumber, name, age, idNumber, drugAllergy, " +
                "organizationId, organizationCode, organizationName, birthday, sexCode, sexName, " +
                "nationCode, nationName, marriageCode, marriageName, nativePlace, educationCode, " +
                "educationName, identity, medBedId, medBedName, inHospitalTime, contactsName, " +
                "contactsMobile, contactsRelation, healthTypeCode, healthTypeName, nurseLevelCode, " +
                "nurseLevelName, diagnose, version, operator_id) " +
                "    VALUES ('" + id + "','" + id + "','" + registerNumber + "','" + name + "','" + age +"','" + idNumber +"','" + drugAllergy +
                "','" + organizationId + "','"+ organizationCode + "','" + organizationName +"','" + birthday + "','" + sexCode + "','" + sexName +
                "','" + nationCode + "','"+ nationName + "','" + marriageCode +"','" + marriageName + "','" + nativePlace + "','" + educationCode +
                "','" + educationName + "','"+ identity + "','" + medBedId +"','" + medBedName + "','" + inHospitalTime + "','" + contactsName +
                "','" + contactsMobile + "','"+ contactsRelation + "','" + healthTypeCode +"','" + healthTypeName + "','" + nurseLevelCode +
                "','" + nurseLevelName + "','"+ diagnose + "','" + version +"','" + operatorId + "')";

            db.executeSqlSync({
                name: cmcdb.name,
                sql: sql
            }, function (ret, err) {
                if (!ret.status) {
                    retFlag = false;
                }
            });
        }
    }
    return retFlag;
}
/**
 * 插入我的病人信息
 */
function insertPatients(ret) {
    var retflag = true;
    if (ret.content && ret.content.list && ret.content.list.length > 0) {
        var datas = ret.content.list;
        for (var i = 0; i < datas.length; i++) {
            var result = datas[i];
            var sql = "insert into " + cmcdb.dlPatientTable + "(age ,await_bed_flag ,backlog_flag ,bed_organization_id ,diagnose ,doctor_id ,doctor_name ,drug_allergy ,fever_flag ,health_type_code ,health_type_name ,high_risk_flag ,id ,id_number ,in_hospital_time ,med_bed_id ,med_bed_name ,my_patient_flag ,name ,new_advice_flag ,nurse_id ,nurse_level_code ,nurse_level_name ,nurse_name ,operation_flag ,operator_id ,organization_code ,organization_id ,organization_name ,out_hospital_time ,predict_out_hospital_time ,register_number ,sex ,telephone ,version) values ('" + result.age + "','" + result.awaitBedFlag + "','"
                + result.backlogFlag + "','" + result.bedOrganizationId + "','" + result.diagnose
                + "','" + result.doctorId + "','" + result.doctorName + "','" + result.drugAllergy
                + "','" + result.feverFlag + "','" + result.healthTypeCode + "','" + result.healthTypeName
                + "','" + result.highRiskFlag + "','" + result.id + "','" + result.idNumber
                + "','" + result.inHospitalTime + "','" + result.medBedId + "','" + result.medBedName
                + "','" + result.myPatientFlag + "','" + result.name + "','" + result.newAdviceFlag
                + "','" + result.nurseId + "','" + result.nurseLevelCode + "','" + result.nurseLevelName
                + "','" + result.nurseName + "','" + result.operationFlag + "','" + result.operatorId
                + "','" + result.organizationCode + "','" + result.organizationId + "','" + result.organizationName
                + "','" + result.outHospitalTime + "','" + result.predictOutHospitalTime + "','" + result.registerNumber
                + "','" + result.sex + "','" + result.telephone + "','" + version + "')";
            db.executeSqlSync({
                name: cmcdb.name,
                sql: sql
            }, function (ret, err) {
                if (!ret.status) {
                    retflag = false;
                }
            });
        }
    }
    return retflag;
}

/*
* todo 删除原始版本的相关数据
*/
function deleteRecord() {
    db.executeSqlSync({
        name: cmcdb.name,
        sql: "delete from " + cmcdb.dlPatientTable + " where operator_id='" + operatorId + "' and version='" + originVersion + "'"
    });
    db.executeSqlSync({
        name: cmcdb.name,
        sql: "delete from " + cmcdb.dbMedAssayTable + " where operator_id='" + operatorId + "' and version='" + originVersion + "'"
    });
    db.executeSqlSync({
        name: cmcdb.name,
        sql: "delete from " + cmcdb.dbMedExamine + " where operator_id='" + operatorId + "' and version='" + originVersion + "'"
    });
    db.executeSqlSync({
        name: cmcdb.name,
        sql: "delete from " + cmcdb.dbMedAdvice + " where operator_id='" + operatorId + "' and version='" + originVersion + "'"
    });
    db.executeSqlSync({
        name: cmcdb.name,
        sql: "delete from " + cmcdb.dbMedAdviceExecute + " where operator_id='" + operatorId + "' and version='" + originVersion + "'"
    });
    db.executeSqlSync({
        name: cmcdb.name,
        sql: "delete from " + cmcdb.dbNurAnimalHeatSituation + " where operator_id='" + operatorId + "' and version='" + originVersion + "'"
    });
    db.executeSqlSync({
        name: cmcdb.name,
        sql: "delete from " + cmcdb.dbNurLastExamine + " where operator_id='" + operatorId + "' and version='" + originVersion + "'"
    });
    db.executeSqlSync({
        name: cmcdb.name,
        sql: "delete from " + cmcdb.dbMedCostSituation + " where operator_id='" + operatorId + "' and version='" + originVersion + "'"
    });
    db.executeSqlSync({
        name: cmcdb.name,
        sql: "delete from " + cmcdb.dbMedPatientDetails + " where operator_id='" + operatorId + "' and version='" + originVersion + "'"
    });
    db.executeSqlSync({
        name: cmcdb.name,
        sql: "delete from " + cmcdb.dlCaseMenu + " where operator_id='" + operatorId + "' and version='" + originVersion + "'"
    });
}

/*
* 删除原来版本状态记录，插入新的版本记录
*/
function updateStatus() {
    var currentDate = new Date();
    var formateDate = formateDateAndTimeToString(currentDate);
    db.executeSqlSync({
        name: cmcdb.name,
        sql: 'delete from ' + cmcdb.dlStatusTable + " where operator_id='" + operatorId + "'"
    });

    db.executeSqlSync({
        name: cmcdb.name,
        sql: 'insert into ' + cmcdb.dlStatusTable + "(operator_id,version,last_download_time) values('" + operatorId + "'," + version + ",'" + formateDate + "')"
    });

    api.toast({
        msg: '下载成功',
        duration: config.duration,
        location: 'bottom'
    });
    db.executeSqlSync({
        name: cmcdb.name,
        sql: "SELECT * FROM " + cmcdb.dlStatusTable + " where operator_id='" + operatorId + "'"
    }, function (ret, err) {
        if (ret.status) {
            if (ret.data.length > 0) {
                var data = ret.data[0];
                $api.html($api.byId('showTime'), '电子病历最后下载时间:' + data.last_download_time);
                version = data.version % 2 + 1;
                originVersion = data.version;
            }
        }
    });


}


function closeWin() {
    //获取是否使用离线，发送消息
    var offlineFlag = $api.byId("offlineFlag").checked;
    if (offlineFlag) {
        $api.setStorage(storageKey.offlineFlag, "on");
    } else {
        $api.setStorage(storageKey.offlineFlag, "off");
    }
    if(db){
      common.rollbackTransSync(db);
    }
    api.sendEvent({
        name: eventName.offlineOrOnline
    });
    api.closeWin();
}

function formatDateToString(date) {
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
    return formatDateToString(date) + " " + hours + ":" + mins + ":" + secs;
}
