var cmcServer="http://doclever.cn:8090/mock/5ad3f5ff995b693f603c9eeb";
//var tempChartServer = "http://192.168.1.126:8001"; //pad里面体温单的路径
//var localServer = "http://192.168.43.200:8085/cmc-server";

var tempChartServer = "http://172.17.100.2:8085"; //pad里面体温单的路径
var localServer = "http://172.17.100.2:8083/cmc-server";
var config={
    //功能类
    duration:3000,
    versionUpdateUrl: localServer+"/sys/appVersion/verification", //版本更新
    //versionUpdateUrl:"http://doclever.cn:8090/mock/5ad3f5ff995b693f603c9eeb/sys/checkVersion",
    medAssayUrl: localServer+"/med/assay?patientId=", //化验结果
    patientDetailUrl: localServer+"/med/patient/", //病人详情
    patientLastExamineUrl: localServer+"/nur/nurseTemperatureChart/getSignValue/", //护理检查信息
    costSituationUrl: localServer+"/med/cost/situation/", //费用情况
    transfuseSituationUrl: localServer+"/med/transfuse/situation/", //输液情况---暂未使用
    accessoryQueryUrl: localServer+"/med/wardRound", //附件分页查询
    accessoryDownloadUrl: localServer+"/sys/accessory/downLoad/", //附件下载
    accessoryDelUrl: localServer+"/med/wardRound/delete/", //附件删除
    accessoryUploadUrl: localServer+"/sys/accessory/upload", //附件上传文件
    accessoryInfoUrl: localServer+"/med/wardRound", //附件上传字段post方法
    adviceExecute: localServer+"/med/adviceExecute?patientId=" ,//医嘱执行记录
    costItemDetails: localServer+"/med/cost/detailByPatientId/pad?patientId=",//费用明细分页测试
    preCostList: localServer+"/med/cost/padPrepayList", //预结费用清单
    medExaminelUrl: localServer+"/med/examine?patientId=", //检查结果
    accessoryGetUrl:localServer+"/med/wardRound/", //附件明细get方法
    nurseLogCommon: localServer+"/nur/nurseLog/listDetails", //护理记录
    medAssayDetailUrl: localServer+"/med/assay/", //化验结果明细
    patientDownloadUrl: localServer+"/med/patient/downloadList",  //我的病人信息
    medAssayDownloadUrl: localServer+"/med/assay/downloadList",  //化验信息
    medAdviceDownloadUrl: localServer+"/med/advice/list/download",  //医嘱列表
    medAdviceExecuteDownloadUrl: localServer+"/med/adviceExecute/list/download",  //医嘱列表
    nurAnimalHeatSituationDownloadUrl: localServer+"/nur/nurseLog/animalHeat/situation/download",  //体温变化
    nurLastExamineDownloadUrl: localServer+"/nur/nurseLog/lastExamine/download",  //护理信息
    medCostSituationDownloadUrl: localServer+"/med/cost/situation/downLoad",  //费用信息
    medPatientDetailsDownloadUrl: localServer+"/med/patient/details/download",  //病人详情
    medExamineDownloadUrl: localServer+"/med/examine/downloadList",  //检查信息
    caseOfflineUrl: localServer+"/med/clinicalHistory/downloadList" , //病历查询右侧的信息
    medExamineDetailUrl: localServer+"/med/examine/", //检查结果明细
    // 20190808 添加医嘱记录查询
    queryAdviceList: localServer+"/med/advice/queryAdviceList",  // 医嘱记录
    querySendList: localServer+"/med/V4gMedicalAdviceSendList/padSendList", //医嘱发送记录
    costListDetails: localServer+"/med/cost/padCostList",//费用明细查询
    medCostTotal: localServer+"/med/advice/queryAdviceCost/",//费用明细查询

    //护理文书类
    smtzjcjldUrl: localServer+"/nur/VitalSigns",   //生命体征检测记录单
    bloodGlucose: localServer+"/nur/nurseLog/listDetails", //血糖监测查询
    bloodSugarDetail: localServer+"/nur/bloodSugar/",//血糖检测表查询
    bloodGlucoseDetail: localServer+"/nur/nurseLog/", //血糖监测明细
    boneCriticallyIllQuery: localServer+"/nur/boneCriticallyIll/",//骨科病重(病危)患者护理记录单查询
    criticallyIllQuery: localServer+"/nur/nursePlan/listDetails/json",//血液肿瘤科病重(病危)患者护理记录单查询
    patientSearchUrl: localServer+"/med/patient/padList",//根据条件查询所有病人信息
    ydsbjlbUrl: localServer+"/nur/nursePlan/selectInsulin?patientId=",   //胰岛素泵列表
    ydsbjlbDetailsUrl: localServer+"/nur/nursePlan/selectInsulin/detail?id=",   //胰岛素泵详情
    loginUserInfoUrl: localServer+"/personnel/detailByOperator", //登陆人员信息
    organizationUrl: localServer+"/sys/organization/listByOperator", //疗区查询



    //没有用到的URL
    adviceDetail: localServer+"/med/advice?patientId=" ,//医嘱明细
    caseQueryUrl: localServer+"/med/clinicalHistory" , //病历查阅中左侧病历列表查询
    chartUrl: tempChartServer+"/#/temperature?token=", //体温单
    loginUrl: localServer+"/sys/login", //登录
    //patientSearchUrl: localServer+"/med/patient", //病人查询
    animalHeatSituationUrl: localServer+"/nur/nurseLog/animalHeat/situation/{patientId}", //体温变化
    nursePlanSituationUrl: cmcServer+"/med/nursePlan/situation/{patientId}", //护理文书
    animalHeatSituation: localServer+"/nur/nurseLog/animalHeat/situation/", //体温变化
    //bloodGlucose: localServer+"/nur/nurseLog?templateId=3&patientId=", //血糖监测查询
    bloodDetailDay: localServer+"/nur/nurseLog/listDetails/json", //按照日期筛选血糖监测明细
    //costItemDetail: localServer+"/med/costItem?patientId=", //费用明细-分页
    costSearch:  localServer+"/med/cost/detailByPatientIdByPda/list",//按照医嘱处方大类与医嘱优先级
    costDate: localServer+"", //按照医嘱日期
    costDetail: localServer+"/med/cost/detailByPatientId/", //费用详情按人员查询，带明细不分页
    //nurseLogCommon: localServer+"/nur/nurseLog?templateId=6&patientId=", //护理记录
    accessoryQueryUrlDetails: localServer+"/med/wardRound/query",
    caseInfoUrl: localServer+"/med/clinicalHistory" , //病历查询右侧的信息
    //离线下载接口
}

