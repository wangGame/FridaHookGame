function(e, t) {
return e - t;
});
return r % 2 == 0 ? (o[Math.floor(r / 2)] + o[Math.floor(r / 2) - 1]) / 2 : o[Math.floor(r / 2)];
}
return -999;
};
Object.defineProperty(e.prototype, "interAdTotalCount", {
get: function() {
var e, t;
return null !== (t = null === (e = c.adxModelRequestInfo.adxLocalData) || void 0 === e ? void 0 : e.inter_ad_total_count) && void 0 !== t ? t : 0;
},
enumerable: !1,
configurable: !0
});
Object.defineProperty(e.prototype, "rewardAdTotalCount", {
get: function() {
var e, t;
return null !== (t = null === (e = c.adxModelRequestInfo.adxLocalData) || void 0 === e ? void 0 : e.reward_ad_total_count) && void 0 !== t ? t : 0;
},
enumerable: !1,
configurable: !0
});
return e;
}();
o.adxModelServerInfo = new s();
cc._RF.pop();
}, {
"../../device/vo/DeviceInfo": "DeviceInfo",
"../../http/HAdxModel": "HAdxModel",
"../../native/NativeDevice": "NativeDevice",
"./AdxModelRequestInfo": "AdxModelRequestInfo"
} ],
AdxModelType: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "7d705eYvKJAYaMimEKTUcoa", "AdxModelType");
Object.defineProperty(o, "__esModule", {
value: !0
});
o.AdxModelPlanIdType = o.AdxReplaceAdType = void 0;
(function(e) {
e[e.Unknown = 0] = "Unknown";
e[e.Banner = 1] = "Banner";
e[e.Interstitial = 2] = "Interstitial";
e[e.Reward = 3] = "Reward";
})(o.AdxReplaceAdType || (o.AdxReplaceAdType = {}));
(function(e) {
e[e.PlayId_1 = 1] = "PlayId_1";
e[e.PlayId_2 = 2] = "PlayId_2";
e[e.PlayId_3 = 3] = "PlayId_3";
e[e.PlayId_4 = 4] = "PlayId_4";
e[e.PlayId_5 = 5] = "PlayId_5";
e[e.PlayId_6 = 6] = "PlayId_6";
e[e.PlayId_7 = 7] = "PlayId_7";
e[e.PlayId_8 = 8] = "PlayId_8";
e[e.PlayId_9 = 9] = "PlayId_9";
e[e.PlayId_10 = 10] = "PlayId_10";
e[e.PlayId_11 = 11] = "PlayId_11";
e[e.PlayId_12 = 12] = "PlayId_12";
e[e.PlayId_13 = 13] = "PlayId_13";
e[e.PlayId_14 = 14] = "PlayId_14";
e[e.PlayId_15 = 15] = "PlayId_15";
e[e.PlayId_16 = 16] = "PlayId_16";
})(o.AdxModelPlanIdType || (o.AdxModelPlanIdType = {}));
cc._RF.pop();
}, {} ],
AdxModel_Game_Proxy: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "f00f3j4Y/FOIbojMnzoa2Ff", "AdxModel_Game_Proxy");
var r, n = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.AdxModel_Game_Proxy = void 0;
var a = e("../../../falcon/Proxy"), i = e("../../game/events/E_Game_InitComplete"), l = e("../../game/events/E_Game_Start"), c = e("../vo/AdxModelRequestInfo"), s = function(e) {
n(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.onInit = function() {};
t.prototype.registerEvents = function() {
return [ i.E_Game_InitComplete, l.E_Game_Start ];
};
t.prototype.receivedEvents = function(e) {
switch (e.getClass()) {
case i.E_Game_InitComplete:
this.onTraitConfigInitComplete(e);
break;

case l.E_Game_Start:
this.onGameStart();
}
};
t.prototype.onTraitConfigInitComplete = function() {
c.adxModelRequestInfo.initData();
};
t.prototype.onGameStart = function() {};
return t;
}(a.Proxy);
o.AdxModel_Game_Proxy = s;
cc._RF.pop();
}, {
"../../../falcon/Proxy": "Proxy",
"../../game/events/E_Game_InitComplete": "E_Game_InitComplete",
"../../game/events/E_Game_Start": "E_Game_Start",
"../vo/AdxModelRequestInfo": "AdxModelRequestInfo"
} ],
AdxModel_Module: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "f7524PGhBBMMLNBShYnAI4l", "AdxModel_Module");
var r, n = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.AdxModel_Module = void 0;
var a = e("../../falcon/Module"), i = e("./proxys/AdxModel_Game_Proxy"), l = e("./proxys/AdxModel_Native_Proxy"), c = function(e) {
n(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.registerProxys = function() {
return [ i.AdxModel_Game_Proxy, l.AdxModel_Native_Proxy ];
};
return t;
}(a.Module);
o.AdxModel_Module = c;
cc._RF.pop();
}, {
"../../falcon/Module": "Module",
"./proxys/AdxModel_Game_Proxy": "AdxModel_Game_Proxy",
"./proxys/AdxModel_Native_Proxy": "AdxModel_Native_Proxy"
} ],
AdxModel_Native_Proxy: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "e0c21ReQzpOKYB5VQK8cnPz", "AdxModel_Native_Proxy");
var r, n = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
});
Object.defineProperty(o, "__esModule", {
value: !0
});
o.AdxModel_Native_Proxy = void 0;
var a = e("../../../falcon/Proxy"), i = e("../../native/NativeReceivedNative"), l = e("../vo/AdxModelNativeInfo"), c = e("../vo/AdxModelReplaceAdCtrl"), s = function(e) {
n(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.onInit = function() {
var e = this;
i.onNativeReponse("getDecisionInfo", function(t) {
e.onGetDecisionInfo(t);
});
i.onNativeReponse("getFirstAdEcpm", function(t) {
e.onGetFirstAdEcpm(t);
});
i.onNativeReponse("adCallback", function(t) {
e.onAdCallback(t);
});
i.onNativeReponse("adxAdCallback", function(t) {
e.onAdxAdCallback(t);
});
i.onNativeReponse("callBackAdWayNum", function(t) {
e.onCallBackAdWayNum(t);
});
};
t.prototype.onCallBackAdWayNum = function(e) {
c.adxModelReplaceAdCtrl.setPromotionState(e.result, e.cur_adwaynum);
};
t.prototype.onAdxAdCallback = function() {};
t.prototype.onGetDecisionInfo = function() {};
t.prototype.onGetFirstAdEcpm = function(e) {
l.adxModelNativeInfo._firstInterEcpm = e.ecpm;
};
t.prototype.onAdCallback = function() {};
return t;
}(a.Proxy);
o.AdxModel_Native_Proxy = s;
cc._RF.pop();
}, {
"../../../falcon/Proxy": "Proxy",
"../../native/NativeReceivedNative": "NativeReceivedNative",
"../vo/AdxModelNativeInfo": "AdxModelNativeInfo",
"../vo/AdxModelReplaceAdCtrl": "AdxModelReplaceAdCtrl"
} ],
AesGcmCompat: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "e1fe7zjZchB2ZVc39tats4c", "AesGcmCompat");
Object.defineProperty(o, "__esModule", {
value: !0
});
o.AesGcmCompat = void 0;
var r = function() {
function e() {}
e.utf8Encode = function(e) {
if ("undefined" != typeof TextEncoder) return new TextEncoder().encode(e);
for (var t = [], o = 0; o < e.length; o++{"#type":"track","#time":"2026-02-28 18:40:43.824","#distinct_id":"e7e5e7bf-6ec9-451b-b6e7-e6f66039672d","#event_name":"s_channel_result","properties":{"#lib_version":"2.8.3","#carrier":"","#os":"Android","#device_id":"eb48ccd23c8bcf34","#screen_height":1920,"#bundle_id":"com.block.juggle","#device_model":"SM-C5000","#screen_width":1080,"#system_language":"zh","#install_time":"2026-02-28 14:16:01.056","#simulator":false,"#lib":"Android","#manufacturer":"samsung","#os_version":"8.0.0","#app_version":"9.2.5","#fps":59,"session_id":"598bcfd0-45ec-4a83-b62c-d6157f10f98c","s_app_version_code":"9250","s_app_type":"normal","s_rn_force_new":182,"app_start_count_by_current_version":5,"s_ad_api_version":164,"s_from_source":"icon","abtestResult_v2":{"id":[],"name":[],"new_id":[],"new_name":[],"base_id":[]},"s_ad_crwaynum":["CRYWA1_5209"],"s_ad_public_ad_from":"block:unNormal","s_ad_public_adwaynum_array":[],"s_ad_installtime_hour":5,"s_ad_public_adwaynum":99037,"s_ad_rn_api_version":"1.9.9","s_ad_rn_bundleversion":"1.0.76","s_ad_rn_bundle_tag":"inner","s_lowest_adwaynum":"","#network_type":"WIFI","#ram":"2.2\/3.5","#disk":"46.7\/54.2","#device_type":"Phone","scene_type":"appLaunch","scene_msg":"桌面图标","scene_ext":"","#zone_offset":8},"#uuid":"9888335d-fbcc-4879-83c0-9f458bce5c1f"}#td#-13733957