function() {
return l.isAccountEnabled() ? [ i.Account_Proxy ] : [];
};
return t;
}(a.Module);
o.Account_Module = c;
cc._RF.pop();
}, {
"../../falcon/Module": "Module",
"./base/AccountConfig": "AccountConfig",
"./proxys/Account_Proxy": "Account_Proxy"
} ],
Account_Proxy: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "309247MQSRBKrn2AbmkRHnh", "Account_Proxy");
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
o.Account_Proxy = void 0;
var i = e("../../../falcon/Proxy"), l = e("../../gameOver/events/E_GameOver_GameEndDataCleared"), c = e("../../game/events/E_Game_Replay"), s = e("../../setup/events/E_Setup_Click"), u = e("../../setup/events/E_Setup_Show"), f = e("../../chapterConfig/events/E_ChapterConfig_PeriodReset"), d = e("../../achievement/events/E_Achievement_Chapter_Pass"), p = e("../../traitConfig/events/E_TraitConfig_InitComplete"), h = e("../../http/HAccount"), m = e("../utils/AccountService"), _ = function(e) {
n(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.registerEvents = function() {
return [ p.E_TraitConfig_InitComplete, u.E_Setup_Show, s.E_Setup_Click, l.E_GameOver_GameEndDataCleared, c.E_Game_Replay, f.E_ChapterConfig_PeriodReset, d.E_Achievement_Chapter_Pass ];
};
t.prototype.receivedEvents = function(e) {
switch (e.getClass()) {
case p.E_TraitConfig_InitComplete:
this.onTraitConfigReady();
break;

case u.E_Setup_Show:
this.onSetupShow(e);
break;

case s.E_Setup_Click:
this.onSetupClick(e);
break;

case l.E_GameOver_GameEndDataCleared:
case c.E_Game_Replay:
this.onGameEndDataCleared();
break;

case f.E_ChapterConfig_PeriodReset:
this.onPeriodReset();
break;

case d.E_Achievement_Chapter_Pass:
this.onChapterPass();
}
};
t.prototype.onInit = function() {
h.registerAccountNativeCallbacks();
};
t.prototype.isModuleEnabled = function() {
return !1;
};
t.prototype.onTraitConfigReady = function() {
var e = this;
m.accountService.checkModuleStatus(function() {
return e.isModuleEnabled();
});
m.accountService.initBusinessLogic();
};
t.prototype.onGameEndDataCleared = function() {
m.accountService.onGameEndDataCleared();
};
t.prototype.onPeriodReset = function() {
m.accountService.onPeriodReset();
};
t.prototype.onChapterPass = function() {
m.accountService.onChapterPass();
};
t.prototype.onSetupShow = function(e) {
m.accountService.onSetupShow(e.data);
};
t.prototype.onSetupClick = function(e) {
m.accountService.onSetupClick(e.key);
};
return a([ classId("Account_Proxy"), classMethodWatch() ], t);
}(i.Proxy);
o.Account_Proxy = _;
cc._RF.pop();
}, {
"../../../falcon/Proxy": "Proxy",
"../../achievement/events/E_Achievement_Chapter_Pass": "E_Achievement_Chapter_Pass",
"../../chapterConfig/events/E_ChapterConfig_PeriodReset": "E_ChapterConfig_PeriodReset",
"../../game/events/E_Game_Replay": "E_Game_Replay",
"../../gameOver/events/E_GameOver_GameEndDataCleared": "E_GameOver_GameEndDataCleared",
"../../http/HAccount": "HAccount",
"../../setup/events/E_Setup_Click": "E_Setup_Click",
"../../setup/events/E_Setup_Show": "E_Setup_Show",
"../../traitConfig/events/E_TraitConfig_InitComplete": "E_TraitConfig_InitComplete",
"../utils/AccountService": "AccountService"
} ],
AchievementInfo: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "9df79lyrU5OjauCFsri/ES7", "AchievementInfo");
var r = this && this.__decorate || function(e, t, o, r) {
var n, a = arguments.length, i = a < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) i = Reflect.decorate(e, t, o, r); else for (var l = e.length - 1; l >= 0; l--) (n = e[l]) && (i = (a < 3 ? n(i) : a > 3 ? n(t, o, i) : n(t, o)) || i);
return a > 3 && i && Object.defineProperty(t, o, i), i;
}, n = this && this.__awaiter || function(e, t, o, r) {
return new (o || (o = Promise))(function(n, a) {
function i(e) {
try {
c(r.next(e));
} catch (e) {
a(e);
}
}
function l(e) {
try {
c(r.throw(e));
} catch (e) {
a(e);
}
}
function c(e) {
e.done ? n(e.value) : (t = e.value, t instanceof o ? t : new o(function(e) {
e(t);
})).then(i, l);
var t;
}
c((r = r.apply(e, t || [])).next());
});
}, a = this && this.__generator || function(e, t) {
var o, r, n, a, i = {
label: 0,
sent: function() {
if (1 & n[0]) throw n[1];
return n[1];
},
trys: [],
ops: []
};
return a = {
next: l(0),
throw: l(1),
return: l(2)
}, "function" == typeof Symbol && (a[Symbol.iterator] = function() {
return this;
}), a;
function l(e) {
return function(t) {
return c([ e, t ]);
};
}
function c(a) {
if (o) throw new TypeError("Generator is already executing.");
for (;i; ) try {
if (o = 1, r && (n = 2 & a[0] ? r.return : a[0] ? r.throw || ((n = r.return) && n.call(r), 
0) : r.next) && !(n = n.call(r, a[1])).done) return n;
(r = 0, n) && (a = [ 2 & a[0], n.value ]);
switch (a[0]) {
case 0:
case 1:
n = a;
break;

case 4:
i.label++;
return {
value: a[1],
done: !1
};

case 5:
i.label++;
r = a[1];
a = [ 0 ];
continue;

case 7:
a = i.ops.pop();
i.trys.pop();
continue;

default:
if (!(n = i.trys, n = n.length > 0 && n[n.length - 1]) && (6 === a[0] || 2 === a[0])) {
i = 0;
continue;
}
if (3 === a[0] && (!n || a[1] > n[0] && a[1] < n[3])) {
i.label = a[1];
break;
}
if (6 === a[0] && i.label < n[1]) {
i.label = n[1];
n = a;
break;
}
if (n && i.label < n[2]) {
i.label = n[2];
i.ops.push(a);
break;
}
n[2] && i.ops.pop();
i.trys.pop();
continue;
}
a = t.call(e, i);
} catch (e) {
a = [ 6, e ];
r = 0;
} finally {
o = n = 0;
}
if (5 & a[0]) throw a[1];
return {
value: a[0] ? a[1] : void 0,
done: !0
};
}
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.achievementInfo = void 0;
var i = e("../../../base/async/Barrier"), l = e("../../../base/decorators/DecoratorTrait"), c = e("../../../base/loader/ResLoader"), s = e("../../../base/storage/Storage"), u = e("../../chapterConfig/vo/ChapterConfigInfo"), f = e("../types/AchievementType"), d = function() {
function e() {
this._barrierAchievementStatisticsData = new i.Barrier();
this._achievementInfoOpen = !1;
this.achievementInfoData = null;
this.statisticsData = [];
}
Object.defineProperty(e.prototype, "barrierAchievementStatisticsData", {
get: function() {
return this._barrierAchievementStatisticsData;
},
enumerable: !1,
configurable: !0
});
e.prototype.updataAchievementStatisticsData = function(e, t) {
var o = this.achievementLocalStatisticsData;
switch (e) {
case f.Achievement_Target_Type.achieve_win_streak:
if (1 == t) {
o.travelWinTimes += t;
o.travelWinTimes > o.travelWinMaxTimes && (o.travelWinMaxTimes = o.travelWinTimes);
} else o.travelWinTimes = 0;
this.saveAndUpData(o, e);
break;

case f.Achievement_Target_Type.achieve_login_day:
var r = new Date(), n = r.getFullYear(), a = r.getMonth() + 1, i = r.getDate(), l = o.dayArr;
if (l[0] !== n || l[1] !== a || l[2] !== i) {
l[0] = n;
l[1] = a;
l[2] = i;
o.loginDays += t;
}
this.saveAndUpData(o, e);
break;

case f.Achievement_Target_Type.achieve_elimination_multi:
o.eliminationMultiNum += t;
this.saveAndUpData(o, e);
break;

case f.Achievement_Target_Type.achieve_collect_gem:
o.collectGemNum += t;
this.saveAndUpData(o, e);
break;

case f.Achievement_Target_Type.achieve_high_combo:
t > o.highComboNum && (o.highComboNum = t);
this.saveAndUpData(o, e);
break;

case f.Achievement_Target_Type.achieve_elimination_block:
o.eliminationBlockNum += t;
this.saveAndUpData(o, e);
break;

case f.Achievement_Target_Type.month_achieve:
var c = new Date(), s = c.getFullYear(), u = c.getMonth() + 1, d = s.toString() + "_" + u.toString();
o.monthLevelObj.hasOwnProperty(d) || (o.monthLevelObj[d] = 0);
o.monthLevelObj[d] += t;
this.saveAndUpData(o, e, s + "_" + u);
break;

default:
this.saveAndUpData(o, e);
}
};
e.prototype.saveAndUpData = function(e, t, o) {
s.storage.setItem("AchieveTargetDataInfo", e);
this.updataAchievementAwardData(t, o);
};
e.prototype.updataAchievementAwardData = function(e, t) {
if (this.achievementInfoData) {
var o = this.getQueryAchievementStatisticsData(e, t), r = this.achievementLocalAwardData;
for (var n in r) {
var a = r[n];
if (a.achieve_type_logic == e) {
if (a.achieve_type == f.Achievement_Class_Type.MONTHLY_ACHIEVEMENT) {
var i = a.key.split("_")[3], l = parseInt(a.key.split("_")[2]), c = new Date().getMonth() + 1, u = new Date().getFullYear();
if (parseInt(i) != c || l != u) continue;
}
if (o > a.currentValue) {
a.currentValue = o;
var d = this.getAchievementInfoData(a.key);
if (!d) continue;
for (var p = -1, h = 0; h < d.achieve_list.length && o >= d.achieve_list[h]; h++) p = h;
if (p != a.curAchieveIndex) {
a.curAchieveIndex = p;
a.isNew = !0;
var m = new Date();
a.achieveTime = m.getFullYear() + "." + (m.getMonth() + 1) + "." + m.getDate();
null != a.unlockTime && 0 != a.unlockTime || (a.unlockTime = Date.now());
DS("usr_data_achieve", {
achieve_key: a.key,
achieve_type_logic: a.achieve_type_logic,
achieve_type: a.achieve_type
});
}
}
break;
}
}
s.storage.setItem("AchievementAwardData0703", r);
}
};
e.prototype.getQueryAchievementStatisticsData = function(e, t) {
void 0 === t && (t = "");
var o = 0;
switch (e) {
case f.Achievement_Target_Type.achieve_high_score:
o = s.storage.getItem("classHighScore", 0);
break;

case f.Achievement_Target_Type.achieve_win_streak:
o = this.achievementLocalStatisticsData.travelWinMaxTimes;
break;

case f.Achievement_Target_Type.achieve_login_day:
o = this.achievementLocalStatisticsData.loginDays;
break;

case f.Achievement_Target_Type.achieve_all_levels:
o = s.storage.getItem("classGameNum", 0) + s.storage.getItem("chapterGameNum", 0);
break;

case f.Achievement_Target_Type.achieve_elimination_multi:
o = this.achievementLocalStatisticsData.eliminationMultiNum;
break;

case f.Achievement_Target_Type.achieve_collect_gem:
o = this.achievementLocalStatisticsData.collectGemNum;
break;

case f.Achievement_Target_Type.achieve_high_combo:
o = this.achievementLocalStatisticsData.highComboNum;
break;

case f.Achievement_Target_Type.achieve_adventure_map:
var r = s.storage.getItem("chapterNum", 0), n = u.chapterConfigInfo.chapterDatasCfg.length;
if (0 == this.achievementLocalStatisticsData.adventureMapOnce) if (r >= n) {
this.achievementLocalStatisticsData.adventureMapOnce = 1;
o = 1;
} else o = 0; else o = 1;
break;

case f.Achievement_Target_Type.achieve_elimination_block:
o = this.achievementLocalStatisticsData.eliminationBlockNum;
break;

case f.Achievement_Target_Type.month_achieve:
var a = t;
o = "" != a && null != this.achievementLocalStatisticsData.monthLevelObj[a] ? this.achievementLocalStatisticsData.monthLevelObj[a] : 0;
break;

case f.Achievement_Target_Type.achieve_open_condition:
o = s.storage.getItem("classGameNum", 0) + s.storage.getItem("chapterGameNum", 0);
}
return o;
};
e.prototype.setAchievementInfoOpen = function(e) {
this._achievementInfoOpen = e;
};
Object.defineProperty(e.prototype, "achievementInfoOpen", {
get: function() {
return this._achievementInfoOpen;
},
enumerable: !1,
configurable: !0
});
e.prototype.getMonthInfoByKey = function(e) {
return "" != e && 0 == e.indexOf("month_achieve_") ? e.slice(14) : "";
};
e.prototype.setRedPointState = function() {
var e = this.achievementLocalAwardData;
for (var t in e) e[t].isNew && (e[t].isNew = !1);
s.storage.setItem("AchievementAwardData0703", e);
};
e.prototype.getRedPointState = function() {
var e = s.storage.getItem("AchievementAwardData0703", {});
for (var t in e) if (e[t].isNew) return !0;
return !1;
};
Object.defineProperty(e.prototype, "achievementLocalStatisticsData", {
get: function() {
return s.storage.getItem("AchieveTargetDataInfo", {
travelWinMaxTimes: 0,
travelWinTimes: 0,
loginDays: 0,
dayArr: [ 0, 0, 0 ],
eliminationMultiNum: 0,
collectGemNum: 0,
highComboNum: 0,
adventureMapOnce: 0,
eliminationBlockNum: 0,
monthLevelObj: {}
});
},
enumerable: !1,
configurable: !0
});
Object.defineProperty(e.prototype, "achievementLocalAwardData", {
get: function() {
var e = s.storage.getItem("AchievementAwardData0703", {});
return "object" == typeof e ? e : {};
},
enumerable: !1,
configurable: !0
});
Object.defineProperty(e.prototype, "achievementAwardData", {
get: function() {
if (!this.achievementInfoData) return [];
var e = [];
for (var t in this.achievementLocalAwardData) {
var o = this.achievementInfoData[t];
if (o) {
var r = this.achievementLocalAwardData[t];
if (o.achieve_type == f.Achievement_Class_Type.MONTHLY_ACHIEVEMENT) {
var n = r.key.split("_")[3], a = parseInt(r.key.split("_")[2]), i = new Date().getMonth() + 1, l = new Date().getFullYear();
if ((parseInt(n) != i || a != l) && -1 == r.curAchieveIndex) continue;
if (this.getMonthInfoByKey(r.key) == l + "_" + i) r.order = 3e4; else if (r.curAchieveIndex > -1) {
r.order += 1e4;
r.isNew && (r.order += 1e4);
}
} else {
if (0 == o.show_or_not && -1 == r.curAchieveIndex) continue;
r.curAchieveIndex > -1 && (r.order += 1e4);
r.isNew && (r.order += 1e4);
}
e.push(r);
}
}
e.sort(function(e, t) {
return e.order == t.order ? t.achieveTime - e.achieveTime : t.order - e.order;
});
return e;
},
enumerable: !1,
configurable: !0
});
Object.defineProperty(e.prototype, "achievementStatisticsData", {
get: function() {
return this.statisticsData;
},
enumerable: !1,
configurable: !0
});
e.prototype.getAchievementInfoData = function(e) {
return this.achievementInfoData ? this.achievementInfoData[e] : null;
};
e.prototype.loadAchievementInfoData = function(e) {
return n(this, void 0, void 0, function() {
var t, o, r;
return a(this, function(n) {
switch (n.label) {
case 0:
t = e.config;
return [ 4, c.ResLoader.asyncLoad("configs/achievement/" + t, cc.JsonAsset) ];

case 1:
o = n.sent();
return [ 4, c.ResLoader.asyncLoad("configs/achievement/achievements_newCommon_config_creator", cc.JsonAsset) ];

case 2:
r = n.sent();
this.setAchievementInfoData([ o, r ], e);
this._barrierAchievementStatisticsData.open();
return [ 2 ];
}
});
});
};
e.prototype.setAchievementInfoData = function(e, t) {
this.achievementInfoData = {};
for (var o = t.new_old, r = t.detail_type, n = t.achieveDiffLevel, a = 0; a < e.length; a++) {
var i = e[a];
if (i) {
var c = i.name, s = i.json;
for (var u in s) {
var d = s[u];
if ("achievements_newCommon_config_creator" == c) {
var p = l.getGameTraitName(d.tag_id), h = TRAIT(p);
if (!h || !h.active) continue;
}
if ("achievements_newCommon_config_creator" != c) {
if (null != o && d.new_old != o) continue;
if (null != r && "null" != r && d.detail_type != r) continue;
null != n && (1 == n ? d.hasOwnProperty("achieve_list_higher") && (d.achieve_list = d.achieve_list_higher) : -1 == n ? d.hasOwnProperty("achieve_list_lower") && (d.achieve_list = d.achieve_list_lower) : d.hasOwnProperty(n) && (d.achieve_list = d[n]));
}
this.achievementInfoData[d.key] = d;
}
}
}
this.initLocalData();
this.initAchievementStatisticsData();
this.updataAchievementStatisticsData(f.Achievement_Target_Type.achieve_login_day, 1);
};
e.prototype.initLocalData = function() {
var e = this.achievementLocalAwardData;
for (var t in this.achievementInfoData) {
var o = e[t];
if (o) o.hasOwnProperty("achieve_type_logic") || (o.achieve_type_logic = this.achievementInfoData[t].achieve_type_logic); else {
var r = this.achievementInfoData[t], n = {
key: r.key,
currentValue: 0,
curAchieveIndex: -1,
isNew: !1,
achieveTime: "",
unlockTime: 0,
id: r.id,
achieveCount: r.achieve_list.length,
achieve_type: r.achieve_type,
order: -r.index,
achieve_type_logic: r.achieve_type_logic
};
e["" + t] = n;
}
}
s.storage.setItem("AchievementAwardData0703", e);
};
e.prototype.initAchievementStatisticsData = function() {
this.statisticsData = [ {
name: "Highest Combo",
targetType: f.Achievement_Target_Type.achieve_high_combo,
sKey: "achieve_high_combo"
}, {
name: "Rounds",
targetType: f.Achievement_Target_Type.achieve_all_levels,
sKey: "achieve_all_levels"
}, {
name: "Best Score",
targetType: f.Achievement_Target_Type.achieve_high_score,
sKey: "achieve_high_score"
}, {
name: "Login Days",
targetType: f.Achievement_Target_Type.achieve_login_day,
sKey: "achieve_login_day"
} ];
};
e.prototype.gmUnlockAllAchievements = function() {};
return r([ classId("AchievementInfo"), classMethodWatch() ], e);
}();
o.achievementInfo = new d();
cc._RF.pop();
}, {
"../../../base/async/Barrier": "Barrier",
"../../../base/decorators/DecoratorTrait": "DecoratorTrait",
"../../../base/loader/ResLoader": "ResLoader",
"../../../base/storage/Storage": "Storage",
"../../chapterConfig/vo/ChapterConfigInfo": "ChapterConfigInfo",
"../types/AchievementType": "AchievementType"
} ],
AchievementInterface: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "56c8bpZEIJIhb9rqOT08t5E", "AchievementInterface");
Object.defineProperty(o, "__esModule", {
value: !0
});
cc._RF.pop();
}, {} ],
AchievementType: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "d5b2e9+IihF7oD5e96oYKjH", "AchievementType");
Object.defineProperty(o, "__esModule", {
value: !0
});
o.PushAndAchievementTypeMix = o.PushTypeAdventureKeyMix = o.PushScenesMix = o.PushCaseConfig = o.PushScenes = o.AchievementGoToType = o.Achievement_Target_Type = o.Achievement_Class_Type = void 0;
(function(e) {
e[e.MONTHLY_ACHIEVEMENT = 2] = "MONTHLY_ACHIEVEMENT";
e[e.PERMANENT_ACHIEVEMENT = 1] = "PERMANENT_ACHIEVEMENT";
})(o.Achievement_Class_Type || (o.Achievement_Class_Type = {}));
(function(e) {
e[e.achieve_high_score = 1] = "achieve_high_score";
e[e.achieve_win_streak = 2] = "achieve_win_streak";
e[e.achieve_login_day = 3] = "achieve_login_day";
e[e.achieve_all_levels = 4] = "achieve_all_levels";
e[e.achieve_elimination_multi = 5] = "achieve_elimination_multi";
e[e.achieve_collect_gem = 6] = "achieve_collect_gem";
e[e.achieve_high_combo = 7] = "achieve_high_combo";
e[e.achieve_adventure_map = 8] = "achieve_adventure_map";
e[e.achieve_elimination_block = 9] = "achieve_elimination_block";
e[e.month_achieve = 14] = "month_achieve";
e[e.achieve_open_condition = 33] = "achieve_open_condition";
})(o.Achievement_Target_Type || (o.Achievement_Target_Type = {}));
(function(e) {
e[e.None = -1] = "None";
e[e.Class = 1] = "Class";
e[e.Chapter = 2] = "Chapter";
e[e.MiniGame = 3] = "MiniGame";
})(o.AchievementGoToType || (o.AchievementGoToType = {}));
o.PushScenes = {
choice: [ "cj03", "cj04", "cj07", "cj08" ],
class: [ "cj01", "cj06" ],
chapter: [ "cj02", "cj05" ]
};
o.PushCaseConfig = {
17: {
key: "achieve_high_score",
achievementTargetType: 1,
cjpushcftype: "highscores",
scheme: "cj17"
},
18: {
key: "achieve_high_score",
achievementTargetType: 1,
cjpushcftype: "highscores",
scheme: "cj18"
},
19: {
key: "achieve_win_streak",
achievementTargetType: 2,
cjpushcftype: "travelwinning",
scheme: "cj19"
},
20: {
key: "achieve_win_streak",
achievementTargetType: 2,
cjpushcftype: "travelwinning",
scheme: "cj20"
},
21: {
key: "achieve_all_levels",
achievementTargetType: 4,
cjpushcftype: "levescompleted",
scheme: "cj21"
},
22: {
key: "achieve_all_levels",
achievementTargetType: 4,
cjpushcftype: "levescompleted",
scheme: "cj22"
},
23: {
key: "achieve_adventure_map",
achievementTargetType: 8,
cjpushcftype: "mosaicmaps",
scheme: "cj23"
},
24: {
key: "achieve_adventure_map",
achievementTargetType: 8,
cjpushcftype: "mosaicmaps",
scheme: "cj24"
},
25: {
key: "achieve_elimination_multi",
achievementTargetType: 5,
cjpushcftype: "clear_master",
scheme: "cj25"
},
26: {
key: "achieve_elimination_multi",
achievementTargetType: 5,
cjpushcftype: "clear_master",
scheme: "cj26"
},
27: {
key: "achieve_elimination_block",
achievementTargetType: 9,
cjpushcftype: "master_cleaner",
scheme: "cj27"
},
28: {
key: "achieve_elimination_block",
achievementTargetType: 9,
cjpushcftype: "master_cleaner",
scheme: "cj28"
},
29: {
key: "achieve_collect_gem",
achievementTargetType: 6,
cjpushcftype: "jewelry_tycoon",
scheme: "cj29"
},
30: {
key: "achieve_collect_gem",
achievementTargetType: 6,
cjpushcftype: "jewelry_tycoon",
scheme: "cj30"
}
};
o.PushScenesMix = {
choice: [ "cj21", "cj35" ],
class: [ "cj17", "cj25", "cj27", "cj31", "cj39", "cj41" ],
chapter: [ "cj19", "cj29", "cj23", "cj33", "cj43", "cj37" ]
};
o.PushTypeAdventureKeyMix = 10001;
o.PushAndAchievementTypeMix = new Map([ [ 10001, {
key: "adventure_push",
AchievementTargetType: 9999,
cjpushcftype: "adventure",
scheme: "adv_adventure01",
strategy: "adventure01"
} ], [ 10002, {
key: "adventure_push",
AchievementTargetType: 9999,
cjpushcftype: "adventure",
scheme: "adv_adventure03",
strategy: "adventure01silent"
} ], [ 17, {
key: "achieve_high_score",
AchievementTargetType: 1,
cjpushcftype: "highscores",
scheme: "cj17",
strategy: "cj001"
} ], [ 18, {
key: "achieve_high_score",
AchievementTargetType: 1,
cjpushcftype: "highscores",
scheme: "cj18",
strategy: "cjsilent01"
} ], [ 19, {
key: "achieve_win_streak",
AchievementTargetType: 2,
cjpushcftype: "travelwinning",
scheme: "cj19",
strategy: "cj002"
} ], [ 20, {
key: "achieve_win_streak",
AchievementTargetType: 2,
cjpushcftype: "travelwinning",
scheme: "cj20",
strategy: "cjsilent01"
} ], [ 21, {
key: "achieve_all_levels",
AchievementTargetType: 4,
cjpushcftype: "levescompleted",
scheme: "cj21",
strategy: "cj004"
} ], [ 22, {
key: "achieve_all_levels",
AchievementTargetType: 4,
cjpushcftype: "levescompleted",
scheme: "cj22",
strategy: "cjsilent01"
} ], [ 23, {
key: "achieve_adventure_map",
AchievementTargetType: 8,
cjpushcftype: "mosaicmaps",
scheme: "cj23",
strategy: "cj005"
} ], [ 24, {
key: "achieve_adventure_map",
AchievementTargetType: 8,
cjpushcftype: "mosaicmaps",
scheme: "cj24",
strategy: "cjsilent01"
} ], [ 25, {
key: "achieve_elimination_multi",
AchievementTargetType: 5,
cjpushcftype: "clear_master",
scheme: "cj25",
strategy: "cj009"
} ], [ 26, {
key: "achieve_elimination_multi",
AchievementTargetType: 5,
cjpushcftype: "clear_master",
scheme: "cj26",
strategy: "cjsilent01"
} ], [ 27, {
key: "achieve_elimination_block",
AchievementTargetType: 9,
cjpushcftype: "master_cleaner",
scheme: "cj27",
strategy: "cj011"
} ], [ 28, {
key: "achieve_elimination_block",
AchievementTargetType: 9,
cjpushcftype: "master_cleaner",
scheme: "cj28",
strategy: "cjsilent01"
} ], [ 29, {
key: "achieve_collect_gem",
AchievementTargetType: 6,
cjpushcftype: "jewelry_tycoon",
scheme: "cj29",
strategy: "cj010"
} ], [ 30, {
key: "achieve_collect_gem",
AchievementTargetType: 6,
cjpushcftype: "jewelry_tycoon",
scheme: "cj30",
strategy: "cjsilent01"
} ], [ 31, {
key: "achieve_high_score",
AchievementTargetType: 1,
cjpushcftype: "highscores",
scheme: "cj31",
strategy: "cj012"
} ], [ 32, {
key: "achieve_high_score",
AchievementTargetType: 1,
cjpushcftype: "highscores",
scheme: "cj32",
strategy: "cjsilent01"
} ], [ 33, {
key: "achieve_win_streak",
AchievementTargetType: 2,
cjpushcftype: "travelwinning",
scheme: "cj33",
strategy: "cj013"
} ], [ 34, {
key: "achieve_win_streak",
AchievementTargetType: 2,
cjpushcftype: "travelwinning",
scheme: "cj34",
strategy: "cjsilent01"
} ], [ 35, {
key: "achieve_all_levels",
AchievementTargetType: 4,
cjpushcftype: "levescompleted",
scheme: "cj35",
strategy: "cj014"
} ], [ 36, {
key: "achieve_all_levels",
AchievementTargetType: 4,
cjpushcftype: "levescompleted",
scheme: "cj36",
strategy: "cjsilent01"
} ], [ 37, {
key: "achieve_adventure_map",
AchievementTargetType: 8,
cjpushcftype: "mosaicmaps",
scheme: "cj37",
strategy: "cj015"
} ], [ 38, {
key: "achieve_adventure_map",
AchievementTargetType: 8,
cjpushcftype: "mosaicmaps",
scheme: "cj38",
strategy: "cjsilent01"
} ], [ 39, {
key: "achieve_elimination_multi",
AchievementTargetType: 5,
cjpushcftype: "clear_master",
scheme: "cj39",
strategy: "cj016"
} ], [ 40, {
key: "achieve_elimination_multi",
AchievementTargetType: 5,
cjpushcftype: "clear_master",
scheme: "cj40",
strategy: "cjsilent01"
} ], [ 41, {
key: "achieve_elimination_block",
AchievementTargetType: 9,
cjpushcftype: "master_cleaner",
scheme: "cj41",
strategy: "cj017"
} ], [ 42, {
key: "achieve_elimination_block",
AchievementTargetType: 9,
cjpushcftype: "master_cleaner",
scheme: "cj42",
strategy: "cjsilent01"
} ], [ 43, {
key: "achieve_collect_gem",
AchievementTargetType: 6,
cjpushcftype: "jewelry_tycoon",
scheme: "cj43",
strategy: "cj018"
} ], [ 44, {
key: "achieve_collect_gem",
AchievementTargetType: 6,
cjpushcftype: "jewelry_tycoon",
scheme: "cj44",
strategy: "cjsilent01"
} ] ]);
cc._RF.pop();
}, {} ],
Achievement_Awards_Item_Icon: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "b913ecshxtAg4nwQIMyeiDq", "Achievement_Awards_Item_Icon");
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
var i = e("../../../base/components/Component"), l = e("../../../base/loader/ResLoader"), c = e("../types/AchievementType"), s = e("../vo/AchievementInfo"), u = cc._decorator, f = u.ccclass, d = u.property, p = "textures/achievement/icons", h = function(e) {
n(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.spAwardsBg = null;
t.spAwardsIcon = null;
t.ndLoading = null;
return t;
}
t.prototype.render = function() {
var e = s.achievementInfo.getAchievementInfoData(this.state.awardData.key);
if (e) {
this.node.active = !0;
this.node.setPosition(this.state.x, this.state.y);
var t = this.state.awardData.curAchieveIndex + 1;
if (e.achieve_type == c.Achievement_Class_Type.MONTHLY_ACHIEVEMENT) {
this.onMonThlyRes(e, t);
this.spAwardsIcon.node.scale = .8;
} else this.onPermanentRes(e, t);
this.changeItemIconShow(this.node, this.state.awardData);
} else this.node.active = !1;
};
t.prototype.changeItemIconShow = function() {};
t.prototype.onMonThlyRes = function(e, t) {
this.spAwardsBg.node.active = !1;
this.loadMonThlyIconRes(e, t);
this.setSprAchieveGrey(this.spAwardsIcon.node, t);
};
t.prototype.loadMonThlyIconRes = function(e, t) {
var o, r = this;
o = t >= this.state.awardData.achieveCount ? e.award_icon + "_color" : e.award_icon + "_grey";
l.ResLoader.load(p + "/" + o, cc.SpriteFrame, function(e, t) {
e || (r.spAwardsIcon.spriteFrame = t);
});
};
t.prototype.onPermanentRes = function(e, t) {
this.spAwardsBg.node.active = !0;
this.loadPermanentIconRes(e, t);
this.spAwardsIcon.node.scale = .87;
this.setSprAchieveGrey(this.spAwardsBg.node, t);
this.setSprAchieveGrey(this.spAwardsIcon.node, t);
};
t.prototype.loadPermanentIconRes = function(e, t) {
var o = this, r = "", n = "";
if (t >= this.state.awardData.achieveCount) {
r = e.award_icon + "_color";
n = "badge_smallPanel_color";
} else {
r = e.award_icon + "_grey";
n = "badge_smallPanel_grey";
}
l.ResLoader.load(p + "/" + r, cc.SpriteFrame, function(e, t) {
e || (o.spAwardsIcon.spriteFrame = t);
});
l.ResLoader.load(p + "/" + n, cc.SpriteFrame, function(e, t) {
e || (o.spAwardsBg.spriteFrame = t);
});
};
t.prototype.setSprAchieveGrey = function(e, t) {
var o = e.getComponent(cc.Button);
null == o && (o = e.addComponent(cc.Button));
o.enableAutoGrayEffect = 0 == t;
o.interactable = !1;
e.opacity = 0 == t ? 76 : 255;
};
a([ d(cc.Sprite) ], t.prototype, "spAwardsBg", void 0);
a([ d(cc.Sprite) ], t.prototype, "spAwardsIcon", void 0);
a([ d(cc.Node) ], t.prototype, "ndLoading", void 0);
return a([ classId("Achievement_Awards_Item_Icon"), f, classMethodWatch() ], t);
}(i.default);
o.default = h;
cc._RF.pop();
}, {
"../../../base/components/Component": "Component",
"../../../base/loader/ResLoader": "ResLoader",
"../types/AchievementType": "AchievementType",
"../vo/AchievementInfo": "AchievementInfo"
} ],
Achievement_Awards_Item: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "92932CkHCNA25O09uEBT8o7", "Achievement_Awards_Item");
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
var i = e("../../../base/components/Component"), l = e("../../../base/decorators/DecoratorThrottle"), c = e("../../../base/events/Events"), s = e("../../../falcon/EventManager"), u = e("../../game/type/GameType"), f = e("../../homePage/events/E_HomePage_Game"), d = e("../events/E_Achievement_AwardClick"), p = e("../vo/AchievementInfo"), h = cc._decorator, m = h.ccclass, _ = h.property, y = function(e) {
n(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t._onDidAchievement_Awards_Item_AwardClick = new c.Emitter();
t.onDidAchievement_Awards_Item_AwardClick = t._onDidAchievement_Awards_Item_AwardClick;
t._onDidAchievement_Awards_ItemClick_GoToGame = new c.Emitter();
t.onDidAchievement_Awards_ItemClick_GoToGame = t._onDidAchievement_Awards_ItemClick_GoToGame;
t.lbAwardsName = null;
t.lbAwardsNum = null;
t.ndRedPoint = null;
return t;
}
t.prototype.onLoad = function() {
this._onDidAchievement_Awards_Item_AwardClick.event(this.awardCllickEvent);
this._onDidAchievement_Awards_ItemClick_GoToGame.event(this.awardClickGoToGameEvent);
};
t.prototype.render = function() {
if (p.achievementInfo.getAchievementInfoData(this.state.awardData.key)) {
this.node.active = !0;
this.changeItemShow(this.node, this.state.awardData);
this.changeSkin(this.lbAwardsNum);
} else this.node.active = !1;
};
t.prototype.changeSkin = function() {};
t.prototype.changeItemShow = function() {
var e = p.achievementInfo.getAchievementInfoData(this.state.awardData.key), t = this.state.awardData.curAchieveIndex + 1;
if (0 == t) {
this.lbAwardsName.node.opacity = 76;
this.lbAwardsNum.node.active = !1;
} else {
this.lbAwardsName.node.opacity = 255;
this.lbAwardsNum.node.active = !0;
this.lbAwardsNum.string = t + "/" + this.state.awardData.achieveCount;
}
this.lbAwardsName.string = e.en_name;
this.ndRedPoint.active = this.state.awardData.isNew;
};
t.prototype.onAwardClick = function() {
DS("ui_achievement_award_click", {
red_point: this.state.awardData.isNew ? 1 : 0,
id: this.state.awardData.id,
award_index: this.state.awardData.curAchieveIndex + 1
});
this.state.awardData.isNew = !1;
this.ndRedPoint.active = this.state.awardData.isNew;
this.awardCllickEvent(this.state.awardData);
};
t.prototype.awardCllickEvent = function(e) {
s.EventManager.dispatchModuleEvent(new d.E_Achievement_AwardClick(e));
};
t.prototype.awardClickGoToGameEvent = function(e) {
e == u.GameType.Class ? s.EventManager.dispatchModuleEvent(new f.E_HomePage_Game(u.GameType.Class)) : e == u.GameType.Chapter && s.EventManager.dispatchModuleEvent(new f.E_HomePage_Game(u.GameType.Chapter, {
isEnterGame: !0
}));
};
a([ _(cc.Label) ], t.prototype, "lbAwardsName", void 0);
a([ _(cc.Label) ], t.prototype, "lbAwardsNum", void 0);
a([ _(cc.Node) ], t.prototype, "ndRedPoint", void 0);
a([ l.throttle(300) ], t.prototype, "onAwardClick", null);
return a([ classId("Achievement_Awards_Item"), m, classMethodWatch() ], t);
}(i.default);
o.default = y;
cc._RF.pop();
}, {
"../../../base/components/Component": "Component",
"../../../base/decorators/DecoratorThrottle": "DecoratorThrottle",
"../../../base/events/Events": "Events",
"../../../falcon/EventManager": "EventManager",
"../../game/type/GameType": "GameType",
"../../homePage/events/E_HomePage_Game": "E_HomePage_Game",
"../events/E_Achievement_AwardClick": "E_Achievement_AwardClick",
"../vo/AchievementInfo": "AchievementInfo"
} ],
Achievement_Detail: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "3c35fZHywZICZz2zRsLPVgt", "Achievement_Detail");
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
var i = e("../../../base/components/Component"), l = e("../../../base/decorators/DecoratorThrottle"), c = e("../../../base/events/Events"), s = e("../../../base/loader/ResLoader"), u = e("../../../base/ui/UI"), f = e("../../../falcon/EventManager"), d = e("../../game/type/GameType"), p = e("../../homePage/events/E_HomePage_Game"), h = e("../types/AchievementType"), m = e("../vo/AchievementInfo"), _ = e("../../multiLang/vo/MultiLangInfo"), y = cc._decorator, g = y.ccclass, v = y.property, b = "textures/achievement/icons", C = function(e) {
n(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.ndMaskBg = null;
t.ndConfirm = null;
t.ndContent = null;
t.spAwardBg = null;
t.dbAwardBg = null;
t.dbAwardIcon = null;
t.dbAward_anim = null;
t.spAwardIcon = null;
t.ndAwardTime = null;
t.lbAwardTime = null;
t.lbDesc = null;
t._onDidAchievement_Detail_GoToGame = new c.Emitter();
t.onDidAchievement_Detail_GoToGame = t._onDidAchievement_Detail_GoToGame;
return t;
}
t.prototype.onLoad = function() {
this._onDidAchievement_Detail_GoToGame.event(this.onGoToGameEvent);
};
t.prototype.render = function() {
var e = this;
this.dbAward_anim.addEventListener(dragonBones.EventObject.COMPLETE, function(t) {
if (t && t.animationState && t.animationState.name) {
var o = t.animationState.name;
"in_a_up" == o ? e.dbAward_anim.playAnimation("init_a", 0) : "in_b_up" == o && e.dbAward_anim.playAnimation("init_b", 0);
}
}, this);
var t = this.state.awardData, o = m.achievementInfo.getAchievementInfoData(t.key);
if (o) {
var r = t.curAchieveIndex + 1, n = "";
if (0 == r) {
this.ndAwardTime.active = !1;
this.lbDesc.string = o.en_lock;
n = this.lbDesc.string;
n = _.multiLangInfo.replaceString(n, [ o.achieve_list[0].toString() ]);
} else {
this.ndAwardTime.active = !0;
this.lbAwardTime.string = t.achieveTime;
this.lbDesc.string = o.en_get;
n = this.lbDesc.string;
n = _.multiLangInfo.replaceString(n, [ o.achieve_list[t.curAchieveIndex].toString() ]);
}
this.lbDesc.string = n;
t.achieve_type == h.Achievement_Class_Type.MONTHLY_ACHIEVEMENT ? this.onMonThlyRes(o, r) : this.onPermanentRes(o, r);
this.showAnim(t.achieve_type, r);
this.changeSkin();
}
};
t.prototype.changeSkin = function() {};
t.prototype.onMonThlyRes = function(e, t) {
this.spAwardIcon.node.active = !1;
this.loadMonThlyIconRes(e, t);
this.setSprAchieveGrey(this.spAwardBg.node, t);
this.spAwardBg.node.scale = 1.02;
this.spAwardBg.node.setPosition(-2, -10);
};
t.prototype.loadMonThlyIconRes = function(e, t) {
var o, r = this;
o = t >= this.state.awardData.achieveCount ? e.award_icon + "_color" : e.award_icon + "_grey";
s.ResLoader.load(b + "/" + o, cc.SpriteFrame, function(e, t) {
e || (r.spAwardBg.spriteFrame = t);
});
};
t.prototype.onPermanentRes = function(e, t) {
this.spAwardBg.node.active = !0;
this.loadPermanentIconRes(e, t);
this.setSprAchieveGrey(this.spAwardBg.node, t);
this.setSprAchieveGrey(this.spAwardIcon.node, t);
this.spAwardIcon.node.scale = 1.67;
this.spAwardBg.node.scale = 1;
this.spAwardBg.node.setPosition(0, -5);
};
t.prototype.loadPermanentIconRes = function(e, t) {
var o = this, r = "", n = "";
if (t >= this.state.awardData.achieveCount) {
r = e.award_icon + "_color";
n = "badge_bigPanel_color";
} else {
r = e.award_icon + "_grey";
n = "badge_bigPanel_grey";
}
s.ResLoader.load(b + "/" + r, cc.SpriteFrame, function(e, t) {
e || (o.spAwardIcon.spriteFrame = t);
});
s.ResLoader.load(b + "/" + n, cc.SpriteFrame, function(e, t) {
e || (o.spAwardBg.spriteFrame = t);
});
};
t.prototype.onClickClose = function() {
u.UI.hide(this.node);
};
t.prototype.onClickConfirm = function() {
u.UI.hide(this.node);
};
t.prototype.showAnim = function(e, t) {
var o = this;
this.spAwardBg.node.active = !1;
this.spAwardIcon.node.active = !1;
this.dbAwardBg.node.active = !1;
this.dbAwardIcon.node.active = !1;
this.dbAward_anim.node.active = !1;
this.ndMaskBg.opacity = 0;
var r = 0;
cc.Tween.stopAllByTarget(this.ndMaskBg);
cc.Tween.stopAllByTarget(this.spAwardBg);
cc.Tween.stopAllByTarget(this.node);
cc.Tween.stopAllByTarget(this.lbDesc);
cc.Tween.stopAllByTarget(this.ndConfirm);
this.ndMaskBg.opacity = 255;
r += 0;
this.ndContent.scale = .75;
cc.tween(this.ndContent).delay(r).to(.23, {
scale: 1
}, {
easing: cc.easing.sineOut
}).start();
r += .1;
cc.tween(this.node).delay(r).call(function() {
o.showDragonAnim(e, t);
}).start();
r += .53;
this.lbDesc.node.opacity = 0;
cc.tween(this.lbDesc.node).delay(r).to(.2, {
opacity: 255
}).start();
r += .2;
this.showConfirmAnim(r, this.ndConfirm, this.state.awardData);
};
t.prototype.showConfirmAnim = function(e, t) {
t.active = !1;
t.scale = .6;
cc.tween(this.node).delay(e).call(function() {
t.active = !0;
cc.tween(t).to(.17, {
scale: 1.05
}).to(.1, {
scale: 1
}).start();
}).start();
};
t.prototype.showDragonAnim = function(e, t) {
this.dbAwardBg.node.active = !0;
this.dbAward_anim.node.active = 0 != t;
this.spAwardBg.node.active = !0;
if (e == h.Achievement_Class_Type.PERMANENT_ACHIEVEMENT) {
this.dbAwardBg.playAnimation("in_a", 1);
this.dbAwardIcon.node.active = !0;
this.dbAwardIcon.playAnimation("in_a_small", 1);
this.spAwardIcon.node.active = !0;
0 != t && this.dbAward_anim.playAnimation("in_a_up", 1);
} else {
this.dbAwardBg.playAnimation("in_b", 1);
this.spAwardIcon.node.active = !1;
0 != t && this.dbAward_anim.playAnimation("in_b_up", 1);
}
};
t.prototype.setSprAchieveGrey = function(e, t) {
var o = e.getComponent(cc.Button);
null == o && (o = e.addComponent(cc.Button));
o.enableAutoGrayEffect = 0 == t;
o.interactable = 0 == t;
e.opacity = 0 == t ? 76 : 255;
};
t.prototype.onGoToGameEvent = function(e) {
e == d.GameType.Class ? f.EventManager.dispatchModuleEvent(new p.E_HomePage_Game(d.GameType.Class)) : e == d.GameType.Chapter && f.EventManager.dispatchModuleEvent(new p.E_HomePage_Game(d.GameType.Chapter, {
isEnterGame: !0
}));
};
a([ v(cc.Node) ], t.prototype, "ndMaskBg", void 0);
a([ v(cc.Node) ], t.prototype, "ndConfirm", void 0);
a([ v(cc.Node) ], t.prototype, "ndContent", void 0);
a([ v(cc.Sprite) ], t.prototype, "spAwardBg", void 0);
a([ v(dragonBones.ArmatureDisplay) ], t.prototype, "dbAwardBg", void 0);
a([ v(dragonBones.ArmatureDisplay) ], t.prototype, "dbAwardIcon", void 0);
a([ v(dragonBones.ArmatureDisplay) ], t.prototype, "dbAward_anim", void 0);
a([ v(cc.Sprite) ], t.prototype, "spAwardIcon", void 0);
a([ v(cc.Node) ], t.prototype, "ndAwardTime", void 0);
a([ v(cc.Label) ], t.prototype, "lbAwardTime", void 0);
a([ v(cc.Label) ], t.prototype, "lbDesc", void 0);
a([ l.throttle(300) ], t.prototype, "onClickClose", null);
a([ l.throttle(300) ], t.prototype, "onClickConfirm", null);
return a([ classId("Achievement_Detail"), g, classMethodWatch() ], t);
}(i.default);
o.default = C;
cc._RF.pop();
}, {
"../../../base/components/Component": "Component",
"../../../base/decorators/DecoratorThrottle": "DecoratorThrottle",
"../../../base/events/Events": "Events",
"../../../base/loader/ResLoader": "ResLoader",
"../../../base/ui/UI": "UI",
"../../../falcon/EventManager": "EventManager",
"../../game/type/GameType": "GameType",
"../../homePage/events/E_HomePage_Game": "E_HomePage_Game",
"../../multiLang/vo/MultiLangInfo": "MultiLangInfo",
"../types/AchievementType": "AchievementType",
"../vo/AchievementInfo": "AchievementInfo"
} ],
Achievement_Entrance: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "51a368ozylLmqZ5ZKemlckX", "Achievement_Entrance");
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
var i = e("../../../base/components/Component"), l = e("../../../base/decorators/DecoratorThrottle"), c = e("../../../falcon/EventManager"), s = e("../events/E_Achievement_Entrance"), u = e("../vo/AchievementInfo"), f = cc._decorator, d = f.ccclass, p = f.property, h = function(e) {
n(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.ndEntranceBone = null;
t.ndRedPoint = null;
return t;
}
t.prototype.render = function() {
this.ndEntranceBone.playAnimation("init", 0);
this.ndRedPoint.active = this.state.isShowRedPoint;
};
t.prototype.onClick = function() {
for (var e = u.achievementInfo.achievementStatisticsData, t = {}, o = 0; o < e.length; o++) {
var r = e[o];
r && (t[r.name] = u.achievementInfo.getQueryAchievementStatisticsData(r.targetType));
}
var n = [];
for (o = 0; o < u.achievementInfo.achievementAwardData.length; o++) {
var a = u.achievementInfo.achievementAwardData[o];
if (a) {
var i = {
id: a.id,
curAchieveIndex: a.curAchieveIndex + 1,
currentValue: a.currentValue
};
n.push(i);
}
}
DS("ui_theme_achievement_click", {
red_point: this.state.isShowRedPoint ? 1 : 0,
statistics: JSON.stringify(t),
awards: JSON.stringify(n)
});
DC("ui_theme_icon_click", {
icon_type: "medal"
});
c.EventManager.dispatchModuleEvent(new s.E_Achievement_Entrance());
};
a([ p(dragonBones.ArmatureDisplay) ], t.prototype, "ndEntranceBone", void 0);
a([ p(cc.Node) ], t.prototype, "ndRedPoint", void 0);
a([ l.throttle(300) ], t.prototype, "onClick", null);
return a([ d ], t);
}(i.default);
o.default = h;
cc._RF.pop();
}, {
"../../../base/components/Component": "Component",
"../../../base/decorators/DecoratorThrottle": "DecoratorThrottle",
"../../../falcon/EventManager": "EventManager",
"../events/E_Achievement_Entrance": "E_Achievement_Entrance",
"../vo/AchievementInfo": "AchievementInfo"
} ],
Achievement_Main: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "19ad2g+avBJ5a+DiIkYFWRR", "Achievement_Main");
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
}, i = this && this.__awaiter || function(e, t, o, r) {
return new (o || (o = Promise))(function(n, a) {
function i(e) {
try {
c(r.next(e));
} catch (e) {
a(e);
}
}
function l(e) {
try {
c(r.throw(e));
} catch (e) {
a(e);
}
}
function c(e) {
e.done ? n(e.value) : (t = e.value, t instanceof o ? t : new o(function(e) {
e(t);
})).then(i, l);
var t;
}
c((r = r.apply(e, t || [])).next());
});
}, l = this && this.__generator || function(e, t) {
var o, r, n, a, i = {
label: 0,
sent: function() {
if (1 & n[0]) throw n[1];
return n[1];
},
trys: [],
ops: []
};
return a = {
next: l(0),
throw: l(1),
return: l(2)
}, "function" == typeof Symbol && (a[Symbol.iterator] = function() {
return this;
}), a;
function l(e) {
return function(t) {
return c([ e, t ]);
};
}
function c(a) {
if (o) throw new TypeError("Generator is already executing.");
for (;i; ) try {
if (o = 1, r && (n = 2 & a[0] ? r.return : a[0] ? r.throw || ((n = r.return) && n.call(r), 
0) : r.next) && !(n = n.call(r, a[1])).done) return n;
(r = 0, n) && (a = [ 2 & a[0], n.value ]);
switch (a[0]) {
case 0:
case 1:
n = a;
break;

case 4:
i.label++;
return {
value: a[1],
done: !1
};

case 5:
i.label++;
r = a[1];
a = [ 0 ];
continue;

case 7:
a = i.ops.pop();
i.trys.pop();
continue;

default:
if (!(n = i.trys, n = n.length > 0 && n[n.length - 1]) && (6 === a[0] || 2 === a[0])) {
i = 0;
continue;
}
if (3 === a[0] && (!n || a[1] > n[0] && a[1] < n[3])) {
i.label = a[1];
break;
}
if (6 === a[0] && i.label < n[1]) {
i.label = n[1];
n = a;
break;
}
if (n && i.label < n[2]) {
i.label = n[2];
i.ops.push(a);
break;
}
n[2] && i.ops.pop();
i.trys.pop();
continue;
}
a = t.call(e, i);
} catch (e) {
a = [ 6, e ];
r = 0;
} finally {
o = n = 0;
}
if (5 & a[0]) throw a[1];
return {
value: a[0] ? a[1] : void 0,
done: !0
};
}
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var c = e("../../../base/cache/CacheRender"), s = e("../../../base/components/Component"), u = e("../../../base/decorators/DecoratorAdapter"), f = e("../../../base/decorators/DecoratorThrottle"), d = e("../../../base/timer/Timer"), p = e("../../../falcon/EventManager"), h = e("../../homePage/events/E_HomePage_Show"), m = e("../../native/NativeAd"), _ = e("../../prefab/PrefabConfig"), y = e("../vo/AchievementInfo"), g = e("./Achievement_Awards_Item"), v = e("./Achievement_Awards_Item_Icon"), b = e("./Achievement_Statistics_Item"), C = e("./Achievement_Statistics_Item_Bg"), S = cc._decorator, P = S.ccclass, k = S.property, I = function(e) {
n(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.topContainer = null;
t.lbTitle = null;
t.lbStatisticesTitle = null;
t.lbAwardsTitle = null;
t.spAwardsBg = null;
t.ndAllContainer = null;
t.ndStatisticsContent = null;
t.ndStatisticsBgContent = null;
t.ndStatisticsLabelContent = null;
t.ndAwardsContent = null;
t.ndAwardsIconContent = null;
t.ndAwardsLabelContent = null;
t._achievementAwardItem = [];
t._achievementAwardItemIcon = [];
t._achievementStatisticsItem = [];
t._hideBannerScheduler = null;
return t;
}
t.prototype.onLoad = function() {};
t.prototype.render = function() {
return i(this, void 0, void 0, function() {
var e;
return l(this, function(t) {
switch (t.label) {
case 0:
this.showAchievementStatisticsList(this.state.statisticsDataList);
return [ 4, d.nextFrame() ];

case 1:
t.sent();
this.showAchievementAwardsList(this.state.awardDataList);
e = cc.find("ndAllContainer/ndAwardsContainer", this.node);
this.showAchievementTitle(e, this.lbAwardsTitle);
this.onDot();
this.changeSkin();
return [ 2 ];
}
});
});
};
t.prototype.changeSkin = function() {};
t.prototype.onDot = function() {};
t.prototype.showAchievementStatisticsList = function(e) {
return i(this, void 0, Promise, function() {
var t, o, r, n;
return l(this, function(a) {
switch (a.label) {
case 0:
return this._achievementStatisticsItem.length <= 0 ? [ 4, c.cacheRender.createOrUpdateCacheListComponents({
tag: "Achievement_Main",
prefabUrl: _.PrefabConfig.Achievement_Statistics_Item.url,
count: e.length,
typeOrClassName: b.default,
parent: this.ndStatisticsLabelContent
}) ] : [ 3, 4 ];

case 1:
t = a.sent();
for (n = 0; n < e.length; n++) if (e[n]) {
t[n].setState({
statisticsData: e[n]
});
this._achievementStatisticsItem.push(t[n]);
}
return [ 4, d.nextFrame() ];

case 2:
a.sent();
this.ndStatisticsBgContent.height = this.ndStatisticsContent.height = this.ndStatisticsLabelContent.height;
this.ndStatisticsBgContent.width = this.ndStatisticsContent.width = this.ndStatisticsLabelContent.width;
return [ 4, c.cacheRender.createOrUpdateCacheListComponents({
tag: "Achievement_Main",
prefabUrl: _.PrefabConfig.Achievement_Statistics_Item_Bg.url,
count: e.length,
typeOrClassName: C.default,
parent: this.ndStatisticsBgContent
}) ];

case 3:
o = a.sent();
for (n = 0; n < e.length; n++) if (e[n]) {
r = t[n].node.getPosition();
o[n].setState({
x: r.x,
y: r.y - 8
});
this.changeStatisticsItemBgSkin(o[n].node);
}
return [ 3, 5 ];

case 4:
for (n = 0; n < this._achievementStatisticsItem.length; n++) e[n] && this._achievementStatisticsItem[n].setState({
statisticsData: e[n]
});
a.label = 5;

case 5:
return [ 2 ];
}
});
});
};
t.prototype.changeStatisticsItemBgSkin = function() {};
t.prototype.showAchievementAwardsList = function(e) {
return i(this, void 0, Promise, function() {
var t, o, r, n;
return l(this, function(a) {
switch (a.label) {
case 0:
return this._achievementAwardItem.length <= 0 ? [ 4, c.cacheRender.createOrUpdateCacheListComponents({
tag: "Achievement_Main",
prefabUrl: _.PrefabConfig.Achievement_Awards_Item.url,
count: e.length,
typeOrClassName: g.default,
parent: this.ndAwardsLabelContent
}) ] : [ 3, 4 ];

case 1:
t = a.sent();
for (n = 0; n < e.length; n++) if (e[n]) {
t[n].setState({
awardData: e[n]
});
this._achievementAwardItem.push(t[n]);
}
return [ 4, d.nextFrame() ];

case 2:
a.sent();
this.ndAwardsIconContent.height = this.ndAwardsContent.height = this.ndAwardsLabelContent.height;
this.ndAwardsIconContent.width = this.ndAwardsContent.width = this.ndAwardsLabelContent.width;
return [ 4, c.cacheRender.createOrUpdateCacheListComponents({
tag: "Achievement_Main",
prefabUrl: _.PrefabConfig.Achievement_Awards_Item_Icon.url,
count: e.length,
typeOrClassName: v.default,
parent: this.ndAwardsIconContent
}) ];

case 3:
o = a.sent();
for (n = 0; n < e.length; n++) if (e[n]) {
r = t[n].node.getPosition();
o[n].setState({
awardData: e[n],
x: r.x,
y: r.y + 64
});
this._achievementAwardItemIcon.push(o[n]);
}
return [ 3, 5 ];

case 4:
for (n = 0; n < this._achievementAwardItem.length; n++) if (e[n]) {
this._achievementAwardItem[n].setState({
awardData: e[n]
});
this._achievementAwardItemIcon[n] && this._achievementAwardItemIcon[n].setState({
awardData: e[n]
});
}
a.label = 5;

case 5:
y.achievementInfo.setRedPointState();
return [ 2 ];
}
});
});
};
t.prototype.showAchievementTitle = function() {};
t.prototype.onClickBack = function() {
p.EventManager.dispatchModuleEvent(new h.E_HomePage_Show());
};
t.prototype.hideBanner = function() {
cc.sys.isNative && m.NativeAd.hideBanner();
};
t.prototype.onEnable = function() {
var e = this;
if (cc.sys.isNative) {
this.hideBanner();
this._hideBannerScheduler = function() {
return e.hideBanner();
};
this.schedule(this._hideBannerScheduler, 1);
}
};
t.prototype.onDisable = function() {
if (this._hideBannerScheduler) {
this.unschedule(this._hideBannerScheduler);
this._hideBannerScheduler = null;
}
};
a([ k(cc.Node) ], t.prototype, "topContainer", void 0);
a([ k(cc.Node) ], t.prototype, "lbTitle", void 0);
a([ k(cc.Node) ], t.prototype, "lbStatisticesTitle", void 0);
a([ k(cc.Node) ], t.prototype, "lbAwardsTitle", void 0);
a([ k(cc.Node) ], t.prototype, "spAwardsBg", void 0);
a([ k(cc.Node) ], t.prototype, "ndAllContainer", void 0);
a([ k(cc.Node) ], t.prototype, "ndStatisticsContent", void 0);
a([ k(cc.Node) ], t.prototype, "ndStatisticsBgContent", void 0);
a([ k(cc.Node) ], t.prototype, "ndStatisticsLabelContent", void 0);
a([ k(cc.Node) ], t.prototype, "ndAwardsContent", void 0);
a([ k(cc.Node) ], t.prototype, "ndAwardsIconContent", void 0);
a([ k(cc.Node) ], t.prototype, "ndAwardsLabelContent", void 0);
a([ u.adapterFringe("topContainer", "ndAllContainer", "lbTitle", "spAwardsBg", "lbStatisticesTitle", "lbAwardsTitle") ], t.prototype, "onLoad", null);
a([ f.throttle(300) ], t.prototype, "onClickBack", null);
return a([ classId("Achievement_Main"), P, classMethodWatch() ], t);
}(s.default);
o.default = I;
cc._RF.pop();
}, {
"../../../base/cache/CacheRender": "CacheRender",
"../../../base/components/Component": "Component",
"../../../base/decorators/DecoratorAdapter": "DecoratorAdapter",
"../../../base/decorators/DecoratorThrottle": "DecoratorThrottle",
"../../../base/timer/Timer": "Timer",
"../../../falcon/EventManager": "EventManager",
"../../homePage/events/E_HomePage_Show": "E_HomePage_Show",
"../../native/NativeAd": "NativeAd",
"../../prefab/PrefabConfig": "PrefabConfig",
"../vo/AchievementInfo": "AchievementInfo",
"./Achievement_Awards_Item": "Achievement_Awards_Item",
"./Achievement_Awards_Item_Icon": "Achievement_Awards_Item_Icon",
"./Achievement_Statistics_Item": "Achievement_Statistics_Item",
"./Achievement_Statistics_Item_Bg": "Achievement_Statistics_Item_Bg"
} ],
Achievement_Module: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "dae66dcMmhIPo+mcTilQ8Bw", "Achievement_Module");
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
o.Achievement_Module = void 0;
var a = e("../../falcon/Module"), i = e("./proxys/Achievement_Proxy"), l = function(e) {
n(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.registerProxys = function() {
return [ i.Achievement_Proxy ];
};
return t;
}(a.Module);
o.Achievement_Module = l;
cc._RF.pop();
}, {
"../../falcon/Module": "Module",
"./proxys/Achievement_Proxy": "Achievement_Proxy"
} ],
Achievement_Proxy: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "876b3ZEey9Aop0hDfJNf2bu", "Achievement_Proxy");
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
}, i = this && this.__awaiter || function(e, t, o, r) {
return new (o || (o = Promise))(function(n, a) {
function i(e) {
try {
c(r.next(e));
} catch (e) {
a(e);
}
}
function l(e) {
try {
c(r.throw(e));
} catch (e) {
a(e);
}
}
function c(e) {
e.done ? n(e.value) : (t = e.value, t instanceof o ? t : new o(function(e) {
e(t);
})).then(i, l);
var t;
}
c((r = r.apply(e, t || [])).next());
});
}, l = this && this.__generator || function(e, t) {
var o, r, n, a, i = {
label: 0,
sent: function() {
if (1 & n[0]) throw n[1];
return n[1];
},
trys: [],
ops: []
};
return a = {
next: l(0),
throw: l(1),
return: l(2)
}, "function" == typeof Symbol && (a[Symbol.iterator] = function() {
return this;
}), a;
function l(e) {
return function(t) {
return c([ e, t ]);
};
}
function c(a) {
if (o) throw new TypeError("Generator is already executing.");
for (;i; ) try {
if (o = 1, r && (n = 2 & a[0] ? r.return : a[0] ? r.throw || ((n = r.return) && n.call(r), 
0) : r.next) && !(n = n.call(r, a[1])).done) return n;
(r = 0, n) && (a = [ 2 & a[0], n.value ]);
switch (a[0]) {
case 0:
case 1:
n = a;
break;

case 4:
i.label++;
return {
value: a[1],
done: !1
};

case 5:
i.label++;
r = a[1];
a = [ 0 ];
continue;

case 7:
a = i.ops.pop();
i.trys.pop();
continue;

default:
if (!(n = i.trys, n = n.length > 0 && n[n.length - 1]) && (6 === a[0] || 2 === a[0])) {
i = 0;
continue;
}
if (3 === a[0] && (!n || a[1] > n[0] && a[1] < n[3])) {
i.label = a[1];
break;
}
if (6 === a[0] && i.label < n[1]) {
i.label = n[1];
n = a;
break;
}
if (n && i.label < n[2]) {
i.label = n[2];
i.ops.push(a);
break;
}
n[2] && i.ops.pop();
i.trys.pop();
continue;
}
a = t.call(e, i);
} catch (e) {
a = [ 6, e ];
r = 0;
} finally {
o = n = 0;
}
if (5 & a[0]) throw a[1];
return {
value: a[0] ? a[1] : void 0,
done: !0
};
}
};
Object.defineProperty(o, "__esModule", {
value: !0
});
o.Achievement_Proxy = void 0;
var c = e("../../../base/timer/Timer"), s = e("../../../base/ui/UI"), u = e("../../../falcon/Proxy"), f = e("../../blocksProducer/events/E_BlocksProducer_TouchEnd"), d = e("../../game/events/E_Game_Replay"), p = e("../../gameOver/events/E_GameOver_GameEnd"), h = e("../../launch/events/E_Launch_Start"), m = e("../../layer/vo/LayerInfo"), _ = e("../../prefab/PrefabConfig"), y = e("../components/Achievement_Detail"), g = e("../components/Achievement_Main"), v = e("../events/E_Achievement_AwardClick"), b = e("../events/E_Achievement_Chapter_Pass"), C = e("../events/E_Achievement_Entrance"), S = e("../vo/AchievementInfo"), P = function(e) {
n(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.registerEvents = function() {
return [ C.E_Achievement_Entrance, v.E_Achievement_AwardClick, f.E_BlocksProducer_TouchEnd, d.E_Game_Replay, b.E_Achievement_Chapter_Pass, h.E_Launch_Start, p.E_GameOver_GameEnd ];
};
t.prototype.receivedEvents = function(e) {
return i(this, void 0, Promise, function() {
return l(this, function(t) {
switch (t.label) {
case 0:
switch (e.getClass()) {
case C.E_Achievement_Entrance:
return [ 3, 1 ];

case v.E_Achievement_AwardClick:
return [ 3, 2 ];

case f.E_BlocksProducer_TouchEnd:
return [ 3, 3 ];

case d.E_Game_Replay:
return [ 3, 5 ];

case b.E_Achievement_Chapter_Pass:
return [ 3, 6 ];

case h.E_Launch_Start:
return [ 3, 7 ];

case p.E_GameOver_GameEnd:
return [ 3, 8 ];
}
return [ 3, 9 ];

case 1:
this.onAchievement_Entrance(e);
return [ 3, 9 ];

case 2:
this.onAchievement_AwardClick(e);
return [ 3, 9 ];

case 3:
return [ 4, c.nextFrame() ];

case 4:
t.sent();
this.onBlocksProducer_TouchEnd(e);
return [ 3, 9 ];

case 5:
this.onGameReplay();
return [ 3, 9 ];

case 6:
this.onAchievement_Chapter_Pass(e);
return [ 3, 9 ];

case 7:
this.onLaunchStart(e);
return [ 3, 9 ];

case 8:
this.onGameOver(e);
return [ 3, 9 ];

case 9:
return [ 2 ];
}
});
});
};
t.prototype.onGameOver = function() {
DS("usr_data_migration_achieve_info", {
data: S.achievementInfo.achievementLocalStatisticsData
});
};
t.prototype.onLaunchStart = function() {
DS("usr_data_migration_achieve_info", {
data: S.achievementInfo.achievementLocalStatisticsData
});
};
t.prototype.onAchievement_Chapter_Pass = function() {};
t.prototype.onGameReplay = function() {};
t.prototype.onBlocksProducer_TouchEnd = function() {};
t.prototype.onAchievement_Entrance = function() {
s.UI.show(_.PrefabConfig.Achievement_Main, m.uiLayer).then(function(e) {
e.getComponent(g.default).setState({
statisticsDataList: S.achievementInfo.achievementStatisticsData,
awardDataList: S.achievementInfo.achievementAwardData
});
});
};
t.prototype.onAchievement_AwardClick = function(e) {
s.UI.show(_.PrefabConfig.Achievement_Details, m.uiLayer).then(function(t) {
t.getComponent(y.default).setState({
awardData: e.awardData
});
});
};
return a([ classId("Achievement_Proxy"), classMethodWatch() ], t);
}(u.Proxy);
o.Achievement_Proxy = P;
cc._RF.pop();
}, {
"../../../base/timer/Timer": "Timer",
"../../../base/ui/UI": "UI",
"../../../falcon/Proxy": "Proxy",
"../../blocksProducer/events/E_BlocksProducer_TouchEnd": "E_BlocksProducer_TouchEnd",
"../../game/events/E_Game_Replay": "E_Game_Replay",
"../../gameOver/events/E_GameOver_GameEnd": "E_GameOver_GameEnd",
"../../launch/events/E_Launch_Start": "E_Launch_Start",
"../../layer/vo/LayerInfo": "LayerInfo",
"../../prefab/PrefabConfig": "PrefabConfig",
"../components/Achievement_Detail": "Achievement_Detail",
"../components/Achievement_Main": "Achievement_Main",
"../events/E_Achievement_AwardClick": "E_Achievement_AwardClick",
"../events/E_Achievement_Chapter_Pass": "E_Achievement_Chapter_Pass",
"../events/E_Achievement_Entrance": "E_Achievement_Entrance",
"../vo/AchievementInfo": "AchievementInfo"
} ],
Achievement_Statistics_Item_Bg: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "d3aa4amQWZM7bXU1oqHwNpi", "Achievement_Statistics_Item_Bg");
var r, n = this && this.__extends || (r = function(e, t) {
re