var accessoryType={
    audio:0, //音频
    note:1,   //记事本
    camera:2  //照片
}

var caseReviceType={
    //病历查阅类型
    index:"index",
    checkin:"checkin",
    record:"record",
    checkout:"checkout"
}

//数据库
var cmcdb={
    name:"cmc",
    path:"fs://cmc.db",
    resTable:"t_res",
    dbVersion:"t_db", //数据库版本表
    dlStatusTable:"t_dl_status", //下载数据总表
    dlPatientTable:"t_dl_patient", //病人明细表
    dbMedAssayTable:"t_dl_med_assay", //病人化验列表
    dbMedExamine:"t_dl_med_examine", //病人检查列表
    dbMedAdvice:"t_dl_med_advice", //病人医嘱列表
    dbMedAdviceExecute:"t_dl_med_advice_execute", //医嘱执行记录
    dbNurAnimalHeatSituation:"t_dl_nur_animalHeat_situation", //体温变化
    dbNurLastExamine:"t_dl_nur_lastExamine", //护理信息
    dbMedCostSituation:"t_dl_med_cost_situation", //费用信息
    dbMedPatientDetails:"t_dl_med_patient_details", //病人详情

    dlCaseMenu:"t_dl_case_menu" //病历左侧菜单
}

//事件列表
var eventName={
    InpatientAreaChanged: 'InpatientAreaChanged', //疗区改变事件
    personChanged:'personChanged', //用户切换更改事件
    mainRefresh:'main_refresh', //由于有患者列表查询和病区查询，这两个共用一样的localstorage，因此需要到病区页面重新进行查询
    personChoosed:'personChoosed', //搜索列表点击事件
    offlineOrOnline:'offlineOrOnline',//切换离线或者在线
}

//localstorage的key
var storageKey={
    loginName:"loginName",//登录填写的用户名
    userName:"userName", //登录用户名
    userId:"userId", //登录用户id
    token:"token",//访问token
    areaId:"areaId", //疗区id
    persons:"persons", //查询到的相关病人信息
    currentPerson:"currentPerson", //当前选择的一个病人的信息
    currentIdx:"currentIdx", //记录当前选择的病人在数组中的索引信息，左右箭头点击时使用
    lastIdx:"lastIdx", //记录当前病人的数量，数组.length-1
    offlineFlag:"offlineFlag",//是否是离线查询

}
