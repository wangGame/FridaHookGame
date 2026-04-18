function(e) {
return e.event(t.onLoadADFire, t);
});
};
t.prototype.onLoadADFire = function(e) {
var t;
if (cc.sys.isNative) {
var o = (t = {}, t[y.AdvertiseType.interstitial] = "inter", t[y.AdvertiseType.reward] = "reward", 
t)[e.type];
o && p.NativeAd.getReadyByAdType(o) || p.NativeAd.showLoad(e.type);
}
};
return a([ classId("Advertisement_Load_Proxy"), classMethodWatch() ], t);
}(c.Proxy);
o.Advertisement_Load_Proxy = v;
cc._RF.pop();
}, {
"../../../base/storage/Storage": "Storage",
"../../../base/ui/UI": "UI",
"../../../falcon/Proxy": "Proxy",
"../../game/events/E_Game_InitComplete": "E_Game_InitComplete",
"../../game/events/E_Game_Start": "E_Game_Start",
"../../game/type/GameType": "GameType",
"../../game/vo/GameInfo": "GameInfo",
"../../native/NativeAd": "NativeAd",
"../events/E_Advertisement_Load": "E_Advertisement_Load",
"../events/E_Advertisement_RewardOver": "E_Advertisement_RewardOver",
"../events/E_Advertisement_SceneLoad": "E_Advertisement_SceneLoad",
"../type/AdvertisementType": "AdvertisementType",
"../vo/AdvertisementGameInfo": "AdvertisementGameInfo"
} ],
Advertisement_Native_Proxy: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "95b4eMi7adF66qV2/aKkXr+", "Advertisement_Native_Proxy");
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
}), a = this && this.__decorate || function(e, t, o, r) {
var n, a = arguments.length, i = a < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) i = Reflect.decorate(e, t, o, r); else for (var l = e.length - 1; l >= 0; l--) (n = e[l]) && (i = (a < 3 ? n(i) : a > 3 ? n(t, o, i) : n(t, o)) || i);
return a > 3 && i && Object.defineProperty(t, o, i), i;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.Advertisement_Native_Proxy = void 0;
var i = e("../../../falcon/Proxy"), l = e("../../native/NativeReceivedNative"), c = e("../events/E_Advertisement_AdStatusInfo"), s = e("../vo/AdvertisementGameInfo"), u = function(e) {
n(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.onInit = function() {
var e = this;
l.onNativeReponse("adCallback", function(t) {
e.onNativeCallBack(t);
});
l.onNativeReponse("adCallback2", function(t) {
e.onNativeCallBack(t);
});
l.onNativeReponse("rewardCallback", function(t) {
e.onNativeRewardCallback(t);
});
l.onNativeReponse("getAdStatusInfo", function(t) {
e.onGetAdStatusInfo(t);
});
};
t.prototype.onGetAdStatusInfo = function(e) {
e.adstatus, e.adtype, e.adecpm;
this.dispatchModuleEvent(new c.E_Advertisement_AdStatusInfo(e));
};
t.prototype.onNativeRewardCallback = function(e) {
var t, o = null !== (t = null == e ? void 0 : e.param) && void 0 !== t ? t : "";
"reward" == o ? s.advertisementGameInfo._rewardAdState = !0 : "interstitial" == o && (s.advertisementGameInfo._interstitialAdState = !0);
};
t.prototype.handleCallback = function(e, t) {
var o = t.adRegists;
if (o && o.cb) {
o.cb.call(o.arg, e);
t.setAdRegists(null);
}
};
t.prototype.onNativeCallBack = function(e) {
s.advertisementGameInfo._inAppHideTime = new Date().getTime();
0 == e.type ? 1 == e.state ? this.handleCallback(1, s.advertisementGameInfo) : this.handleCallback(2, s.advertisementGameInfo) : 1 == e.type && (1 == e.state || this.handleCallback(3, s.advertisementGameInfo));
};
return a([ classId("Advertisement_Native_Proxy"), classMethodWatch() ], t);
}(i.Proxy);
o.Advertisement_Native_Proxy = u;
cc._RF.pop();
}, {
"../../../falcon/Proxy": "Proxy",
"../../native/NativeReceivedNative": "NativeReceivedNative",
"../events/E_Advertisement_AdStatusInfo": "E_Advertisement_AdStatusInfo",
"../vo/AdvertisementGameInfo": "AdvertisementGameInfo"
} ],
Advertisement_Proxy: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "b3e37UrP7VPP6crq6CXZzn0", "Advertisement_Proxy");
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
}), a = this && this.__decorate || function(e, t, o, r) {
var n, a = arguments.length, i = a < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) i = Reflect.decorate(e, t, o, r); else for (var l = e.length - 1; l >= 0; l--) (n = e[l]) && (i = (a < 3 ? n(i) : a > 3 ? n(t, o, i) : n(t, o)) || i);
return a > 3 && i && Object.defineProperty(t, o, i), i;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.Advertisement_Proxy = void 0;
var i = e("../../../base/audio/AudioInfo"), l = e("../../../falcon/EventManager"), c = e("../../../falcon/Proxy"), s = e("../../audio/config/AudioConfig"), u = e("../../game/events/E_Game_InitComplete"), f = e("../../game/events/E_Game_Replay"), d = e("../../game/events/E_Game_Start"), p = e("../../gameOver/events/E_GameOver_GameEndPre"), h = e("../../gameOver/type/GameOverType"), m = e("../../revive/events/E_Revive_Success"), _ = e("../events/E_Advertisement_RewardOver"), y = e("../type/AdvertisementType"), g = function(e) {
n(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.registerEvents = function() {
return [ _.E_Advertisement_RewardOver, p.E_GameOver_GameEndPre, f.E_Game_Replay, d.E_Game_Start, u.E_Game_InitComplete ];
};
t.prototype.receivedEvents = function(e) {
switch (e.getClass()) {
case _.E_Advertisement_RewardOver:
this.onRewardOver(e);
break;

case p.E_GameOver_GameEndPre:
this.onGameOverGameEndPre(e);
break;

case f.E_Game_Replay:
this.onGameReplay(e);
break;

case d.E_Game_Start:
this.onGameStart(e);
break;

case u.E_Game_InitComplete:
this.onGameInitComplete(e);
}
};
t.prototype.onGameStart = function() {};
t.prototype.onGameReplay = function() {};
t.prototype.onGameOverGameEndPre = function() {};
t.prototype.onRewardOver = function(e) {
e.data.state == y.AdvertiseCallBackState.Advertise_Success ? this.onRewardOverSuccess() : e.data.state == y.AdvertiseCallBackState.Advertise_Fail ? l.EventManager.dispatchModuleEvent(new p.E_GameOver_GameEndPre({
source: h.GameOverSourceType.AdvertiseFail
})) : e.data.state == y.AdvertiseCallBackState.Advertise_TimeOut && cc.tween(cc.Canvas.instance.node).delay(2).call(function() {
l.EventManager.dispatchModuleEvent(new p.E_GameOver_GameEndPre({
source: h.GameOverSourceType.AdvertiseFail
}));
}).start();
};
t.prototype.onGameInitComplete = function() {};
t.prototype.onRewardOverSuccess = function() {
i.audioInfo.play(s.AudioConfig.s_restart);
l.EventManager.dispatchModuleEvent(new m.E_Revive_Success());
};
return a([ classId("Advertisement_Proxy"), classMethodWatch() ], t);
}(c.Proxy);
o.Advertisement_Proxy = g;
cc._RF.pop();
}, {
"../../../base/audio/AudioInfo": "AudioInfo",
"../../../falcon/EventManager": "EventManager",
"../../../falcon/Proxy": "Proxy",
"../../audio/config/AudioConfig": "AudioConfig",
"../../game/events/E_Game_InitComplete": "E_Game_InitComplete",
"../../game/events/E_Game_Replay": "E_Game_Replay",
"../../game/events/E_Game_Start": "E_Game_Start",
"../../gameOver/events/E_GameOver_GameEndPre": "E_GameOver_GameEndPre",
"../../gameOver/type/GameOverType": "GameOverType",
"../../revive/events/E_Revive_Success": "E_Revive_Success",
"../events/E_Advertisement_RewardOver": "E_Advertisement_RewardOver",
"../type/AdvertisementType": "AdvertisementType"
} ],
AdxModelConfig: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "713adfvy7ZGUpXi7L/6Nogf", "AdxModelConfig");
var r;
Object.defineProperty(o, "__esModule", {
value: !0
});
o.adxModelConfigInfo = o.ecpmConfMapGp = void 0;
var n = e("../type/AdxModelType");
o.ecpmConfMapGp = {
first_reward_global: {
user_cnt: 1227085,
top_ecpm: [ 129.16, 33.4, 16.02, 9.92 ]
},
first_reward_america: {
user_cnt: 45966,
top_ecpm: [ 497.74, 299.22, 196.06, 140.21 ]
},
first_inter_global: {
user_cnt: 2138714,
top_ecpm: [ 75.95, 19.42, 9.37, 5.72 ]
},
first_inter_america: {
user_cnt: 56935,
top_ecpm: [ 414.87, 232.64, 147.6, 108.35 ]
}
};
o.adxModelConfigInfo = ((r = {})[n.AdxModelPlanIdType.PlayId_1] = {
triggerIndex: 1,
adcd: 1,
isModelBased: !1,
ecpmRate: 1,
adxLimit: 5
}, r[n.AdxModelPlanIdType.PlayId_2] = {
triggerIndex: 1,
adcd: 1,
isModelBased: !1,
ecpmRate: 1,
adxLimit: 5
}, r[n.AdxModelPlanIdType.PlayId_3] = {
triggerIndex: 1,
adcd: 1,
isModelBased: !1,
ecpmRate: 1,
adxLimit: 5
}, r[n.AdxModelPlanIdType.PlayId_4] = {
triggerIndex: 1,
adcd: 1,
isModelBased: !1,
ecpmRate: 1,
adxLimit: 5,
targetEcpm: {
contry: "global",
inter: 5,
reward: 5
}
}, r[n.AdxModelPlanIdType.PlayId_5] = {
triggerIndex: 1,
adcd: 1,
isModelBased: !1,
ecpmRate: 1,
adxLimit: 5,
targetEcpm: {
contry: "global",
inter: 1,
reward: 1
}
}, r[n.AdxModelPlanIdType.PlayId_6] = {
triggerIndex: 1,
adcd: 1,
isModelBased: !1,
ecpmRate: 1,
adxLimit: 5,
targetEcpm: {
contry: "america",
inter: 5,
reward: 5
}
}, r[n.AdxModelPlanIdType.PlayId_7] = {
triggerIndex: 1,
adcd: 1,
isModelBased: !1,
adxLimit: 5,
ecpmRate: .7,
targetEcpm: {
contry: "global",
inter: 5,
reward: 5
}
}, r[n.AdxModelPlanIdType.PlayId_8] = {
triggerIndex: 1,
adcd: 1,
isModelBased: !1,
adxLimit: 5,
ecpmRate: .5,
targetEcpm: {
contry: "global",
inter: 5,
reward: 5
}
}, r[n.AdxModelPlanIdType.PlayId_9] = {
triggerIndex: 1,
adcd: 1,
isModelBased: !1,
adxLimit: 5,
ecpmRate: .3,
targetEcpm: {
contry: "global",
inter: 5,
reward: 5
}
}, r[n.AdxModelPlanIdType.PlayId_10] = {
triggerIndex: 1,
adcd: 1,
ecpmRate: 1,
adxLimit: 5,
targetEcpm: {
contry: "global",
inter: 5,
reward: 5
},
isModelBased: !0
}, r[n.AdxModelPlanIdType.PlayId_11] = {
triggerIndex: 3,
adcd: 1,
ecpmRate: 1,
adxLimit: 5,
targetEcpm: {
contry: "global",
inter: 5,
reward: 5
},
isModelBased: !0
}, r[n.AdxModelPlanIdType.PlayId_12] = {
triggerIndex: 3,
adcd: 1,
ecpmRate: 1,
adxLimit: 3,
targetEcpm: {
contry: "global",
inter: 5,
reward: 5
},
isModelBased: !0
}, r[n.AdxModelPlanIdType.PlayId_13] = {
triggerIndex: 3,
adcd: 1,
ecpmRate: 1,
adxLimit: 5,
targetEcpm: {
contry: "global",
inter: 5,
reward: 5
},
isModelBased: !0
}, r[n.AdxModelPlanIdType.PlayId_14] = {
triggerIndex: 5,
adcd: 1,
isModelBased: !1,
ecpmRate: 1,
adxLimit: 0
}, r[n.AdxModelPlanIdType.PlayId_15] = {
triggerIndex: 5,
adcd: 1,
isModelBased: !1,
ecpmRate: 1,
adxLimit: 0
}, r[n.AdxModelPlanIdType.PlayId_16] = {
triggerIndex: 3,
ecpmRate: 1,
adxLimit: 0,
targetEcpm: {
contry: "global",
inter: 5,
reward: 5
},
isModelBased: !0,
adcd: 2
}, r);
cc._RF.pop();
}, {
"../type/AdxModelType": "AdxModelType"
} ],
AdxModelInterface: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "34026pMN11FhpXNUCqL9zgm", "AdxModelInterface");
Object.defineProperty(o, "__esModule", {
value: !0
});
cc._RF.pop();
}, {} ],
AdxModelNativeInfo: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "20117TFnCtJH5ilZ1Q/Dp3z", "AdxModelNativeInfo");
Object.defineProperty(o, "__esModule", {
value: !0
});
o.adxModelNativeInfo = void 0;
var r = function() {
function e() {
this._firstInterEcpm = -999;
}
Object.defineProperty(e.prototype, "firstInterEcpm", {
get: function() {
return this._firstInterEcpm;
},
enumerable: !1,
configurable: !0
});
return e;
}();
o.adxModelNativeInfo = new r();
cc._RF.pop();
}, {} ],
AdxModelReplaceAdCtrl: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "e7945D8gphBMbmyjAqWP3j4", "AdxModelReplaceAdCtrl");
Object.defineProperty(o, "__esModule", {
value: !0
});
o.adxModelReplaceAdCtrl = void 0;
var r = e("../../advertisement/config/AdvertisementConfig"), n = e("../../advertisement/type/AdvertisementType"), a = e("../../device/vo/DeviceInfo"), i = e("../../ecpm/vo/EcpmInfo"), l = e("../../gameWay/vo/GameWayInfo"), c = e("../../native/NativeAdxModel"), s = e("../../traitServer/vo/TraitServerInfo"), u = e("../type/AdxModelType"), f = e("../config/AdxModelConfig"), d = e("./AdxModelServerInfo"), p = function() {
function e() {
this._adxpromotionData = null;
}
e.prototype.setPromotionState = function(e, t) {
this.loadPromotionLocal();
this._adxpromotionData.status = e;
this._adxpromotionData.adwaynum = t;
storage.setItem("adx_promotion_local", this._adxpromotionData);
};
Object.defineProperty(e.prototype, "promotionState", {
get: function() {
this.loadPromotionLocal();
return this._adxpromotionData.status;
},
enumerable: !1,
configurable: !0
});
e.prototype.loadPromotionLocal = function() {
this._adxpromotionData || (this._adxpromotionData = storage.getItem("adx_promotion_local", {
status: !1,
adwaynum: ""
}));
};
e.prototype.getAdxTypeByStr = function(e) {
switch (e) {
case r.AD_TYPE.TYPE_2:
case r.AD_TYPE.TYPE_3:
return u.AdxReplaceAdType.Banner;

case r.AD_TYPE.TYPE_4:
case r.AD_TYPE.TYPE_41:
case r.AD_TYPE.TYPE_42:
case r.AD_TYPE.TYPE_43:
case r.AD_TYPE.TYPE_44:
case r.AD_TYPE.TYPE_45:
case r.AD_TYPE.TYPE_46:
case r.AD_TYPE.TYPE_47:
case r.AD_TYPE.TYPE_48:
case r.AD_TYPE.TYPE_49:
return u.AdxReplaceAdType.Interstitial;

case r.AD_TYPE.TYPE_5:
case r.AD_TYPE.TYPE_51:
case r.AD_TYPE.TYPE_52:
case r.AD_TYPE.TYPE_53:
case r.AD_TYPE.TYPE_54:
case r.AD_TYPE.TYPE_55:
return u.AdxReplaceAdType.Reward;

default:
return u.AdxReplaceAdType.Unknown;
}
};
Object.defineProperty(e.prototype, "lastInterstitialEcpm", {
get: function() {
var e = d.adxModelServerInfo.getRecentEcpm(!0);
e <= 0 && (e = 0);
return e;
},
enumerable: !1,
configurable: !0
});
Object.defineProperty(e.prototype, "lastRewardEcpm", {
get: function() {
var e = d.adxModelServerInfo.getRecentEcpm(!1);
e <= 0 && (e = 0);
return e;
},
enumerable: !1,
configurable: !0
});
e.prototype.getEcpmExpectAndSaveCurEcpm = function(e, t, o) {
if (!e) return -1;
var r = f.adxModelConfigInfo[e].isModelBased ? 3 : 1, n = t == u.AdxReplaceAdType.Interstitial ? "adx_ecpm_first_3_inter" : "adx_ecpm_first_3_reward", a = storage.getItem(n, []);
if (a.length < r) {
a.push(o);
storage.setItem(n, a);
}
return a.length >= r ? a.slice(0, r).reduce(function(e, t) {
return e + t;
}, 0) / r : -1;
};
e.prototype.getEcpmTargetByConfig = function(e, t) {
var o, r = "first_" + (t ? "inter" : "reward") + "_" + e.contry, n = [ 1, 5, 10, 15 ].indexOf(t ? e.inter : e.reward);
return n < 0 ? -1 : null === (o = f.ecpmConfMapGp[r]) || void 0 === o ? void 0 : o.top_ecpm[n];
};
e.prototype.sendAdLowEcpmSubEvent = function(e, t, o, r, a) {
var l = 0, c = 0, s = 0;
if (e == u.AdxReplaceAdType.Interstitial) {
l = d.adxModelServerInfo.interAdTotalCount;
c = t;
s = i.ecpmInfo.getMaxEcpm(n.AdvertiseType.interstitial) || 0;
} else {
l = d.adxModelServerInfo.rewardAdTotalCount;
c = o;
s = i.ecpmInfo.getMaxEcpm(n.AdvertiseType.reward) || 0;
}
var f = d.adxModelServerInfo.getRecentEcpm(e == u.AdxReplaceAdType.Interstitial), p = e == u.AdxReplaceAdType.Interstitial ? "inter" : "reward";
DS("ad_lowecpm_sub", {
ad_inter_times: l,
ad_sub_times: r,
lag_inter_ecpm: f,
predict_inter_ecpm: c,
now_inter_ecpm: s,
unit_id: a,
unit_type: p
});
};
e.prototype.getAdTotalCountByType = function(e) {
var t = 0;
e == u.AdxReplaceAdType.Interstitial ? t = d.adxModelServerInfo.interAdTotalCount : e == u.AdxReplaceAdType.Reward && (t = d.adxModelServerInfo.rewardAdTotalCount);
return t;
};
e.prototype.showAdx = function(e) {
e == u.AdxReplaceAdType.Interstitial ? c.NativeAdxModel.showAdxInterstitial("1") : c.NativeAdxModel.showAdxReward("2");
};
e.prototype.loadAd = function() {
this.loadAdx(u.AdxReplaceAdType.Interstitial);
this.loadAdx(u.AdxReplaceAdType.Reward);
};
Object.defineProperty(e.prototype, "wayNumStr", {
get: function() {
var e, t;
return (null === (e = s.traitServerInfo.experimentData) || void 0 === e ? void 0 : e.abtestResult) ? null === (t = s.traitServerInfo.experimentData) || void 0 === t ? void 0 : t.abtestResult.map(function(e) {
return e.name;
}).join(",") : l.gameWayInfo.gameWayNum;
},
enumerable: !1,
configurable: !0
});
e.prototype.loadAdx = function(e) {
e == u.AdxReplaceAdType.Interstitial ? c.NativeAdxModel.loadAdxInterstitial(JSON.stringify({
game_wayNum: this.wayNumStr
})) : c.NativeAdxModel.loadAdxReward(JSON.stringify({
game_wayNum: this.wayNumStr
}));
};
e.prototype.isAdxAdReady = function(e) {
var t = !1;
e == u.AdxReplaceAdType.Interstitial ? t = c.NativeAdxModel.isLoadAdxInterstitial() : e == u.AdxReplaceAdType.Reward && (t = c.NativeAdxModel.isLoadAdxReward());
return t;
};
e.prototype.canTriggerCountry = function(e) {
var t, o = null !== (t = a.deviceInfo.data.country) && void 0 !== t ? t : "";
"string" == typeof o && (o = o.toLowerCase());
return e != u.AdxModelPlanIdType.PlayId_6 || "us" != o;
};
e.prototype.canTriggerRandom = function(e) {
return e != u.AdxModelPlanIdType.PlayId_15 || Math.random() < .33;
};
return e;
}();
o.adxModelReplaceAdCtrl = new p();
cc._RF.pop();
}, {
"../../advertisement/config/AdvertisementConfig": "AdvertisementConfig",
"../../advertisement/type/AdvertisementType": "AdvertisementType",
"../../device/vo/DeviceInfo": "DeviceInfo",
"../../ecpm/vo/EcpmInfo": "EcpmInfo",
"../../gameWay/vo/GameWayInfo": "GameWayInfo",
"../../native/NativeAdxModel": "NativeAdxModel",
"../../traitServer/vo/TraitServerInfo": "TraitServerInfo",
"../config/AdxModelConfig": "AdxModelConfig",
"../type/AdxModelType": "AdxModelType",
"./AdxModelServerInfo": "AdxModelServerInfo"
} ],
AdxModelRequestInfo: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "7ea89r/0klMxI7A6BcSK+7N", "AdxModelRequestInfo");
Object.defineProperty(o, "__esModule", {
value: !0
});
o.adxModelRequestInfo = void 0;
var r = e("../../native/NativeAd"), n = e("../type/AdxModelType"), a = e("./AdxModelReplaceAdCtrl"), i = e("./AdxModelServerInfo"), l = function() {
function e() {
this.game_num_high_cord = 0;
this.last_game_end_time = 0;
this._adxLocalData = null;
}
Object.defineProperty(e.prototype, "adxLocalData", {
get: function() {
return this._adxLocalData;
},
enumerable: !1,
configurable: !0
});
e.prototype.loadData = function() {
this._adxLocalData = storage.getItem("adxLocalData", {
install_day: -1,
active_time: Date.now(),
inter_ad_today: 0,
reward_ad_today: 0,
first_inter_ecpm: -999,
fisrt_reward_ecpm: -999,
inter_ecpm_history: [],
reward_ecpm_history: [],
inter_ad_total_count: 0,
reward_ad_total_count: 0,
lastHistoryScoreTime: 0,
lastMaxScoreGameNum: 0,
gameStartTime: 0,
lastGameEndTime: 0,
lastGameStartTime: 0
});
};
e.prototype.saveData = function() {
storage.setItem("adxLocalData", this._adxLocalData);
};
e.prototype.initData = function() {
this.loadData();
var e = i.adxModelServerInfo.anzhuangInterval;
if (e != this._adxLocalData.install_day) {
this._adxLocalData.install_day = e;
this._adxLocalData.inter_ad_today = 0;
this._adxLocalData.reward_ad_today = 0;
}
};
e.prototype.saveCurrentADEcpm = function(e) {
var t = a.adxModelReplaceAdCtrl.getAdxTypeByStr(e);
if ((t == n.AdxReplaceAdType.Interstitial || t == n.AdxReplaceAdType.Reward) && this._adxLocalData) {
var o = 0;
if (t == n.AdxReplaceAdType.Interstitial) {
o = r.NativeAd.callNativeGetMaxEcpmNumber("1");
this._adxLocalData.first_inter_ecpm <= 0 && (this._adxLocalData.first_inter_ecpm = o);
this._adxLocalData.inter_ad_today++;
this._adxLocalData.inter_ad_total_count++;
this._adxLocalData.inter_ecpm_history.push(o);
this._adxLocalData.inter_ecpm_history.length > 10 && (this._adxLocalData.inter_ecpm_history = this._adxLocalData.inter_ecpm_history.slice(-10));
} else {
o = r.NativeAd.callNativeGetMaxEcpmNumber("2");
this._adxLocalData.fisrt_reward_ecpm <= 0 && (this._adxLocalData.fisrt_reward_ecpm = o);
this._adxLocalData.reward_ad_today++;
this._adxLocalData.reward_ad_total_count++;
this._adxLocalData.reward_ecpm_history.push(o);
this._adxLocalData.reward_ecpm_history.length > 10 && (this._adxLocalData.reward_ecpm_history = this._adxLocalData.reward_ecpm_history.slice(-10));
}
this.saveData();
}
};
e.prototype.recordCurGameStartTime = function() {
if (this._adxLocalData) {
this._adxLocalData.lastGameStartTime = this._adxLocalData.gameStartTime || 0;
this._adxLocalData.gameStartTime = Date.now();
this.saveData();
this.game_num_high_cord = storage.getItem("classHighScore", 0);
}
};
e.prototype.updateScore = function(e, t) {
var o = e;
if (this.game_num_high_cord < o) {
this.game_num_high_cord = o;
this.recordLastHistoryScore(t);
}
};
e.prototype.recordLastHistoryScore = function(e) {
if (this._adxLocalData) {
this._adxLocalData.lastHistoryScoreTime = Date.now();
this._adxLocalData.lastMaxScoreGameNum = e;
this.saveData();
}
};
e.prototype.recordLastGameEndTime = function() {
if (this._adxLocalData) {
this.last_game_end_time = this._adxLocalData.lastGameEndTime;
this._adxLocalData.lastGameEndTime = Date.now();
this.saveData();
}
};
e.prototype.insertUsrDataGameEndEventData = function() {
var e = {};
if (!this._adxLocalData) return e;
e.his_max_score_datetime = this._adxLocalData.lastHistoryScoreTime || 0;
var t = 0, o = storage.getItem("classGameNum", 0);
o && this._adxLocalData.lastMaxScoreGameNum && (t = o - 1 - this._adxLocalData.lastMaxScoreGameNum) < 0 && (t = 0);
e.acc_his_max_score_cnt = t;
e.game_start_datetime = this._adxLocalData.gameStartTime || 0;
e.last_game_start_datetime = this._adxLocalData.lastGameStartTime || 0;
e.last_game_end_datetime = this.last_game_end_time || 0;
return e;
};
return e;
}();
o.adxModelRequestInfo = new l();
cc._RF.pop();
}, {
"../../native/NativeAd": "NativeAd",
"../type/AdxModelType": "AdxModelType",
"./AdxModelReplaceAdCtrl": "AdxModelReplaceAdCtrl",
"./AdxModelServerInfo": "AdxModelServerInfo"
} ],
AdxModelServerInfo: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "b2b54GNlm1OsJtSMJtpFmD3", "AdxModelServerInfo");
var r = this && this.__read || function(e, t) {
var o = "function" == typeof Symbol && e[Symbol.iterator];
if (!o) return e;
var r, n, a = o.call(e), i = [];
try {
for (;(void 0 === t || t-- > 0) && !(r = a.next()).done; ) i.push(r.value);
} catch (e) {
n = {
error: e
};
} finally {
try {
r && !r.done && (o = a.return) && o.call(a);
} finally {
if (n) throw n.error;
}
}
return i;
}, n = this && this.__spread || function() {
for (var e = [], t = 0; t < arguments.length; t++) e = e.concat(r(arguments[t]));
return e;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.adxModelServerInfo = void 0;
var a = e("../../device/vo/DeviceInfo"), i = e("../../http/HAdxModel"), l = e("../../native/NativeDevice"), c = e("./AdxModelRequestInfo"), s = function() {
function e() {}
Object.defineProperty(e.prototype, "ecpmModelBody", {
get: function() {
return this.requestBody;
},
enumerable: !1,
configurable: !0
});
e.prototype.sendToNative = function() {};
e.prototype.requestAdxModelValue = function(e, t) {
void 0 === t && (t = !0);
if (c.adxModelRequestInfo.adxLocalData) {
var o = this.requestBody;
o.type = t ? "inter" : "reward";
i.HAdxModel.sendAdxModelData("https://hella-game-gateway-server.afafb.com/v1/ecpm_prediction?v=" + new Date().getTime(), o).then(function(t) {
e && e(t.score);
}).catch(function() {});
}
};
e.prototype.requestEcpmPlayerModel = function(e) {
var t = this.requestBody;
t.type = e ? "personalized_inter" : "personalized_reward";
t.os = "android";
return new Promise(function(e, o) {
i.HAdxModel.sendAdxModelData("https://hella-game-gateway-server.afafb.com/v1/ecpm_prediction?v=" + new Date().getTime(), t).then(function(t) {
e(t.score);
}).catch(function(e) {
o(e);
});
});
};
Object.defineProperty(e.prototype, "requestBody", {
get: function() {
var e, t, o, r, n, i, s, u, f, d, p, h, m, _, y, g, v, b, C;
if (!c.adxModelRequestInfo.adxLocalData) return null;
var S = {
type: "",
uid: "",
country: "",
device_model: "",
carrier: "",
af_media_source: "",
total_ram: 0,
total_disk: 0,
endless_first_score: 0,
active_install_interval: 0,
anzhuang_interval: 0,
hour_of_day: 0,
inter_ad_cnt_bf: 0,
ad_cnt_bf: 0,
reward_ad_cnt_bf: 0,
first_inter_ecpm: 0,
first_reward_ecpm: 0,
recent_reward_ecpm: 0,
recent_reward_ecpm_3_avg: 0,
recent_reward_ecpm_3_max: 0,
recent_reward_ecpm_3_min: 0,
recent_reward_ecpm_3_md: 0,
recent_reward_ecpm_3_std: 0,
recent_reward_ecpm_5_avg: 0,
recent_reward_ecpm_5_max: 0,
recent_reward_ecpm_5_min: 0,
recent_reward_ecpm_5_md: 0,
recent_reward_ecpm_5_std: 0,
recent_inter_ecpm: 0,
recent_inter_ecpm_3_avg: 0,
recent_inter_ecpm_3_max: 0,
recent_inter_ecpm_3_min: 0,
recent_inter_ecpm_3_md: 0,
recent_inter_ecpm_3_std: 0,
recent_inter_ecpm_5_avg: 0,
recent_inter_ecpm_5_max: 0,
recent_inter_ecpm_5_min: 0,
recent_inter_ecpm_5_md: 0,
recent_inter_ecpm_5_std: 0
}, P = a.deviceInfo.deviceMore, k = l.NativeDevice.getRAMTotalValueMB() / 1024, I = Number(null !== (e = null == P ? void 0 : P.allDisk) && void 0 !== e ? e : 0);
S.type = "";
S.uid = null !== (o = null === (t = a.deviceInfo.data) || void 0 === t ? void 0 : t.distinct_id) && void 0 !== o ? o : "";
S.country = null !== (n = null === (r = a.deviceInfo.data) || void 0 === r ? void 0 : r.country) && void 0 !== n ? n : "";
S.device_model = null !== (s = null === (i = a.deviceInfo.data) || void 0 === i ? void 0 : i.device_model) && void 0 !== s ? s : "";
S.carrier = null !== (f = null === (u = a.deviceInfo.data) || void 0 === u ? void 0 : u.carrier) && void 0 !== f ? f : "";
S.af_media_source = null !== (d = localStorage.getItem("appsflyer")) && void 0 !== d ? d : "";
S.os = "";
var E = storage.getItem("classGameEndStatisticsInfo");
S.total_ram = null != k ? k : 0;
S.total_disk = I;
S.endless_first_score = null !== (p = null == E ? void 0 : E.firstHighScore) && void 0 !== p ? p : 0;
S.active_install_interval = this.activeInstallInterval;
S.anzhuang_interval = this.anzhuangInterval;
S.hour_of_day = this.hourOfDay;
S.inter_ad_cnt_bf = null !== (m = null === (h = c.adxModelRequestInfo.adxLocalData) || void 0 === h ? void 0 : h.inter_ad_today) && void 0 !== m ? m : 0;
S.reward_ad_cnt_bf = null !== (y = null === (_ = c.adxModelRequestInfo.adxLocalData) || void 0 === _ ? void 0 : _.reward_ad_today) && void 0 !== y ? y : 0;
S.ad_cnt_bf = S.inter_ad_cnt_bf + S.reward_ad_cnt_bf;
S.first_inter_ecpm = null !== (v = null === (g = c.adxModelRequestInfo.adxLocalData) || void 0 === g ? void 0 : g.first_inter_ecpm) && void 0 !== v ? v : 0;
S.first_reward_ecpm = null !== (C = null === (b = c.adxModelRequestInfo.adxLocalData) || void 0 === b ? void 0 : b.fisrt_reward_ecpm) && void 0 !== C ? C : 0;
S.recent_reward_ecpm = this.getRecentEcpm(!1);
S.recent_reward_ecpm_3_avg = this.getRecentEcpmAvg(3, !1);
S.recent_reward_ecpm_3_max = this.getRecentEcpmMax(3, !1);
S.recent_reward_ecpm_3_min = this.getRecentEcpmMin(3, !1);
S.recent_reward_ecpm_3_md = this.getRecentEcpmMd(3, !1);
S.recent_reward_ecpm_3_std = this.getRecentEcpmStd(3, !1);
S.recent_reward_ecpm_5_avg = this.getRecentEcpmAvg(5, !1);
S.recent_reward_ecpm_5_max = this.getRecentEcpmMax(5, !1);
S.recent_reward_ecpm_5_min = this.getRecentEcpmMin(5, !1);
S.recent_reward_ecpm_5_md = this.getRecentEcpmMd(5, !1);
S.recent_reward_ecpm_5_std = this.getRecentEcpmStd(5, !1);
S.recent_inter_ecpm = this.getRecentEcpm(!0);
S.recent_inter_ecpm_3_avg = this.getRecentEcpmAvg(3, !0);
S.recent_inter_ecpm_3_max = this.getRecentEcpmMax(3, !0);
S.recent_inter_ecpm_3_min = this.getRecentEcpmMin(3, !0);
S.recent_inter_ecpm_3_md = this.getRecentEcpmMd(3, !0);
S.recent_inter_ecpm_3_std = this.getRecentEcpmStd(3, !0);
S.recent_inter_ecpm_5_avg = this.getRecentEcpmAvg(5, !0);
S.recent_inter_ecpm_5_max = this.getRecentEcpmMax(5, !0);
S.recent_inter_ecpm_5_min = this.getRecentEcpmMin(5, !0);
S.recent_inter_ecpm_5_md = this.getRecentEcpmMd(5, !0);
S.recent_inter_ecpm_5_std = this.getRecentEcpmStd(5, !0);
return S;
},
enumerable: !1,
configurable: !0
});
Object.defineProperty(e.prototype, "activeInstallInterval", {
get: function() {
var e, t;
if (!c.adxModelRequestInfo.adxLocalData) return -999;
var o = c.adxModelRequestInfo.adxLocalData.active_time, r = null !== (t = null === (e = a.deviceInfo.data) || void 0 === e ? void 0 : e.install_time) && void 0 !== t ? t : 0;
return o && r ? Math.floor((o - r) / 1e3 / 60 / 60) : -999;
},
enumerable: !1,
configurable: !0
});
Object.defineProperty(e.prototype, "anzhuangInterval", {
get: function() {
var e, t, o = null !== (t = null === (e = a.deviceInfo.data) || void 0 === e ? void 0 : e.install_time) && void 0 !== t ? t : 0;
return isNaN(o) ? -999 : Math.floor((Date.now() - o) / 1e3 / 60 / 60 / 24);
},
enumerable: !1,
configurable: !0
});
Object.defineProperty(e.prototype, "hourOfDay", {
get: function() {
return new Date().getHours() + 1;
},
enumerable: !1,
configurable: !0
});
e.prototype.getRecentEcpm = function(e) {
if (!c.adxModelRequestInfo.adxLocalData) return -999;
var t = e ? c.adxModelRequestInfo.adxLocalData.inter_ecpm_history : c.adxModelRequestInfo.adxLocalData.reward_ecpm_history;
return t.length > 0 ? t[t.length - 1] : -999;
};
e.prototype.getRecentEcpmStd = function(e, t) {
var o = this.getRecentEcpmAvg(e, t);
return -999 != o ? Math.sqrt(o) : -999;
};
e.prototype.getRecentEcpmAvg = function(e, t) {
if (!c.adxModelRequestInfo.adxLocalData) return -999;
var o = (t ? c.adxModelRequestInfo.adxLocalData.inter_ecpm_history : c.adxModelRequestInfo.adxLocalData.reward_ecpm_history).slice();
o && o.length > e && (o = o.slice(-e));
return o && o.length > 0 ? o.reduce(function(e, t) {
return e + t;
}, 0) / o.length : -999;
};
e.prototype.getRecentEcpmMax = function(e, t) {
if (!c.adxModelRequestInfo.adxLocalData) return -999;
var o = (t ? c.adxModelRequestInfo.adxLocalData.inter_ecpm_history : c.adxModelRequestInfo.adxLocalData.reward_ecpm_history).slice();
o && o.length > e && (o = o.slice(-e));
return o && o.length > 0 ? Math.max.apply(Math, n(o)) : -999;
};
e.prototype.getRecentEcpmMin = function(e, t) {
if (!c.adxModelRequestInfo.adxLocalData) return -999;
var o = (t ? c.adxModelRequestInfo.adxLocalData.inter_ecpm_history : c.adxModelRequestInfo.adxLocalData.reward_ecpm_history).slice();
o && o.length > e && (o = o.slice(-e));
return o && o.length > 0 ? Math.min.apply(Math, n(o)) : -999;
};
e.prototype.getRecentEcpmMd = function(e, t) {
if (!c.adxModelRequestInfo.adxLocalData) return -999;
var o = (t ? c.adxModelRequestInfo.adxLocalData.inter_ecpm_history : c.adxModelRequestInfo.adxLocalData.reward_ecpm_history).slice();
o && o.length > e && (o = o.slice(-e));
var r = o.length;
if (r > 0) {
o.sort(function(e, t) {
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