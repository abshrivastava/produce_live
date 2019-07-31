//i18n翻译
var i18n_cacheFlag=false;
var sourceList = {
    uploadFileShimArr:[],//save user upload video infoma
    uploadIpShimArr:[],//save user upload ip source infomation
    UploadUrl:'',
    pipIdArr:[],
    token2live:false,
    tokenFlag:true,//避免重复token推送发送额外的请求
    startLvieTimeOut:2000,
    tokenDelete:false,
    retryCountTimer:false,
    preventRepeatRequest:false,
    isOrCanvas:false,
}
var currentRInfo = {//保存当前R的状态
    selectRId:"",
    zorder:2,
    isLive:0,
    isSwitch:false,//表示是否切换R
    selectRUserBehavior:{},
    IsAudioFollowVideo:undefined,//为了避免afv状态改变，按钮改变慢的问题
    webrtcLogin:"",
    outputPreview:true,
    rtcIdList:{
        pvw:"",
        pgm:{
            id:[],
            data:null
        },
        preLis:{
            idArr:[],
            data:[]
        }
    },
    voIpTlist:{}
}
/*
 * set status save object
 */
var statusObj = {
    pipStatus: false,
    IsPIPPreviewing: false,
    pageInit:true,
    previewListTimer:null,
    clockInitTimer:null,
    resolutionArray:[],
    voIpFlag:false,
    isVoIpFunction:false,
    AUTHORITY:null
}
var clockObj={
    setClockTimer:undefined,
    clockSeconds:0,
    clockEndTime:undefined,
    recordTimer:"",
    recordSeconds:0,
}
var switchLangObj=fn_loadProperties(["i18n_all","i18n_pIdOrName","i18n_receiver","i18n_tvuPack","i18n_tvuAnywhere","i18n_grid"
,"i18n_ext","i18n_unknow","i18n_bookmark","i18n_filter","i18n_source","i18n_publishShare","i18n_shareDirectly","i18n_share"
,"i18n_stop","i18n_privacy","i18n_type","i18n_friends","i18n_only_me","i18n_continuous","i18n_regular","i18n_public"
,"i18n_live","i18n_receiverControl","i18n_sourceControl","i18n_startLive","i18n_stopLive","i18n_select","i18n_dynamic"
,"i18n_fixed","i18n_startCall", "i18n_continueCall", "i18n_interruption","i18n_cancel","i18n_online","i18n_offline"
,"i18n_status","i18n_dynamicsorting","i18n_save","i18n_name","i18n_callConnectionFail","i18n_To","i18n_From"
,"i18n_localSource","i18n_addToSwitchBus","i18n_removeFromSwitchBus","i18n_unclassified","i18n_cloudR","i18n_refresh"
,"i18n_ReceiverVersionIsLow","i18n_ImageFormatIsWrong","i18n_Now","i18n_min","i18n_mins","i18n_hour","i18n_hours"
,"i18n_loading","i18n_clickShowMore","i18n_determine","i18n_clickIpStream","i18n_create","i18n_search","i18n_go"
,"i18n_first","i18n_last","i18n_prev","i18n_next","i18n_add","i18n_maximunSize640","i18n_default","i18n_peerId"
,"1i8n_nameCondition","i18n_stereo","i18n_mono","i18n_notShowIPStramingOutput","i18n_procuderMustBeOne","i18n_activate"
,"i18n_deactivate","i18n_bookmarkName","i18n_deviceName",,"i18n_addRole","i18n_editRole","i18n_deleteRole"
,"i18n_accessControl","i18n_pidOrNameOrTag","i18n_relationManagement","i18n_email","i18n_permission","i18n_Y","i18n_N"
,"i18n_voip","i18n_Yes","i18n_No","i18n_Admin","i18n_User","i18n_lowerdelete","i18n_receiverIpIsWrong","i18n_webRTCOffline"
,"i18n_webRTCSeverError","i18n_regular4HourWidthVOD","i18n_notOpenPreview","i18n_ChangUserRole","i18n_deviceType"
,"i18n_userName","i18n_fullUserName","i18n_ChangUserRole","i18n_at","i18n_with","i18n_tag","i18n_where","i18n_who"
,"i18n_videoTag","i18n_In","i18n_together","i18n_andother","i18n_users","i18n_with_none","i18n_at_low","i18n_In_low"
,"i18n_at_none","i18n_liveVideo","i18n_producer","i18n_multiView","i18n_commercialFeature","i18n_addAcountToShare"
,"i18n_pushLiveR","i18n_LogoFormatIsWrong","i18n_NotSameFileName","i18n_turnOn","i18n_position","i18n_tagFriend"
,"i18n_vdieoTag","i18n_kickLastOne","i18n_kickDefine","i18n_kickCancle","i18n_VOIPOffline","i18n_cloudLiveError"
,"i18n_accept","i18n_deny","i18n_setStatusTips","i18n_nextTips","i18n_token","i18n_location","i18n_automatic"
,"i18n_manual","i18n_noPosition","i18n_noVolumeModule","i18n_tvuToken","i18n_tokeItems","i18n_creatToken","i18n_tokenName"
,"i18n_expireTime","i18n_createTokenName","i18n_emailAddr","i18n_createtoken","i18n_addtoken","i18n_edittoken","i18n_emailTips"
,"i18n_Inke","i18n_YiLive","i18n_pandaTV","i18n_howToGetIt","i18n_edit","i18n_waiting", "i18n_rejected", "i18n_completed"
,"i18n_delete","i18n_enterTips","i18n_nameRequired","i18n_IllegalInkeID","i18n_mailAddrTips","i18n_portraitMode"
,"i18n_clickMapSetLocation","i18n_automaticLocation","i18n_manualLocation","i18n_Receivers","i18n_receivers"
,"i18n_endEvent","i18n_selectEventFirst","i18n_invalidEvent","i18n_errorTips","i18n_existName","i18n_createFailed"
,"i18n_notExist","i18n_wrongPhoneNumber","i18n_correctPhoneNumber","i18n_portraitMode","i18n_pandaNoAuth","i18n_getMessgae"
,"i18n_ylNoPower","i18n_waitForTwoMin","i18n_accountBanned","i18n_messageTooMuch","i18n_messageCodeFour","i18n_Others"
,"i18n_facebookBanned","i18n_control","i18n_clickToShowMoreInfo","i18n_allDevices","i18n_wrongMessageCode"
,"i18n_chooseExpireTime","i18n_shareWay","i18n_dialog","i18n_appId","i18n_nameAndAppid","i18n_PostTo","i18n_systemAdmin"
,"i18n_supportManager","i18n_uploadLogoFirst","i18n_cannotEmpty","i18n_cannotLive","i18n_IllegalOutputname"
,"i18n_selectAccountFirst","i18n_invalidValue","i18n_maxLogoSize","i18n_cancelRemove","i18n_removeFileShim","i18n_pack"
,"i18n_moduleNotFind","i18n_selectReceiverFirst","i18n_titleMust","i18n_deleteEvent","i18n_title","i18n_reporter"
,"i18n_storySlug","i18n_liveControl","i18n_emptyList","i18n_goodNight","i18n_gridPack","i18n_gridSDI","i18n_clickRefreshList"
,"i18n_eventTimeConflict","i18n_planning","i18n_running","i18n_completedStatus","i18n_deleted","i81n_interrupted"
,"i18n_startTimeLaterNow","i18n_confirmStopBooking","i18n_log","i18n_action","i18n_focus","i18n_exposure","i18n_zoom"
,"i18n_crop","i18n_noAuthority","i18n_eventEndInOneMin","i18n_gridControl","i18n_gridControlFunction","i18n_notFindStudioModule"
,"i18n_noDeployed","i18n_workWithRealR","i18n_cameraOff","i18n_clickOfflineR","i18n_cannotUseCloudR","i18n_optAndLog"
,"i81n_pending","i18n_sourceOffline","i18n_sourceOffline","i18n_receiverOffline","i18n_sourceOccupied","i18n_receiverOccupied","i18n_notPaired"
,"i18n_sourceSwitched","i18n_receiverStoppedManually","i18n_failed","i18n_receiverStopped","i18n_notFindProducerProModule","i18n_liveFailed"
,"i18n_isLiveWithCloud","i18n_removeCloudrPermission","i18n_stopCloudrShareFail","i18n_more","i18n_ProducerPro","i18n_tvuProducerPro"
,"i18n_isCanStopProducer","i18n_home","i18n_alert","i18n_booking","i18n_gridControlPartner","i18n_isLiveByCloud","i18n_synchronizing"
,"i18n_synchronized","i18n_unSync","i18n_synFailed","i18n_eventExpiration","i18n_noTimeLockFeature","i18n_serviceClosed"
,"i18n_invalidSourcePeerId","i18n_invalidDestPeerId","i18n_sourceTypeIsNull","i18n_invalidStartTime","i18n_invalidEndTime","i18n_biggerEndTime"
,"i18n_biggerStartTime","i18n_sourceSetDelay","i18n_delayInputRange","i18n_sourceSetBitrate","i18n_bitrateInput","i18n_sourceSetUrl"
,"i18n_matrixSetOutputId","i18n_matrixSetSwitchtype","i18n_Setswitchtype","i18n_matrixSupport","i18n_sdiInNotSupport","i18n_cannotModifyEvent"
,"i18n_endTimeBigger","i18n_cannotModifyStartTime","i18n_matrixEventCannotModify","i18n_msgpipeConnectError","i18n_requestTimeOut"
,"i18n_paramError","i18n_checkType","i18n_checkName","i18n_cannotEdit","i18n_checkRStatus","i18n_timeLock","i18n_syncing","i18n_success","i18n_failed"
,"i18n_gridMateDate","i18n_gridMonitorSource","i18n_applyPVW","i18n_VideoCut","i18n_OverlayCut","i18n_AFV","i18n_proDone","i18n_proType","i18n_ScorePattern"
,"i18n_proSet","i18n_subtitle","i18n_scoreTitle","i18n_leftName","i18n_rightName","i18n_leftScore","i18n_rightScore","i18n_font","i18n_fontsize","i18n_fontbg"
,"i18n_Typeface","i18n_fontcolor","i18n_pipPattent","i18n_selectScore","i18n_EmptyData","i18n_prosharepage","i18n_localVideo","i18n_extIP","i18n_proerrorTips"
,"i18n_tableView","i18n_calendarView","i18n_runningBooking","i18n_AudioFollowVideo","i18n_textValue","i18n_StepOne","i18n_StepTwo","i18n_StepThree","i18n_OnAppSetting"
,"i18n_OnThisPage","i18n_OnAppLive","i18n_Device","i18n_Operation","i18n_headTips","i18n_add","i18n_cancelFailed","i18n_cancelLive","i18n_ProhibitedToDelete"
,"i18n_hastoken","i18n_chooseLiveAccount","i18n_fileName","i18n_OK","i18n_Camera","i18n_Unspecified","i18n_ReceiverIsNotOnline","i1n8_fileServerId","i18n_Periscope"
,"i18n_ReceiverIslivingWithOther","i18n_userInfo","i18n_SalesforceAccount","i18n_fullAccountName","i18n_preview","i18n_acceptAnywhere","i18n_liveAnywhere"
,"i18n_HasBeenSent","i18n_whiteIPList","i18n_errorAlreadyExist","i18n_errorNotExist","i18n_errorProhibit","i18n_scoreRepeat","i18n_uploadScoreFail","i18n_acceptFail"
,"i18n_preload","i18n_NotDelete","i18n_currentUserNum","i18n_openInstance","i18n_closeInstance","i18n_heckNetworkRetry","i18n_PairingSuccess","i18n_LvieSuccess"
,"i18n_tokenStartlive","i18n_pleaseOtherCamera","i18n_shutDownProducerpro","i18n_account","i18n_SyncToTwitter","i18n_MobileNumber","i18n_MessageLimited","i18n_MessageCode"
,"i18n_publish","i18n_selectPublishCount","i18n_reauthCount","i18n_producerReauthTitle","i18n_publish","i18n_click2publish","i18n_VideoDescription"
,"i18n_VerticalScreen","i18n_socialAccount","i18n_websiteType","i18n_isPid","i18n_ipConnect","i18n_OutputNameSupport","i18n_tips","i18n_OnAppLivetips"
,"i18n_producerReauthTitle","i18n_youTuBeIsAuthorSuccess","i18n_Topreview","i18n_LogoImage","i18n_Score","i18n_Text","i18n_PIP","i18n_Copyed","i18n_GridSource"
,"i18n_LogoPngFormat","i18n_noSourceNoReplay","i18n_selectResolution","i18n_record","i18n_Bitrate","i18n_AcceptAutomatically","i18n_Rewind","i18n_ReplayCut"
,"i18n_initialize","i18n_allocate","i18n_config","i18n_digitsPassword","i18n_inconsistent","i18n_rightCode","i18n_tryagain","i18n_emailAddress","i18n_inputPassword"
,"i18_reSend","i18n_applySuccess","i18_ComfirmLogin","i18n_emailOrPhoneAddress","i18n_inviteRightCode","i18n_commentError","i18n_crossRecoverLogo","i18n_crossRecoverLogoEnd"
,"i18n_crossRecoverVideo","i18n_crossRecoverVideoEnd","i18n_gridName","i18n_gustRecharge","i18n_Professional","i18n_Advanced","i18n_hourTime","i18n_vaild","i18n_paypal","i18n_wechat"
,"i18n_Remain","i18n_ipUnConnect","i18n_Adv","i18n_Pro","i18n_hourTime","i18n_hoursTime","i18n_hourTimes","i18n_minTime","i18n_oneWeek","i18n_oneMonth","i18n_halfYear","i18n_oneYear","i18n_next"
,"i18n_StartAt"]);